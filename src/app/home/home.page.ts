import { Component, OnInit } from '@angular/core';
import { FcmService } from 'src/services/fcm/fcm.service';
import { UtilsService } from 'src/services/utils/utils.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(
    private fcmService: FcmService,
    private utilsService: UtilsService
  ) { }

  async ngOnInit() {
    try {
      await this.fcmService.getTokenDevice();
      this.utilsService.presentToast(
        "Token enviado",
        6000,
        "OK",
        true
      );
    } catch (error) {
      this.utilsService.presentToast(
        error,
        6000,
        "OK",
        true
      );
    }
  }




}
