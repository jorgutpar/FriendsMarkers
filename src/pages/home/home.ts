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

/*class MyMarker : Object {
    var author: String = ""
    var body: String = ""
    var imageURL: String = ""
    var uid: String = ""
}*/

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	

	map : GoogleMap;	
	public mapRendered: Boolean = false;
  	public location: LatLng;
  	public myLocation: MyLocation;
	markers: FirebaseListObservable<any>;
	clickableMap : any = true;
	public database : any;




  constructor(public navCtrl: NavController, 
  	public platform: Platform, 
  	public loadingCtrl : LoadingController,
  	public toastCtrl : ToastController,  
  	public alertCtrl: AlertController, 
  	public af : AngularFireDatabase, auth: AngularFireAuth, 
  	public actionSheetCtrl : ActionSheetController, 
  	private googleMaps: GoogleMaps) {
    

  	//this.markers = af.list('/markers');

  	console.log("this.markers");
  	console.log(this.markers);
  	auth.auth.signInAnonymously();
  	//auth.auth.onAuthStateChanged(user => {} );



  }




disableMap(){
	this.clickableMap = !this.clickableMap;
	this.map.setClickable(this.clickableMap);
}


ionViewDidLoad(){ 


	this.getMyLocation(); 
	this.placeMarkers();

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
        'zoom': true,
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
	            this.showMap();
	            this.addListeners();
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
		          this.markers.push({
		            title: data.title,
		            description: data.description,
        			latLng: latLng,
		          });
		          this.disableMap();
		        }
		      }
		    ]
		  });
		 prompt.present();
   }


  addListeners(){

    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe((mapClick) => {
      console.log("Map clicked on : " + mapClick);
      console.log(mapClick);
/*      let latLng = mapClick +"".split(',');
*/	
		this.disableMap();
		this.setMarkerProperties(mapClick);
		
		 let markerOptions : MarkerOptions = {
        'position': mapClick,
        'icon':'blue',
        'title': '',
    	'snippet': ''
      };
		this.map.addMarker(markerOptions).then((marker: Marker) => {
		marker.showInfoWindow();
		})
		}, (err) => {
		console.log(err);
		});
		}
  




	placeMarkers(){


		let savedSnapshot : any;
  	let myMarkers = this.af.database.ref('/markers').once('value').then(function(snapshot) {
  		savedSnapshot = snapshot;
  		var username = snapshot.val().username;
  		var marker = snapshot.val();

		console.log(marker);
		let position : LatLng;
		console.log(position);
		var latlng = marker.latLng.toString().split(/, ?/)
		console.log(parseFloat(latlng[0]), parseFloat(latlng[1]));
		position = marker.latLng;
		console.log(position);
		console.log(marker.latLng);

			let markerOptions : MarkerOptions = {
		    'position': position,
		    'icon':'blue',
		    'title': marker.title,
			'snippet': marker.description
		};

		console.log(markerOptions);
		this.map.addMarker(markerOptions).then(
			(marker: Marker) =>
				marker.addEventListener(GoogleMapsEvent.MARKER_CLICK).subscribe(
					(mark) => {
						marker.showInfoWindow();
					}
				)
		);


});


/*	this.database = firebase.database();
	this.database
		console.log('placeMarkers()');
		var ref = this.af.database.ref('/markers');
		// Attach an asynchronous callback to read the data at our posts reference
		ref.on("value", function(snapshot) {
		  console.log(snapshot.val());
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});

		ref.once("value", function(data) {
	  		console.log(data.exportVal())
	  		console.log(data.latLng);
		}, function (errorObject) {
		  console.log("The read failed: " + errorObject.code);
		});*/
/*  		this.markers = this.af.list('/markers');
  		this.markers.
		for (let marker in this.markers) {
			marker.
			let markeropts : MarkerOptions = marker;
			console.log(markeropts);
			console.log(marker);

		}*/


/*		  this.markers.forEach(
		  	marker => {
	            console.log(marker);
	            let position : LatLng;
	            console.log(position);
	            var latlng = marker.latLng.toString().split(/, ?/)
    			console.log(parseFloat(latlng[0]), parseFloat(latlng[1]));
	            position = marker.latLng;
	            console.log(position);
	            console.log(marker.latLng);

	          	let markerOptions : MarkerOptions = {
			        'position': position,
			        'icon':'blue',
			        'title': marker.title,
			    	'snippet': marker.description
			    };

			    console.log(markerOptions);
				this.map.addMarker(markerOptions).then(
					(marker: Marker) =>
						marker.addEventListener(GoogleMapsEvent.MARKER_CLICK).subscribe(
							(mark) => {
								marker.showInfoWindow();
							}
			    		)
			    );
			}
		);*/

	}
}

 
