import { Component } from '@angular/core';
import { NavController, NavParams, Platform, FabContainer } from 'ionic-angular';
import { AlertController, LoadingController, ActionSheetController, ToastController } from 'ionic-angular';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { MapsProvider } from '../../providers/maps';
import { MarkersProvider } from '../../providers/markers';
import { AuthProvider } from '../../providers/auth';

import { GoogleMaps, GoogleMap, GoogleMapsEvent, LatLng, CameraPosition, MarkerOptions, MyLocation, Marker} from '@ionic-native/google-maps';

'use strict'; 
class MyMarker{
	id : any;
	title : any;
	description : any;
	latLng : any;
 constructor(id, title, description, latLng){
    this.id = id ;
    this.title = title ;
    this.description = description ;
    this.latLng = latLng ;
}

}

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
	mapsService: FirebaseListObservable<any>;
	clickableMap : any = true;
	public database : any;
	//public showedmarkers = [];
	public keys : string[];
	public db : any;
	public mapName : string = "Global Map";
  	public user;
  	public userProfile : any = null;
  	public fabContainer : FabContainer;


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
    	

    	if(navParams.data){
    		let mapSelected = navParams.data;
    		this.loadMarkersFromMap(mapSelected.id)	
    	} else {
    		this.markerService = this.af.database.ref('/markers/');
    	}
    	this.userProfile = this.authProvider.getCurrentUser();
  }



loadMarkersFromMap(mapSelectedID){
	console.log("Loading markers from map id ", mapSelectedID);
}



selectMap(fab : FabContainer){
	fab.close();
	let alert = this.alertCtrl.create();
    alert.setTitle('Available Maps');
	var loader = this.loadingCtrl.create();

    this.mapsProvider.getMapsFromUser(alert, loader);

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log('Map UID choosed ', data)
      }
    });
    alert.present();
}




menuShowing(){
	this.disableMap();
}

disableMap(){
	this.map.setClickable(false);
}
enableMap(){
	this.map.setClickable(true);
}


promptAddMap(event, fab : FabContainer){
	fab.close();
	this.disableMap();
   	console.log("Adding Map ...");
   	let prompt = this.alertCtrl.create({
		    title: 'Add map',
		    message: "Enter a name for the new map ",
		    inputs: [{ name: 'name', placeholder: 'Name'},
		    		{ name: 'description', placeholder: 'Description' } ],
		    buttons: [{text: 'Cancel', handler: data => { console.log('promptAddMap | Cancel clicked');}},
		      	{ text: 'Save', handler: (data) => { this.addMapToUser(data); } } ]
	});
	prompt.onDidDismiss(() => { this.enableMap();	})
	prompt.present();
}


addMapToUser(map){
	console.log('Add map to user',map);
	this.mapsProvider.addMapToUser(map);
}

ionViewDidLoad(){ 
	this.getMyLocation(); 
	this.user = firebase.auth().currentUser;
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
    this.map = new GoogleMap('map', {
        'backgroundColor': 'white',
        'controls': {
        'compass': true,
        'myLocationButton': true,
        'indoorPicker': true,
      },
      'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      }
    });

    console.log("Getting location");
    let loader = this.loadingCtrl.create({
      content: "Getting location ... please wait."
    });

    loader.present();
    this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {
        	this.map.getMyLocation().then((location) => {
	            console.log("Map Ready, location is ");
	            console.log(location);
	            this.myLocation = location;


	            
	            
/////////////// MAP READY /////////////////////

	            this.showMap();
	            this.addListeners();
	            //this.placeMarkers();




        // constructor passing in this DIV.




	            loader.dismiss();
        	}, (err) => {
                loader.dismiss();
                console.log(err);
                alert(err.error_message);
          });
    }, (err) => {
            loader.dismiss();
            console.log("Error in MAP_READY event");
            console.log(err);
            alert(err.error_message);
      });
                loader.dismiss();


   }


   getMapUID(){

   }

   promptAddMarker(mapClick){
   	this.disableMap();
   	let latLng = mapClick+"".toString();
	let prompt = this.alertCtrl.create({
		    title: 'Add marker',
		    message: "Enter a name for this place ",
		    inputs: [ 	{ name: 'title', 		placeholder: 'Title' },
		    			{ name: 'description', 	placeholder: 'Description' } ],
		    buttons: [ 	{ text: 'Cancel', 		handler: data => { console.log('Cancel clicked'); } },
		      { text: 'Save', handler: data => {
		        	this.markersProvider.addMarkerToMap(data, this.getMapUID());
		        	
		        	console.log(data);
		          this.markerService.push({
		            title: data.title,
		            description: data.description,
        			latLng: latLng
		          });

	
					let markerOptions : MarkerOptions = {
						'position': mapClick,
						'icon':'blue',
						'title': data.title,
						'snippet': data.description
					};
					this.map.addMarker(markerOptions).then((marker: Marker) => {
								marker.showInfoWindow();
					})
					this.enableMap();
		        }
		      }
		    ]
		  });

		prompt.onDidDismiss(() => { this.enableMap();	})
		prompt.present();
   }



addListeners(){
    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe((mapClick) => {
      	console.log("Map clicked on : ", mapClick);
		this.promptAddMarker(mapClick);
	}, (err) => {
		console.log(err);
	});
}
  



/* Places all markers from /markers/global */
placeMarkersGlobal(){

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
/*		.then((marker: Marker) => {
			marker.showInfoWindow();
		}, (err) => {
			console.log(err)
		});*/
	});
  }

}

 
