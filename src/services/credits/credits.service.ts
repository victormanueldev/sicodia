import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, reduce } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Credit } from 'src/models/credit.model';
import { ClientsService } from '../clients/clients.service';
import { CreditMaster } from 'src/models/credit-master.model';

@Injectable({
  providedIn: 'root'
})
export class CreditsService {

  private creditsCollection: AngularFirestoreCollection<Credit>;
  private credits: Observable<Credit[]>;

  private creditsMasterCollection: AngularFirestoreCollection<CreditMaster>;
  private availableCredits: Observable<CreditMaster[]>;



  constructor(
    private afs: AngularFirestore,
    private clientesServce: ClientsService
  ) {
    this.creditsCollection = this.afs.collection<Credit>('creditos');
    this.creditsMasterCollection = this.afs.collection<CreditMaster>('maestro-creditos');
  }

  getCredits(idCompany: number): Observable<Credit[]> {
    this.credits = this.creditsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(action => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          const idCompanyCredit = data.idCompany;
          // Valida que la accion realizada sea una modificacion
          if(action.type === 'modified') {
            // Valida que se completaron las cuotas pendietes
            if(action.payload.doc.data().outstandingFees === 0){
              // Actualiza los estados de las respectivas colecciones
              this.updateCredit(action.payload.doc.id, { state: 'Pagado' });
              this.clientesServce.updateClient({ billingState: 'Al día' }, action.payload.doc.data().idClient);
            }

          }
          if(idCompanyCredit == idCompany){
            return { id, ...data };
          } else {
            null
          }
        })
      })
    )

    return this.credits;
  }

  getCredit(id: string): Observable<Credit> {
    return this.creditsCollection.doc<Credit>(id).valueChanges();
  }

  getCreditByClient(idClient: string): Observable<Credit[]>{
    return this.afs.collection<Credit>('creditos', ref => ref.where('idClient', '==', idClient)).valueChanges();
  }

  getActiveCredits(idCompany: number): Observable<Credit[]> {
    return this.afs.collection<Credit>('creditos', ref => ref.where('state', '==', 'Acreditado').where('idCompany','==',idCompany)).valueChanges();
  }

  addCredit(data: Credit): Promise<void> {
    return this.creditsCollection.doc(data.id).set(data);
  }

  updateCredit(id: string, data: Credit): Promise<void> {
    return this.creditsCollection.doc(id).update(data);
  }

  deleteCredit(id: string): Promise<void> {
    return this.creditsCollection.doc(id).delete();
  }

  createAvailableCredit( data: CreditMaster ): Promise<void> {
    const id = this.afs.createId();
    return this.creditsMasterCollection.doc(id).set(data);
  }

  getAvailableCredits(idCompany: number): Observable<CreditMaster[]> {
    return this.afs.collection<CreditMaster>('maestro-creditos', ref => ref.where('idCompany','==',idCompany)).valueChanges();
  }

}
