using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using angular_dotnet_agentify.Models;

namespace angular_dotnet_agentify.Hubs
{
    public class ChatHub : Hub
    {
        public async Task NewMessage(Message msg)
        {
            await Clients.All.SendAsync("MessageReceived", msg);
        }
    }
}