import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { UtilsService } from 'src/services/utils/utils.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { Credit } from 'src/models/credit.model';
import { CollectionsService } from 'src/services/collections/collections.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements OnInit {

  customPickerOptionsInitial: any;
  customPickerOptionsFinal: any;
  initialDate:string;
  finalDate:string;
  idCompany: number;
  activeCredits: Credit[];
  totalAcredited: number = 0;
  totalProfit: number = 0;
  totalCollectProfit: number = 0;

  constructor(
    private utils: UtilsService,
    private creditsService: CreditsService,
    private collectsService: CollectionsService
  ) { 
    // Listener de picker fecha inicial
    this.customPickerOptionsInitial = {
      buttons: [{
        text: 'Cancelar'
      }, {
        text: 'OK',
        handler: (data) => {
          this.initialDate = moment(
            `${data.year.value}-${data.month.value}-${data.day.value} 00:00:00`,
            'YYYY-MM-DD HH:mm:ss'
          ).tz('America/Bogota').format();
          this.dateChange();
        }
      }]
    }

    // Listener de picker fecha final
    this.customPickerOptionsFinal = {
      buttons: [{
        text: 'Cancelar'
      }, {
        text: 'OK',
        handler: (data) => {
          this.finalDate = moment(
            `${data.year.value}-${data.month.value}-${data.day.value} 23:59:59`,
            'YYYY-MM-DD HH:mm:ss'
          ).tz('America/Bogota').format();
          this.dateChange();
        }
      }]
    }
  }

  private async dateChange(): Promise<void> {
    if(moment(this.initialDate) >= moment(this.finalDate)){
      this.utils.presentToast(
        'Selecciona una fehca inicial menor que la final',
        6000,
        'OK',
        true
      )
    } else {
      const promise = this.creditsService.getCredits(0).subscribe(res => {
        
        this.totalAcredited = 0;
        this.totalProfit = 0;
        this.totalCollectProfit = 0;
        this.activeCredits = res.filter(credit => credit != null);

        this.activeCredits.forEach(credit => {
          if(moment(credit.acreditedAt) <= moment(this.finalDate) && credit.state == 'Acreditado'){
            this.totalAcredited += Number(credit.balance);
            this.totalProfit += credit.profitTotal;
          }
        })

        this.collectsService.getCollections(0).subscribe(res => {
          let collections = res.filter(res => res != null);

          collections.forEach(collect => {
            if(moment(collect.createdAt) >= moment(this.initialDate) && moment(collect.createdAt) <= moment(this.finalDate)) {
              console.log({ company: collect.idCompany, monto: collect.amountPaid});
              
              this.totalCollectProfit += collect.amountPaid;
            }
          })
        })

        promise.unsubscribe();
      })
    }
  }

  ngOnInit() {
    this.idCompany = Number(localStorage.getItem('idCompany'));
    this.initialDate = moment().tz('America/Bogota').subtract(1, 'month').format();
    this.finalDate = moment().tz('America/Bogota').format();
    this.dateChange();
  }

}
