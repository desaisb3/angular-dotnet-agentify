import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { Message } from '../models/message';

import { getUserDetails } from '@amc-technology/davinci-api';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  messageRecieved = new EventEmitter<Message>();
  userConnected = new EventEmitter();
  userDisconnected = new EventEmitter();
  connectionEstablished = new EventEmitter<Boolean>();
  updateCount = new EventEmitter();
  updateUserList = new EventEmitter();
  updateUserNameList = new EventEmitter();
  addUser = new EventEmitter();
  userTyping = new EventEmitter();
  acknowledgeMessage = new EventEmitter();
  userleftInfo = new EventEmitter();

  userName;

  private isConnectionEstablished = false;
  public hubConnection: HubConnection;

  constructor() {
    this.createConnection();
    this.registerOnServerEvent();
    this.startConnection();
    //this.refreshList();
  }

  //Calls the function NewMessage in the /Hubs/ChatHub which will send the message to all clients
  //Parameters: message (the user input in the textarea)
  sendMessage(message: Message) {
    this.hubConnection.invoke('NewMessage', message);
  }

  //Creating a new hub connection
  //  - withUrl must be a path to the hub class created
  private createConnection() {
    /*this.hubConnection = new HubConnectionBuilder()
      .withUrl(window.location.href + '/ChatHub')
      .build(); */
      //.withUrl("https://notification.contactcanvas.com/ChatHub")
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(window.location.href + 'ChatHub') //This is hard coded and will need to be changed later
        .build();
  }

  //Starts the hub connection that was created
  //  -If successful, the boolean isConnectionEstablished is turned to true and is emitted
  //  -If unsuccessful, an error will be logged and the function will callback itself after 5 seconds
  private startConnection(): void {
    this.hubConnection
      .start()
      .then(() => {
        this.isConnectionEstablished = true;
        console.log('Hub connection started');
        this.connectionEstablished.emit(true);
      })
      .catch(err => {
        console.log("Error while establishing connection, retrying...");
        setTimeout(function () {
          this.startConnection(); }, 5000);
      });
  }


  //Listens for a message coming in and when there is one, sends an event of the data received
  private registerOnServerEvent(): void {
    this.hubConnection.on('MessageReceived', (data: any) => {
      this.messageRecieved.emit(data);
    });

    this.hubConnection.on("userConnected", (userId) => {
      this.userConnected.emit(userId);
    });

    this.hubConnection.on("updateCount", (count) => {
      this.updateCount.emit(count);
    });

    this.hubConnection.on("userDisconnected", (data)=> {
      this.userDisconnected.emit(data);
    });

    this.hubConnection.on("updateUserList", (data)=>{
      this.updateUserList.emit(data);
    });

    this.hubConnection.on("newUserList", (data)=> {
      this.addUser.emit(data);
    });

    this.hubConnection.on("userTyping", (data) => {
      this.userTyping.emit(data);
    });

    this.hubConnection.on("notifyDelivery", (data) => {
      this.acknowledgeMessage.emit(data);
    });

    this.hubConnection.on("userleftInfo", (data)=> {
      this.userleftInfo.emit(data);
    });
  }

}
