import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
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
import { RenewalsService } from 'src/services/renewals/renewals.service';
import { Renewal } from 'src/models/renewal.model';

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
        private fcm: FcmService,
        private renewalsService: RenewalsService
    ) { }

    dismissModal() {
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    async createCredit(): Promise<void> {
        const loader = await this.utilsService.presentLoader('Enviando solicitud...');
        loader.present();

        const idCompany = Number(this.usersService.getStorageData("idCompany"))
        const fullNameClient = this.navParams.get('fullName');

        const renewal: Renewal = {
            id: moment().tz('America/Bogota').format('YYYYMMDDHHmmss') + 'RN' + this.navParams.get('id'),
            ...this.creditForm.value,
            requestDate: moment().tz('America/Bogota').format('YYYY-MM-DD HH:mm:ss'),
            idClient: this.navParams.get('id'),
            requestUid: this.usersService.getStorageData("uid"),
            state: 'Pendiente',
            idCompany
        }

        const notification: Notification = {
            notification: {
                title: 'Nueva solicitud de crédito',
                body: `Se ha recibido una nueva solicitud de aprobación de crédito para ${fullNameClient}`,
                icon: 'myicon',
                sound: 'default'
            },
            to: ''
        }

        try {

            await this.usersService.getUsers(idCompany).subscribe(res => {
                this.users = res.filter(user => user != null);
                this.users.map(async user => {
                    // Valida que el usuario sea administrados y diferente al usuario logueado
                    if (user.role == 'admin' && user.id !== localStorage.getItem('uid') && user.idCompany == idCompany) {
                        // Añade el token al objeto de notificacion
                        notification.to = user.token;
                        // Envia una notificacion por cada usuario que cumpla la condicion
                        await this.fcm.sendNotifications(notification);
                    }
                });
            });

            await this.renewalsService.addRenewal(renewal);

            this.utilsService.presentToast(
                'Solicitud enviada',
                6000,
                "OK",
                true
            );

        } catch (error) {
            this.utilsService.presentAlert("Error", "Error inesperado", error, [{ text: 'OK' }], '');
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

