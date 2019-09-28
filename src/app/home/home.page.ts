import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FcmService } from 'src/services/fcm/fcm.service';
import { UtilsService } from 'src/services/utils/utils.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { Credit } from 'src/models/credit.model';
import { Collection } from 'src/models/collection.moldel';
import { CollectionsService } from 'src/services/collections/collections.service';
import { User } from 'src/models/user.model';
import { UsersService } from 'src/services/users/users.service';
import * as moment from 'moment-timezone';
import { Chart } from 'chart.js';
import { ModalController } from '@ionic/angular';
import { ModalCollectDetails } from './modal-collect-detail/modal-collect-details';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  @ViewChild('chartpie', { static: false }) chartContainer: ElementRef

  activeCredits: Credit[];
  users: User[];
  collections: Collection[];
  totalAmountExpected: number = 0;
  dailyCollections: Array<any> = [];
  totalAmountNotPaid: number = 0;
  totalAmountPaid: number = 0;
  now: string;
  dateVar: any;
  customPickerOptions: any;
  paidPercent: number = 0;
  notPaidPercent: number = 0;
  chart: any = null;
  ctx: CanvasRenderingContext2D;
  idCompany: number;

  constructor(
    private fcmService: FcmService,
    private utilsService: UtilsService,
    private creditsService: CreditsService,
    private collectionsService: CollectionsService,
    private usersService: UsersService,
    private modalCtrl: ModalController
  ) {

    this.now = moment().tz("America/Bogota").format();
    this.customPickerOptions = {
      buttons: [{
        text: 'Cancelar'
      }, {
        text: 'OK',
        handler: (data) => {
          this.dateChange(`${data.year.value}-${data.month.value}-${data.day.value} 00:00:00`);
        }
      }]
    }
  }

  ngAfterViewInit() {
    this.ctx = (<HTMLCanvasElement>this.chartContainer.nativeElement).getContext('2d');

    this.chart = new Chart(this.ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Paid',
          'Not paid',
        ],
        datasets: [
          {
            label: 'Paid',
            data: [50, 50],
            backgroundColor: ['#10dc60', '#f04141'],
            borderColor: ['#10dc60', '#f04141']
          },

        ],
      },
      options: {
        responsive: true,
        tooltips: {
          enabled: false
        },
        legend: {
          display: false,
          position: 'bottom',
          labels: {
            fontColor: 'white'
          }
        },
        gridLines: {
          display: false
        }
      }
    });
  }

  async ngOnInit() {

    this.idCompany = Number(this.usersService.getStorageData('idCompany'))

    // Obtiene todos los usuarios del sistema y crea el array que 
    // Lleva la sumatoria de recaudos de cada uno
    this.usersService.getUsers(this.idCompany).subscribe(res => {
      this.users = res.filter(user => user != null);
      this.users.forEach(user => {
          this.dailyCollections.push({
            id: user.id,
            name: user.name,
            role: user.role,
            today: moment().tz("America/Bogota").format("YYYY-MM-DD"),
            totalCollected: 0,
            totalNotPaid: 0
          });
        
      });
    });

    // Obtiene todos los creditos activos y calcula el monto total de 
    // Cuotas que se espera que los cobradores recauden
    this.creditsService.getActiveCredits(this.idCompany).subscribe(res => {
      this.activeCredits = res.filter(credit => credit != null);
      this._calculateTotalExpected();
    });

    // Obtiene todos los recaudos de la base de datos
    this.collectionsService.getCollections(this.idCompany).subscribe(res => {
      this._calculateCollectionsPayments(res.filter(collection => collection != null));
    });

    try {
      await this.fcmService.getTokenDevice();
    } catch (error) {
      this.utilsService.presentToast(
        error,
        6000,
        "OK",
        true
      );
    }
  }

  /**
   * Actualiza el gráfico con los nuevos valores de recaudo
   * @param paidPercent 
   * @param notPaidPercent 
   */
  private _drawGraph(paidPercent: number, notPaidPercent: number): void {
    this.chart.data.datasets[0].data[0] = paidPercent;
    this.chart.data.datasets[0].data[1] = notPaidPercent;
    this.chart.update();
  }

  /**
   * Calcula el total de recaudo esperado para la fecha anterior 
   * o igual a la escogida
   */
  private async _calculateTotalExpected(): Promise<void> {
    await this.activeCredits.forEach(credit => {
      if (moment(credit.acreditedAt) <= moment(this.now)) {
        this.totalAmountExpected += credit.feesTotalAmount
      }
    });
  }

  /**
   * Calcula la sumatoria de los recaudos realizados por todos los cobradores
   * @param collections 
   */
  private _calculateCollectionsPayments(collections: Collection[]): void {
    // Inicializa las variables de suma
    this.totalAmountPaid = 0;
    this.totalAmountNotPaid = 0;
    this.users.forEach((user, index) => {
      if (this.dailyCollections[index]) {
        this.dailyCollections[index].totalCollected = 0;
        this.dailyCollections[index].totalNotPaid = 0;
      }
    });

    this.collections = collections;

    // Recorre todos los recaudos existentes
    this.collections.forEach(collect => {
      // Cuenta solo los recaudos de la fecha determinada
      if (moment(this.now).format("YYYY-MM-DD") == moment(collect.createdAt).tz("America/Bogota").format("YYYY-MM-DD")) {

        // Acumula el todal de los montos Pagados y No pagados
        collect.paid ?
          this.totalAmountPaid += collect.amountPaid :
          this.totalAmountNotPaid += collect.amountPaid;

        // Acumulos montos recaudados de cada usuario
        this.users.forEach((user, index) => {
          if (this.dailyCollections[index]) {

            // Valida que el recaudos sea del usuario
            if (this.dailyCollections[index].id == collect.uid) {

              // Acumula el total de las cutoas Pagadas y No pagadas
              collect.paid ?
                this.dailyCollections[index].totalCollected += collect.amountPaid :
                this.dailyCollections[index].totalNotPaid += collect.amountPaid;

            }

          }
        })

      }
    })

    // Calcular porcentajes de Pagos y No pagos
    let paidPercent = (this.totalAmountPaid * 100) / this.totalAmountExpected;
    let notPaidPercent = (this.totalAmountNotPaid * 100) / this.totalAmountExpected;

    this._drawGraph(paidPercent, notPaidPercent);
  }

  /**
   * Se ejecuta cuando el Datepicker cambia su valor
   * @param newDate 
   */
  dateChange(newDate: string): void {
    this.now = moment(newDate, "YYYY-MM-DD HH:mm:ss").format();
    this._calculateTotalExpected();
    this._calculateCollectionsPayments(this.collections)
  }

  async openModalDetailCollectios(collectorID: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ModalCollectDetails,
      componentProps: { id: collectorID, dateSelected: this.now }
    });

    modal.present();
  }


}
