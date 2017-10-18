// default
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// add
import { App, MenuController, AlertController } from 'ionic-angular';

// firebase
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

// utils 
import { CommonUtil } from './../utils/commonUtil';

// providers
import { AuthService } from './../providers/auth-service/auth-service';

// models
import { PageInterface } from './../models/PageInterface';

// pages
import { SigninPage } from './../pages/signin/signin';
import { HomePage } from '../pages/home/home';
import { TabsPage } from './../pages/tabs/tabs';
import { CatListPage } from './../pages/cat/list/catList';
import { UserInfoPage } from './../pages/user/info/userInfo';

interface MenuTitleInterface {
  header: string;
  navigate: string;
  study: string;
  admin: string;
  account: string;
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  lastBack: any;

  pages: Array<{title: string, component: any}>;

  navigatePages: PageInterface[];
  studyPages: PageInterface[];
  accountPages: PageInterface[];
  menuTitle: MenuTitleInterface = {
    header: null,
    navigate: null,
    admin: null,
    study: null,
    account: null
  }

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,

    private app: App,
    private menuCtrl: MenuController,
    private alertCtrl: AlertController,

    private afAuth: AngularFireAuth,    // 제거 X
    private _auth: AuthService
  ) {
    this.subscribeAuth();
    this.initializeApp();
    CommonUtil.void();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      // this.splashScreen.hide();
      this.platform.registerBackButtonAction(() => this.exitApp());
      this.savePlatform();
    });
  }

  subscribeAuth() {
    firebase.auth().onAuthStateChanged(user => {
      this.initializeMenu(user);
    });
  }

  initializeMenu(auth) {
    
    this._auth.signinProcess(auth).then( () => {

      this.setPages();

      if(auth != null && this._auth.authenticated) {
        this.nav.setRoot(CatListPage, {activeName: "EwPage", key: "ew"});
      } else if(auth != null && !this._auth.authenticated) {
        this.nav.setRoot(UserInfoPage);
      } else {
        this.nav.setRoot(SigninPage);
      }
    }).catch(err => console.log(err));
  }

  setPages() {
    const homePage: PageInterface = { title: '대시보드', name: 'HomePage',  component: HomePage, icon: 'home' };
    const tabsPage: PageInterface = { title: 'Tabs', name: 'TabsPage', component: TabsPage, icon: 'home'};
    const ewPage: PageInterface = { title: '영단어', name: 'EwPage',  component: CatListPage, param: {activeName: "EwPage", key: "ew"}, icon: 'book' };
    const lwPage: PageInterface = { title: '외래어', name: 'LwPage',  component: CatListPage, param: {activeName: "LwPage", key: "lw"}, icon: 'book' };
    const ciPage: PageInterface = { title: '한자성어', name: 'CiPage',  component: CatListPage, param: {activeName: "CiPage", key: "ci"}, icon: 'book' };
    const ccPage: PageInterface = { title: '한자', name: 'CcPage',  component: CatListPage, param: {activeName: "CcPage", key: "cc"}, icon: 'book' };
    const userInfoPage: PageInterface = { title: '내 정보', name: 'UserInfoPage', component: UserInfoPage, icon: 'information-circle'};

    if(this._auth.authenticated){
      this.navigatePages = [];
      this.navigatePages.push(homePage);
      this.navigatePages.push(tabsPage);

      this.studyPages = [];
      this.studyPages.push(ewPage);
      this.studyPages.push(lwPage);
      this.studyPages.push(ciPage);
      this.studyPages.push(ccPage);
    }

    if(this._auth != null){
      this.accountPages = [];
      this.accountPages.push(userInfoPage);
    }

    this.menuTitle.header = "Menu";
    this.menuTitle.navigate = "Navigate";
    this.menuTitle.study = "Study";
    this.menuTitle.admin = "Navigate";
    this.menuTitle.account = "Account";
  }

  savePlatform() {
    
    let thisPlatform = null;

    if(this.platform.is('browser')) {
      thisPlatform = "browser";
    } else if (this.platform.is('core')) {
      thisPlatform = "core";
    } else if (this.platform.is('android')) {
      thisPlatform = "android";
    } else if (this.platform.is('ios')) {
      thisPlatform = "ios";
    }

    this._auth.platform = thisPlatform;
    console.log("MyApp - Current platform: " + thisPlatform);
  }

  private exitApp() {
    
    const overlay = this.app._appRoot._overlayPortal.getActive();
    const nav = this.app.getActiveNavs()[0];

    if(this.menuCtrl.isOpen()) {
      this.menuCtrl.close();
    }else if(overlay && overlay.dismiss) {
      overlay.dismiss();
    } else if(nav.getActive().name == "WordCardPage"){
      this.showConfirmAlert("목록으로 돌아가시겠습니까?", ()=> {
        nav.pop();  
      });
    } else if(nav.canGoBack()){
      nav.pop();
    } else if(Date.now() - this.lastBack < 500) {
      this.showConfirmAlert("EXIT?", () => {
        this.platform.exitApp();
      });
    }
    this.lastBack = Date.now();
  }

  openPage(page) {
    this.nav.setRoot(page.component, page.param);
  }

  isActive(page: PageInterface) {
    if (this.nav.getActive()) {
      if(this.nav.getActive().name === page.name) {
        return 'primary';
      } else if(this.nav.getActive().getNavParams().get("activeName") == page.name) {
        return 'primary';
      }
    }
    return;
  }

  showConfirmAlert(message: string, yesHandler) {
    let confirm = this.alertCtrl.create({
      message: message,
      buttons: [
        { text: 'No' },
        {
          text: 'Yes',
          handler: () => {
            yesHandler();
          }
        }
      ]
    });
    confirm.present();
  }

}
