using System.Text.Json;
using HappySteppy.API.Models;

namespace HappySteppy.API.Repositories;

public class BrandRepository : IBrandRepository
{
    private readonly string _storageFilePath;
    private readonly List<Brand> _brands = new();
    private readonly object _lock = new();

    private static readonly List<Brand> DefaultBrands = new()
    {
        new Brand { Id = 1, Name = "Bioray", Icon = "fa-solid fa-flask", DisplayOrder = 1, IsActive = true },
        new Brand { Id = 2, Name = "CBD Plus", Icon = "fa-solid fa-leaf", DisplayOrder = 2, IsActive = true },
        new Brand { Id = 3, Name = "Designs for Health", Icon = "fa-solid fa-heart-pulse", DisplayOrder = 3, IsActive = true },
        new Brand { Id = 4, Name = "Kirkman", Icon = "fa-solid fa-capsules", DisplayOrder = 4, IsActive = true },
        new Brand { Id = 5, Name = "Life Extension", Icon = "fa-solid fa-dna", DisplayOrder = 5, IsActive = true },
        new Brand { Id = 6, Name = "Mary Ruth", Icon = "fa-solid fa-shield-heart", DisplayOrder = 6, IsActive = true },
        new Brand { Id = 7, Name = "Nature's Answer", Icon = "fa-solid fa-seedling", DisplayOrder = 7, IsActive = true },
        new Brand { Id = 8, Name = "Nature's Way", Icon = "fa-solid fa-tree", DisplayOrder = 8, IsActive = true },
        new Brand { Id = 9, Name = "NOW Foods", Icon = "fa-solid fa-apple-whole", DisplayOrder = 9, IsActive = true }
    };

    public BrandRepository(IWebHostEnvironment env)
    {
        // Target the root database folder (database/brands.json and database/happysteppy.db)
        var parentDir = Directory.GetParent(env.ContentRootPath)?.Parent?.FullName;
        var dataDir = !string.IsNullOrEmpty(parentDir) && Directory.Exists(Path.Combine(parentDir, "database"))
            ? Path.Combine(parentDir, "database")
            : Path.Combine(env.ContentRootPath, "Data");

        if (!Directory.Exists(dataDir))
        {
            Directory.CreateDirectory(dataDir);
        }
        _storageFilePath = Path.Combine(dataDir, "brands.json");

        LoadData();
    }

    private void LoadData()
    {
        lock (_lock)
        {
            if (File.Exists(_storageFilePath))
            {
                try
                {
                    var json = File.ReadAllText(_storageFilePath);
                    var items = JsonSerializer.Deserialize<List<Brand>>(json);
                    if (items != null && items.Count > 0)
                    {
                        _brands.Clear();
                        _brands.AddRange(items);
                        return;
                    }
                }
                catch
                {
                    // Fall back to defaults on error
                }
            }

            _brands.Clear();
            _brands.AddRange(DefaultBrands);
            SaveDataInternal();
        }
    }

    private void SaveDataInternal()
    {
        try
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var json = JsonSerializer.Serialize(_brands, options);
            File.WriteAllText(_storageFilePath, json);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BrandRepository] Error persisting data: {ex.Message}");
        }
    }

    public Task<IEnumerable<Brand>> GetAllAsync()
    {
        lock (_lock)
        {
            var result = _brands
                .Where(b => b.IsActive)
                .OrderBy(b => b.DisplayOrder)
                .ThenBy(b => b.Id)
                .ToList();
            return Task.FromResult<IEnumerable<Brand>>(result);
        }
    }

    public Task<Brand?> GetByIdAsync(int id)
    {
        lock (_lock)
        {
            var brand = _brands.FirstOrDefault(b => b.Id == id);
            return Task.FromResult(brand);
        }
    }

    public Task<Brand?> GetByNameAsync(string name)
    {
        lock (_lock)
        {
            var brand = _brands.FirstOrDefault(b => b.Name.Equals(name.Trim(), StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(brand);
        }
    }

    public Task<Brand> CreateAsync(Brand brand)
    {
        lock (_lock)
        {
            var maxId = _brands.Count > 0 ? _brands.Max(b => b.Id) : 0;
            brand.Id = maxId + 1;
            if (brand.DisplayOrder <= 0)
            {
                brand.DisplayOrder = _brands.Count + 1;
            }
            brand.CreatedAt = DateTime.UtcNow;

            _brands.Add(brand);
            SaveDataInternal();

            return Task.FromResult(brand);
        }
    }

    public Task<Brand?> UpdateAsync(int id, Brand updated)
    {
        lock (_lock)
        {
            var existing = _brands.FirstOrDefault(b => b.Id == id);
            if (existing == null) return Task.FromResult<Brand?>(null);

            existing.Name = updated.Name.Trim();
            if (!string.IsNullOrWhiteSpace(updated.Icon))
            {
                existing.Icon = updated.Icon.Trim();
            }
            if (updated.ImgUrl != null)
            {
                existing.ImgUrl = updated.ImgUrl;
            }
            if (updated.DisplayOrder > 0)
            {
                existing.DisplayOrder = updated.DisplayOrder;
            }
            existing.IsActive = updated.IsActive;

            SaveDataInternal();
            return Task.FromResult<Brand?>(existing);
        }
    }

    public Task<bool> DeleteAsync(int id)
    {
        lock (_lock)
        {
            var existing = _brands.FirstOrDefault(b => b.Id == id);
            if (existing == null) return Task.FromResult(false);

            _brands.Remove(existing);
            SaveDataInternal();
            return Task.FromResult(true);
        }
    }

    public Task<IEnumerable<Brand>> ResetDefaultsAsync()
    {
        lock (_lock)
        {
            _brands.Clear();
            _brands.AddRange(DefaultBrands);
            SaveDataInternal();
            return Task.FromResult<IEnumerable<Brand>>(_brands.ToList());
        }
    }
}

