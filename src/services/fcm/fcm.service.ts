import { Injectable } from '@angular/core';
import { FCM } from '@ionic-native/fcm/ngx';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsersService } from '../users/users.service';
import { Notification } from 'src/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private fcm: FCM,
    private usersService: UsersService,
    private http: HttpClient
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

  /**
   * Envia las notificaciones a los usuarios que corresponda
   * @param data 
   */
  sendNotifications(data: Notification): Promise<any>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'AAAA4j7FUP0:APA91bHgEQAygvGAC7Ou3B6sauOc-PkThkoHtm2FN1xcqUdQHK1xPdUymSKv9QX4CBhTFJhrnoZZdDAFlKJY32XRPzLXWm2z-SABv-tqY-Fr7smo83sI1uPqpyl_2tgzC77ZCKQAqREv'
      })
    };
    return new Promise((resolve, reject) => {
      this.http.post('https://fcm.googleapis.com/fcm/send', data, httpOptions).subscribe(
        data => {
          resolve(data);
        },
        error => {
          reject(error);
        }
      );
    });
  }


}
