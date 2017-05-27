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
  console.log('Markers Provider | getMarkersFromMap | mapSelectedUID', mapSelectedUID);
  let markersFromMap = this.af.database.ref('/maps/'+ mapSelectedUID + '/markers');
  loader.present();
  markersFromMap.once('value', marker => {
            console.log('MarkersProvider | getPublicMarkers | marker --> ', marker);
            console.log('MarkersProvider | getPublicMarkers | marker.val() --> ', marker.val());
            let markers = marker.val();
            for (var key in markers) {
                var value = markers[key];
                console.log(value)
                if(value != null){
                console.log('Markers Provider | Map ' + mapSelectedUID + ' | Marker ', value);



                  let latlng = value.latLng.toString().split(/, ?/)
                  let position: LatLng = new LatLng(latlng[0],latlng[1]);
                  let markerOptions : MarkerOptions = {
                    'position': position,
                    'icon':'blue',
                    'title': value.title,
                    'snippet': value.description
                  }
                  MapsProvider.mapSaved.addMarker(markerOptions).then((marker: Marker) => {
                  MapsProvider.markersArray.push(marker);
                    marker.setVisible(true);
                  });   

              }



            }




 
  }).then(() => {
    loader.dismiss();
    console.log('MarkersProvider | getMarkersFromMap | MapsProvider.markersArray ', MapsProvider.markersArray);
  });

}









  addMarkerToMap(marker, latLng, mapUID){
     console.log('Markers Provider | addMarkerToMap ')
    if(mapUID == 'public'){
      let publicMarkers = this.af.database.ref('/maps/public/markers');
      publicMarkers.push({
        title: marker.title,
        description: marker.description,
        latLng: latLng
      })
    }else{
      let mapMarkers = this.af.database.ref('/maps/'+ mapUID + '/markers');
      mapMarkers.push({
        title: marker.title,
        description: marker.description,
        latLng: latLng
      });
    }

    let markerOptions : MarkerOptions = {
      'position': latLng,
      'icon':'blue',
      'title': marker.title,
      'snippet': marker.description
    };
    MapsProvider.mapSaved.addMarker(markerOptions).then((marker: Marker) => {
      MapsProvider.markersArray.push(marker);
      marker.setVisible(true);
      marker.showInfoWindow();
    })
  }


}
