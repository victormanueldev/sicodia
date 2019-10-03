import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Renewal } from 'src/models/renewal.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RenewalsService {

  private renewalsCollection: AngularFirestoreCollection<Renewal>;
  private renewals$: Observable<Renewal[]>;

  constructor(
    private afs: AngularFirestore
  ) { 
    this.renewalsCollection = this.afs.collection<Renewal>('renovaciones');
  }

  getRenewals(idCompany: number): Observable<Renewal[]> {
    this.renewals$ = this.renewalsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(action => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          const idCompanyRenewal = data.idCompany;
          if(idCompany == idCompanyRenewal){
            return { id, ...data }
          } else {
            null
          }
        })
      })
    );

    return this.renewals$;
  }

  getRenewal(id: string): Observable<Renewal> {
    return this.renewalsCollection.doc<Renewal>(id).valueChanges();
  }

  getRenewalByClient(idClient: string): Observable<Renewal[]> {
    return this.afs.collection<Renewal>('renovaciones', ref => ref.where('idClient', '==', idClient)).valueChanges();
  }

  addRenewal(data: Renewal): Promise<void> {
    return this.renewalsCollection.doc<Renewal>(data.id).set(data);
  }

  updateRenewal(id: string, data: Renewal): Promise<void> {
    return this.renewalsCollection.doc<Renewal>(id).update(data);
  }

}
