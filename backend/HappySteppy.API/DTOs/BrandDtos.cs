using System.ComponentModel.DataAnnotations;

namespace HappySteppy.API.DTOs;

public class CreateBrandDto
{
    [Required(ErrorMessage = "Brand name is required")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Icon { get; set; } = "fa-solid fa-tag";

    public string? ImgUrl { get; set; }

    public int? DisplayOrder { get; set; }
}

public class UpdateBrandDto
{
    [Required(ErrorMessage = "Brand name is required")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Icon { get; set; }

    public string? ImgUrl { get; set; }

    public int? DisplayOrder { get; set; }

    public bool? IsActive { get; set; }
}

