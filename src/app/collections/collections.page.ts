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
import { Router } from '@angular/router';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage implements OnInit {

  clients: Client[];
  filteredClients: Client[];
  credit: Credit[];
  userData: User;
  idClient: string;
  isHoliday: boolean = false;

  constructor(
    private clientsService: ClientsService,
    private creditsService: CreditsService,
    private collectService: CollectionsService,
    private utilsService: UtilsService,
    private router: Router
  ) { }

  ionViewDidEnter(){
    this._verifyHolidayOrSunday();
  }

  ngOnInit() {

    this.clientsService.getClients().subscribe(res => {
      this.clients = res;
      this.filteredClients = this.clients;
    });

    this.creditsService.getCredits().subscribe(res => {
      return res
    })

  }

  /**
   * Verifica si la fecha actual es festivo o domingo
   */
  private _verifyHolidayOrSunday(): void {
    // Obtiene todos los festivos en colombia para el año determinado
    const holidays = ColombiaHolidays.getColombiaHolidaysByYear(moment().tz("America/Bogota").year())

    //Valida si es domingo
    if(moment().tz("America/Bogota").day() === 0){
      this.isHoliday = true;
    }

    // Valida si es festivo
    holidays.forEach(celebrationDay => {
      if(moment(celebrationDay.holiday, "YYYY-MM-DD").format("YYYY-MM-DD") == moment().tz("America/Bogota").format("YYYY-MM-DD")){
        this.isHoliday = true;
      }
    });

  }

  filterClients(filterValue: string): void {
    this.clients = this.filteredClients.filter(client => client.id.toString().toLowerCase().indexOf(filterValue.toLowerCase()) > -1);
  }

  async collect(idClient: string, fullNameClient: string): Promise<void> {

    if(this.isHoliday){
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

    const promise = this.creditsService.getCreditByClient(idClient).subscribe(res => {
      try {

        if (res.length === 0) {
          throw "Ha ocurrido un error...";
        }

        this.credit = res;

        const messageAlert = `
            Cuotas pendientes: <b>${this.credit[0].outstandingFees}</b><br>
            Cuota actual: <b>${this.credit[0].feesPaid + 1}</b><br>
            Cuotas pagadas: <b>${this.credit[0].feesPaid}</b><br>
            Cuotas no pagadas: <b>${this.credit[0].feesNotPaid}</b><br>
            Total crédito: <b>$ ${this.credit[0].totalAmount.toLocaleString('DE-de')}</b><br>
            Saldo total: <b>$ ${this.credit[0].balance.toLocaleString('DE-de')}</b><br><br>
            Valor cuota: <b>$ ${this.credit[0].feesTotalAmount.toLocaleString('DE-de')}</b>
        `;

        this.utilsService.presentAlert(
          fullNameClient,
          idClient,
          messageAlert,
          this._buttonActions()
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
        promise.unsubscribe();
      }

    })

  }

  private _buttonActions(): AlertButton[] {
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
          this._saveCollect(false);
        }
      },
      // Boton PAGO
      {
        text: 'Paga',
        handler: () => {
          this._saveCollect(true);
        }
      }

    ]
  }

  /**
   * Guarda el pago realizado en la base de datos
   * @param paidFee Paga/No paga
   */
  private async _saveCollect(paidFee: boolean): Promise<void> {
    const loader = await this.utilsService.presentLoader('Generando recibo...');
    loader.present();

    try {

      if (paidFee) { // Valida que la cuota fue pagada

        const data: Credit = {
          feesPaid: this.credit[0].feesPaid + 1,
          outstandingFees: this.credit[0].outstandingFees - 1,
          balance: this.credit[0].balance - this.credit[0].feesTotalAmount,
        }

        await this.creditsService.updateCredit(this.credit[0].id, data);
      } else {

        await this.creditsService.updateCredit(this.credit[0].id, { feesNotPaid: this.credit[0].feesNotPaid + 1 });
        await this.clientsService.updateClient({ billingState: 'Atrasado' }, (this.idClient));

      }

      const collect: Collection = {
        id: `${moment().format("YYYYMMDDSS")}-${this.credit[0].id}`,
        createdAt: moment().tz('America/Bogota').format(),
        paid: paidFee,
        amountPaid: this.credit[0].feesTotalAmount,
        uid: localStorage.getItem("uid")
      }

      await this.collectService.addCollection(collect);

      this.utilsService.presentToast(
        'Información guardada',
        4000,
        'OK',
        true
      );


    } catch (error) {

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
