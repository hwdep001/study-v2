import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

// firebase
import * as firebase from 'firebase';

// providers
import { LoadingService } from './../../../providers/loading-service/loading-service';
import { AuthService } from './../../../providers/auth-service/auth-service';
import { WordRefService } from './../../../providers/word-ref-service/word-ref-service';

// models
import { Word } from './../../../models/Word';

@Component({
  selector: 'page-wordCard',
  templateUrl: 'wordCard.html',
})
export class WordCardPage {

  lvRef: firebase.database.Reference;

  wordRefs: Array<string>;
  curWord: Word = new Word();

  bodyFlag: boolean = false;

  constructor(
    private param: NavParams,
    private _loading: LoadingService,
    private _auth: AuthService,
    private _wr: WordRefService
  ) {
    this.initData();
  }
  
  ionViewDidLoad() {
    // console.log('==> ionViewDidLoad WordCardPage');
  }

  initData() {
    let loading = this._loading.getLoader(null, null);
    loading.present();
    
    this.wordRefs = this.param.get("wordRefs");
    this.setCurWord(0);

    loading.dismiss();
  }

  setCurWord(index: number) {
    this._wr.getDirWordRefByPath(this.wordRefs[index]).once('value', snapshot => {

      this.curWord = new Word(snapshot.val());
      this.curWord.num = index + 1;

      this.lvRef = this._wr.getPathWordLevelsRef(this.curWord.subKey
          , this.curWord.catKey, this.curWord.lecKey, this.curWord.key);
      this.lvRef.child(this._auth.uid).once('value', snapshot => {
        this.curWord.level = snapshot.val() == undefined ? 0 : snapshot.val();
      });
    });
  }

  prevWord(index: number) {
    this.bodyFlag = false;
    if( (index-1) > 0 ) {
      this.setCurWord(index-1-1);
    } else {
      this.setCurWord(this.wordRefs.length-1);
    }
  }

  nextWord(index: number) {
    this.bodyFlag = false;
    if( (index+1) <= this.wordRefs.length ) {
      this.setCurWord(index);
    } else {
      this.setCurWord(0);
    }
  }

  clickThumbs(thumbCode: number) {
    const level: number = thumbCode + (this.curWord.level == undefined ? 0 : this.curWord.level);

    if(level > 2 || level < -2){
      return;
    } else if(level == 0) {
      this.lvRef.child(this._auth.uid).remove().then( () => this.curWord.level = level);
    } else {
      this.lvRef.update({
        [this._auth.uid]: level
      }).then( () => this.curWord.level = level);
    }
  }

}