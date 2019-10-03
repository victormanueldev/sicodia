import { Component, OnInit } from '@angular/core';
import { ClientsService } from 'src/services/clients/clients.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { ActivatedRoute } from '@angular/router';
import { Client } from 'src/models/client.model';
import { Credit } from 'src/models/credit.model';
import { ModalController } from '@ionic/angular';
import { ModalPage } from './modal-renewal/modal-renewal';
import { ModalDetailRenewal } from './modal-detail-renewal/modal-detail-renewal';
import { RenewalsService } from 'src/services/renewals/renewals.service';
import { Renewal } from 'src/models/renewal.model';
import { UsersService } from 'src/services/users/users.service';

@Component({
  selector: 'app-clients-detail',
  templateUrl: './clients-detail.page.html',
  styleUrls: ['./clients-detail.page.scss'],
})
export class ClientsDetailPage implements OnInit {

  clientId: string = null;
  client: Client = null;
  activeCredit: Credit = null;
  credits: Credit[] = [];
  activeCreditEmpty: boolean;
  renewal: Renewal = null;

  // Loader
  loaderActiveCredit: boolean = true;

  constructor(
    private clientsSerivice: ClientsService,
    private creditsService: CreditsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private renewalsService: RenewalsService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.clientId = this.route.snapshot.params['id'];
    if (this.clientId) {
      this._loadClient();
      this._loadCredits();
      this._loadRenewal();
    }
  }

  private _loadClient(): void {
    this.clientsSerivice.getClient(this.clientId).subscribe(res => {
      this.client = res;
    });
  }

  private _loadCredits(): void {
    this.creditsService.getCreditByClient(this.clientId).subscribe(res => {

      this.credits = res;
      this.loaderActiveCredit = false;
      this.credits.forEach((credit, index) => {
        if (credit.state == 'Acreditado') {
          this.activeCredit = credit;
          this.credits.splice(index, 1);
        }
      });
      this.activeCredit ? this.activeCreditEmpty = false : this.activeCreditEmpty = true;
    });
  }

  private _loadRenewal(): void {
    this.renewalsService.getRenewalByClient(this.clientId).subscribe(res => {
      const uid = this.usersService.getStorageData('uid');
      const role = this.usersService.getStorageData('role');
      // Valida la primera renovacion con estado pendiente del cliente
      // Que el usuario que la solicitó no sea el mismo que la aprueba
      // Que el rol autorizado para realizar la aprobacion es el administrador
      // if(res[0].state == 'Pendiente' && res[0].requestUid != uid && role == 'admin'){
      this.renewal = res.filter(renewal => renewal.state == 'Pendiente')[0];
    });
  }

  async openRenewalModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: this.client
    });

    modal.present();
  }

  async openModalDetailRenewal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ModalDetailRenewal,
      componentProps: {
        id: this.renewal.id,
        idActiveCredit: this.activeCredit.id,
        idClient: this.clientId,
        fullNameClient: this.client.fullName
      }
    });

    modal.present();
  }

}
