import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { AlertController, LoadingController, ActionSheetController, ToastController } from 'ionic-angular';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import {
 GoogleMaps,
 GoogleMap,
 GoogleMapsEvent,
 LatLng,
 CameraPosition,
 MarkerOptions,
 MyLocation,
 Marker
} from '@ionic-native/google-maps';

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
	markerService: FirebaseListObservable<any>;
	mapsService: FirebaseListObservable<any>;
	clickableMap : any = true;
	public database : any;
	public showedmarkers = [];
	public keys : string[];
	public db : any;

	public mapName : string = "Global Map";

  constructor(public navCtrl: NavController, 
  	public platform: Platform, 
  	public loadingCtrl : LoadingController,
  	public toastCtrl : ToastController,  
  	public alertCtrl: AlertController, 
  	public af : AngularFireDatabase, 
  	public auth: AngularFireAuth, 
  	public actionSheetCtrl : ActionSheetController, 
  	private googleMaps: GoogleMaps) {
    
  
  	this.markerService = af.list('/markers');
  	this.mapsService = af.list('/maps');
  	console.log("this.markerService");
  	console.log(this.markerService);
  	auth.auth.signInAnonymously();
  	//auth.auth.onAuthStateChanged(user => {} );



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

isAuthenticated(){

}


addMap(){
	this.disableMap();
   	console.log("Adding Map ...");
   	let prompt = this.alertCtrl.create({
		    title: 'Name',
		    message: "Enter a name for the new map ",
		    inputs: [
		      {
		        name: 'name',
		        placeholder: 'Name'
		      },{
		        name: 'description',
		        placeholder: 'Description'
		      }
		    ],
		    buttons: [
		      {
		        text: 'Cancel',
		        handler: data => { console.log('Cancel clicked');     }
		      },
		      {
		        text: 'Save',
		        handler: data => {
		        	console.log(data);
		          	this.mapsService.push({	name: data.name,
			          						description: data.description
		           							//owner: this.auth.auth.id
   		          	});
   		          	this.mapName = data.name;
		        }
		      }
		    ]
		  });
		prompt.onDidDismiss(() => { this.enableMap();	})
		prompt.present();
}


ionViewDidLoad(){ 


	this.getMyLocation(); 

}





  showMap(){
    this.mapRendered=true;
    let position: CameraPosition = {
      target: this.myLocation.latLng,
      zoom: 15
    };
    this.map.moveCamera(position);
    let markerOptions: MarkerOptions = {
      'position': this.myLocation.latLng
    };
    let toast = this.toastCtrl.create({
      message: 'Location found, search for anything',
      position: 'bottom',
      duration: 3000
    });
    toast.present();
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
/*	            alert('Latitude: '          + location.latLng.lat          + '\n' +
	              'Longitude: '         + location.latLng.lng         + '\n');*/
	            
/////////////// MAP READY /////////////////////

	            this.showMap();
	            this.addListeners();
	            this.placeMarkers();



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

   setMarkerProperties(mapClick){
   	this.disableMap();
   	let latLng = mapClick+"".toString();
	let prompt = this.alertCtrl.create({
		    title: 'Name',
		    message: "Enter a name for this place ",
		    inputs: [
		      {
		        name: 'title',
		        placeholder: 'Title'
		      },{
		        name: 'description',
		        placeholder: 'Description'
		      }
		    ],
		    buttons: [
		      {
		        text: 'Cancel',
		        handler: data => {
		          console.log('Cancel clicked');
		        }
		      },
		      {
		        text: 'Save',
		        handler: data => {
		        	
		        	
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
      console.log("Map clicked on : " + mapClick);
      console.log(mapClick);
/*      let latLng = mapClick +"".split(',');
*/	
		this.setMarkerProperties(mapClick);
	
		}, (err) => {
		console.log(err);
		});
		}
  




	placeMarkers(){

  	let myMarkers = this.af.database.ref('/markers');
  	var self = this;
  	  var markers : MyMarker[];
	myMarkers.on('child_added', function(snapshot) {
				console.log('snapshot')
				console.log(snapshot)
				console.log('snapshot.val()')
				console.log(snapshot.val())

				let latlng = snapshot.val().latLng.toString().split(/, ?/)
    			console.log(parseFloat(latlng[0]), parseFloat(latlng[1]));
				 let position: LatLng = new LatLng(latlng[0],latlng[1]);


				let markerOptions : MarkerOptions = {
					'position': position,
					'icon':'blue',
					'title': snapshot.val().title,
					'snippet': snapshot.val().description
				}
				console.log('Marker Options: ')
				console.log(markerOptions);
				self.map.addMarker(markerOptions).then(
							(marker: Marker) => {
								marker.showInfoWindow();
							},
						 (err) => {
					console.log(err)
				});
});


	}
}

 
