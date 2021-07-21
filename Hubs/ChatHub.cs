using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using angular_dotnet_agentify.Models;
using System; 
using System.Collections.Generic; 
using System.Linq; 

namespace angular_dotnet_agentify.Hubs
{
    public class ChatHub : Hub
    {
        //Variable to count the active users in the chat 
        public static int Count=0; 
        //List only with storing UserIDs 
        public static List<string> Users = new List<string>(); 
        //UserList with Username and UserID
        public static List<Users> UserList = new List<Users>();
        public async Task NewMessage(Message msg)
        {
            await Clients.All.SendAsync("MessageReceived", msg);
        }

        public async Task addNewUser(string userName, string userEmail, string userLastName) { 
            var index = new Users(); 
            //Add a new user to the list only if the 
            //userId(Context.ConnectionId) is unique. 
            //Otherwise ignore it and send the userlist to all clients.  
            try { 
                index = UserList.Single(r => r.userId == Context.ConnectionId); 
            } 
            catch (Exception e) { 
                index = null; 
                Console.WriteLine("UserId is unique! Adding this user to the list."); 
            } 
            if(index == null) 
                UserList.Add(new Users() {userId=Context.ConnectionId, username=userName, email=userEmail, lastname=userLastName}
            ); 
            await Clients.All.SendAsync("newUserList", UserList); 
        } 
        public override async Task OnConnectedAsync() { 
            Count++; 
            Users.Add(Context.ConnectionId); 
            await Clients.All.SendAsync("updateCount", Count); 
            await Clients.Others.SendAsync("userConnected", Context.ConnectionId); 
            await Clients.All.SendAsync("updateUserList", Users); 
            await base.OnConnectedAsync(); 
        } 

        public override async Task OnDisconnectedAsync(Exception exception) { 
            Count--; 
            Users.Remove(Context.ConnectionId); 
            //Find the connectionId, remove and update from the list
            var index = UserList.Single(r => r.userId == Context.ConnectionId); 
            UserList.Remove(index); 

            await Clients.Others.SendAsync("userDisconnected", Context.ConnectionId); 
            await Clients.All.SendAsync("updateCount", Count); 
            await Clients.All.SendAsync("updateUserList", Users); 
            await Clients.Others.SendAsync("newUserList", UserList); 
            await base.OnDisconnectedAsync(exception); 
        } 

    }
}