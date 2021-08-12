import { ChatService } from './../../services/chat.service';
import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { initializeComplete, NOTIFICATION_TYPE, INotificationMessage, sendNotification, getUserDetails, setAppHeight } from '@amc-technology/davinci-api';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { Message, MessageType } from '../../models/message';
import * as applicationAPI from '@amc-technology/davinci-api';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css']
})
export class NotifyComponent implements OnInit, INotificationMessage {

  //Creating empty array where messages will be held
  public texts = [];
  public sendingMessage = new Message();
  //A unique id is created for the hub connection
  public userUniqueId: string = new Date().getTime().toString();
  public userName: string;
  public userLastName: string;
  public userEmail: string;
  public usersOnline: number;      
  public allUsers: any;
  public userId: string;
  public userList: any[] = [];
  public sortedList: any[] = [];
  public userCount: number;
  public isAgent: boolean;
  public config: any;
  public userLeft: string;
  public messageDelivered: boolean = false;
  public user: any;
  public smallestAppHeight: number = 36; //Smallest value to still fit all of the app when collapsed
  public largestAppHeight: number = 433; //App height that shows entirity of expanded app
  public messageType = MessageType;


  constructor(private _ngZone: NgZone, private chatService: ChatService) {
    this.subscribeToEvents();
   }

   public message: string = "New Message From ";
  notificationType: NOTIFICATION_TYPE.Information;

  @ViewChild('autosize', {static: false}) autosize: CdkTextareaAutosize;
  @ViewChild('entireChat', {static: false}) chatElement: ElementRef;

  async ngOnInit() {
    this.config = await applicationAPI.getConfig();
    await initializeComplete().then(configReturn => {
      //this.config = configReturn;
    });
    //Grab app configuration for if the user is a agent or supervisor
    this.isAgent = this.config["variables"]["isAgent"];
    //If the app configuration does not exist, defaulted to agent environment
    if(this.isAgent === undefined) {
      this.isAgent = true;
    }
    if(this.isAgent == true) {
      applicationAPI.setAppHeight(0);
    } else {
      applicationAPI.setAppHeight(this.largestAppHeight);
    }

    this.user=(await getUserDetails());
    this.userName = this.user.firstName;
    this.userLastName = this.user.lastName;
    this.userEmail = this.user.email;
  }

  //When text exceeds the text area width, it will automatically add a new line
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  //Collapsable for DaVinci Chat
  //  -Grabs the arrow image and everytime it is clicked:
  //    1.) checks the display
  //      a.)If display is shown, hide content and adjust app height
  //      b.)If display is hidden, show content and adjust app height
  triggerMinimize() {
    let contentDiv = document.getElementById("minimizeContent");
    let image = document.getElementById("arrow");
    if(contentDiv.style.display == "block") {
      contentDiv.style.display = "none";
      applicationAPI.setAppHeight(this.smallestAppHeight);
      image.setAttribute('src', 'https://amcdavincistorage.blob.core.windows.net/icon-pack/section_expand.png');
      image.title = "Expand";
    } else {
      contentDiv.style.display = "block";
      image.setAttribute('src', 'https://amcdavincistorage.blob.core.windows.net/icon-pack/section_collapse.png');
      applicationAPI.setAppHeight(this.largestAppHeight);
      image.title = "Collapse";
    }
  }

