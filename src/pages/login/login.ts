import { Component, NgZone } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Maps } from '../../providers/maps';
import { Markers } from '../../providers/markers';
import firebase from 'firebase';




@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  public userProfile: any = null;
  public zone: NgZone;
  public options : any = [ 'myMaps', 'myMarkers'];
  constructor(public afAuth: AngularFireAuth,
              public googlePlus : GooglePlus,
              public facebook : Facebook,
              public markers : Markers,
              public maps : Maps) {
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
  }


loginFacebook(){
  this.facebook.login(['public_profile', 'user_friends', 'email'])
    .then((res: FacebookLoginResponse) => {
      console.log('Logged into Facebook!', res)
      firebase.auth().signInWithCredential(firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken))
        .then( success => {
        console.log("Firebase success: " + JSON.stringify(success));
      }).catch( error => console.log("Firebase failure: " + JSON.stringify(error)));
   }).catch(e => {
       console.log('Error logging into Facebook', e)
    });


}

ionViewDidLoad(){ 
  console.log("userProfile");  
  console.log(this.userProfile);
  this.maps.load();

}


loginGoogle() {
  this.googlePlus.login({
    'webClientId': '563992372693-9nshfv0ej44nm6guoqur7rks56ctop3d.apps.googleusercontent.com',
    'offline': true
  }).then( res => {
    firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
      .then( success => {
        console.log("Firebase success: " + JSON.stringify(success));
      })
      .catch( error => console.log("Firebase failure: " + JSON.stringify(error)));
    }).catch(err => console.error("Error: ", err));
}


logout(){
  this.googlePlus.logout().then( signout => {
    console.log("Google Plus signOut")
    console.log(signout);
  }).catch( error => {
    console.log("Google Plus ERROR Sign Out")
    console.log(error);
  });


  firebase.auth().signOut().then( signout => {
    console.log("Firebase signOut")
    console.log(signout);
  }).catch( error => {
    console.log("Firebase ERROR signOut")
    console.log(error);
  });
}


showMyMaps(){
  
}
showMyMarkers(){

}


optionSelected(item){
  console.log("Item selected: ", item);
  switch(item) { 
   case "mymaps": { 
      this.showMyMaps();
      break; 
   } 
   case "mymarkers": { 
      this.showMyMarkers();
      break; 
   } 
  } 
}

isUserLogged(){
  return this.userProfile!=null;
}

}
