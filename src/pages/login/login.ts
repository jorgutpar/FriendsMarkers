import { Component, NgZone } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { MapsProvider } from '../../providers/maps';
import firebase from 'firebase';
import { FirebaseListObservable, AngularFireDatabase } from 'angularfire2/database';
import { ListPage } from '../list/list';
import { MarkersProvider } from '../../providers/markers';
import { AuthProvider } from '../../providers/auth';


class Map {
    public key : any;
    public name: any;
    public description: any;
    public owner: any;
    public password: any;
    public users: any[] = [];
}

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  public userProfile: any = null;
  public zone: NgZone;
  public options : any = [ 'myMaps', 'myMarkers'];
  mapsService: FirebaseListObservable<any>;

  constructor(public navController : NavController,
              public afAuth: AngularFireAuth,
              public googlePlus : GooglePlus,
              public facebook : Facebook,
              public af : AngularFireDatabase, 
              public markersProvider : MarkersProvider,
              public maps : MapsProvider,
              public authProvider : AuthProvider,
              public loadingCtrl : LoadingController) {
    this.zone = new NgZone({});
    firebase.auth().onAuthStateChanged( user => {
      this.userProfile = null;
      this.zone.run( () => {
        if(user){
          this.userProfile = authProvider.getCurrentUser();
        } else {
          this.userProfile = null;
        }
      });
    });
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

ionViewDidLoad(){ 
  console.log("userProfile");  
  console.log(this.userProfile);
}


showMyMaps(){

  this.navController.push(ListPage, {option: 'listMaps'});
}
showMyMarkers(){

}



initProfile(){
  let user = firebase.auth().currentUser;
  let profile = this.af.database.ref('/users/');
  profile.child(this.userProfile.uid).set({
    name: user.displayName,
    email: user.email,
    photoUrl: user.photoURL,
    uid: user.uid
  });
}

insertMapFromUser(){
  
  //this.initProfile();

  let maps = this.af.database.ref('/maps/');
  let myMaps = this.af.database.ref('/users/'+this.userProfile.uid+'/maps');
  

  maps.push({
      name: 'Mapa para mis amigos',
      description: "Es la hostia",
      owner: this.userProfile.email,
      password: false
  }).catch(error => {
      console.log("Error adding new map on user ", error);
  });

  // Map added

  maps.on('child_added', snapshot =>{
    this.addMapToUser(snapshot);
  })

}


addMapToUser(snapshot){
  let userMaps = this.af.database.ref('/users/'+this.userProfile.uid+'/maps');
  let mapsUsers = this.af.database.ref('/maps/'+snapshot.key+'/users');
  mapsUsers.child(this.userProfile.uid).set(true);
  userMaps.child(snapshot.key).set(true);
}



/*  myMaps.on('child_added', snapshot => {
    console.log('New child_added to maps | Snapshot --> ', snapshot);
    console.log('Snapshot.val() -->', snapshot.val());

  });*/

/*  maps2.child(''+this.userProfile.uid).push({
      name: 'Mapa para mis amigos',
      description: "Es la hostia",
      owner: this.userProfile.email,
      password: false
  }).catch(error => {
      console.log("Error adding new map on user ", error);
  });*/
/*  maps.push({ 
      name: 'Mapa para mis amigos',
      description: "Es la hostia",
      owner: this.userProfile.email,
      password: false
  }).catch(error => {
      console.log("Error adding new map on user ", error);
  });*/



////// LISTENERS  /////////////

  // child_added //
/*  myMaps.on('child_added', snapshot => {
    console.log('New child_added to maps | Snapshot --> ', snapshot);
    console.log('Snapshot.val() -->', snapshot.val());
*/
/*    this.mapsService.push({  
      name: snapshot.val().name,
      description: snapshot.val().description,
      owner: this.userProfile.email
    }).catch(error => {
        console.log("Error inserting new map", error);
    });*/
  /*});
*/


loadMyMaps(){
  let myMaps = this.af.database.ref('/users/'+this.userProfile.uid+'/maps');
  var key = myMaps.push().key;
  var self = this;
  myMaps.push({  
      name: 'Mapa para mis amigos',
      description: "Es la hostia",
      owner: this.userProfile.email
    }).key;
////// LISTENERS  /////////////

  // child_added //
  myMaps.on('child_added', snapshot => {
    console.log('New child_added to maps | Snapshot --> ', snapshot);
    console.log('Snapshot.val() -->', snapshot.val());
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


loginGoogle() {
  var loader = this.loadingCtrl.create({
      content: "Loggin user ... please wait."
    });
  this.userProfile = this.authProvider.googleLogin(loader);
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



isUserLogged(){
  return this.userProfile!=null;
}

}