  //Occurs on button click or when just enter is pressed
  //  - Parameter: Input string within the textarea
  //  - Makes the text area empty so a new message can be typed
  //  - Grabs current User's details, the time stamp in HH:MM, and the inputText and places them in an array, along with a type in order to dictate the type of message
  //  - Trim the string of potential empty space and if there is still a value, add the message to an array.
  //  - Setter for a new message that will then be sent to all connected clients
  async textSent(inputText: string) {
    (<HTMLInputElement>document.getElementById('notificationInput')).value = "";
    let username = this.userEmail;
    //let username = this.userName + " " + this.userLastName

    let myDate: Date = new Date();
    let arr =  [username, inputText, myDate, this.messageType.Send];
    this.sendingMessage.message = inputText;
    this.sendingMessage.user = username;
    this.sendingMessage.clientid = this.userUniqueId;
    this.sendingMessage.date = myDate;

    this.sendingMessage.type = this.messageType.Send;
    console.log(this.sendingMessage.type);
    //this.sendingMessage.type = "send";

    if(this.sortedList.length==1){
      return alert('Only you are in the chat!');
    }

    if(inputText.trim() != "" && this.sortedList.length>1)
    {
      this.texts.push(arr);

      this.sendingMessage.type = this.messageType.Receive;
      console.log(this.sendingMessage.type);
      //this.sendingMessage.type = "receive";
      this.chatService.sendMessage(this.sendingMessage); //Call send message to send it to everyone (Should be the only update required in this method)
      //Invoke 'acknowledgeMessage' method in the server which will
      //ensure that the message was indeed delivered to all the connected
      //clients
      this.chatService.hubConnection.invoke('acknowledgeMessage', "Message Delivered!");
      let lastMessage = this.getLastMessage();
      // Scrolls to the most recent message, only scrolls for sent messages
      setTimeout(() => lastMessage.scrollTo({behavior: "smooth", top: lastMessage.scrollHeight}),0);
    }
  }

  //Grabs the container in which holds and displays all notification messages
  public getLastMessage() : HTMLElement {
    return this.chatElement.nativeElement;
  }

  //Method to invoke when the client clicks on the 'Start Chat' button
  //to refresh the Active Users list
   async refreshList() {

    this.user = (await getUserDetails());
    this.userName = this.user.firstName;
    this.userLastName = this.user.lastName;
    this.userEmail = this.user.email;
    //Send the username to the server to bind it with connectionID
    //and send the userlist (Active Users) to all connected clients
    this.chatService.hubConnection.send('addNewUser', this.userName, this.userEmail, this.userLastName);
  }

  //Subscribes to an event upon the recieval of a message
  //  -Creates an array with all the values of the message
  //  -Checks to see if the message was sent from the current user by checking the unique id
  //  -If the two ids are not the same, add the message to the array of messages
  private subscribeToEvents(): void {
    this.chatService.messageRecieved.subscribe((message: Message) => {
      this._ngZone.run(() => {
        let messageArray = [message.user, message.message, message.date, message.type, message.clientid];
        if(message.clientid !== this.userUniqueId) {
          if(this.isAgent == true) {
            sendNotification(this.message + message.user + ": " + message.message, this.notificationType);
          } else {
            this.texts.push(messageArray);
            sendNotification("Notification sent from " + message.user, this.notificationType);
          }
        }
      });
    });

    //On a user connecting to the hub, grab the user first name and email from DaVinci
    this.chatService.userConnected.subscribe();

    //Updates the count of users in the hub depending on disconnection or new connection
    this.chatService.updateCount.subscribe((count: number) => {
      this.usersOnline=count;
    });

    this.chatService.userDisconnected.subscribe();

    //On user disconnection
    //  -Grabs user disconnecting's details
    //  -Creates an array of exit response, type of message, placeholder, placeholder
    //  -Adds to the message array so it can outputed to all users chat windows
    this.chatService.userleftInfo.subscribe((userData: any) => {
      this.userLeft = userData.username + " " + userData.lastname;
      let leavingUser = [this.userLeft + "\nhas left the chat!", this.messageType.UserLeft, "none", "none"];
      this.texts.push(leavingUser);
    });

    //Updates userlist depedning on new connections or disconnections
    this.chatService.updateUserList.subscribe((userList: any) => {
      this._ngZone.run(() => {
        this.allUsers=userList;
      });
    });

    //Refreshes the list of active users
    this.chatService.connectionEstablished.subscribe(() => {
      this.refreshList();
    });

    this.chatService.addUser.subscribe((userList: any)=> {
      this.userList = userList;
      //Sorting the usernames list alphabetically
      this.sortedList=this.userList.sort((a,b) => a.username.localeCompare(b.username));
      this.userCount = this.sortedList.length;
    });

    //Upon delivery of the message, grabs the emittion of data from hub confirming the message was received
    this.chatService.acknowledgeMessage.subscribe((message: string) => {
      if(message === "Message Delivered!"){
        this.messageDelivered = true;
      }
    });
  }
}
