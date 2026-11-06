using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using HappySteppy.Infrastructure;
using HappySteppy.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Controllers with JSON formatting
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 2. Add Infrastructure Services (DbContext, Repositories, Services, JWT Auth, Policies)
builder.Services.AddInfrastructureServices(builder.Configuration);

// 3. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendApp", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrEmpty(origin)) return false;
                  try
                  {
                      var host = new Uri(origin).Host;
                      return host == "localhost" || host == "127.0.0.1";
                  }
                  catch
                  {
                      return false;
                  }
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Swagger with JWT Bearer support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Happy Steppy E-Commerce & Admin API",
        Version = "v1",
        Description = "Production-grade RESTful API for Happy Steppy Storefront and Admin CMS"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT access token. Format: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 5. Seed Database & apply initial configuration
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await DatabaseSeeder.SeedAsync(db);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database initialization warning: {ex.Message}");
    }
}

// 6. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Happy Steppy API v1");
    });
}

app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowFrontendApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
