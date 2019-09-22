import { Component } from '@angular/core';
import { ModalController, NavParams, LoadingController } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { StaticFees } from 'src/app/create-clients/static-fees';
import { Credit } from 'src/models/credit.model';
import * as moment from 'moment-timezone';
import { CreditsService } from 'src/services/credits/credits.service';
import { UtilsService } from 'src/services/utils/utils.service';
import { Notification } from 'src/models/notification.model';
import { UsersService } from 'src/services/users/users.service';
import { User } from 'src/models/user.model';
import { FcmService } from 'src/services/fcm/fcm.service';

@Component({
    selector: 'modal-renewal',
    templateUrl: './modal-renewal.html'
})
export class ModalPage {

    // Liquidación del crédito predefinida
    staticFees: Array<any> = StaticFees;
    // Opciones de pago disponibles por cada monto
    availableFees: Array<any> = [];

    creditForm = new FormGroup({
        totalAmount: new FormControl(''),
        numberFees: new FormControl(''),
        creditDuration: new FormControl(''),
        feesTotalAmount: new FormControl('')
    });

    users: User[];

    constructor(
        private modalCtrl: ModalController,
        private navParams: NavParams,
        private creditsService: CreditsService,
        private utilsService: UtilsService,
        private usersService: UsersService,
        private fcm: FcmService
    ) { }

    dismissModal() {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    async createCredit(): Promise<void> {
        const loader = await this.utilsService.presentLoader('Enviando solicitud...');
        loader.present();

        const credit: Credit = {
            ...this.creditForm.value,
            id: `${moment().format("YYYYMMDD")}-${this.navParams.get('id')}`,
            idClient: this.navParams.get('id'),
            fullNameClient: this.navParams.get('fullName'),
            // Ganacia Total = (Valor Cuota * No. de cuotas) - Total de Crédito
            profitTotal: (this.creditForm.value.feesTotalAmount * this.creditForm.value.numberFees) - this.creditForm.value.totalAmount,
            state: 'Pendiente',
            feesPaid: 0,
            feesNotPaid: 0,
            outstandingFees: this.creditForm.value.numberFees,
            balance: this.creditForm.value.totalAmount,
            createdAt: moment().tz("America/Bogota").format(),
        }
        
        const notification: Notification = {
            notification: {
                title: 'Nueva solicitud de crédito',
                body: 'Se ha recibido una nueva solicitud de aprobación de crédito. Toca para ver más',
                icon: 'myicon',
                sound: 'default'
            },
            to: ''
        }

        try {

            await this.usersService.getUsers().subscribe(res => {
                this.users = res;
            });

            let promises = this.users.map(async user => {
                if(user.role == 'admin' && user.uid !== localStorage.getItem('uid')){
                    notification.to = user.token;
                    await this.fcm.sendNotifications(notification);
                }
            });

            await Promise.all(promises);

            await this.creditsService.addCredit(credit);
            this.utilsService.presentToast(
                'Solicitud enviada',
                6000,
                "OK",
                true
            );
        } catch (error) {
            console.log(error);
            this.utilsService.presentAlert("Error","Error inesperado", error, [ { text: 'OK' }], '');
        } finally {
            loader.dismiss();
        }

    }

    showAvailablesFees(event: any): void {
        this.creditForm.patchValue({ numberFees: '', feesTotalAmount: '', creditDuration: '' });
        if (event.target.value) {
            this.availableFees = this.staticFees.filter(fee => fee.totalAmount === parseInt(event.target.value))[0].availableFees;
        } else { return; }
    }

    setFeeTotalAmount(event: any): void {
        try {
            let durationSelected = parseInt(event.target.value);
            this.creditForm.patchValue({ feesTotalAmount: this.availableFees.filter(fee => fee.numberFees == durationSelected)[0].totalFee || '' })
            this.creditForm.patchValue({ numberFees: this.availableFees.filter(fee => fee.numberFees == durationSelected)[0].numberFees || '' })
        } catch (error) { // Encapsula el error de (availableFees: undefined)
            this.creditForm.patchValue({ feesTotalAmount: '' });
        }
    }

}

