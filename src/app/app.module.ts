import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { GooglePlus } from '@ionic-native/google-plus';


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { Login } from '../pages/login/login';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthProvider } from 'angularfire2/auth';
import { GoogleMaps }  from '@ionic-native/google-maps';
import { Facebook } from '@ionic-native/facebook'
import { MapsProvider } from '../providers/maps';
import { MarkersProvider } from '../providers/markers';
import { AuthProvider } from '../providers/auth';













// AF2 Settings
export const firebaseConfig = {
    apiKey: "AIzaSyBoAEdFJDszBlYxS9w8VW5QyZT8k0U52Mk",
    //authDomain: "friendsmarkers-5bff9.firebaseapp.com",
    databaseURL: "https://friendsmarkers-5bff9.firebaseio.com",
    projectId: "friendsmarkers-5bff9",
    storageBucket: "friendsmarkers-5bff9.appspot.com",
    messagingSenderId: "563992372693"
};



@NgModule({
  declarations: [
    MyApp,
    HomePage,
    Login,
    ListPage
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    Login,
    ListPage
    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFireAuthProvider,
    GoogleMaps,
    GooglePlus,
    Facebook,
    MarkersProvider,
    MapsProvider,
    AuthProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
