import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Collection } from 'src/models/collection.moldel';
import { CollectionsService } from 'src/services/collections/collections.service';
import * as moment from 'moment-timezone';

@Component({
    selector: 'modal-collect-details',
    templateUrl: './modal-collect-details.html'
})
export class ModalCollectDetails implements OnInit{

    collections: Collection[] = null;
    emptyCollections: boolean = false;

    constructor(
        private modalCtrl: ModalController,
        private navParams: NavParams,
        private collectService: CollectionsService
    ){}

    dismissModal(){
        this.modalCtrl.dismiss({
            'dismissed': true
        });
    }

    ngOnInit() {
        
        this.collectService.getCollectByUser(this.navParams.get('id')).subscribe(res => {
            let allCollections = res;
            const date = this.navParams.get('dateSelected');
            // Muestra el detalle del recaudo del dia actual
            this.collections = allCollections.filter(collect => moment(collect.createdAt).format('YYYY-MM-DD') == moment(date).tz('America/Bogota').format('YYYY-MM-DD'))
            if(this.collections.length === 0){
                this.emptyCollections = true
            }
            
        });
    }

}