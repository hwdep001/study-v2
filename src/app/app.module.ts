
// default
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';

// environments
import { environment } from './../environments/environment';

// pages
import { MyApp } from './app.component';
import { SigninPage } from './../pages/signin/signin';
import { HomePage } from '../pages/home/home';
import { TabsPage } from './../pages/tabs/tabs';
  import { Tab1Page } from './../pages/tabs/tab1/tab1';
import { CatListPage } from './../pages/cat/list/catList';
import { LecListPage } from './../pages/lec/list/lecList';
import { LecTestPage } from './../pages/lec/test/lecTest';
import { WordCardPage } from './../pages/word/card/wordCard';
import { UserInfoPage } from './../pages/user/info/userInfo';

// providers
import { AuthService } from '../providers/auth-service/auth-service';
import { LoadingService } from '../providers/loading-service/loading-service';
import { WordRefService } from '../providers/word-ref-service/word-ref-service';

@NgModule({
  declarations: [
    MyApp,
    SigninPage,
    HomePage,
    TabsPage,
      Tab1Page,
    CatListPage,
    LecListPage,
    LecTestPage,
    WordCardPage,
    UserInfoPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {tabsPlacement: 'top'}),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    SigninPage,
    HomePage,
    TabsPage,
      Tab1Page,
    CatListPage,
    LecListPage,
    LecTestPage,
    WordCardPage,
    UserInfoPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService,
    LoadingService,
    WordRefService
  ]
})
export class AppModule {}
