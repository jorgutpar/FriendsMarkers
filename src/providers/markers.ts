import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from './auth';
import { HomePage } from '../pages/home/home';
import { MarkerOptions, Marker, LatLng, GoogleMapsEvent } from '@ionic-native/google-maps';
import { MapsProvider } from './maps'
import { ActionSheetController, LoadingController } from 'ionic-angular'

import { ColorPickerService } from 'angular2-color-picker';
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
    public mapsProvider : MapsProvider,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl : LoadingController,
    public cpService: ColorPickerService ) {
    console.log('Hello Markers Provider');

    this.currentUser = authProvider.getCurrentUser();
    console.log('Markers Provider | Constructor ');
    console.log('Markers Provider | this.currentUser ', this.currentUser);

  }




getMarkersFromMap(loader){
  MapsProvider.mapSaved.clear();
  MapsProvider.markersArray.length = 0;
  MapsProvider.mapSaved.setClickable(false)

  console.log('Markers Provider | getMarkersFromMap | mapSelectedUID', MapsProvider.mapUID);
  let markersFromMap = this.af.database.ref('/maps/'+ MapsProvider.mapUID + '/markers');
  loader.onWillDismiss(() => MapsProvider.mapSaved.setClickable(true));
  loader.onDidDismiss( () => MapsProvider.mapSaved.setClickable(true));
  console.log('loader.didEnter', loader.didEnter)
  markersFromMap.once('value', allMarkers => {   
    var markersArray = allMarkers.val()
    for (var key in markersArray) {
      var value = markersArray[key];
      console.log(value)
      if(value != null){
        console.log('Markers Provider | Map ' + MapsProvider.mapUID + ' | Marker ', value);
        let position: LatLng = new LatLng(value.latLng.lat, value.latLng.lng);
        let markerOptions : MarkerOptions = {
          'position': position,
          'icon':'blue',
          'title': value.title,
          'snippet': value.snippet
        }
        MapsProvider.mapSaved.addMarker(markerOptions)
        .then((marker: Marker) => {
          console.log('Markers Provider | getMarkersFromMap '+ MapsProvider.mapUID + ' | MARKER ADDED!!', marker, markerOptions);
          MapsProvider.markersArray.push(markerOptions);
          marker.setVisible(true);
          marker.set('key', key)
          this.addInfoListener(marker)
        });   
    }
  } 
  }).then(() => {
    loader.dismiss();
    console.log('MarkersProvider | getMarkersFromMap | MapsProvider.markersArray ', MapsProvider.markersArray);
  });

}


addInfoListener(marker : Marker){

  marker.on(GoogleMapsEvent.INFO_CLICK).subscribe(() => {
    let actionSheet = this.actionSheetCtrl.create({ title: marker.getTitle() });
    actionSheet.onWillDismiss(() => MapsProvider.mapSaved.setClickable(true));
    actionSheet.onDidDismiss( () => MapsProvider.mapSaved.setClickable(true));
    actionSheet.addButton({ text: 'Remove', icon: 'trash', role: 'destructive', handler: () => { this.removeMarker(marker.get('key')) }  })
    actionSheet.addButton({ text: 'Color', icon: 'color-palette', handler: () => { }  })
    actionSheet.addButton({ text: 'Edit', icon: 'create', handler: () => { }  })
    actionSheet.addButton({ text: 'Cancel', icon: 'close', role: 'cancel', handler: () => { }  })
    MapsProvider.mapSaved.setClickable(false)
    actionSheet.present();
  });

}

removeMarker(key){
  let markersFromMap = this.af.database.ref('/maps/'+ MapsProvider.mapUID + '/markers');
  let loader = this.loadingCtrl.create();
  loader.present();
  markersFromMap.child(key).remove( callback => {
    console.log("removeMarker " + key + " removed! ", callback);
  }).then( () => {
    this.getMarkersFromMap(loader);
  });
}

refreshMarkers(){
  MapsProvider.mapSaved.clear();
  MapsProvider.mapSaved.setClickable(false);
  MapsProvider.markersArray.length = 0;
  
  let markersFromMap = this.af.database.ref('/maps/'+ MapsProvider.mapUID + '/markers');
  let loader = this.loadingCtrl.create();
  loader.onWillDismiss(() => MapsProvider.mapSaved.setClickable(true));
  loader.onDidDismiss( () => MapsProvider.mapSaved.setClickable(true));
  loader.present();

  markersFromMap.once('value', allMarkers => {   
    var markersArray = allMarkers.val()
    for (var key in markersArray) {
      var value = markersArray[key];
      console.log(value)
        let position: LatLng = new LatLng(value.latLng.lat, value.latLng.lng);
        let markerOptions : MarkerOptions = {
          'position': position,
          'icon':'blue',
          'title': value.title,
          'snippet': value.snippet
        }
        MapsProvider.mapSaved.addMarker(markerOptions)
        .then((marker: Marker) => {
          MapsProvider.markersArray.push(markerOptions);
          marker.setVisible(true);
          marker.set('key', key)
          this.addInfoListener(marker)
        });   
    }
    loader.dismiss();
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



  addMarkerToMap(marker, mapClick){
    console.log('Markers Provider | addMarkerToMap ')
    let latlng = mapClick.toString().split(/, ?/)
    marker.snippet = "0 comments, 0 likes"
    let position: LatLng = new LatLng(latlng[0],latlng[1]);
    let markerOptions : MarkerOptions = {
      'position': position,
      'icon':'blue',
      'title': marker.title,
      'snippet': marker.snippet
    };

    let mapMarkers = this.af.database.ref('/maps/'+ MapsProvider.mapUID + '/markers');
    mapMarkers.push({
      title: marker.title,
      snippet: marker.snippet,
      latLng: position,
      owner: this.authProvider.currentUser.uid
    }).then( callback => {
      console.log('callback', callback)

       MapsProvider.mapSaved.addMarker(markerOptions)
        .then((marker: Marker) => {
          console.log('Markers Provider | getMarkersFromMap '+ MapsProvider.mapUID + ' | MARKER ADDED!!', marker, markerOptions);
          marker.setVisible(true);
          marker.showInfoWindow();
          marker.set('key', callback.key);
          this.addInfoListener(marker);
        })
        .catch(error => {
          console.error('Error adding Marker!', error)
        }); 
        MapsProvider.markersArray.push(markerOptions);



    });

  }


}
