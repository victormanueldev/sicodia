import { Component, OnInit } from '@angular/core';
import { FcmService } from 'src/services/fcm/fcm.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private fcmService: FcmService
  ) { 
    this.fcmService.getTokenDevice();
  }


}
