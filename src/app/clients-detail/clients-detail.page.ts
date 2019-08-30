import { Component, OnInit } from '@angular/core';
import { ClientsService } from 'src/services/clients/clients.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { UtilsService } from 'src/services/utils/utils.service';
import { ActivatedRoute } from '@angular/router';
import { Client } from 'src/models/client.model';
import { Credit } from 'src/models/credit.model';
import { map } from 'rxjs/operators';

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

  constructor(
    private clientsSerivice: ClientsService,
    private creditsService: CreditsService,
    private utils: UtilsService,
    private route: ActivatedRoute
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
      this.credits.forEach((credit, index) => {
        if(credit.state == 'Acreditado'){
          this.activeCredit = credit;
          this.credits.splice(index);
        }
      });
    });
  }

}
