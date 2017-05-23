import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AuthProvider } from './auth'
/*
  Generated class for the Maps provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MapsProvider {

  public currentUser : any;
  public mapsRef : any;
  constructor(public af : AngularFireDatabase, 
  	public auth: AngularFireAuth,
    public authProvider : AuthProvider ) {
    	
      this.mapsRef = this.af.database.ref('/maps');
      this.currentUser = authProvider.getCurrentUser();
      console.log('Maps Provider | Constructor ');
      console.log('Maps Provider | this.currentUser ', this.currentUser);
  }

  load(){
  }


  addItem(item){
    console.log("Adding new map", item)
      this.mapsRef.push({  
        name: item.name,
        description: item.description,
        owner: this.currentUser.email
     }).catch(error => {
         console.log("Error inserting new map", error);
     });
}

  editItem(){

  }

  getItem(id){
    let myMaps = this.af.database.ref('/users/'+this.currentUser.email+'/maps');

  }


getMapsFromUser(alert, loader){
  loader.present();
  console.log('Getting maps from user', this.authProvider.getCurrentUser());
  let myMaps = this.af.database.ref('/users/'+this.authProvider.getCurrentUser().uid+'/maps');
  let maps = this.af.database.ref('/maps/');
  myMaps.once('value', userMaps => {
    for (var key in userMaps.val() ){
      console.log(key);
      maps.child(key).once('value', map => {
        console.log(map);
        console.log(map.val());
        console.log(map.val().name);
        alert.addInput({
          type: 'radio',
          label: map.val().name,
          value: map.key,
        });
      })
    }
  });
  loader.dismiss();
}


addMapToUser(map){
  this.mapsRef.push({  name: map.name,
              description: map.description,
              owner: this.authProvider.getCurrentUser().uid
  }).then( newmap => {
      console.log('New map with key ', newmap.key);
      console.log('Current user id ', this.authProvider.getCurrentUser().uid);
      let userMaps = this.af.database.ref('/users/'+this.authProvider.getCurrentUser().uid+'/maps');
      let mapsUsers = this.af.database.ref('/maps/'+ newmap.key +'/users');
      mapsUsers.child(this.authProvider.getCurrentUser().uid).set(true);
      userMaps.child(newmap.key).set(true);
  });
}


}