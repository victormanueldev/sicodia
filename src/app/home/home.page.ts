import { Component, OnInit } from '@angular/core';
import { FcmService } from 'src/services/fcm/fcm.service';
import { UtilsService } from 'src/services/utils/utils.service';
import { UsersService } from 'src/services/users/users.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor(
    private fcmService: FcmService,
    private utilsService: UtilsService,
    private usersService: UsersService
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

  async update(){
    try {
      await this.usersService.updateUser(this.usersService.getId(), {token: 'TOKEN'})
      this.utilsService.presentToast(
        'Update OK',
        5000,
        'OK',
        true
      );
    } catch (error) {
      this.utilsService.presentToast(
        error,
        5000,
        'OK',
        true
      );
    }
  }

}
