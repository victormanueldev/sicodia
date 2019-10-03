import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Renewal } from 'src/models/renewal.model';
import { RenewalsService } from 'src/services/renewals/renewals.service';
import { UsersService } from 'src/services/users/users.service';
import * as moment from 'moment-timezone';
import { CreditsService } from 'src/services/credits/credits.service';
import { Credit } from 'src/models/credit.model';
import { UtilsService } from 'src/services/utils/utils.service';

@Component({
    selector: 'modal-detail-renewal',
    templateUrl: './modal-detail-renewal.html'
})
export class ModalDetailRenewal implements OnInit {

    loaderRenewal: boolean = true;
    renewal: Renewal = null;

    constructor(
        private modalCtrl: ModalController,
        private renewalsService: RenewalsService,
        private navParams: NavParams,
        private usersService: UsersService,
        private creditsService: CreditsService,
        private utils: UtilsService
    ) { }

    async ngOnInit() {
        this.renewalsService.getRenewal(this.navParams.get('id')).subscribe(res => {
            this.renewal = res;
            this.loaderRenewal = false;
        });
    }

    dismissModal(): void {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    async renewalApproved(approval: string): Promise<void> {
        const loader = await this.utils.presentLoader('Enviando información...');
        loader.present();

        try {
            // Actualiza la renovacion con la opcion de aprobacion
            await this.renewalsService.updateRenewal(this.renewal.id, {
                state: approval,
                approvalUid: this.usersService.getStorageData('uid'),
                approvalDate: moment().tz('America/Bogota').format()
            });

            if(approval === 'Aprobado') {
                const credit: Credit = {
                    totalAmount: this.renewal.totalAmount,
                    creditDuration: this.renewal.creditDuration,
                    feesTotalAmount: this.renewal.feesTotalAmount,
                    numberFees: this.renewal.numberFees,
                    id: `${moment().format("YYYYMMDDHHmmss")}-${this.navParams.get('idClient')}`,
                    idClient: this.navParams.get('idClient'),
                    fullNameClient: this.navParams.get('fullNameClient'),
                    // Ganacia Total = (Valor Cuota * No. de cuotas) - Total de Crédito
                    profitTotal: (this.renewal.feesTotalAmount * this.renewal.numberFees) - this.renewal.totalAmount,
                    state: 'Acreditado',
                    feesPaid: 0,
                    feesNotPaid: 0,
                    outstandingFees: this.renewal.numberFees,
                    // Saldo = Valor Cuota * No. de cuotas
                    balance: (this.renewal.feesTotalAmount * this.renewal.numberFees),
                    createdAt: moment().tz("America/Bogota").format(),
                    acreditedAt: moment().tz("America/Bogota").format(),
                    idCompany: Number(this.usersService.getStorageData('idCompany'))
                }

                await this.creditsService.updateCredit(this.navParams.get('idActiveCredit'), {
                    balance: 0,
                    outstandingFees: 0,
                    state: 'Pagado'
                });

                await this.creditsService.addCredit(credit);
            }
        } catch (error) {
            this.utils.presentToast(
                'Ha ocurrido un error inesperado',
                6000,
                'OK',
                true
            );
        } finally {
            loader.dismiss();
            this.dismissModal();
        }
    }



}