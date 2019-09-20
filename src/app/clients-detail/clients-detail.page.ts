import { Component, OnInit } from '@angular/core';
import { ClientsService } from 'src/services/clients/clients.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { ActivatedRoute } from '@angular/router';
import { Client } from 'src/models/client.model';
import { Credit } from 'src/models/credit.model';
import { ModalController } from '@ionic/angular';
import { ModalPage } from './modal-renewal/modal-renewal';

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

  // Loader
  loaderActiveCredit: boolean = true;

  constructor(
    private clientsSerivice: ClientsService,
    private creditsService: CreditsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.clientId = this.route.snapshot.params['id'];
    if(this.clientId){
      this._loadClient();
      this._loadCredits();
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
        if(credit.state == 'Acreditado'){
          this.activeCredit = credit;
          this.credits.splice(index);
        }
      });
      this.activeCredit ? this.activeCreditEmpty = false : this.activeCreditEmpty = true;
    });
  }

  async openRenewalModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      componentProps: this.client
    });

    modal.present();
  }

}
