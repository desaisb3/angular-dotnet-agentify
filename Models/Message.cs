using System;

namespace angular_dotnet_agentify.Models
{
    public class Message
    {
        public string user { get; set; }
        public string type { get; set; }
        public string clientid { get; set; }
        public string message { get; set; }
        public DateTime date { get; set; }
    }
}