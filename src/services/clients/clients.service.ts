import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Client } from "../../models/client.model";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private clientsCollection: AngularFirestoreCollection<Client>;
  private clients: Observable<Client[]>;

  constructor(
    private afs: AngularFirestore
  ) { 

    // Crea una instancia de la coleccion con un objeto de AngularFire.
    this.clientsCollection = this.afs.collection<Client>('clientes');
  }

  /**
   * Obtiene todos los clientes de la coleccion.
   */
  getClients(): Observable<Client[]>{

    // Obtiene el estado actual de la coleccion seleccionada
    // como un Observable Doc. completa en:
    // https://github.com/angular/angularfire2/blob/master/docs/firestore/collections.md
    this.clients = this.clientsCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(action => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          return {id, ...data};
        })
      })
    );
    
    return this.clients;
  }

  /**
   * Obtiene los datos del estado actual del cliente seleccionado.
   * @param id Nro. de cédula del cliente
   */
  getClient(id: string): Observable<Client>{
    return this.clientsCollection.doc<Client>(id).valueChanges();
  }

  /**
   * Añade un cliente a la coleccion.
   * @param client 
   */
  addClient(client: Client): Promise<void>{
    return this.clientsCollection.doc<Client>(client.id.toString()).set(client);
  }

  /**
   * Actualiza el documento con el ID seleccionado.
   * @param data 
   * @param id Nro. de cédula
   */
  updateClient(data: any, id: string): Promise<void>{
    return this.clientsCollection.doc(id).update(data);
  }

  /**
   * Elimina un documento con el ID seleccionado.
   * @param id Nro. de cédula
   */
  removeClient(id: string): Promise<void>{
    return this.clientsCollection.doc(id).delete();
  }
}
