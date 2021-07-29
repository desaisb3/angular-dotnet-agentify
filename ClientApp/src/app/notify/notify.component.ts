import { ChatService } from './../../services/chat.service';
import { Component, OnInit, NgZone, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { initializeComplete, NOTIFICATION_TYPE, INotificationMessage, sendNotification, getUserDetails, setAppHeight } from '@amc-technology/davinci-api';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { Message } from '../../models/message';
import * as applicationAPI from '@amc-technology/davinci-api';


@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css']
})
export class NotifyComponent implements OnInit, INotificationMessage, AfterViewChecked {

  //Creating empty array where messages will be held
  public texts = [];
  public sendingMessage = new Message();
  //A unique id is created for the hub connection
  public userUniqueId: string = new Date().getTime().toString();
  userName;
  userLastName;
  userEmail;
  usersOnline;      
  allUsers;
  userId;
  userList: any[] = [];
  sortedList: any[] = [];
  userCount;
  isAgent;
  config;
  userLeft;
  messageDelivered = false;


  constructor(private _ngZone: NgZone, private chatService: ChatService) {
    this.subscribeToEvents();
   }

  message: string = "New Message From ";
  notificationType: NOTIFICATION_TYPE.Information;

  @ViewChild('autosize', {static: false}) autosize: CdkTextareaAutosize;
  @ViewChild('entireChat', {static: false}) chatElement: ElementRef;

  async ngOnInit() {
    this.config = await applicationAPI.getConfig();
    await initializeComplete().then(configReturn => {
      //this.config = configReturn;
    });
    this.userName = (await getUserDetails()).firstName;
    this.userLastName = (await getUserDetails()).lastName;
    this.userEmail = (await getUserDetails()).email;
    this.isAgent = this.config["variables"]["isAgent"];
    console.log("this isAgent is: " + this.isAgent);
  }


  ngAfterViewChecked(): void {
    if(this.isAgent == true) {
      applicationAPI.setAppHeight(0);
    } else {
      applicationAPI.setAppHeight(415);
    }
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  //Occurs on button click or when just enter is pressed
  //  - Parameter: Input string within the textarea
  //  - Makes the text area empty so a new message can be typed
  //  - Grabs current User's details, the time stamp in HH:MM, and the inputText and places them in an array, along with a type in order to dictate the type of message
  //  - Trim the string of potential empty space and if there is still a value, add the message to an array.
  //  - Setter for a new message that will then be sent to all connected clients
  async textSent(inputText: string) {
    (<HTMLInputElement>document.getElementById('notificationInput')).value = "";
    let username = this.userName + " " + this.userLastName
    let myDate: Date = new Date();
    let arr =  [username, inputText, myDate, "send"];
    this.sendingMessage.message = inputText;
    this.sendingMessage.user = username;
    this.sendingMessage.clientid = this.userUniqueId;
    this.sendingMessage.date = myDate;
    this.sendingMessage.type = "send";

    if(this.sortedList.length==1){
      console.log('Only you are in the chat!');
      return alert('Only you are in the chat!');
    }

    if(inputText.trim() != "" && this.sortedList.length>1)
    {
      this.texts.push(arr);
      this.sendingMessage.type = "receive";
      this.chatService.sendMessage(this.sendingMessage); //Call send message to send it to everyone (Should be the only update required in this method)
      //Invoke 'acknowledgeMessage' method in the server which will
      //ensure that the message was indeed delivered to all the connected
      //clients
      this.chatService.hubConnection.invoke('acknowledgeMessage', "Message Delivered!");
      let lastMessage = this.getLastMessage();
      console.log(lastMessage);
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
    this.userName = (await getUserDetails()).firstName;
    this.userLastName = (await getUserDetails()).lastName;
    this.userEmail = (await getUserDetails()).email;
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
          this.texts.push(messageArray);
          sendNotification(this.message + message.user + ": " + message.message, this.notificationType);
        }
      });
    });

    this.chatService.userConnected.subscribe(async (userId)=>{
      this.userName = (await getUserDetails()).firstName;
      this.userEmail = (await getUserDetails()).email;
      console.log(userId + " has joined the chat");
    });

    this.chatService.updateCount.subscribe((count) => {
      this._ngZone.run(() => {
        console.log('Total users = ' + count);
        this.usersOnline=count;
      });
    });

    this.chatService.userDisconnected.subscribe((userId)=>{
      console.log(userId + " has left the chat");
    });

    this.chatService.userleftInfo.subscribe((userData) => {
      console.log(userData);
      this.userLeft = userData.username + " " + userData.lastname;
      console.log(this.userLeft + " has left the chat!");
    });

    this.chatService.updateUserList.subscribe((userList) => {
      this._ngZone.run(() => {
        console.log('Total users = ' + userList);
        console.log(userList);
        this.allUsers=userList;
      });
    });

    this.chatService.connectionEstablished.subscribe(() => {
      this.refreshList();
    });

    this.chatService.addUser.subscribe((userList)=> {
      console.log(userList);
      this.userList = userList;
      //Sorting the usernames list alphabetically
      this.sortedList=this.userList.sort((a,b) => a.username.localeCompare(b.username));
      this.userCount = this.sortedList.length;
    });

    this.chatService.acknowledgeMessage.subscribe((message) => {
      console.log(message);
      //console.log(applicationAPI.getConfig());
      if(message === "Message Delivered!"){
        this.messageDelivered = true;
      }
    });
  }
}
