using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HappySteppy.Application.Interfaces.Repositories;
using HappySteppy.Domain.Content;

namespace HappySteppy.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/media")]
    [Authorize]
    public class MediaController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IMediaRepository _mediaRepo;

        public MediaController(IWebHostEnvironment env, IMediaRepository mediaRepo)
        {
            _env = env;
            _mediaRepo = mediaRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var assets = await _mediaRepo.GetAllAsync(ct);
            return Ok(assets);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsDir = Path.Combine(webRoot, "uploads");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsDir, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, ct);
            }

            var publicUrl = $"assets/uploads/{uniqueFileName}";
            try
            {
                var frontendDir = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "frontend", "public", "assets", "uploads"));
                if (!Directory.Exists(frontendDir)) Directory.CreateDirectory(frontendDir);
                System.IO.File.Copy(filePath, Path.Combine(frontendDir, uniqueFileName), true);
            }
            catch
            {
                publicUrl = $"/uploads/{uniqueFileName}";
            }

            var asset = new MediaAsset
            {
                FileName = file.FileName,
                StoragePath = filePath,
                PublicUrl = publicUrl,
                ContentType = file.ContentType,
                FileSizeBytes = file.Length,
                CreatedAtUtc = DateTime.UtcNow
            };

            await _mediaRepo.AddAsync(asset, ct);

            return Ok(new
            {
                id = asset.Id,
                fileName = asset.FileName,
                url = publicUrl,
                size = asset.FileSizeBytes
            });
        }
    }
}

