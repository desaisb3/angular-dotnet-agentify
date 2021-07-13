import { ChatService } from './../../services/chat.service';
import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { setAppHeight, initializeComplete, NOTIFICATION_TYPE, INotificationMessage, sendNotification, getUserDetails, getSequenceID } from '@amc-technology/davinci-api';

import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { Notification } from 'rxjs';
import { Message } from '../../models/message';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css']
})
export class NotifyComponent implements OnInit {

  public texts = [];
  public preset = [];
  public sendingMessage = new Message();
  public userId: string = new Date().getTime().toString();
  /*public preset = [["ESPN NBA Draft Bot", "Nah'shon Hyland Season Stats: 19.5 PTS, 4.7 REBS, 2.1 AST, 44.7% FG%"], ["ESPN NBA Draft Bot", "Cade Cunningham Season Stats: 20.1 PTS, 6.2 REBS, 3.5 AST, 43.8% FG%"], ["ESPN NBA Draft Bot", "Jalen Green Season Stats: 17.9 PTS, 4.1 REBS, 2.8 AST, 46.1% FG%"],
    ["ESPN NBA Draft Bot", "Evan Mobley Season Stats: 16.4 PTS, 8.7 REBS, 2.4 AST, 57.8% FG%"], ["ESPN NBA Draft Bot", "Jalen Suggs Season Stats: 14.4 PTS, 5.3 REBS, 4.5 AST, 50.3% FG%"], ["ESPN NBA Draft Bot", "James Bouknight Season Stats: 18.7 PTS, 5.7 REBS, 1.8 AST, 44.7% FG%"], ["ESPN NBA Draft Bot", "Jonathan Kuminga Season Stats: 15.8 PTS, 7.2 REBS, 2.7 AST, 38.7% FG%"],
    ["ESPN NBA Draft Bot", "Scottie Barnes Season Stats: 10.3 PTS, 4.0 REBS, 4.1 AST, 50.3% FG%"], ["ESPN NBA Draft Bot", "Davion Mitchell Season Stats: 14.0 PTS, 2.7 REBS, 5.5 AST, 51.1% FG%"], ["ESPN NBA Draft Bot", "Josh Giddy Season Stats: 10.9 PTS, 7.4 REBS, 7.5 AST, 42.7% FG%"], ["ESPN NBA Draft Bot", "Franz Wagner Season Stats: 12.5 PTS, 6.5 REBS, 3.0 AST, 47.7% FG%"],
    ["ESPN NBA Draft Bot", "Moses Moody Season Stats: 16.8 PTS, 5.8 REBS, 1.6 AST, 42.7% FG%"], ["ESPN NBA Draft Bot", "Corey Kispert Season Stats: 18.6 PTS, 5.0 REBS, 1.8 AST, 52.9% FG%"], ["ESPN NBA Draft Bot", "Keon Johnson Season Stats: 11.3 PTS, 3.5 REBS, 2.5 AST, 44.9% FG%"],  ["ESPN NBA Draft Bot", "Ayo Dosunmu Season Stats: 20.1 PTS, 6.3 REBS, 5.3 AST, 48.8% FG%"]];
  */

  constructor(private _ngZone: NgZone, private chatService: ChatService) {
    this.subscribeToEvents();
   }

  @ViewChild('autosize', {static: false}) autosize: CdkTextareaAutosize;

  async ngOnInit() {
    await initializeComplete().then(configReturn => {
      setAppHeight(400, true);
      //this.config = configReturn;
    });
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1))
        .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  //Occurs on button click or when just enter is pressed
  //  - Parameter: Input string within the textarea
  //  - Makes the text area empty so a new message can be typed
  //  - Grabs current User's details, the time stamp in HH:MM, and the inputText and places them in an array
  //  - Trim the string of potential empty space and if there is still a value, add the message to an array.
  async textSent(inputText: string) {
    (<HTMLInputElement>document.getElementById('notificationInput')).value = "";
    let userName = (await getUserDetails()).firstName + " " + (await getUserDetails()).lastName;
    let myDate: Date = new Date();
    let arr =  [userName, inputText, myDate, "send"];
    this.sendingMessage.message = inputText;
    this.sendingMessage.user = userName;
    this.sendingMessage.clientid = this.userId;
    console.log(this.sendingMessage.user)
    console.log(this.userId);
    this.sendingMessage.date = myDate;
    this.sendingMessage.type = "send";
    if(inputText.trim() != "")
    {
      this.texts.push(arr);
      this.sendingMessage.type = "receive";
      this.chatService.sendMessage(this.sendingMessage); //Call send message to send it to everyone (Should be the only update required in this method)
    }
  }

private subscribeToEvents(): void {
  console.log("hey the subscribe to event has been made!");
  this.chatService.messageRecieved.subscribe((message: Message) => {
    this._ngZone.run(() => {
      let messageArray = [message.user, message.message, message.date, message.type, message.clientid];
      console.log(message.clientid);
      if(message.clientid !== this.userId) {
        this.texts.push(messageArray); //Becareful to watch for the texts you send that you also recieve. If so error is from here.
        console.log(this.texts);
      }
    })
  })
}

}
