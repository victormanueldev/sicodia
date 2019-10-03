import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { firebaseConfig } from '../environments/environment';
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { ClientsService } from 'src/services/clients/clients.service';
import { CreditsService } from 'src/services/credits/credits.service';
import { AuthService } from 'src/services/auth/auth.service';
import { FCM } from '@ionic-native/fcm/ngx';
import { ModalPage } from './clients-detail/modal-renewal/modal-renewal';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ModalCollectDetails } from './home/modal-collect-detail/modal-collect-details';
import { RenewalsService } from 'src/services/renewals/renewals.service';
import { ModalDetailRenewal } from './clients-detail/modal-detail-renewal/modal-detail-renewal';

@NgModule({
  declarations: [AppComponent, ModalPage, ModalCollectDetails, ModalDetailRenewal],
  entryComponents: [
    ModalPage,
    ModalCollectDetails,
    ModalDetailRenewal
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ClientsService,
    CreditsService,
    AuthService,
    RenewalsService,
    FCM
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
