import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Platform, FabContainer, FabButton } from 'ionic-angular';
import { AlertController, LoadingController, ActionSheetController, ToastController } from 'ionic-angular';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { MapsProvider } from '../../providers/maps';
import { MarkersProvider } from '../../providers/markers';
import { AuthProvider } from '../../providers/auth';

import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition, MarkerOptions, MyLocation, Marker, GroundOverlay } from '@ionic-native/google-maps';




@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	
	public map : GoogleMap;	
	public mapRendered: Boolean = false;
  public location: LatLng;
  public myLocation: MyLocation;
	markerService: any;
	clickableMap : any = true;
	public database : any;
	public keys : string[];
	public db : any;
  	public user;
  	public userProfile : any = null;
  	public fabContainer : FabContainer;
    public fabButton : FabButton
    public overlay : GroundOverlay;

  public static mapSaved : any;
  	public mapUID : any
	public mapName : string = "Public Map";

  constructor(public navCtrl: NavController, 
  	public navParams : NavParams,
  	public platform: Platform, 
  	public loadingCtrl : LoadingController,
  	public toastCtrl : ToastController,  
  	public alertCtrl: AlertController, 
  	public af : AngularFireDatabase, 
  	public auth: AngularFireAuth, 
  	public actionSheetCtrl : ActionSheetController, 
  	private googleMaps: GoogleMaps,
  	public markersProvider : MarkersProvider,
  	public authProvider : AuthProvider,
  	public mapsProvider : MapsProvider) {

    console.log('HomePage | Constructor | navParams.data', navParams.data)
    if(!navParams.data.id){
      navParams.data.id = 'public'
    }
    this.loadMarkersFromMap(navParams.data.id)	
    this.userProfile = this.authProvider.getCurrentUser();
  }


ionViewDidLoad(){ 

  console.log('HomePage | ionViewDidLoad');
  console.log('HomePage | ionViewDidLoad | this.map', this.map);

  if(!this.map){
      console.log('HomePage | ionViewDidLoad | this.map is null!! ');
      MapsProvider.mapSaved.setDiv(document.getElementById('map'));
      MapsProvider.mapSaved.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe((mapClick) => {
        console.log("Map clicked on : ", mapClick);
        this.promptAddMarker(mapClick);
      }, (err) => {
        console.log(err);
      });
      
      MapsProvider.mapSaved.setOptions({ 'backgroundColor': 'white',  'controls': { 'compass': true,'myLocationButton': true,'indoorPicker': true, }, 'gestures': { 'scroll': true, 'tilt': true,  'rotate': true,  'zoom': true  }  });
      this.getMyLocation(); 
  } else {
    console.log('HomePage | ionViewDidLoad | Map already initialized  ');
  }

}


clearMarkers(){
  for ( var i = 0; i < MapsProvider.markersArray.length; i++){
    let marker : Marker = MapsProvider.markersArray[i];
    marker.remove();
  }
  MapsProvider.markersArray.length = 0;
}






loadMarkersFromMap(mapSelectedUID){
	this.disableMap();
  this.clearMarkers();
	this.mapUID = mapSelectedUID;
	var loader = this.loadingCtrl.create({
    content: "Loading markers ... please wait."
  });
  loader.onDidDismiss(() => this.enableMap());
  this.mapsProvider.getNameFromMapUID(mapSelectedUID, this);
  console.log("Loading markers from map id ", mapSelectedUID);
	this.markersProvider.getMarkersFromMap(mapSelectedUID, loader);
  this.addListeners();
}



selectMap(){
  this.disableMap();
	let alert = this.alertCtrl.create();
  alert.setTitle('Available Maps');
  alert.onDidDismiss(() => this.enableMap());
	var loader = this.loadingCtrl.create();
  loader.present();
 	alert.addInput({ type: 'radio', label: 'Public map', value: 'public', });
  this.mapsProvider.getMapsFromUser(alert, loader);
  alert.addButton('Cancel');
  alert.addButton({ text: 'OK',
    handler: data => {
      console.log('Data --> ', data);
      console.log('Loading map with id ', data);
      this.loadMarkersFromMap(data);
      }
  });
}




