using HappySteppy.API.Models;

namespace HappySteppy.API.Repositories;

public interface IBrandRepository
{
    Task<IEnumerable<Brand>> GetAllAsync();
    Task<Brand?> GetByIdAsync(int id);
    Task<Brand?> GetByNameAsync(string name);
    Task<Brand> CreateAsync(Brand brand);
    Task<Brand?> UpdateAsync(int id, Brand brand);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Brand>> ResetDefaultsAsync();
}

