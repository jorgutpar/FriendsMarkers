import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AuthProvider } from './auth'

/*
  Generated class for the Markers provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MarkersProvider {


	markers : any;

  constructor(public af : AngularFireDatabase, 
    public auth: AngularFireAuth) {
    console.log('Hello Markers Provider');
  }

  load(){

  }


  addItem(){

  }

  editItem(){

  }

  getItem(id){

  }

  loadMarkersFromMap(mapUID){
    
  }


  addMarkerToMap(marker, mapUID){

  }


}
