import { Injectable } from '@angular/core';

// firebase
import * as firebase from 'firebase';

// models
import { User } from './../../models/User';

@Injectable()
export class AuthService {

  userRef: firebase.database.Reference;
  user: User;
  platform: string;

  constructor(
  ) {
    this.userRef = firebase.database().ref("/users");
    this.user = new User();
  }

  get uid(): string {
    return this.isSignedIn ? this.user.uid : null;
  }

  get email(): string {
    return this.isSignedIn ? this.user.email : null;
  }

  get name(): string {
    return this.isSignedIn ? this.user.name : null;
  }

  get photoURL(): string {
    return this.isSignedIn ? this.user.photoURL : null;
  }

  get createDate(): string {
    return this.isSignedIn ? this.user.createDate : null;
  }

  get lastSigninDate(): string {
    return this.isSignedIn ? this.user.lastSigninDate : null;
  }

  get isSignedIn(): boolean {
    return this.user == null ? false : true;
  }

  get min(): boolean {
    return this.isSignedIn ? this.user.ad : false;
  }

  get authenticated(): boolean {
    return this.isSignedIn ? this.user.authenticated : false;
  }

  // // Returns
  // get currentUserObservable(): any {
  //   return this.afAuth.authState
  // }

  // // Returns current user data
  // get currentUser(): any {
  //   return this.isSignedIn ? this.user : null;
  // }

  // // Anonymous User
  // get currentUserAnonymous(): boolean {
  //   return this.isSignedIn ? this.afAuth.auth.currentUser.isAnonymous : false
  // }

  // // Returns current user display name or Guest
  // get currentUserDisplayName(): string {
  //   if (!this.user) { return 'Guest' }
  //   else if (this.currentUserAnonymous) { return 'Anonymous' }
  //   else { return this.user['name'] || 'User without a Name' }
  // }


  //// Social Auth ////

  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return this.socialSignIn(provider);
  }

  async socialSignIn(provider) {
    switch(this.platform) {
      case 'browser':
      case 'core':
        return firebase.auth().signInWithPopup(provider);
      case 'android':
      case 'ios':
      default:
        return firebase.auth().signInWithRedirect(provider); 
    }
  }


  //// Sign Out ////

  signOut() {
    this.user = null;
    return firebase.auth().signOut();
  }


  //// Helpers ////

  signinProcess(currentUser: firebase.User): Promise<any> {
    
    // state: signed Out
    if(!currentUser) {
      this.user = null;
      return new Promise( (resolve) => {resolve()});
    }

    const currentDate = new Date().yyyy_MM_dd_HH_mm_ss();
    
    let user: User;
    let getUserPromise = this.getUser(currentUser.uid);
    return getUserPromise.then(snapshot => {
      user = snapshot.val();

      // create user info
      if(user == null) {
        user = new User({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createDate: currentDate,
          lastSigninDate: currentDate,
          authenticated: false
        });
  
        this.setUser(user);
  
      // update user info
      } else if(user) {
        user.email = currentUser.email;
        user.name = currentUser.displayName;
        user.photoURL = currentUser.photoURL;
        user.lastSigninDate = currentDate;
  
        this.saveUser(user);
      }
      this.user = user;
    });
  }

  private getUser(uid: string): Promise<any> {
    return this.userRef.child(uid).once('value');
  }

  private setUser(user: User): Promise<any> {
    return this.userRef.child(`${user.uid}`).set(user);
  }

  private saveUser(user: User): Promise<any> {
    return this.userRef.child(`${user.uid}`).update(user);
  }

}
