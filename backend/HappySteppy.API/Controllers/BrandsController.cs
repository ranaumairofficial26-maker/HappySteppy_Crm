using Microsoft.AspNetCore.Mvc;
using HappySteppy.API.DTOs;
using HappySteppy.API.Models;
using HappySteppy.API.Repositories;

namespace HappySteppy.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class BrandsController : ControllerBase
{
    private readonly IBrandRepository _brandRepository;
    private readonly ILogger<BrandsController> _logger;

    public BrandsController(IBrandRepository brandRepository, ILogger<BrandsController> logger)
    {
        _brandRepository = brandRepository;
        _logger = logger;
    }

    /// <summary>
    /// Get all active sidebar top brands
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Brand>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var brands = await _brandRepository.GetAllAsync();
        return Ok(brands);
    }

    /// <summary>
    /// Get a single brand by ID
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Brand), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var brand = await _brandRepository.GetByIdAsync(id);
        if (brand == null)
        {
            return NotFound(new { message = $"Brand with ID {id} not found." });
        }
        return Ok(brand);
    }

    /// <summary>
    /// Create a new brand for the sidebar
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Brand), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateBrandDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existing = await _brandRepository.GetByNameAsync(dto.Name);
        if (existing != null)
        {
            return Conflict(new { message = $"A brand named '{dto.Name}' already exists." });
        }

        var brand = new Brand
        {
            Name = dto.Name.Trim(),
            Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "fa-solid fa-tag" : dto.Icon.Trim(),
            ImgUrl = dto.ImgUrl,
            DisplayOrder = dto.DisplayOrder ?? 0,
            IsActive = true
        };

        var created = await _brandRepository.CreateAsync(brand);
        _logger.LogInformation("Brand created: {Name} (ID: {Id})", created.Name, created.Id);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Update an existing sidebar brand
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Brand), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateBrandDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var brand = new Brand
        {
            Name = dto.Name.Trim(),
            Icon = dto.Icon?.Trim() ?? string.Empty,
            ImgUrl = dto.ImgUrl,
            DisplayOrder = dto.DisplayOrder ?? 0,
            IsActive = dto.IsActive ?? true
        };

        var updated = await _brandRepository.UpdateAsync(id, brand);
        if (updated == null)
        {
            return NotFound(new { message = $"Brand with ID {id} not found." });
        }

        _logger.LogInformation("Brand updated: {Name} (ID: {Id})", updated.Name, updated.Id);
        return Ok(updated);
    }

    /// <summary>
    /// Delete a brand by ID
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _brandRepository.DeleteAsync(id);
        if (!success)
        {
            return NotFound(new { message = $"Brand with ID {id} not found." });
        }

        _logger.LogInformation("Brand deleted: ID {Id}", id);
        return Ok(new { success = true, message = $"Brand {id} removed successfully." });
    }

    /// <summary>
    /// Reset sidebar brands back to the default 9 brands
    /// </summary>
    [HttpPost("reset-defaults")]
    [ProducesResponseType(typeof(IEnumerable<Brand>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetDefaults()
    {
        var defaults = await _brandRepository.ResetDefaultsAsync();
        _logger.LogInformation("Brands reset to default 9 items.");
        return Ok(defaults);
    }
}

