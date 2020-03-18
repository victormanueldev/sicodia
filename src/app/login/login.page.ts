import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { AuthService } from 'src/services/auth/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsersService } from 'src/services/users/users.service';
import { User } from 'src/models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {


  //Formulario Login
  loginForm = new FormGroup({
    email: new FormControl('', Validators.email),
    password: new FormControl('')
  });

  constructor(
    private authService: AuthService,
    private toastCtrl: ToastController,
    private loaderCtrl: LoadingController,
    private router: Router,
    private userService: UsersService
  ) { }

  ngOnInit() {
  }

  async presentToast(message: string): Promise<void>{
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 5000,
      showCloseButton: true,
      closeButtonText: 'OK'
    });

    toast.present();
  }

  async login(): Promise<void> {

    const loader = await this.loaderCtrl.create({
      message: 'Validando credenciales...'
    })
    loader.present();

    try {
      const resAuth = await this.authService.login(this.loginForm.value.email, this.loginForm.value.password);
      let promise = this.userService.getUser(resAuth.user.uid).subscribe(res => {
        localStorage.setItem("idCompany", res.idCompany.toString());
        localStorage.setItem('role', res.role);
        localStorage.setItem('name', res.name);
        localStorage.setItem("uid", resAuth.user.uid);
        localStorage.setItem("routeNumber", res.routeNumber.toString());
        promise.unsubscribe();
        this.router.navigate(['/home']);
      });
    } catch (error) {
      // Valida el tipo de error
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this.presentToast('Usuario no válido. Revisa tu correo y contraseña.')
          break
        default:
          this.presentToast('Ocurrió un error validando la información.')
          break;
      }
    } finally {
      loader.dismiss();
    }
  }

}
