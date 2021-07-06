import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { setAppHeight, initializeComplete, NOTIFICATION_TYPE, INotificationMessage, sendNotification, getUserDetails, getSequenceID } from '@amc-technology/davinci-api';

import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {take} from 'rxjs/operators';
import { Notification } from 'rxjs';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css']
})
export class NotifyComponent implements OnInit {

  public texts = [];
  /* public preset = [["Little Jimmy", "I was only nine years old."], ["Little Jimmy", "I loved Shrek so much, I had all the merchandise and movies."], ["Little Jimmy", " I'd pray to Shrek every night before I go to bed, thanking for the life I've been given."],
    ["Little Jimmy", "Shrek is love, I would say, Shrek is life."], ["Little Jimmy", "My dad hears me and calls me a faggot."], ["Little Jimmy", "I knew he was just jealous for my devotion of Shrek."], ["Little Jimmy", "I called him a cunt."], ["Little Jimmy", "He slaps me and sends me to go to sleep."],
    ["Little Jimmy", "I'm crying now and my face hurts."], ["Little Jimmy", "I lay in bed and it's really cold. A warmth is moving towards me. I feel something touch me."], ["Little Jimmy", "It's Shrek."], ["Little Jimmy", "I'm so happy. He whispers in my ear, This is my swamp."],
    ["Little Jimmy", "He grabs me with his powerful ogre hands, and puts me on my hands and knees."], ["Little Jimmy", "I spread my ass-cheeks for Shrek. He penetrates my butthole."], ["Little Jimmy", "It hurts so much, but I do it for Shrek."], ["Little Jimmy", "I can feel my butt tearing as my eyes start to water."],
    ["Little Jimmy", "I push against his force.", "I want to please Shrek."], ["Little Jimmy", "He roars a mighty roar, as he fills my butt with his love."], ["Little Jimmy", "My dad walks in. Shrek looks him straight in the eye, and says, It's all ogre now."],
    ["Little Jimmy", "Shrek leaves through my window."], ["Little Jimmy", "Shrek is love. Shrek is life."]]; */
  public preset = [["ESPN NBA Draft Bot", "Nah'shon Hyland Season Stats: 19.5 PTS, 4.7 REBS, 2.1 AST, 44.7% FG%"], ["ESPN NBA Draft Bot", "Cade Cunningham Season Stats: 20.1 PTS, 6.2 REBS, 3.5 AST, 43.8% FG%"], ["ESPN NBA Draft Bot", "Jalen Green Season Stats: 17.9 PTS, 4.1 REBS, 2.8 AST, 46.1% FG%"],
    ["ESPN NBA Draft Bot", "Evan Mobley Season Stats: 16.4 PTS, 8.7 REBS, 2.4 AST, 57.8% FG%"], ["ESPN NBA Draft Bot", "Jalen Suggs Season Stats: 14.4 PTS, 5.3 REBS, 4.5 AST, 50.3% FG%"], ["ESPN NBA Draft Bot", "James Bouknight Season Stats: 18.7 PTS, 5.7 REBS, 1.8 AST, 44.7% FG%"], ["ESPN NBA Draft Bot", "Jonathan Kuminga Season Stats: 15.8 PTS, 7.2 REBS, 2.7 AST, 38.7% FG%"],
    ["ESPN NBA Draft Bot", "Scottie Barnes Season Stats: 10.3 PTS, 4.0 REBS, 4.1 AST, 50.3% FG%"], ["ESPN NBA Draft Bot", "Davion Mitchell Season Stats: 14.0 PTS, 2.7 REBS, 5.5 AST, 51.1% FG%"], ["ESPN NBA Draft Bot", "Josh Giddy Season Stats: 10.9 PTS, 7.4 REBS, 7.5 AST, 42.7% FG%"], ["ESPN NBA Draft Bot", "Franz Wagner Season Stats: 12.5 PTS, 6.5 REBS, 3.0 AST, 47.7% FG%"],
    ["ESPN NBA Draft Bot", "Moses Moody Season Stats: 16.8 PTS, 5.8 REBS, 1.6 AST, 42.7% FG%"], ["ESPN NBA Draft Bot", "Corey Kispert Season Stats: 18.6 PTS, 5.0 REBS, 1.8 AST, 52.9% FG%"], ["ESPN NBA Draft Bot", "Keon Johnson Season Stats: 11.3 PTS, 3.5 REBS, 2.5 AST, 44.9% FG%"],  ["ESPN NBA Draft Bot", "Ayo Dosunmu Season Stats: 20.1 PTS, 6.3 REBS, 5.3 AST, 48.8% FG%"]];

  constructor(private _ngZone: NgZone) { }

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

  async textSent(inputText: string) {
    (<HTMLInputElement>document.getElementById('notificationInput')).value = "";
    let userName = (await getUserDetails()).firstName + " " + (await getUserDetails()).lastName;
    let myDate: Date = new Date();
    let arr =  [userName, inputText, myDate];
    if(inputText.trim() != "")
    {
      this.texts.push(arr);
    }
  }
}
