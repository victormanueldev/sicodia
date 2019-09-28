import { Component } from '@angular/core';

import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from 'src/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Clientes',
      url: '/clients',
      icon: 'person'
    },
    {
      title: 'Recaudos',
      url: '/collections',
      icon: 'cash'
    }

  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private loaderCtrl: LoadingController,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  async logout(): Promise<void>{
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de cerrar la sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel'},
        {
          text: 'Aceptar',
          handler: async () => {
            const loader = await this.loaderCtrl.create({
              message: 'Cerrando sesión...'
            });
            loader.present();
            try {
              await this.authService.logout();
              window.location.href = '/login';
              // this.router.navigate(['/']);
            } catch (error) {
              console.log(error);
            } finally {
              loader.dismiss();
            }
          }
        }

      ]
    })

    alert.present();
  }
}
