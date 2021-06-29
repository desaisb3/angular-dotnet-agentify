import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.css']
})
export class NotifyComponent implements OnInit {

  public $message = "";
  public messageSent = false;

  constructor() { }

  ngOnInit() {
  }

  async sendMessage() {
    console.log(this.$message);
    this.messageSent=true;
  }


}
