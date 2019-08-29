import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ClientsService } from 'src/services/clients/clients.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Client } from 'src/models/client.model';
import { Credit } from 'src/models/credit.model';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-create-clients',
  templateUrl: './create-clients.page.html',
  styleUrls: ['./create-clients.page.scss'],
})
export class CreateClientsPage implements OnInit {

    //Formulario de clientes
    mainForm = new FormGroup({
      client: new FormGroup({
        id: new FormControl(''),
        fullName: new FormControl(''),
        phone: new FormControl(''),
        mobile: new FormControl(''),
        bussinessType: new FormControl(''),
        address: new FormControl(''),
        neighborhood: new FormControl(''),
        city: new FormControl(''),
      }),
      credit: new FormGroup({
        totalAmount: new FormControl(''),
        numberFees: new FormControl(''),
        billingFrequency: new FormControl('daily'),
        feesTotalAmount: new FormControl('')
      })
    })

  constructor(
    private clientsService: ClientsService,
    private creditsService: CreditsService,
    private loaderCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
  }

  async presentToast(message: string): Promise<void>{
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: 'OK'
    });

    toast.present();
  }

  async createClient(): Promise<void>{
    const loader = await this.loaderCtrl.create({
      message: 'Guardando información...',
    });
    loader.present();

    //Data to send
    const client: Client = {
      ...this.mainForm.value.client
    }

    const credit: Credit = {
      ...this.mainForm.value.credit,
      id: `${moment().format("YYYYMMDD")}-${client.id}`,
      idClient: client.id,
      fullNameClient: client.fullName,
      profitPercentage: 1,
      state: 'Acreditado',
      feesPaid: 0,
      outstandingFees: this.mainForm.value.credit.numberFees, 
      balance: this.mainForm.value.credit.totalAmount,
      createdAt: moment().tz("America/Bogota").toISOString()
    }

    try {
      await this.clientsService.addClient(client);
      await this.creditsService.addCredit(credit);

      this.presentToast('Información guardada');
      this.mainForm.reset();

    } catch (error) {
      this.presentToast('Error al guardar');
      console.log(error)
    } finally {
      loader.dismiss();
    }
  }
}
