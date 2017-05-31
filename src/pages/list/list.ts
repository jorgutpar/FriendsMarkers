import { Component,NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import { HomePage } from '../home/home';
/**
 * Generated class for the List page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {
  	public zone: NgZone;
	public arrayMaps : any[] = [];
	public arrayMarkers : any;
	public userProfile : any;
  constructor(public navCtrl: NavController, 
  	public navParams: NavParams,
  	public af : AngularFireDatabase) {


  	this.arrayMaps = [];

    this.zone = new NgZone({});
    firebase.auth().onAuthStateChanged( user => {
      this.zone.run( () => {
        if(user){
          this.userProfile = user;
        } else {
          this.userProfile = null;
        }
      });
  });

	console.log('option : ', navParams.data.option);
  	switch(navParams.data.option){
	   case "listMaps": {
	   	this.showMyMaps();
	   	break; 
   		} 
   		
   		case "listMarkers": { 
		this.arrayMarkers = navParams.data.data;
		break; 
   		} 
	}
  }

mapSelected(mapSelected){
	console.log(mapSelected);

	this.navCtrl.push(HomePage, mapSelected);


}


showMyMaps(){
  this.userProfile = firebase.auth().currentUser;
  let myMaps = this.af.database.ref('/users/'+this.userProfile.uid+'/maps');
  let maps = this.af.database.ref('/maps/');

  myMaps.on('child_added', snapshot => {
  	let extractMap = maps.child(snapshot.key);
  	extractMap.once('value').then( map => {
  		this.arrayMaps.push({
  			id: snapshot.key,
  			name: map.val().name,
  			description: map.val().description,
  			members: 4,
  			owner: this.userProfile.uid
  		})
  		console.log(this.arrayMaps);
  		console.log(map.val());
  	});
  });
  
}

  ionViewDidLoad() {
    console.log('ionViewDidLoad List');
  }

}

