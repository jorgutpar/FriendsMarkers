import {Injectable} from '@angular/core';
import firebase from 'firebase';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { LoadingController } from 'ionic-angular';


  

@Injectable()
export class AuthProvider {

  public self : any = this;
  public loader : any;
  public currentUser : any;

  constructor(public facebook : Facebook,
              public loadingCtrl : LoadingController,
              public googlePlus: GooglePlus) {

    this.currentUser = firebase.auth().currentUser;

  }



loginUser(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}


signupUser(email: string, password: string) {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then( newUser => {
        firebase.database().ref('/userProfile').child(newUser.uid)
        .set({ email: email });
  });
}


resetPassword(email: string) {
  return firebase.auth().sendPasswordResetEmail(email);
}


logoutUser() {
  return firebase.auth().signOut();
}



getCurrentUser(){
  return this.currentUser;
}

googleLogin(loader) {
  loader.present();
  this.googlePlus.login({
    'webClientId': '563992372693-9nshfv0ej44nm6guoqur7rks56ctop3d.apps.googleusercontent.com',
    'offline': true
  }).then( res => {
    firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
      .then( success  => {
        console.log("AuthProvider | Google Login | Firebase success: ", success);
        this.currentUser = success;
        loader.dismiss();
        return success;
      })
      .catch(err => console.log("AuthProvider | Google Login | Firebase failure: " + JSON.stringify(err)));
    }).catch(err => console.log("AuthProvider | Google Login | Google Plus failure: : ", err));
}


facebookLogin(){
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



}