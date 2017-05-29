import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import firebase from 'firebase';
import { AuthProvider } from './auth';
import { HomePage } from '../pages/home/home';
import { MarkerOptions, Marker, LatLng } from '@ionic-native/google-maps';
import { MapsProvider } from './maps'
/*
  Generated class for the Markers provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class MarkersProvider {


	markers : any;
  public currentUser : any;
  public markersFromMap : any;
  public homePage : HomePage;

  constructor(public af : AngularFireDatabase,
    public authProvider : AuthProvider,
    public mapsProvider : MapsProvider ) {
    console.log('Hello Markers Provider');

    this.currentUser = authProvider.getCurrentUser();
    console.log('Markers Provider | Constructor ');
    console.log('Markers Provider | this.currentUser ', this.currentUser);








  }


getMarkersFromMap(mapSelectedUID, loader){
  MapsProvider.mapSaved.clear();
  MapsProvider.markersArray.length = 0;
  console.log('Markers Provider | getMarkersFromMap | mapSelectedUID', mapSelectedUID);
  let markersFromMap = this.af.database.ref('/maps/'+ mapSelectedUID + '/markers');
  loader.present();
  markersFromMap.once('value', marker => {
            let markers = marker.val();
            for (var key in markers) {
                var value = markers[key];
                console.log(value)
                if(value != null){
                  console.log('Markers Provider | Map ' + mapSelectedUID + ' | Marker ', value);
                  let position: LatLng = new LatLng(value.latLng.lat, value.latLng.lng);
                  let markerOptions : MarkerOptions = {
                    'position': position,
                    'icon':'blue',
                    'title': value.title,
                    'snippet': value.description
                  }
                  MapsProvider.mapSaved.addMarker(markerOptions)
                  .then((marker: Marker) => {
                    console.log('Markers Provider | getMarkersFromMap '+ mapSelectedUID + ' | MARKER ADDED!!', marker, markerOptions);
                    MapsProvider.markersArray.push(markerOptions);
                    marker.setVisible(true);
                  });   
              }
            }




 
  }).then(() => {
    loader.dismiss();
    console.log('MarkersProvider | getMarkersFromMap | MapsProvider.markersArray ', MapsProvider.markersArray);
  });

}





placeMarkersFromArray(){
  MapsProvider.mapSaved.clear();
  for(var key in MapsProvider.markersArray){
    var value = MapsProvider.markersArray[key];
    console.log('Markers Provider | placeMarkersFromArray | marker loop', value);
    if(value != null){
        MapsProvider.mapSaved.addMarker(value);
    }
  }
}



  addMarkerToMap(marker, mapClick, mapUID){
    console.log('Markers Provider | addMarkerToMap ')
    let latlng = mapClick.toString().split(/, ?/)
    let position: LatLng = new LatLng(latlng[0],latlng[1]);
    let markerOptions : MarkerOptions = {
      'position': position,
      'icon':'blue',
      'title': marker.title,
      'snippet': marker.description
    };

    let mapMarkers = this.af.database.ref('/maps/'+ mapUID + '/markers');
    mapMarkers.push({
      title: marker.title,
      description: marker.description,
      latLng: position
    }).then(() => {


       MapsProvider.mapSaved.addMarker(markerOptions)
        .then((marker: Marker) => {
          console.log('Markers Provider | getMarkersFromMap '+ mapUID + ' | MARKER ADDED!!', marker, markerOptions);
          marker.setVisible(true);
          marker.showInfoWindow();
        })
        .catch(error => {
          console.error('Error adding Marker!', error)
        }); 
        MapsProvider.markersArray.push(markerOptions);


    });


 







    






  }


}
