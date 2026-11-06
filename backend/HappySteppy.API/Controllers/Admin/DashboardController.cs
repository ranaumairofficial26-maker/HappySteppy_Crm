using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HappySteppy.Application.Interfaces.Services;

namespace HappySteppy.API.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        public DashboardController(IDashboardService dashboardService) => _dashboardService = dashboardService;

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats(CancellationToken ct)
        {
            var stats = await _dashboardService.GetStatsAsync(ct);
            return Ok(stats);
        }
    }
}

