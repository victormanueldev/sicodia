import { Component, OnInit } from '@angular/core';
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
import { CreditMaster } from 'src/models/credit-master.model';

@Component({
    selector: 'modal-renewal',
    templateUrl: './modal-renewal.html'
})
export class ModalPage implements OnInit {

    // Liquidación del crédito predefinida
    staticFees: Array<any> = StaticFees;
    // Opciones de pago disponibles por cada monto
    availableFees: Array<any> = [];
    // Creditos disponibles
    availableCredits: CreditMaster[] = [];
    availableAmounts: number[] = [];
    availableNumberFees: CreditMaster[] = [];
    idCompany: number;
  

    creditForm = new FormGroup({
        collectFrecuency: new FormControl(''),
        totalAmount: new FormControl(''),
        numberFees: new FormControl(''),
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

    ngOnInit() {
        this.idCompany = Number(this.usersService.getStorageData("idCompany"));
        const masterSubscription = this.creditsService.getAvailableCredits( this.idCompany )
            .subscribe( credits => {
                this.availableCredits = credits;
                this.availableAmounts = [...new Set(credits.map( c => c.totalAmount ))].sort();
                masterSubscription.unsubscribe(); 
            })
    }

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
            totalAmount: parseInt(this.creditForm.value.totalAmount),
            feesTotalAmount: parseInt(this.creditForm.value.feesTotalAmount),
            creditDuration: this.creditForm.value.numberFees.numberFees + ' Días',
            numberFees: parseInt(this.creditForm.value.numberFees.numberFees),
            collectFrecuency: parseInt(this.creditForm.value.collectFrecuency),
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
                this.users.forEach(async user => {
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

    /**
     * Muestra las opciones de tiempo de crédito disponibles
     * para el monto seleccionado
     * @param event 
     */
    showAvailablesFees(event: any): void {
        this.availableNumberFees = this.availableCredits
        .filter( credit => credit.totalAmount === Number(event.target.value) )
    }

    /**
     * Establece el valor de la cuota dependiendo del tiempo
     * de crédito seleccionado
     * @param event 
     */
    showFeeTotalAmount(event: any): void {
    try {
        this.creditForm.patchValue( { feesTotalAmount: event.target.value.feesTotalAmount.toString() } );
    } catch (error) {  // Encapsula el error de (availableFees: undefined)
        this.creditForm.patchValue( { feesTotalAmount: '' } ); 
    }
    }

}

