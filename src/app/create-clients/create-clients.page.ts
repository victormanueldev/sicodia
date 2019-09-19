import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ClientsService } from 'src/services/clients/clients.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Client } from 'src/models/client.model';
import { Credit } from 'src/models/credit.model';
import * as moment from 'moment-timezone';
import { StaticFees } from './static-fees';

@Component({
  selector: 'app-create-clients',
  templateUrl: './create-clients.page.html',
  styleUrls: ['./create-clients.page.scss'],
})
export class CreateClientsPage implements OnInit {

  // Liquidación del crédito predefinida
  staticFees: Array<any> = StaticFees;
  // Opciones de pago disponibles por cada monto
  availableFees: Array<any> = [];

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
      creditDuration: new FormControl('daily'),
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

  async presentToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: 'OK'
    });

    toast.present();
  }

  async createClient(): Promise<void> {
    const loader = await this.loaderCtrl.create({
      message: 'Guardando información...',
    });
    loader.present();

    //Datos a enviar
    const client: Client = {
      ...this.mainForm.value.client,
      billingState: 'Al dia'
    }

    const credit: Credit = {
      ...this.mainForm.value.credit,
      id: `${moment().format("YYYYMMDD")}-${client.id}`,
      idClient: client.id,
      fullNameClient: client.fullName,
      // Ganacia Total = (Valor Cuota * No. de cuotas) - Total de Crédito
      profitTotal: (this.mainForm.value.credit.feesTotalAmount * this.mainForm.value.credit.numberFees) - this.mainForm.value.credit.totalAmount,
      state: 'Acreditado',
      feesPaid: 0,
      feesNotPaid: 0,
      outstandingFees: this.mainForm.value.credit.numberFees,
      balance: this.mainForm.value.credit.totalAmount,
      createdAt: moment().tz("America/Bogota").format(),
      acreditedAt: moment().tz("America/Bogota").format()
    }

    try {
      await this.clientsService.addClient(client);
      await this.creditsService.addCredit(credit);

      this.presentToast('Información guardada');
      this.mainForm.reset();

    } catch (error) {
      this.presentToast('Ocurrió un error inesperado');
    } finally {
      loader.dismiss();
    }
  }

  /**
   * Muestra las opciones de tiempo de crédito disponibles
   * para el monto seleccionado
   * @param event 
   */
  showAvailablesFees(event: any): void {
    this.mainForm.patchValue({ credit: { numberFees: '', feesTotalAmount: '', creditDuration: '' } });
    if(event.target.value) {
      this.availableFees = this.staticFees.filter(fee => fee.totalAmount === parseInt(event.target.value) )[0].availableFees;
    } else { return; }
  }

  /**
   * Establece el valor de la cuota dependiendo del tiempo
   * de crédito seleccionado
   * @param event 
   */
  setFeeTotalAmount(event: any): void {
    try {
      let durationSelected = parseInt(event.target.value);
      this.mainForm.patchValue({ credit: { feesTotalAmount: this.availableFees.filter(fee => fee.numberFees == durationSelected)[0].totalFee || '' } })
      this.mainForm.patchValue({ credit: { numberFees: this.availableFees.filter(fee => fee.numberFees == durationSelected)[0].numberFees || '' } })
    } catch(error) { // Encapsula el error de (availableFees: undefined)
      this.mainForm.patchValue({ credit: { feesTotalAmount: '' } }); 
    }
  }
}
