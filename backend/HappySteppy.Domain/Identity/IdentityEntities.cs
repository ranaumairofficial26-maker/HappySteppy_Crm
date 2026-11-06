using System;
using System.Collections.Generic;
using HappySteppy.Domain.Common;

namespace HappySteppy.Domain.Identity
{
    public enum AdminRoleType
    {
        SuperAdmin,
        Admin,
        Editor
    }

    public class AdminUser : BaseEntity
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public AdminRoleType Role { get; set; } = AdminRoleType.Editor;
        public DateTime? LastLoginAtUtc { get; set; }
        public DateTime? LockoutEndUtc { get; set; }
        public int AccessFailedCount { get; set; } = 0;
        
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }

    public class RefreshToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid AdminUserId { get; set; }
        public AdminUser AdminUser { get; set; } = null!;
        public string TokenHash { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? RevokedAtUtc { get; set; }
        public string? ReplacedByTokenHash { get; set; }
        public string? CreatedByIp { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;
        public bool IsRevoked => RevokedAtUtc != null;
        public bool IsActive => !IsRevoked && !IsExpired;
    }

    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? AdminUserId { get; set; }
        public string? AdminUserEmail { get; set; }
        public string Action { get; set; } = string.Empty; // e.g. "Create", "Update", "Delete", "Login"
        public string EntityName { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string? ChangesJson { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}

