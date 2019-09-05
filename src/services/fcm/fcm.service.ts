import { Injectable } from '@angular/core';
import { FCM } from '@ionic-native/fcm/ngx';
import { UsersService } from '../users/users.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private fcm: FCM,
    private usersService: UsersService
  ) { 
    this._onRefreshTokenUser();
  }

  /**
   * Actualiza el token del usuario en caso de que el dispositivo cambie
   */
  private _onRefreshTokenUser(): void {
    this.fcm.onTokenRefresh().subscribe(token => {
      this.usersService.updateUser(this.usersService.getId(), {token});
    });
  }

  /**
   * Obtiene el Token que identifica el dispositivo del usuario
   * y lo guarda en la base de datos
   */
  async getTokenDevice(): Promise<void> {
    const token = await this.fcm.getToken();
    this.usersService.updateUser(this.usersService.getId(), {token});
  }


}
