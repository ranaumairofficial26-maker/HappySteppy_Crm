using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using HappySteppy.Application.DTOs;
using HappySteppy.Application.Interfaces.Repositories;
using HappySteppy.Application.Interfaces.Services;
using HappySteppy.Domain.Identity;

namespace HappySteppy.Infrastructure.Authentication
{
    public class AuthService : IAuthService
    {
        private readonly IAdminUserRepository _userRepo;
        private readonly IConfiguration _config;

        public AuthService(IAdminUserRepository userRepo, IConfiguration config)
        {
            _userRepo = userRepo;
            _config = config;
        }

        public async Task<(LoginResponse? Response, string? RefreshToken, string? Error)> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return (null, null, "Email and password are required.");

            var user = await _userRepo.GetByEmailAsync(request.Email, ct);
            if (user == null)
                return (null, null, "Invalid email or password.");

            if (!user.IsActive)
                return (null, null, "Your account has been deactivated. Please contact SuperAdmin.");

            if (user.LockoutEndUtc.HasValue && user.LockoutEndUtc.Value > DateTime.UtcNow)
                return (null, null, $"Account is locked out until {user.LockoutEndUtc.Value:g} UTC.");

            bool isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isValid)
            {
                user.AccessFailedCount++;
                if (user.AccessFailedCount >= 5)
                {
                    user.LockoutEndUtc = DateTime.UtcNow.AddMinutes(15);
                }
                await _userRepo.UpdateAsync(user, ct);
                return (null, null, "Invalid email or password.");
            }

            // Reset failed count & update last login
            user.AccessFailedCount = 0;
            user.LockoutEndUtc = null;
            user.LastLoginAtUtc = DateTime.UtcNow;
            await _userRepo.UpdateAsync(user, ct);

            // Generate JWT and Refresh Token
            var (accessToken, expiresAtUtc) = GenerateJwtToken(user);
            var (rawRefreshToken, tokenHash) = GenerateRefreshToken();

            var refreshLifetimeDays = _config.GetValue<int>("Jwt:RefreshTokenLifetimeDays", 7);
            var refreshTokenEntity = new RefreshToken
            {
                AdminUserId = user.Id,
                TokenHash = tokenHash,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(refreshLifetimeDays),
                CreatedByIp = ipAddress,
                CreatedAtUtc = DateTime.UtcNow
            };
            await _userRepo.SaveRefreshTokenAsync(refreshTokenEntity, ct);

            var profile = new AdminUserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString()
            };

            var loginResponse = new LoginResponse
            {
                AccessToken = accessToken,
                ExpiresAtUtc = expiresAtUtc,
                User = profile
            };

            return (loginResponse, rawRefreshToken, null);
        }

        public async Task<(LoginResponse? Response, string? NewRefreshToken, string? Error)> RefreshTokenAsync(string oldRefreshToken, string? ipAddress, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(oldRefreshToken))
                return (null, null, "Missing refresh token.");

            var hash = HashToken(oldRefreshToken);
            var storedToken = await _userRepo.GetRefreshTokenAsync(hash, ct);
            if (storedToken == null)
                return (null, null, "Invalid refresh token.");

            if (storedToken.IsRevoked)
            {
                // Possible token reuse attack! Revoke all tokens for user.
                await _userRepo.RevokeAllUserRefreshTokensAsync(storedToken.AdminUserId, ct);
                return (null, null, "Revoked token reused. Security lock triggered. Please log in again.");
            }

            if (storedToken.IsExpired)
                return (null, null, "Refresh token has expired.");

            var user = storedToken.AdminUser;
            if (user == null || !user.IsActive)
                return (null, null, "User inactive or deleted.");

            // Rotate refresh token
            var (newRawRefreshToken, newTokenHash) = GenerateRefreshToken();
            await _userRepo.RevokeRefreshTokenAsync(hash, newTokenHash, ct);

            var refreshLifetimeDays = _config.GetValue<int>("Jwt:RefreshTokenLifetimeDays", 7);
            var newRefreshTokenEntity = new RefreshToken
            {
                AdminUserId = user.Id,
                TokenHash = newTokenHash,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(refreshLifetimeDays),
                CreatedByIp = ipAddress,
                CreatedAtUtc = DateTime.UtcNow
            };
            await _userRepo.SaveRefreshTokenAsync(newRefreshTokenEntity, ct);

            var (accessToken, expiresAtUtc) = GenerateJwtToken(user);
            var profile = new AdminUserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString()
            };

            var response = new LoginResponse
            {
                AccessToken = accessToken,
                ExpiresAtUtc = expiresAtUtc,
                User = profile
            };

            return (response, newRawRefreshToken, null);
        }

        public async Task RevokeTokenAsync(string refreshToken, CancellationToken ct = default)
        {
            if (!string.IsNullOrWhiteSpace(refreshToken))
            {
                var hash = HashToken(refreshToken);
                await _userRepo.RevokeRefreshTokenAsync(hash, null, ct);
            }
        }

        public async Task<AdminUserProfileDto?> GetCurrentUserProfileAsync(Guid userId, CancellationToken ct = default)
        {
            var user = await _userRepo.GetByIdAsync(userId, ct);
            if (user == null) return null;

            return new AdminUserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString()
            };
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
        {
            var user = await _userRepo.GetByIdAsync(userId, ct);
            if (user == null) return false;

            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.UpdatedAtUtc = DateTime.UtcNow;
            await _userRepo.UpdateAsync(user, ct);

            // Revoke all existing sessions
            await _userRepo.RevokeAllUserRefreshTokensAsync(userId, ct);
            return true;
        }

        private (string token, DateTime expiresAtUtc) GenerateJwtToken(AdminUser user)
        {
            var keyString = _config["Jwt:Key"] ?? "HappySteppySecretSuperSecureKey2026_ProductionReadyAdminPanelAuthKey!";
            var issuer = _config["Jwt:Issuer"] ?? "HappySteppyApi";
            var audience = _config["Jwt:Audience"] ?? "HappySteppyApp";
            var lifetimeMinutes = _config.GetValue<int>("Jwt:TokenLifetimeMinutes", 60);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expiresAtUtc = DateTime.UtcNow.AddMinutes(lifetimeMinutes);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FullName", $"{user.FirstName} {user.LastName}".Trim()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: expiresAtUtc,
                signingCredentials: creds
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresAtUtc);
        }

        private static (string rawToken, string tokenHash) GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            var rawToken = Convert.ToBase64String(randomBytes);
            var tokenHash = HashToken(rawToken);
            return (rawToken, tokenHash);
        }

        private static string HashToken(string token)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }
    }
}

