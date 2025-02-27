import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ClientsService } from 'src/services/clients/clients.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { Client } from 'src/models/client.model';
import { Credit, PaymentForecast } from 'src/models/credit.model';
import * as moment from 'moment-timezone';
import { StaticFees } from './static-fees';
import { UtilsService } from 'src/services/utils/utils.service';
import { UsersService } from 'src/services/users/users.service';

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
    id: new FormControl(''),
    client: new FormGroup({
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
      creditDuration: new FormControl(''),
      feesTotalAmount: new FormControl('')
    })
  })

  idCompany: number;
  paymentsForecast: PaymentForecast[] = [];

  constructor(
    private clientsService: ClientsService,
    private creditsService: CreditsService,
    private utilsServie: UtilsService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.idCompany = Number(this.usersService.getStorageData("idCompany"))
  }

  async createClient(): Promise<void> {
    const loader = await this.utilsServie.presentLoader('Guardando información...');
    loader.present();

    //Datos a enviar
    const client: Client = {
      ...this.mainForm.value.client,
      id: this.mainForm.value.id.toString(),
      billingState: 'Al dia',
      idCompany: this.idCompany
    }

    // Valida si el crédito es semanal
    if(this.mainForm.value.credit.numberFees < 25) {
      let auxDate = moment().tz('America/Bogota');
      for (let index = 0; index < this.mainForm.value.credit.numberFees; index++) {
        this.paymentsForecast[index] = {
          date: auxDate.add(7, 'days').format('YYYY-MM-DD'),
          expectedAmount: this.mainForm.value.credit.feesTotalAmount,
          paid: false
        }
      }
    }

    const credit: Credit = {
      ...this.mainForm.value.credit,
      id: `${moment().format("YYYYMMDDHHmmss")}-${client.id}`,
      idClient: client.id,
      fullNameClient: client.fullName,
      // Ganacia Total = (Valor Cuota * No. de cuotas) - Total de Crédito
      profitTotal: (this.mainForm.value.credit.feesTotalAmount * this.mainForm.value.credit.numberFees) - this.mainForm.value.credit.totalAmount,
      state: 'Acreditado',
      feesPaid: 0,
      feesNotPaid: 0,
      outstandingFees: this.mainForm.value.credit.numberFees,
      // Saldo = Valor Cuota * No. de cuotas
      balance: (this.mainForm.value.credit.feesTotalAmount * this.mainForm.value.credit.numberFees),
      createdAt: moment().tz("America/Bogota").format(),
      acreditedAt: moment().tz("America/Bogota").format(),
      idCompany: this.idCompany,
      paymentsForecast: this.paymentsForecast
    }

    try {
      await this.clientsService.addClient(client);
      await this.creditsService.addCredit(credit);

      this.utilsServie.presentToast(
        'Información guardada',
        6000,
        "OK",
        true
      );

      this.mainForm.reset();

    } catch (error) {
      this.utilsServie.presentToast(
        'Ocurrió un error inesperado',
        6000,
        "OK",
        true
      );
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
