import { Component } from '@angular/core';

// firebase
import * as firebase from 'firebase';

// providers
import { AuthService } from './../../../providers/auth-service/auth-service';

// models
import { User } from './../../../models/User';

// pages

@Component({
  selector: 'page-userInfo',
  templateUrl: 'userInfo.html',
})
export class UserInfoPage {

  userRef: any;
  user: User = new User();

  isFirst: boolean = true;
  preAuthState: boolean;

  constructor(
    private _auth: AuthService
  ) {
  }
  
  ionViewDidEnter() {
    this.initData();
  //   console.log('ionViewDidEnter UserInfoPage');
  }
  
  ionViewWillLeave() {
    this.userRef.off();
    // console.log('ionViewWillLeave UserInfoPage');
  }

  initData(): void {
    this.getUser();
  }

  getUser(): void {
    this.userRef = firebase.database().ref(`users/${this._auth.uid}`);
    this.userRef.on('value', snapshot => {
      this.user = snapshot.val();
      if(this.isFirst) {
        this.preAuthState = this.user.authenticated;
        this.isFirst = false;
      }

      if(this.preAuthState != this.user.authenticated) {
        window.location.reload();
      }
    });
  }

  signOut(): void {
    this._auth.signOut();
  }

}
