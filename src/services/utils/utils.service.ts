import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { AlertButton, AlertInput } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private loaderCtrl: LoadingController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  /**
   * Muestra un alert con los parametros dados
   * @param header 
   * @param subHeader 
   * @param message 
   * @param inputs
   * @param buttons 
   * @param cssClass 
   */
  async presentAlert(header: string, subHeader: string, message: string, buttons: Array<AlertButton>, inputs?: Array<Partial<AlertInput>>, cssClass?: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      subHeader,
      message,
      inputs,
      buttons,
      cssClass
    });

    alert.present();
  }

  /**
   * Muestra un toast con los parametros dados
   * @param message 
   * @param duration 
   * @param closeButtonText 
   * @param showCloseButton 
   */
  async presentToast(message: string, duration: number, closeButtonText: string, showCloseButton: boolean): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      closeButtonText,
      showCloseButton
    });

    toast.present();
  }

  /**
   * Muestra un loader con el mensaje dado
   * @param message 
   */
  async presentLoader(message: string): Promise<HTMLIonLoadingElement> {
    const loader = await this.loaderCtrl.create({
      message
    });
    return loader;
  }
}
