import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';
import { AuthProvider } from './auth'
import { HomePage } from '../pages/home/home';
import { GoogleMap, GoogleMapsEvent } from '@ionic-native/google-maps';

/*
  Generated class for the Maps provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MapsProvider {

  public currentUser : any;
  public mapsRef : any;
  public map : GoogleMap;
  public static mapSaved : GoogleMap;
  public static markersArray = [];
  public homePage : HomePage;


  constructor(public af : AngularFireDatabase, 
  	public auth: AngularFireAuth,
    public authProvider : AuthProvider ) {
    	
      this.mapsRef = this.af.database.ref('/maps');
      this.currentUser = authProvider.getCurrentUser();
      console.log('Maps Provider | Constructor | this.currentUser ', this.currentUser);
      this.map = new GoogleMap('map');



      this.map.one(GoogleMapsEvent.MAP_READY).then(callback => {
        console.log('Maps Provider | Constructor | MAP_READY', this.map);
        console.log('Maps Provider | Constructor | callback', callback);
        MapsProvider.mapSaved = this.map;
      });




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


getNameFromMapUID(mapSelectedUID, homePage){
  let map = this.af.database.ref('/maps/' + mapSelectedUID);
  map.once('value', data => {
    console.log('Maps Provider | getNameFromMapUID(' + mapSelectedUID + ') -->', data.val().name);
    homePage.mapName = data.val().name;
  })
}


getMapsFromUser(alert, loader){
  loader.present();
  console.log('Getting maps from user', this.authProvider.getCurrentUser());
  let myMaps = this.af.database.ref('/users/'+this.authProvider.getCurrentUser().uid+'/maps');
  let maps = this.af.database.ref('/maps/');
  myMaps.once('value', userMaps => {
    for (var key in userMaps.val() ){
      maps.child(key).once('value', map => {
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