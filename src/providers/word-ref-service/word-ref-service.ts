import { Injectable } from '@angular/core';

// firebase
import * as firebase from 'firebase';

// pages
import { NameValue } from './../../models/NameValue';

@Injectable()
export class WordRefService {

  private dirRef: firebase.database.Reference;
  private dirSubRef: firebase.database.Reference;
  private dirCatRef: firebase.database.Reference;
  private dirLecRef: firebase.database.Reference;
  private dirWordRef: firebase.database.Reference;

  private pathRef: firebase.database.Reference;

  private tsRef: firebase.database.Reference;

  constructor(
  ) {
    this.dirRef = firebase.database().ref("word/dir");
    this.dirSubRef = this.dirRef.child("subs");
    this.dirCatRef = this.dirRef.child("cats");
    this.dirLecRef = this.dirRef.child("lecs");
    this.dirWordRef = this.dirRef.child("words");

    this.pathRef = firebase.database().ref("word/path");

    this.tsRef = firebase.database().ref("testSetting");
  }



  //////////////////////////////////////////
  // DIR
  // word/dir
  //////////////////////////////////////////

  /**
   * word/dir/subs
   */
  getDirSubsRef(): firebase.database.Reference {
    return this.dirSubRef;
  }

  /**
   * word/dir/subs/{subKey}
   * @param subKey subjec key
   */
  getDirSubRef(subKey: string): firebase.database.Reference {
    return this.dirSubRef.child(subKey);
  }

  /**
   * word/dir/cats/{subKey}
   * @param subKey subejct key
   */
  getDirCatsRef(subKey: string): firebase.database.Reference {
    return this.dirCatRef.child(subKey);
  }

  // getDirCatRef(subKey: string, catKey: string): firebase.database.Reference {
  //   return this.dirCatRef.child(`${subKey}/${catKey}`);
  // }

  /**
   * word/dir/lecs/{subKey}/{catKey}
   * @param subKey subject key
   * @param catKey category key
   */
  getDirLecsRef(subKey: string, catKey: string): firebase.database.Reference {
    return this.dirLecRef.child(`${subKey}/${catKey}`);
  }

  // getDirLecRef(subKey: string, catKey: string, lecKey: string): firebase.database.Reference {
  // }

  /**
   * word/dir/words/{subKey}/{catKey}/{lecKey}
   * @param subKey subject key
   * @param catKey category key
   * @param lecKey lecture key
   */
  getDirWordsRef(subKey: string, catKey: string, lecKey: string): firebase.database.Reference {
    return this.dirWordRef.child(`${subKey}/${catKey}/${lecKey}`);
  }

  // getDirWordRef(subKey: string, catKey: string, lecKey: string, wordKey: string): firebase.database.Reference {
  // }

  /**
   * /{path}
   * @param path path
   */
  getDirWordRefByPath(path: string): firebase.database.Reference {
    return firebase.database().ref(path);
  }



  //////////////////////////////////////////
  // PATH
  // word/path
  //////////////////////////////////////////

  /**
   * word/path/{subKey}/{catKey}
   * @param subKey subject key
   * @param catKey category key
   */
  getPathCatRef(subKey: string, catKey: string): firebase.database.Reference {
      return this.pathRef.child(`${subKey}/${catKey}`);
  }

  /**
   * word/path/{subKey}/{catKey}/{lecKey}
   * @param subKey subject key
   * @param catKey category key
   * @param lecKey lecture key
   */
  getPathLecRef(subKey: string, catKey: string, lecKey: string): firebase.database.Reference {
    return this.pathRef.child(`${subKey}/${catKey}/${lecKey}`);
  }

  /**
   * word/path/{subKey}/{catKey}/{lecKey}/{wordKey}
   * @param subKey subject key
   * @param catKey category key
   * @param lecKey lecture key
   * @param wordKey word key
   */
  getPathWordRef(subKey: string, catKey: string, lecKey: string, wordKey: string): firebase.database.Reference {
    return this.pathRef.child(`${subKey}/${catKey}/${lecKey}/${wordKey}`);
  }

  /**
   * word/path/{subKey}/{catKey}/{lecKey}/{wordKey}/levels
   * @param subKey subject key
   * @param catKey category key
   * @param lecKey lecture key
   * @param wordKey word key
   */
  getPathWordLevelsRef(subKey: string, catKey: string, lecKey: string, wordKey: string): firebase.database.Reference {
    return this.pathRef.child(`${subKey}/${catKey}/${lecKey}/${wordKey}/levels`);
  }



  //////////////////////////////////////////
  // PATH
  // word/path
  //////////////////////////////////////////

  getType(): Array<NameValue> {
    return new Array<NameValue>(
      { name: "카드", value: 0},
      // { name: "객관식", value: 1},
    );;
  }

  getLevel(): Array<NameValue> {
    return new Array<NameValue>(
      { name: "Very easy", value: 2},
      { name: "Easy", value: 1},
      { name: "Normal", value: 0},
      { name: "Difficult", value: -1},
      { name: "Very Difficult", value: -2},
    );;
  }

  setCount(startNum: number, endNum: number, increaseNum: number): Promise<void> {
    return this.tsRef.child("count").remove().then( () => {
      for(let i=startNum; i<=endNum; i=i+increaseNum) {
        this.tsRef.child(`count/${i}`).set({
          value: i
        });
      }
    });
  } 

  getCountRef(): firebase.database.Reference {
    return this.tsRef.child("count");
  }

}
