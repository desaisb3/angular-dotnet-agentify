# DaVinci Notifications

A DaVinci App that allows supervisors to send personalized notifications to all of their agents.

  

# Installation

```bash

cd ClientApp

npm install

```

  

# Software Dependencies
Using a Windows machine is recommended to test this project.
Download the following tools to run the project:
*  dotnet core 2.1 or higher (https://dotnet.microsoft.com/download/dotnet/2.2)
*  nodejs (https://nodejs.org/en/download/)
*  Fiddler (https://www.telerik.com/download/fiddler)

  

# Build and Test

**1.) Creating App in DaVinci Creator Studio:** Create a [DaVinci Creator Studio](https://studio-dev.contactcanvas.com/) App associated to this project.
Configure the app with the appropriate setting by clicking the app, pressing the "More" button, config, and finally app name:
*  **1a.)** Create a variable, if one is not present, called `isAgent` (**DO NOT** change the name of the `isAgent` variable or the code will not work) and give it the type `Boolean`. (`isAgent` is a variable that will allow the user to track if they will see agent view, no additions to the soft phone but will receive DaVinci information notifications, or supervisor view, which will have an additional dropdown containing the DaVinci Chat application.)
*  **1b.)** Set the URL to the website you wish to direct the application to a secured network.
(Ex. `https://notification.contactcanvas.com`)
The end result should look like:

![alt text](/ClientApp/src/assets/images/notification_config.png)

**2.)** Open Fiddler and go to **Tools --> HOSTS** then remap `localhost:5007` to the URL used in the configuration for step 1b and click Save. Minimize Fiddler and go to Step 3.

 ![alt text](/ClientApp/src/assets/images/host_remapping.png)

**3.)** In the terminal, call `dotnet run` command in the root folder(where the `Startup.cs` file exists).

  ![alt text](/ClientApp/src/assets/images/dotnet_run.png)

**4.)** Check `localhost:5007` and the URL used from step 1b and if prompted, advance past the security warning.

**5.)** Login to [Salesforce](https://login.salesforce.com/), go to Service Console, open the softphone and the project should appear.

   ![alt text](/ClientApp/src/assets/images/softphone_w_notification.png)

**6.)** When testing as a supervisor (`isAgent = false`), the hub connection (server in which the chat will be hosted) has not been established until the badge indicating how many users are connected is displayed on the user icon in the top left of the DaVinci Chat. Any chat sent before that badge will not be displayed.

![alt text](/ClientApp/src/assets/images/no_badge.png)

**7.)** When using the chat application, simply type in the text bar and when ready to send the notification, press enter or click the send button to the right of the input box. The message will then be displayed with in the chat window with a time stamp and an acknowledgment if the chat has been deliver to all clients.

![alt text](/ClientApp/src/assets/images/supervisor_notification.png)

**8.)** When this chat message is sent on the supervisor side, the agent's softphone will display a information notification with the user's name who sent the notification and the message following. This message will remain until the agent has closed out the notification.

![alt text](/ClientApp/src/assets/images/agent_receiving.png)

**9.)** In the scenario that multiple supervisors are present online, the supervisor sending the chat will see their notification as a typical group texting application on cell phones, on the right of the screen with a blue messaging bubble. Supervisors on the receiving end of this notification, will be prompted with an information notification at the top informing that there is a notification; however, unlike agents they will not see the content of the notification unless they view it in the DaVinci Chat window. Received messages will be displayed on the left of the chat window, just like text messages received on your cell phone.

![alt text](/ClientApp/src/assets/images/supervisor_receiving.png)
  

# Understanding Additional Features

**List of Users Connected to Chat Application:**
This List of users connected to the chat application can be located by pressing the icon that looks like two people. When clicked, a drop down menu will be displayed with all users. If you were to hover over a particular user, the user's full name will be displayed, as well as their email.

![usersgif](/ClientApp/src/assets/images/UsersGif.gif)
  

# Contribute
Help us improve by adding and contributing some of these features:
*  Create a search bar within the Users list to check for a specific acitve user.
*  Indicate when a user leaves. Print "`Username` has left the chat" within the chat window.
