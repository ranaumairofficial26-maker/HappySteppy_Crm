using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using HappySteppy.Application.Interfaces.Repositories;
using HappySteppy.Application.Interfaces.Services;
using HappySteppy.Application.Services;
using HappySteppy.Domain.Identity;
using HappySteppy.Infrastructure.Authentication;
using HappySteppy.Infrastructure.Data;
using HappySteppy.Infrastructure.Repositories;

namespace HappySteppy.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Database
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString, b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            // Repositories
            services.AddScoped<IAdminUserRepository, AdminUserRepository>();
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<IHomepageRepository, HomepageRepository>();
            services.AddScoped<ISettingsRepository, SettingsRepository>();
            services.AddScoped<IMediaRepository, MediaRepository>();

            // Business & Auth Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<IHomepageService, HomepageService>();
            services.AddScoped<IDashboardService, DashboardService>();

            // JWT Authentication
            var jwtKey = configuration["Jwt:Key"] ?? "HappySteppySecretSuperSecureKey2026_ProductionReadyAdminPanelAuthKey!";
            var jwtIssuer = configuration["Jwt:Issuer"] ?? "HappySteppyApi";
            var jwtAudience = configuration["Jwt:Audience"] ?? "HappySteppyApp";

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false; // set to true in production SSL
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

            // Role and Policy Authorization
            services.AddAuthorization(options =>
            {
                options.AddPolicy("SuperAdminOnly", policy => policy.RequireRole(AdminRoleType.SuperAdmin.ToString()));
                options.AddPolicy("AdminOrAbove", policy => policy.RequireRole(AdminRoleType.SuperAdmin.ToString(), AdminRoleType.Admin.ToString()));
                options.AddPolicy("Homepage.Manage", policy => policy.RequireRole(AdminRoleType.SuperAdmin.ToString(), AdminRoleType.Admin.ToString(), AdminRoleType.Editor.ToString()));
                options.AddPolicy("Products.Read", policy => policy.RequireAuthenticatedUser());
                options.AddPolicy("Products.Write", policy => policy.RequireRole(AdminRoleType.SuperAdmin.ToString(), AdminRoleType.Admin.ToString()));
                options.AddPolicy("Users.Manage", policy => policy.RequireRole(AdminRoleType.SuperAdmin.ToString()));
            });

            return services;
        }
    }
}

