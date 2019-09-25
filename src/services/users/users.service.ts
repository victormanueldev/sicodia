import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { User } from 'src/models/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  usersCollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;

  constructor(
    private afs: AngularFirestore
  ) { 
    this.usersCollection = this.afs.collection<User>('usuarios');
  }

  getUsers(): Observable<User[]> {

    this.users = this.usersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(action => {
          const data = action.payload.doc.data();
          const id = action.payload.doc.id;
          return { id, ...data };
        })
      })
    );

    return this.users;
  }

  getUser(id: string): Observable<User> {
    return this.usersCollection.doc<User>(id).valueChanges();
  }

  getStorageData(property: string): string {
    return localStorage.getItem(property);
  }

  updateUser(id: string, data: User): Promise<void> {
    return this.usersCollection.doc<User>(id).update(data);
  }

}
