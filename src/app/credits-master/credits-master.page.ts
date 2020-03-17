import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CreditsService } from 'src/services/credits/credits.service';
import { UtilsService } from 'src/services/utils/utils.service';
import { UsersService } from 'src/services/users/users.service';

@Component({
  selector: 'app-credits-master',
  templateUrl: './credits-master.page.html',
  styleUrls: ['./credits-master.page.scss'],
})
export class CreditsMasterPage implements OnInit {
  
  creditsForm: FormGroup = new FormGroup({
    totalAmount: new FormControl(''),
    numberFees: new FormControl(''),
    feesTotalAmount: new FormControl('')
  })

  constructor(
    private creditsService: CreditsService,
    private utilsService: UtilsService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
  }

  async createCredit(  ) {

    const loader = await this.utilsService.presentLoader('Guardando información...');
    loader.present();

    try {
      await this.creditsService.createAvailableCredit({
        ...this.creditsForm.value, 
        idCompany: Number(this.usersService.getStorageData("idCompany")) 
      });

      this.utilsService.presentToast(
        'Información guardada',
        6000,
        "OK",
        true
      );

      this.creditsForm.reset();

    } catch (error) {

      this.utilsService.presentToast(
        'Ocurrió un error inesperado',
        6000,
        "OK",
        true
      );

    } finally {
      loader.dismiss();
    }
  }

}
