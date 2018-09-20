using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using KDB_Dash.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.FileProviders;

namespace KDB_Dash.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly IHostingEnvironment _hostingEnvironment;

        public HomeController(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            string webRootPath = _hostingEnvironment.WebRootPath;// + "\\Widges";
            IFileProvider provider = new PhysicalFileProvider(webRootPath);

            IDirectoryContents contents = provider.GetDirectoryContents(""); // the applicationRoot contents
            var result = contents.Where(l => l.Name == "Widgets").FirstOrDefault();
            string wtg = result.PhysicalPath.Substring(result.PhysicalPath.Length - 8);
            IFileInfo fileInfo = provider.GetFileInfo(wtg); // a file under applicationRoot  NOT needed right now;
            var wid = provider.GetDirectoryContents(wtg);

            List<string> availableWidgets = new List<string>();
            foreach (IFileInfo Widget in wid)
            {
                availableWidgets.Add(Widget.Name);
            }
            string contentRootPath = _hostingEnvironment.ContentRootPath;


            Response.Cookies.Append("Name", "Jason Groarke");  //Creates cookies here;
            return View(availableWidgets);
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        [AllowAnonymous]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
