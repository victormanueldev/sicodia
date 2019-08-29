import { Component, OnInit } from '@angular/core';
import { ClientsService } from 'src/services/clients/clients.service';
import { Client } from 'src/models/client.model';
import { CreditsService } from 'src/services/credits/credits.service';
import { UtilsService } from 'src/services/utils/utils.service';
import { AlertButton } from '@ionic/core';
import { Credit } from 'src/models/credit.model';
import { Collection } from 'src/models/collection.moldel';
import * as moment from 'moment-timezone';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/models/user.model';

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


  constructor(
    private clientsService: ClientsService,
    private creditsServices: CreditsService,
    private utilsService: UtilsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.clientsService.getClients().subscribe(res => {
      this.clients = res;
      this.filteredClients = this.clients;
    });

    this.authService.user$.subscribe(res => {
      this.userData = res;
    })
  }

  filterClients(filterValue: string): void {
    this.clients = this.filteredClients.filter(client => client.id.toString().toLowerCase().indexOf(filterValue.toLowerCase()) > -1);
  }

  async collect(idClient: string, fullNameClient: string): Promise<void> {

    const loader = await this.utilsService.presentLoader('Obteniendo datos...');
    loader.present();

    const prom = this.creditsServices.getCreditByClient(idClient).subscribe(res => {
      try {

        if (res.length === 0) {
          throw "Ha ocurrido un error...";
        }

        this.credit = res;

        const messageAlert = `
            Cuotas pendientes: <b>${this.credit[0].outstandingFees}</b><br>
            Cuota actual: <b>${this.credit[0].feesPaid + 1}</b><br>
            Cuotas pagadas: <b>${this.credit[0].feesPaid}</b><br>
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
        console.log("Ha ocurrido un error...");
      } finally {
        loader.dismiss();
        prom.unsubscribe()
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
      // Boton Pago
      {
        text: 'Paga',
        handler: () => {
          this._saveCollect(true);
        }
      }

    ]
  }


  private async _saveCollect(payment: boolean): Promise<void> {
    const loader = await this.utilsService.presentLoader('Generando recibo...');
    loader.present();

    try {

      if (payment) { // Valida que la cuota fue pagada

        const data: Credit = {
          feesPaid: this.credit[0].feesPaid + 1,
          outstandingFees: this.credit[0].outstandingFees - 1,
          balance: this.credit[0].balance - this.credit[0].feesTotalAmount
        }

        await this.creditsServices.updateCredit(this.credit[0].id, data);
      }

      const collection: Collection = {
        id: `${moment().format("YYYYMMDDSS")}-${this.credit[0].id}`,
        createdAt: moment().tz('America/Bogota').format(),
        paid: payment,
        amountPaid: this.credit[0].feesTotalAmount,
        uid: localStorage.getItem("uid")
      }

      await this.creditsServices.addCollection(this.credit[0].id, collection);

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
