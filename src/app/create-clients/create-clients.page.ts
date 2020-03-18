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
import { CreditMaster } from 'src/models/credit-master.model';
import { map } from 'rxjs/operators';

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
  // Creditos disponibles
  availableCredits: CreditMaster[] = [];
  availableAmounts: number[] = [];
  availableNumberFees: CreditMaster[] = [];

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
      routeNumber: new FormControl(''),
      positionOnRoute: new FormControl(''),
      collectFrecuency: new FormControl(''),
      totalAmount: new FormControl(''),
      numberFees: new FormControl(''),
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
    this.idCompany = Number(this.usersService.getStorageData("idCompany"));
    const masterSubscription = this.creditsService.getAvailableCredits( this.idCompany )
      .subscribe( credits => {
        this.availableCredits = credits;
        this.availableAmounts = [...new Set(credits.map( c => c.totalAmount ))].sort();
        masterSubscription.unsubscribe(); 
      })
  }

  async createClient(): Promise<void> {
    const loader = await this.utilsServie.presentLoader('Guardando información...');
    loader.present();

    let now = moment().tz("America/Bogota");
    console.log(this.mainForm.value.collectFrecuency);
     

    //Datos a enviar
    const client: Client = {
      ...this.mainForm.value.client,
      id: this.mainForm.value.id.toString(),
      billingState: 'Al dia',
      idCompany: this.idCompany,
      routeNumber: this.mainForm.value.credit.routeNumber,
      positionOnRoute: this.mainForm.value.credit.positionOnRoute
    }

    // Valida si el crédito es semanal
    if(parseInt(this.mainForm.value.credit.numberFees.numberFees) < 25) {
      let auxDate = moment().tz('America/Bogota');
      for (let index = 0; index < parseInt(this.mainForm.value.credit.numberFees.numberFees); index++) {
        this.paymentsForecast[index] = {
          date: auxDate.add(7, 'days').format('YYYY-MM-DD'),
          expectedAmount: parseInt(this.mainForm.value.credit.feesTotalAmount),
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
      profitTotal: (parseInt(this.mainForm.value.credit.feesTotalAmount) * parseInt(this.mainForm.value.credit.numberFees.numberFees)) - parseInt(this.mainForm.value.credit.totalAmount),
      state: 'Acreditado',
      feesPaid: 0,
      feesNotPaid: 0,
      numberFees: parseInt(this.mainForm.value.credit.numberFees.numberFees),
      feesTotalAmount: parseInt(this.mainForm.value.credit.feesTotalAmount),
      outstandingFees: parseInt(this.mainForm.value.credit.numberFees.numberFees),
      // Saldo = Valor Cuota * No. de cuotas
      balance: (parseInt(this.mainForm.value.credit.feesTotalAmount) * parseInt(this.mainForm.value.credit.numberFees.numberFees)),
      createdAt: moment().tz("America/Bogota").format(),
      acreditedAt: moment().tz("America/Bogota").format(),
      idCompany: this.idCompany,
      paymentsForecast: [],//this.paymentsForecast,
      nextCollect: moment().tz("America/Bogota").add(parseInt(this.mainForm.value.credit.collectFrecuency), 'days').format('YYYY-MM-DD')
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
      console.log(error);
      
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
     this.availableNumberFees = this.availableCredits
      .filter( credit => credit.totalAmount === Number(event.target.value) )
  }

  /**
   * Establece el valor de la cuota dependiendo del tiempo
   * de crédito seleccionado
   * @param event 
   */
  showFeeTotalAmount(event: any): void {
    try {
      this.mainForm.patchValue({ credit: { feesTotalAmount: event.target.value.feesTotalAmount.toString() } });
    } catch (error) {  // Encapsula el error de (availableFees: undefined)
      this.mainForm.patchValue({ credit: { feesTotalAmount: '' } }); 
    }
  }
}
