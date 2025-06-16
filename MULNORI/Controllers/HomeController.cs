using DHTEST.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Text.Json;

namespace SeaConditionWeb.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IConfiguration _configuration;

        public HomeController(ILogger<HomeController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            ViewBag.KakaoMapKey = _configuration["KakaoMap:JavaScriptKey"];
            return View();
        }

        [HttpPost]
        public IActionResult GetSeaCondition([FromBody] string menuType)
        {
            // 각 메뉴별 바다 상황 데이터 처리
            var result = menuType switch
            {
                "realtime" => GetRealTimeSeaData(),
                "statistics" => GetStatisticsData(),
                _ => new { success = false, message = "엥 어떻게 들어왔지" }
            };

            return Json(result);
        }

        private object GetRealTimeSeaData()
        {
            // 실시간 바다 상황 데이터 로직
            return new
            {
                success = true,
                data = new
                {
                    temperature = "18.5°C",
                    waveHeight = "1.2m",
                    windSpeed = "15km/h",
                    visibility = "양호"
                }
            };
        }

        private object GetStatisticsData()
        {
            // 통계 정보 데이터 로직
            return new
            {
                success = true,
                data = new
                {
                    avgTemperature = "19.2°C",
                    maxWaveHeight = "2.1m",
                    avgWindSpeed = "12km/h"
                }
            };
        }

        /// <summary>
        /// 다이빙포인트 불러오기. 스킨스쿠버기준
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetDivePointData()
        {
            try
            {
                var apiUrl = "https://apis.data.go.kr/1192136/fcstSkinScuba/GetFcstSkinScubaApiService";

                var serviceKey = _configuration["openApi:ServiceKey"];

                if (string.IsNullOrEmpty(serviceKey)) 
                {
                    return Json(new { success = false, message = "API 키가 없거나 올바르지 않습니다" });
                }

                var parameters = new Dictionary<string, string>
                {
                    {"serviceKey", serviceKey},
                    {"type","json"},
                    {"reqDate",System.DateTime.Now.ToString("yyyyMMddHH")},
                    {"numOfRows", "100"},
                    {"pageNo", "1"}
                };

                using var client = new HttpClient();
                var queryString = string.Join("&", parameters.Select(p => $"{p.Key}={Uri.EscapeDataString(p.Value)}"));
                var finalUrl = $"{apiUrl}?{queryString}";

                Console.WriteLine($"요청 URL: {finalUrl}");
                var response = await client.GetAsync(finalUrl);
                var content = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<JsonElement>(json);
                    var items = result
                        .GetProperty("response")
                        .GetProperty("body")
                        .GetProperty("items")
                        .GetProperty("item")
                        .EnumerateArray()
                        .Select(item => new
                        {
                            skscExpcnRgnNm = item.GetProperty("skscExpcnRgnNm").GetString(),
                            lat = item.GetProperty("lat").GetDouble(),
                            lot = item.GetProperty("lot").GetDouble(),
                            predcYmd = item.GetProperty("predcYmd").GetString(),
                            predcNoonSeCd = item.GetProperty("predcNoonSeCd").GetString(),
                            minWvhgt = item.GetProperty("minWvhgt").GetString(),
                            maxWvhgt = item.GetProperty("maxWvhgt").GetString(),
                            minWtem = item.GetProperty("minWtem").GetString(),
                            maxWtem = item.GetProperty("maxWtem").GetString(),
                            totalIndex = item.GetProperty("totalIndex").GetString(),
                            lastScr = item.GetProperty("lastScr").GetDouble()
                        })
                        .ToList();
                
                    return Json(items);
                }
                return BadRequest("데이터를 가져오는데 실패했습니다.");

            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
           
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
