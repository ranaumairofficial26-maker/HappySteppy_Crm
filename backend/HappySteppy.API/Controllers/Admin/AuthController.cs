using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HappySteppy.Application.DTOs;
using HappySteppy.Application.Interfaces.Services;

namespace HappySteppy.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private const string RefreshTokenCookieName = "HappySteppy_RefreshToken";

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var (response, refreshToken, error) = await _authService.LoginAsync(request, ipAddress, ct);

            if (!string.IsNullOrEmpty(error) || response == null)
            {
                return Unauthorized(new { message = error ?? "Invalid credentials" });
            }

            // Set refresh token in HttpOnly cookie
            if (!string.IsNullOrEmpty(refreshToken))
            {
                SetRefreshTokenCookie(refreshToken);
            }

            return Ok(response);
        }

        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<IActionResult> RefreshToken(CancellationToken ct)
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new { message = "No refresh token found." });
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var (response, newRefreshToken, error) = await _authService.RefreshTokenAsync(refreshToken, ipAddress, ct);

            if (!string.IsNullOrEmpty(error) || response == null)
            {
                Response.Cookies.Delete(RefreshTokenCookieName);
                return Unauthorized(new { message = error ?? "Invalid token session." });
            }

            if (!string.IsNullOrEmpty(newRefreshToken))
            {
                SetRefreshTokenCookie(newRefreshToken);
            }

            return Ok(response);
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout(CancellationToken ct)
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _authService.RevokeTokenAsync(refreshToken, ct);
            }

            Response.Cookies.Delete(RefreshTokenCookieName);
            return Ok(new { message = "Successfully logged out." });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                var profile = await _authService.GetCurrentUserProfileAsync(userId, ct);
                if (profile != null) return Ok(profile);
            }

            return Unauthorized(new { message = "Session invalid." });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req, CancellationToken ct)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

            if (Guid.TryParse(userIdClaim, out var userId))
            {
                var success = await _authService.ChangePasswordAsync(userId, req, ct);
                if (success)
                {
                    Response.Cookies.Delete(RefreshTokenCookieName);
                    return Ok(new { message = "Password changed successfully. Please log in again." });
                }
                return BadRequest(new { message = "Incorrect current password." });
            }

            return Unauthorized();
        }

        private void SetRefreshTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = DateTime.UtcNow.AddDays(7),
                SameSite = SameSiteMode.Lax, // Allows cross-origin development on localhost
                Secure = false // set to true in production HTTPS
            };
            Response.Cookies.Append(RefreshTokenCookieName, token, cookieOptions);
        }
    }
}

