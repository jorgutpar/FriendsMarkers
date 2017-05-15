import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { GooglePlus } from '@ionic-native/google-plus';

/**
 * Generated class for the Login page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class Login {

  public user: Observable<firebase.User>;
  public data : any;
  constructor(public afAuth: AngularFireAuth,
  	public googlePlus : GooglePlus) {
    this.user = afAuth.authState;

  }

  login() {
    console.log("this.user");
    console.log(this.user);
    this.googlePlus.login({})
      .then(res => {
        //User Authenticated
        console.log("res");
        this.data=res;
        console.log(res);
      })
      .catch(err => console.error(err));
  }

  logout() {
    this.googlePlus.logout();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Login');
    this.login();
  }

}