menuShowing(){
	this.disableMap();
}

disableMap(){
	this.clickableMap = false;
  console.log("Map clickable? ",this.clickableMap)
	MapsProvider.mapSaved.setClickable(false);
}
enableMap(){
	this.clickableMap = true;
  console.log("Map clickable? ",this.clickableMap)
	MapsProvider.mapSaved.setClickable(true);
}


toggleMapClick(){
  this.clickableMap = !this.clickableMap
  console.log("Map clickable? ",this.clickableMap)
	MapsProvider.mapSaved.setClickable(this.clickableMap);
}


fabController(ev, fab : FabContainer, fabButton : FabButton){
	//this.toggleMapClick();
  console.log(fab);
  console.log(fabButton);

}




addMapToUser(map){
	console.log('Add map to user',map);
	this.mapsProvider.addMapToUser(map);
}





  showMap(){
    this.mapRendered=true;
    let position : CameraPosition = {
      target: this.myLocation.latLng,
      zoom: 15
    };
    this.map.moveCamera(position);
  }





   getMyLocation(){
    let loader = this.loadingCtrl.create({ content: "Getting location ... please wait." });
    loader.present();
    MapsProvider.mapSaved.getMyLocation().then((location) => {
        console.log("HomePage | getMyLocation | Location is ", location);
        this.myLocation = location;
        this.mapRendered=true;
        let position : CameraPosition = { target: location.latLng, zoom: 15 };
        MapsProvider.mapSaved.moveCamera(position);
        loader.dismiss();
  	}, (err) => {
          loader.dismiss();
          console.log(err);
          alert(err.error_message);
    });
   }


   getMapUID(){
   		return this.mapUID;
   }

  promptAddMarker(mapClick){
    console.log('HomePage | promptAddMarker | Init ')
    console.log('HomePage | promptAddMarker | mapClick ', mapClick)
   	let latLng = mapClick+"".toString();
	  let prompt = this.alertCtrl.create({
		    title: 'Add marker',
		    message: 'Enter a name for this place',
		    inputs: [ { name: 'title', 		  placeholder: 'Title' },
		    			    { name: 'description',placeholder: 'Description' }],
		    buttons: [{ text: 'Cancel', handler: data => console.log('HomePage | promptAddMarker | Cancel add marker')},
		      { text: 'Save', handler: data => {
		        	this.markersProvider.addMarkerToMap(data, latLng, this.getMapUID());
		      }}]
		  });
		prompt.onDidDismiss(() => this.enableMap())
		prompt.present().then(() => this.disableMap());
   }



addListeners(){


}
  


promptAddMap(){
  this.disableMap();
  console.log("HomePage | promptAddMap | Init ");
  let prompt = this.alertCtrl.create({
    title: 'Add map',
    message: "Enter a name for the new map ",
    inputs: [ { name: 'name', placeholder: 'Name'},
              { name: 'description', placeholder: 'Description' } ],
    buttons: [{text: 'Cancel', handler: data => { console.log('HomePage | promptAddMap | Cancel add map');}},
              {text: 'Save',   handler: data => {this.addMapToUser(data)}}]
  });
  prompt.onDidDismiss(() => {this.enableMap()})
  prompt.present()
}

/*placeMarkersGlobal(){
  	let myMarkers = this.af.database.ref('/markers/global');
  	var self = this;
  	myMarkers.once('value', function(snapshot) {
		let latlng = snapshot.val().latLng.toString().split(/, ?/)
		let position: LatLng = new LatLng(latlng[0],latlng[1]);
		let markerOptions : MarkerOptions = {
			'position': position,
			'icon':'blue',
			'title': snapshot.val().title,
			'snippet': snapshot.val().description
		}
		self.map.addMarker(markerOptions);
	});
  }*/

}

 
