import { Injectable } from '@angular/core';
import { Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";

import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from '@angular/fire/firestore'

import { User } from "../../models/user.model";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Guarda todos los estados del usuario Login/Logout
  user$: Observable<User>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {
    // Escucha al cambio de estado de autenticacion del usuario
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          // Retorna un objeto la base de datos del tipo <User>
          return this.afs.doc<User>(`user/${user.uid}`).valueChanges();
        } else {
          // Retorna un observable de null cuando no hay cambios de estado el usuario
          return of(null);
        }
      })
    )
  }

  /**
   * Login con firebase Email & Contraseña
   * @param email 
   * @param password 
   */
  login(email: string, password: string): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
  }

  /**
   * Cerrar sesión en Firebase
   */
  logout(): Promise<void> {
    console.log("Logout")
    return this.afAuth.auth.signOut();
  }
}
