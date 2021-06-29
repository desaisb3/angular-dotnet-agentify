import { Component, OnInit } from '@angular/core';
import { setAppHeight, initializeComplete } from '@amc-technology/davinci-api';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css']
})
export class NotifyComponent implements OnInit {

  public $message = "";
  public messageSent = false;

  constructor() { }

  async ngOnInit() {
    await initializeComplete().then(configReturn => {
      setAppHeight(400, true);
      //this.config = configReturn;
    });
  }


  async sendMessage() {
    console.log(this.$message);
    setTimeout(() => {
      this.messageSent=false;
    }, 2000)
    this.messageSent=true;
  }


}
