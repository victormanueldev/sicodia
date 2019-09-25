import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Credit } from 'src/models/credit.model';
import { ClientsService } from '../clients/clients.service';

@Injectable({
  providedIn: 'root'
})
export class CreditsService {

  private creditsCollection: AngularFirestoreCollection<Credit>;
  private credits: Observable<Credit[]>;



  constructor(
    private afs: AngularFirestore,
    private clientesServce: ClientsService
  ) {
    this.creditsCollection = this.afs.collection<Credit>('creditos');
  }

  getCredits(): Observable<Credit[]> {
    this.credits = this.creditsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(action => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          // Valida que la accion realizada sea una modificacion
          if(action.type === 'modified') {
            // Valida que se completaron las cuotas pendietes
            if(action.payload.doc.data().outstandingFees === 0){
              // Actualiza los estados de las respectivas colecciones
              this.updateCredit(action.payload.doc.id, { state: 'Pagado' });
              this.clientesServce.updateClient({ billingState: 'Al día' }, action.payload.doc.data().idClient);
            }

          }
          
          return { id, ...data };
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

  getActiveCredits(): Observable<Credit[]> {
    return this.afs.collection<Credit>('creditos', ref => ref.where('state', '==', 'Acreditado')).valueChanges();
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

}
