import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// providers
import { LoadingService } from './../../../providers/loading-service/loading-service';
import { WordRefService } from './../../../providers/word-ref-service/word-ref-service';
import { CommonUtil } from './../../../utils/commonUtil';

// models
import { Subject } from './../../../models/Subject';
import { Category } from './../../../models/Category';

// pages
import { LecListPage } from './../../lec/list/lecList';

@Component({
  selector: 'page-catList',
  templateUrl: 'catList.html',
})
export class CatListPage {

  subKey: string;
  sub: Subject;
  cats: Array<Category>;

  constructor(
    private navCtrl: NavController,
    private param: NavParams,
    private _loading: LoadingService,
    private _wr: WordRefService
  ) {
    this.initData();
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad CatListPage');
  }

  initData(): void {
    this.subKey = this.param.get(`key`);
    this.getSub();
  }

  getSub(): void {
    this._wr.getDirSubRef(this.subKey).once('value', snapshot => {
      this.sub = snapshot.val();
      this.getCats();
    });
  }

  getCats(): void {
    const loader = this._loading.getLoader(null, null);
    loader.present();

    this.cats = new Array();
    this._wr.getDirCatsRef(this.subKey).orderByChild("num").once('value', snapshot => {
      let cats: Array<Category> = new Array();

      snapshot.forEach(catSnapshot => {
        cats.push(catSnapshot.val());
        return false;
      });

      this.cats = cats;
    }).then( () => {
      loader.dismiss();
    })
    .catch(err => {
      loader.dismiss();
      console.log(err);
    });
  }

  clickCat(cat: Category): void {
    this.navCtrl.push(LecListPage, {
      activeName: CommonUtil.getActiveName(this.sub.key), sub: this.sub, cat: cat});
  }

}
