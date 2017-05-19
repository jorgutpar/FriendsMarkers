import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

/*
  Generated class for the Markers provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Markers {


	markers : any;

  constructor(public http: Http) {
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


}
