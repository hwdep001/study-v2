import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

// providers
import { LoadingService } from './../../../providers/loading-service/loading-service';
import { AuthService } from './../../../providers/auth-service/auth-service';
import { WordRefService } from './../../../providers/word-ref-service/word-ref-service';
import { CommonUtil } from './../../../utils/commonUtil';

// models
import { NameValue } from './../../../models/NameValue';
import { Subject } from './../../../models/Subject';
import { Category } from './../../../models/Category';
import { Lecture } from './../../../models/Lecture';
import { WordRef } from './../../../models/WordRef';

// pages
import { WordCardPage } from './../../word/card/wordCard';

@Component({
  selector: 'page-lecTest',
  templateUrl: 'lecTest.html',
})
export class LecTestPage {

  sub: Subject;
  cat: Category;
  lecs: Array<Lecture>;

  lecRange: any = { lower: 1, upper: 1 };

  selectTestType: number;
  selectTestLvs: Array<number>;
  selectTestCnt: number;
  selectLecType: number = 0;  // 0: Checkbox, 1: Range

  testTypes: Array<NameValue>;
  testLvs: Array<NameValue>;
  testCnts: Array<any>;
  
  isStartBtn: boolean = false;

  // checkbox
  cbA: boolean = false;
  cbs: Array<boolean>;

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private param: NavParams,
    private _loading: LoadingService,
    private _auth: AuthService,
    private _wr: WordRefService
  ) {
    this.initData();
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad LecTestPage');
  }

  initData() {
    this.sub = this.param.get(`sub`);
    this.cat = this.param.get(`cat`);

    this.getLecs();
    this.getTestType();
    this.getTestLv();
    this.getTestCnt();
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
      this.initCheckbox(false);
      this.lecRange = { lower: 1, upper: this.lecs.length };
    }).then( () => {
      loader.dismiss();
    }).catch(err => {
      loader.dismiss();
      console.log(err);
    });
  }
  
  initCheckbox(bl: boolean) {
    this.cbA = bl;
    this.isStartBtn = bl;

    this.cbs = new Array<boolean>();
    for(let i=0; i< this.lecs.length; i++) {
      this.cbs.push(bl);
    }
  }

  checkCb(cb: boolean) {
    if(!cb) {
      this.cbA = false;
    } else {
      let result: boolean = true;
      this.cbs.every( (ele, index) => {
        if(!ele) {
          this.cbA = false;
          result = false;
        }
        return ele;
      });
      if(result) {this.cbA = true;}
    }
  }

  checkStartBtn() {
    if(this.selectTestLvs.length == 0) {
      this.isStartBtn = false;
      return;
    }

    if(this.selectLecType == 0) {
      let isExistTrue: boolean = false;
      this.cbs.every( (ele, index) => {
        if(ele) {
          isExistTrue = true;
        }
        return !ele;
      });
      if(!isExistTrue) {
        this.isStartBtn = false;
        return;
      }
    }

    this.isStartBtn = true;
  }

  getTestType() {
    this.testTypes = this._wr.getType();
    this.selectTestType = this.testTypes[0].value;
  }

  getTestLv() {
    this.selectTestLvs = new Array<number>();
    this.testLvs = this._wr.getLevel();
    this.testLvs.forEach(lv => {
      this.selectTestLvs.push(lv.value);
    })
  }

  getTestCnt() {
    this.testCnts = new Array<any>();
    this._wr.getCountRef().once('value', snapshot => {
      snapshot.forEach( cntSnapshot => {
        this.testCnts.push(cntSnapshot.val());
        return false;
      });
      this.selectTestCnt = this.testCnts[0].value;
    });
  }

  async startTest() {
    let st = new Date().getTime();
    console.log("----------------------------------");
    console.log("type : " + this.selectTestType);
    console.log("level: " + this.selectTestLvs);
    console.log("count: " + this.selectTestCnt);

    let wordRefs: Array<string> = new Array();
    let selectedLecs: Array<string> = new Array();
    const uid: string = this._auth.uid;

    let selectTestLvs_: Array<number> = new Array();
    this.selectTestLvs.forEach(lv => {
      selectTestLvs_.push(parseInt(lv.toString()));
    });

    if(this.selectLecType == 0) {
      // checkbox
      for(let i=0; i<this.cbs.length; i++) {
        if(this.cbs[i]) {
          selectedLecs.push(this.lecs[i].key);
        }
      }
    } else {
      // range
      for(let i=this.lecRange.lower; i<=this.lecRange.upper; i++) {
        selectedLecs.push(this.lecs[i-1].key);
      }
    }
    console.log("lecs length: " + selectedLecs.length);

    let promises: Array<any> = new Array();

    // lec 전체 선택했을 경우
    if(this.lecs.length == selectedLecs.length) {

      promises.push(this._wr.getPathCatRef(this.sub.key, this.cat.key).once('value', snapshot => {
        console.log("lec 전체");
        let refsInCat = snapshot.val();
        selectedLecs.forEach(lecKey => {
          for(let word in refsInCat[lecKey]) {
            const lv = (refsInCat[lecKey][word].levels[uid] == undefined) ? 0 : refsInCat[lecKey][word].levels[uid];
            if(selectTestLvs_.indexOf(lv) > -1) {
              wordRefs.push(refsInCat[lecKey][word].ref);
            }
          }
        });
      }));
    } 

    // lec 일부 선택했을 경우
    else {
      for(let lecKey of selectedLecs) {
        promises.push(this._wr.getPathLecRef(this.sub.key, this.cat.key, lecKey).once('value', snapshot => {
          console.log("lec 일부");
          snapshot.forEach(wordRefSnapshot => {
            const wordRef: WordRef = wordRefSnapshot.val();
            const lv: number = wordRef.levels[uid] == undefined ? 0 : wordRef.levels[uid];
  
            if(selectTestLvs_.indexOf(lv) > -1) {
              wordRefs.push(wordRef.ref);
            }
            return false;
          });
        }));
      }
    }


    Promise.all(promises).then(as => {
      console.log("wordRefs length: " + wordRefs.length);
      
      [0,1,3].forEach(i => {
        wordRefs.shuffleArray();
      });

      const searchSize: number = this.selectTestCnt > wordRefs.length ? wordRefs.length : this.selectTestCnt;
      wordRefs.splice(searchSize);
  
      console.log("wordRefs length: " + wordRefs.length);

      console.log("succ: " + wordRefs.length);
      console.log("time : " + CommonUtil.msToHH_mm_ss(new Date().getTime()-st));
      console.log("----------------------------------");

      if(wordRefs.length < 1) {
        this.showToast("top", "조건에 맞는 단어가 없습니다.");
      } else {
        this.navCtrl.push(WordCardPage, {
          activeName: CommonUtil.getActiveName(this.sub.key), wordRefs: wordRefs});
      }

    }).catch(err => {
      console.log("err: " + err);
    });
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