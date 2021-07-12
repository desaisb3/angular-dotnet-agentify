import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import { Message } from '../models/message';
import * as signalR from "@microsoft/signalr";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  messageRecieved = new EventEmitter<Message>();
  connectionEstablished = new EventEmitter<Boolean>();

  private isConnectionEstablished = false;
  private hubConnection: HubConnection;

  constructor() {
    this.createConnection();
    this.registerOnServerEvent();
    this.startConnection();
  }

  //Calls the function NewMessage in the /Hubs/ChatHub which will send the message to all clients
  //Parameters: message (the user input in the textarea)
  sendMessage(message: Message) {
    //console.log("Right before invoke: " + message.user);
    this.hubConnection.invoke('NewMessage', message);
  }

  private createConnection() {
    /*this.hubConnection = new HubConnectionBuilder()
      .withUrl(window.location.href + '/ChatHub')
      .build(); */
      //.withUrl("https://notification.contactcanvas.com/ChatHub")
      //.withUrl("https://localhost:5007/ChatHub")
      this.hubConnection = new HubConnectionBuilder()
        .withUrl("https://notification.contactcanvas.com/ChatHub")
        .build();
  }

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

  private registerOnServerEvent(): void {
    this.hubConnection.on('MessageReceived', (data: any) => {
      this.messageRecieved.emit(data);
    })
  }

}
