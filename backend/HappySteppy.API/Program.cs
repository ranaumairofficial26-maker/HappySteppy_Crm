var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Happy Steppy API",
        Version = "v1",
        Description = "ASP.NET Core Web API for Happy Steppy Store"
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

// Redirect root to /swagger for instant access
app.MapGet("/", () => Results.Redirect("/swagger"));

// Health / Status endpoint
app.MapGet("/api/status", () => Results.Ok(new
{
    Status = "Online",
    Application = "Happy Steppy Backend API",
    Timestamp = DateTime.UtcNow
}))
.WithName("GetStatus")
.WithOpenApi();

app.Run();
