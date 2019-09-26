import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Collection } from 'src/models/collection.moldel';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CollectionsService {

  private collectsCollections: AngularFirestoreCollection<Collection>;
  private collections: Observable<Collection[]>

  constructor(
    private afs: AngularFirestore
  ) {
    this.collectsCollections = this.afs.collection<Collection>('recaudos'); 
  }

  getCollections(): Observable<Collection[]> {
    this.collections = this.collectsCollections.snapshotChanges().pipe(
      map(actions => {
        return actions.map(action => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;

          return { id, ...data };
        })
      })
    );

    return this.collections
  }

  getCollect(id: string): Observable<Collection> {
    return this.collectsCollections.doc<Collection>(id).valueChanges();
  }

  getCollectByUser(idUser: string): Observable<Collection[]> {
    return this.afs.collection<Collection>('recaudos', ref => ref.where('uid', '==', idUser)).valueChanges();
  }


  addCollection(data: Collection): Promise<void> {
    return this.collectsCollections.doc<Collection>(data.id).set(data);
  }

  updateCollection(idCollecion: string, data: Collection): Promise<void> {
    return this.collectsCollections.doc<Collection>(idCollecion).update(data);
  }

  removeCollection(idCollecion: string): Promise<void> {
    return this.collectsCollections.doc<Collection>(idCollecion).delete();
  }
}
