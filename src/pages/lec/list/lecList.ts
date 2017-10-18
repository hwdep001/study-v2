import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

// providers
import { LoadingService } from './../../../providers/loading-service/loading-service';
import { WordRefService } from './../../../providers/word-ref-service/word-ref-service';
import { CommonUtil } from './../../../utils/commonUtil';

// models
import { Subject } from './../../../models/Subject';
import { Category } from './../../../models/Category';
import { Lecture } from './../../../models/Lecture';

// pages
import { LecTestPage } from './../test/lecTest';
import { WordCardPage } from './../../word/card/wordCard';

@Component({
  selector: 'page-lecList',
  templateUrl: 'lecList.html',
})
export class LecListPage {

  sub: Subject;
  cat: Category
  lecs: Array<Lecture>;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private param: NavParams,
    private _loading: LoadingService,
    private _wr: WordRefService
  ) {
    this.initData();
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad LecListPage');
  }

  initData(): void {
    this.sub = this.param.get(`sub`);
    this.cat = this.param.get(`cat`);

    this.getLecs();
  }

  getLecs(): void {
    const loader = this._loading.getLoader(null, null);
    loader.present();

    this._wr.getDirLecsRef(this.sub.key, this.cat.key).orderByChild("num").once('value', snapshot => {
      let lecs: Array<Lecture> = new Array();
      
      snapshot.forEach(lecSnapshot => {
        lecs.push(lecSnapshot.val());
        return false;
      });

      this.lecs = lecs;
    }).then( () => {
      loader.dismiss();
    }).catch(err => {
      loader.dismiss();
      console.log(err);
    });
  }

  clickLec(lec: Lecture): void {
    let wordRefs: Array<string> = new Array();

    this._wr.getDirWordsRef(this.sub.key,this.cat.key, lec.key).orderByChild("num").once('value', snapshot => {
      snapshot.forEach( wordSnapshot => {
        wordRefs.push(wordSnapshot.ref.path['pieces_'].join("/"));
        return false;
      });
    }).then( () => {

      if(wordRefs.length < 1) {
        this.showToast("top", "단어가 없습니다.");
      } else {
        this.navCtrl.push(WordCardPage, {
          activeName: CommonUtil.getActiveName(this.sub.key), wordRefs: wordRefs});
      }

    });
  }

  moveLecTestPage(): void {
    this.navCtrl.push(LecTestPage, {
      activeName: CommonUtil.getActiveName(this.sub.key), sub: this.sub, cat: this.cat});
  }

  private showToast(position: string, message: string, duration?: number) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: (duration == null) ? 2500 : duration
    });

    toast.present(toast);
  }
  
}