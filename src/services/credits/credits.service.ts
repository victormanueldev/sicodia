import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Credit } from 'src/models/credit.model';
import { Collection } from 'src/models/collection.moldel';

@Injectable({
  providedIn: 'root'
})
export class CreditsService {

  private creditsCollection: AngularFirestoreCollection<Credit>;
  private credits: Observable<Credit[]>;



  constructor(
    private afs: AngularFirestore
  ) {
    this.creditsCollection = this.afs.collection<Credit>('creditos');

    this.credits = this.creditsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(action => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          return { id, ...data };
        })
      })
    )
  }

  getCredits(): Observable<Credit[]> {
    return this.credits;
  }

  getCredit(id: string): Observable<Credit> {
    return this.creditsCollection.doc<Credit>(id).valueChanges();
  }

  getCreditByClient(idClient: string): Observable<Credit[]>{
    return this.afs.collection<Credit>('creditos', ref => ref.where('idClient', '==', idClient) ).valueChanges();
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

  addCollection(idCredit: string, data: Collection): Promise<void>{
    return this.creditsCollection.doc<Credit>(idCredit).collection<Collection>('recaudos').doc(data.id).set(data);
  }
}
