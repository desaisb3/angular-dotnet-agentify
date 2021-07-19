import { ChatService } from './../../services/chat.service';
import { Component, OnInit, NgZone, ViewChild, EventEmitter, Output, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { setAppHeight, initializeComplete, NOTIFICATION_TYPE, INotificationMessage, sendNotification, getUserDetails, getSequenceID } from '@amc-technology/davinci-api';

import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { Notification } from 'rxjs';
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
  userEmail;
  startButton = true;
  closeButton = false;
  usersOnline;      
  allUsers;
  userId;
  userList: any[] = [];

  constructor(private _ngZone: NgZone, private chatService: ChatService) {
    this.subscribeToEvents();
   }

  message: string = "New Message From ";
  notificationType: NOTIFICATION_TYPE.Information;

  @ViewChild('autosize', {static: false}) autosize: CdkTextareaAutosize;
  @ViewChild('entireChat', {static: false}) chatElement: ElementRef;

  async ngOnInit() {
    await initializeComplete().then(configReturn => {
      //this.config = configReturn;
    });
    this.userName = (await getUserDetails()).firstName;
    this.userEmail = (await getUserDetails()).email;
    //this.refreshList();
  }

  //Method to open the 'Chat Container'
  async openChatBox() {
    this.startButton = false;
    this.closeButton = true;
  }

  async closeButton$(){
    this.closeButton = false;
    this.startButton = true;
  }

  ngAfterViewChecked(): void {
    applicationAPI.setAppHeight(400);
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
    let userName = (await getUserDetails()).firstName + " " + (await getUserDetails()).lastName;
    let myDate: Date = new Date();
    let arr =  [userName, inputText, myDate, "send"];
    this.sendingMessage.message = inputText;
    this.sendingMessage.user = userName;
    this.sendingMessage.clientid = this.userUniqueId;
    this.sendingMessage.date = myDate;
    this.sendingMessage.type = "send";
    if(inputText.trim() != "")
    {
      this.texts.push(arr);
      this.sendingMessage.type = "receive";
      //setAppHeight(400, true);
      this.chatService.sendMessage(this.sendingMessage); //Call send message to send it to everyone (Should be the only update required in this method)
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
    this.startButton = false;
    this.closeButton = true;
    this.userName = (await getUserDetails()).firstName;
    //Send the username to the server to bind it with connectionID
    //and send the userlist (Active Users) to all connected clients
    this.chatService.hubConnection.send('addNewUser', this.userName);
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
          sendNotification(this.message + message.user, this.notificationType);
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
    })
  }
}
