import { WordRefService } from './../../../providers/word-ref-service/word-ref-service';
import { Word } from './../../../models/Word';
import { Lecture } from './../../../models/Lecture';
import { Category } from './../../../models/Category';
import { Component } from '@angular/core';

import * as firebase from 'firebase';

import { Subject } from './../../../models/Subject';

@Component({
  selector: 'page-tab1',
  templateUrl: 'tab1.html'
})
export class Tab1Page {

  subs = [
    new Subject({key: "ew", name: '영단어', num: 1}), 
    new Subject({key: "lw", name: '외래어', num: 2})
  ];
  catSize = 2;
  lecSize = 2;
  wordSize = 5;

  gssLecSize = 100;
  gssWordSize = 80;

  constructor(
    private _wr: WordRefService
  ) {
  }

  createSubject() {
    this.subs.forEach(sub => {
      this._wr.getDirSubsRef().child(`${sub.key}`).set(sub);
    });
  }

  removeSubject() {
    this._wr.getDirSubsRef().remove();
  }

  async getSubjects(): Promise<Array<Subject>> {
    let result: Array<Subject> = new Array();

    await this._wr.getDirSubsRef().orderByChild('num').once('value', snapshot => {
      snapshot.forEach(subSnapshot => {
        result.push(subSnapshot.val());
        return false;
      });
    });

    return result;
  }

  async createCategory() {
    let subs = await this.getSubjects();

    subs.forEach(sub => {
      for(let i=1; i<=this.catSize; i++) {
        const ref = this._wr.getDirCatsRef(sub.key).push();
        ref.set(new Category({
          key: ref.key,
          name: `C${i}`,
          num: i
        }));
      }
    });
  }

  removeCategory() {
    this.getSubjects().then(subs => {
      subs.forEach(sub => {
        this._wr.getDirCatsRef(sub.key).remove();
      });
    });
  }

  async getCategories(subKey: string): Promise<Array<Category>> {
    let result: Array<Category> = new Array();

    await this._wr.getDirCatsRef(subKey).orderByChild('num').once('value', snapshot => {
      snapshot.forEach(subSnapshot => {
        result.push(subSnapshot.val());
        return false;
      });
    });

    return result;
  }

  async createLecture() {
    let subs = await this.getSubjects();
    for(let sub of subs) {
      let cats = await this.getCategories(sub.key);

      for(let cat of cats) {
        for(let i=1; i<=this.lecSize; i++) {
          const ref = this._wr.getDirLecsRef(sub.key, cat.key).push();
          ref.set(new Lecture({
            key: ref.key,
            name: `L${i}`,
            num: i
          }));
        }
      }
    }
  }

  removeLecture() {
    this.getSubjects().then(subs => {
      subs.forEach(sub => {
        this.getCategories(sub.key).then(cats => {
          cats.forEach(cat => {
            this._wr.getDirLecsRef(sub.key, cat.key).remove();
          });
        });
      });
    });
  }

  async getLectures(subKey: string, catKey: string ): Promise<Array<Lecture>> {
    let result: Array<Lecture> = new Array();

    await this._wr.getDirLecsRef(subKey, catKey).orderByChild('num').once('value', snapshot => {
      snapshot.forEach(subSnapshot => {
        result.push(subSnapshot.val());
        return false;
      });
    });

    return result;
  }

  async createWord() {
    let subs = await this.getSubjects();
    for(let sub of subs) {
      let cats = await this.getCategories(sub.key);

      for(let cat of cats) {
        let lecs = await this.getLectures(sub.key, cat.key);

        for(let lec of lecs) {
          for(let i=1; i<=this.wordSize; i++) {
            const ref = this._wr.getDirWordsRef(sub.key, cat.key, lec.key).push();
            ref.set(new Word({
              key: ref.key,
              head1: `W${i}-h1`,
              head2: `W${i}-h2`,
              body1: `W${i}-b1`,
              body2: `W${i}-b2`,
              num: i,
              subKey: sub.key,
              catKey: cat.key,
              catName: cat.name,
              lecKey: lec.key,
              lecName: lec.name
            })).then( () => {
              this._wr.getPathWordRef(sub.key, cat.key, lec.key, ref.key).set({
                ref: ref.path["pieces_"].join("/"),
                levels: {
                  true: true
                }
              });
            });
          }
        }
      }
    }
  }

  removeWord() {
    this.getSubjects().then(subs => {
      subs.forEach(sub => {
        this.getCategories(sub.key).then(cats => {
          cats.forEach(cat => {
            this.getLectures(sub.key, cat.key).then(lecs => {
              lecs.forEach(lec => {
                this._wr.getDirWordsRef(sub.key, cat.key, lec.key).once('value', snapshot => {
                  snapshot.forEach(wordSnapshot => {
                    wordSnapshot.ref.remove().then( () => {
                      this._wr.getPathWordRef(sub.key, cat.key, lec.key, wordSnapshot.key).remove();
                    })
                    return false;
                  });
                });
              });
            });
          });
        });
      });
    });
  }


  async createGss() {
    const sub = this.subs[0];
    const cat: Category = new Category({
      name: "경선식",
      num: 2
    });

    const newCatRef = this._wr.getDirCatsRef(sub.key).push();
    cat.key = newCatRef.key;
    await newCatRef.set(cat);

    for(let i=1; i<=this.gssLecSize; i++) {
      const newLecRef = this._wr.getDirLecsRef(sub.key, cat.key).push();
      const lec = new Lecture({
        key: newLecRef.key,
        name: (i<10 ? '0'+i : i).toString(),
        num: i
      });
      await newLecRef.set(lec);

      for(let i=1; i<=this.gssWordSize; i++) {
        const newWordRef = this._wr.getDirWordsRef(sub.key, cat.key, lec.key).push();
        const word = new Word({
          key: newWordRef.key,
          head1: `W${i}-h1`,
          head2: `W${i}-h2`,
          body1: `W${i}-b1`,
          body2: `W${i}-b2`,
          num: i,
          subKey: sub.key,
          catKey: cat.key,
          catName: cat.name,
          lecKey: lec.key,
          lecName: lec.name
        });
        newWordRef.set(word).then( () => {
          this._wr.getPathWordRef(sub.key, cat.key, lec.key, word.key).set({
            ref: newWordRef.path["pieces_"].join("/"),
            levels: {
              true: true
            }
          });
        });
      }
    }
  }

  async removeGss() {
    let sub = this.subs[0];
    let cat: Category;
    await this._wr.getDirCatsRef(sub.key).orderByChild("name").equalTo("경선식").once('value', snapshot => {
      snapshot.forEach(gss => {
        cat = gss.val();
        snapshot.ref.remove();
        return false;
      });
    });

    let lecs: Array<Lecture> = await this.getLectures(sub.key, cat.key);
    this._wr.getDirLecsRef(sub.key, cat.key).once('value', snapshot => {
      snapshot.forEach(lecSnapshot => {
        lecs.push(lecSnapshot.val())
        lecSnapshot.ref.remove();
        return false;
      });
    });

    for(let lec of lecs) {
      this._wr.getDirWordsRef(sub.key, cat.key, lec.key).once('value', snapshot => {
        snapshot.forEach(wordSnapshot => {
          wordSnapshot.ref.remove().then( () => {
            this._wr.getPathWordRef(sub.key, cat.key, lec.key, wordSnapshot.key).remove();
          });
          return false;
        });
      });
    }
  }

  createCnt() {
    for(let i=20; i<=100; i=i+10) {
      firebase.database().ref(`testSetting/count/${i}`).set({value: i});
    }
  }
  
}
