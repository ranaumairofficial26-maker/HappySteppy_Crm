using HappySteppy.API.DTOs;
using HappySteppy.API.Models;
using HappySteppy.API.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Register Repository Pattern
builder.Services.AddSingleton<IBrandRepository, BrandRepository>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Happy Steppy API",
        Version = "v1",
        Description = "ASP.NET Core 8 Web API with Repository Pattern for Happy Steppy Store"
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("AllowAll");

// Enable Swagger UI unconditionally
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Happy Steppy API v1");
    c.RoutePrefix = "swagger";
});

// Redirect root to /swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

// Health check
app.MapGet("/api/status", () => Results.Ok(new
{
    Status = "Online",
    Application = "Happy Steppy Backend API",
    Timestamp = DateTime.UtcNow
}))
.WithName("GetStatus")
.WithOpenApi();

// Brands API Endpoints (Using Repository Pattern)
var brandsApi = app.MapGroup("/api/brands").WithTags("Top Brands (Sidebar)");

brandsApi.MapGet("/", async (IBrandRepository repo) =>
{
    var brands = await repo.GetAllAsync();
    return Results.Ok(brands);
})
.WithName("GetAllBrands")
.WithOpenApi();

brandsApi.MapGet("/{id:int}", async (int id, IBrandRepository repo) =>
{
    var brand = await repo.GetByIdAsync(id);
    return brand != null ? Results.Ok(brand) : Results.NotFound(new { message = $"Brand with ID {id} not found." });
})
.WithName("GetBrandById")
.WithOpenApi();

brandsApi.MapPost("/", async (CreateBrandDto dto, IBrandRepository repo) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name))
    {
        return Results.BadRequest(new { message = "Brand name is required." });
    }

    var existing = await repo.GetByNameAsync(dto.Name);
    if (existing != null)
    {
        return Results.Conflict(new { message = $"A brand named '{dto.Name}' already exists." });
    }

    var brand = new Brand
    {
        Name = dto.Name.Trim(),
        Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "fa-solid fa-tag" : dto.Icon.Trim(),
        ImgUrl = dto.ImgUrl,
        DisplayOrder = dto.DisplayOrder ?? 0,
        IsActive = true
    };

    var created = await repo.CreateAsync(brand);
    return Results.Created($"/api/brands/{created.Id}", created);
})
.WithName("CreateBrand")
.WithOpenApi();

brandsApi.MapPut("/{id:int}", async (int id, UpdateBrandDto dto, IBrandRepository repo) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name))
    {
        return Results.BadRequest(new { message = "Brand name is required." });
    }

    var brand = new Brand
    {
        Name = dto.Name.Trim(),
        Icon = dto.Icon?.Trim() ?? string.Empty,
        ImgUrl = dto.ImgUrl,
        DisplayOrder = dto.DisplayOrder ?? 0,
        IsActive = dto.IsActive ?? true
    };

    var updated = await repo.UpdateAsync(id, brand);
    return updated != null ? Results.Ok(updated) : Results.NotFound(new { message = $"Brand with ID {id} not found." });
})
.WithName("UpdateBrand")
.WithOpenApi();

brandsApi.MapDelete("/{id:int}", async (int id, IBrandRepository repo) =>
{
    var success = await repo.DeleteAsync(id);
    return success ? Results.Ok(new { success = true, message = $"Brand {id} deleted." }) : Results.NotFound(new { message = $"Brand with ID {id} not found." });
})
.WithName("DeleteBrand")
.WithOpenApi();

brandsApi.MapPost("/reset-defaults", async (IBrandRepository repo) =>
{
    var defaults = await repo.ResetDefaultsAsync();
    return Results.Ok(defaults);
})
.WithName("ResetBrandsToDefault")
.WithOpenApi();

app.Run();
