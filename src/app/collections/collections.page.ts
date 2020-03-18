import { Component, OnInit } from '@angular/core';
import { ClientsService } from 'src/services/clients/clients.service';
import { Client } from 'src/models/client.model';
import { CreditsService } from 'src/services/credits/credits.service';
import { UtilsService } from 'src/services/utils/utils.service';
import { AlertButton } from '@ionic/core';
import { Credit } from 'src/models/credit.model';
import { Collection } from 'src/models/collection.moldel';
import * as moment from 'moment-timezone';
import { User } from 'src/models/user.model';
import { CollectionsService } from 'src/services/collections/collections.service';
import * as ColombiaHolidays from 'colombia-holidays';
import { UsersService } from 'src/services/users/users.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage implements OnInit {

  clients: Credit[] = [];
  filteredClients: Credit[];
  credit: Credit[];
  idClient: string;
  userData: User;
  fullNameClient: string;
  isHoliday: boolean = false;
  idCompany: number;
  idCreditFeeNotPaid: string;
  routeNumber: number;

  constructor(
    private clientsService: ClientsService,
    private creditsService: CreditsService,
    private collectService: CollectionsService,
    private utilsService: UtilsService,
    private usersService: UsersService
  ) { }

  ionViewDidEnter() {
    this._verifyHolidayOrSunday();
  }

  ngOnInit() {

    this.idCompany = Number(this.usersService.getStorageData("idCompany"));
    this.routeNumber = Number(this.usersService.getStorageData("routeNumber"));

    // Obtiene todos los clientes y los almacena en diferentes variables
    // this.clientsService.getClients(this.idCompany).subscribe(res => {
    //   this.clients = res.filter(client => client != null );
    //   this.filteredClients = this.clients;
    // });

    // Obtiene todos los créditos
    this.creditsService.getActiveCreditsbyRoute(this.idCompany, this.routeNumber).subscribe(res => {
      this.clients = [];
      this.clients = res.filter(client => 
        client != null && 
        client.state == 'Acreditado' && 
        client.nextCollect == moment().tz("America/Bogota").format("YYYY-MM-DD")
      );
      // activeCredits.forEach(credit => {
      //   credit.feesToPay = 0;
      //   // Valida que el credito es semanal
      //   if (credit.numberFees >= 25) {
      //     this._addCredit(true, credit, 0, null);
      //   } else if (credit.numberFees < 25 && credit.paymentsForecast.length > 0) {
      //     credit.paymentsForecast.forEach((payment, index) => {
      //       // Valida que en el array de proyeccuión existan cuotas  pendientes que sean 
      //       // iguales a la fecha actual
      //       if (payment.date === moment().tz('America/Bogota').format('YYYY-MM-DD') && !payment.paid) {
      //         this._addCredit(true, credit, payment.expectedAmount, index);
      //       // En caso contrario, si tiene coutas pendiente, añade el credito al array 
      //       // para que aparezca en los recaudos disponibles
      //       } else if (moment(payment.date) < moment().tz('America/Bogota') && !payment.paid) {
      //         this._addCredit(true, credit, payment.expectedAmount, index);
      //       }
      //     });
      //   }
      // });

      this.filteredClients = this.clients;
    });


    // Obtiene la información del usuario
    this.usersService.getUser(this.usersService.getStorageData('uid')).subscribe(res => {
      this.userData = res;
    });

  }

  /**
   * Añade un crédito al array que muestra los recaudos disponibles
   * @param push
   * @param creditToPush 
   * @param expectedAmount 
   * @param indexPaymentForecast 
   */
  private _addCredit(push: boolean, creditToPush: Credit, expectedAmount: number, indexPaymentForecast: number): void {
    if(push){
      let exist = false;
      this.clients.forEach(credit => {
        if(credit.id === creditToPush.id){
          // Suma las cuotas pendientes del credito
          credit.feesTotalAmount += expectedAmount;
          // Suma las cuotas pendientes
          credit.feesToPay += 1;
          // Valida que el credito tenga una proyeccion de pagos (credito semanal)
          creditToPush.paymentsForecast.length > 0  ? credit.paymentsForecast[indexPaymentForecast].paid = true : null;
          // Valida que el credito exista dentro del array, en caso de que si actualiza
          // las propiedades del mismo
          exist = true;
        }
      });

      if(exist === false){
        // Si no existe el credito dentro del array, actualiza las propiedades 
        // del mismo
        creditToPush.paymentsForecast.length > 0 ? creditToPush.paymentsForecast[indexPaymentForecast].paid = true : null;
        creditToPush.feesToPay += 1;
        this.clients.push(creditToPush);
      }
    }
  } 

  /**
   * Verifica si la fecha actual es festivo o domingo
   */
  private _verifyHolidayOrSunday(): void {
    // Obtiene todos los festivos en colombia para el año determinado
    const holidays = ColombiaHolidays.getColombiaHolidaysByYear(moment().tz("America/Bogota").year())

    //Valida si es domingo
    if (moment().tz("America/Bogota").day() === 0) {
      this.isHoliday = true;
    }

    // Valida si es festivo
    holidays.forEach(celebrationDay => {
      if (moment(celebrationDay.holiday, "YYYY-MM-DD").format("YYYY-MM-DD") == moment().tz("America/Bogota").format("YYYY-MM-DD")) {
        this.isHoliday = true;
      }
    });

  }

  filterClients(filterValue: string): void {
    this.clients = this.filteredClients.filter(client => client.fullNameClient.toLowerCase().indexOf(filterValue.toLowerCase()) > -1);
  }

  async collect(idClient: string, fullNameClient: string, idCredit: string): Promise<void> {

    if (this.isHoliday) {
      this.utilsService.presentToast(
        'No es posible hacer recaudos hoy',
        8000,
        'OK',
        true
      );
      return;
    }

    const loader = await this.utilsService.presentLoader('Obteniendo datos...');
    loader.present();

    this.idClient = idClient;
    this.fullNameClient = fullNameClient;

      try {

        this.credit = this.clients.filter(credit => credit.state == 'Acreditado' && credit.id == idCredit);
        
        if (this.credit[0].balance == 0 && this.credit[0].state == 'Pagado') {
          this.utilsService.presentToast(
            'Este cliente no tiene créditos activos',
            8000,
            'OK',
            true
          );
          return;
        }

        const messageAlert = `
            Cuotas pendientes: <b>${this.credit[0].outstandingFees}</b><br>
            Cuota actual: <b>${this.credit[0].feesPaid + 1}</b><br>
            Cuotas pagadas: <b>${this.credit[0].feesPaid}</b><br>
            Cuotas no pagadas: <b>${this.credit[0].feesNotPaid}</b><br>
            Total crédito: <b>$ ${ Number(this.credit[0].totalAmount).toLocaleString('DE-de')}</b><br>
            Saldo total: <b>$ ${this.credit[0].balance.toLocaleString('DE-de')}</b><br><br>
            Valor cuota: <b>$ ${this.credit[0].feesTotalAmount.toLocaleString('DE-de')}</b>
        `;

        this.utilsService.presentAlert(
          fullNameClient,
          idClient,
          messageAlert,
          this._buttonActions(this.credit[0].feesTotalAmount)
        );

      } catch (error) {

        this.utilsService.presentToast(
          error,
          4000,
          'OK',
          true
        );

      } finally {
        loader.dismiss();
      }

  }

  private _buttonActions(feesTotalAmount: number): AlertButton[] {
    return [
      // Boton Cancelar
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      // Boton de NO PAGO
      {
        text: 'No paga',
        handler: () => {
          this._submitAlert(false, feesTotalAmount);
        }
      },
      // Boton PAGO
      {
        text: 'Paga',
        handler: () => {
          this._submitAlert(true, feesTotalAmount);
        }
      }

    ]
  }

  private _submitAlert(paidFee: boolean, feesTotalAmount): void {
    this.utilsService.presentAlert(
      'Advertencia',
      '¿Está seguro de realizar esta acción?',
      `Registrar ${paidFee
        ? `pago de la cuota de ${this.fullNameClient} por $ ${feesTotalAmount.toLocaleString('DE-de')}`
        : `no pago de la cuota de ${this.fullNameClient}`} `,
      [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'default'
        },
        {
          text: 'Aceptar',
          handler: () => {
            this._saveCollect(paidFee);
          }
        }
      ]
    );

  }

  /**
   * Guarda el pago realizado en la base de datos
   * @param paidFee Paga/No paga
   */
  private async _saveCollect(paidFee: boolean): Promise<void> {

    const loader = await this.utilsService.presentLoader('Registrando recaudo...');
    loader.present();

    try {

      if (paidFee) { // Valida que la cuota fue pagada

        let data: Credit = {
          feesPaid: this.credit[0].feesPaid + this.credit[0].feesToPay,
          outstandingFees: this.credit[0].outstandingFees - this.credit[0].feesToPay,
          balance: this.credit[0].balance - this.credit[0].feesTotalAmount,
          paymentsForecast: this.credit[0].paymentsForecast,
          state: null
        }

        // Valida que el credito fue pagado
        if (data.balance == 0) {
          data.state = 'Pagado'
        } else {
          data.state = 'Acreditado'
        }

        await this.creditsService.updateCredit(this.credit[0].id, data);
      } else {

        await this.creditsService.updateCredit(this.credit[0].id, { feesNotPaid: this.credit[0].feesNotPaid + this.credit[0].feesToPay });
        await this.clientsService.updateClient({ billingState: 'Atrasado' }, (this.idClient));

      }

      const collect: Collection = {
        id: `${moment().format("YYYYMMDDHHmmss")}-${this.credit[0].id}`,
        createdAt: moment().tz('America/Bogota').format(),
        paid: paidFee,
        amountPaid: this.credit[0].feesTotalAmount,
        uid: this.userData.id,
        username: this.userData.name,
        idClient: this.idClient,
        fullNameClient: this.fullNameClient,
        idCompany: this.idCompany
      }

      await this.collectService.addCollection(collect);

      this.utilsService.presentToast(
        'Información guardada',
        4000,
        'OK',
        true
      );

    } catch (error) {
      console.log(error)
      this.utilsService.presentToast(
        'Error al guardar la información',
        4000,
        'OK',
        true
      );

    } finally {
      loader.dismiss();
    }

  }

}
