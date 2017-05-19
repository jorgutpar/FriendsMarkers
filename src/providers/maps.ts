import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

/*
  Generated class for the Maps provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Maps {

	mapsService: FirebaseListObservable<any>;
	maps : any;

  constructor(public http: Http,
  	public af : AngularFireDatabase, 
  	public auth: AngularFireAuth ) {
    	console.log('Hello Maps Provider');
    	//this.mapsService = af.list('/maps');
  }

  load(){
  	var user = firebase.auth().currentUser;
  	let myMaps = this.af.database.ref('/users/'+user.email+'/maps');
  	var self = this;
	myMaps.on('child_added', snapshot => {
				console.log('New child_added to maps | Snapshot --> ', snapshot);
				console.log('Snapshot.val() -->', snapshot.val());
	          	this.mapsService.push({	
	          		name: snapshot.name,
		          	description: snapshot.description,
	           		owner: self.user.email
		         }).catch(error => {
		         	console.log("Error inserting new map error");
		         });
	});
  }


  addItem(item){
	
  	//console.log("user", user);


}

  editItem(){

  }

  getItem(id){

  }


}