import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Tab1Page } from './tab1/tab1';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root: any = Tab1Page;

  constructor() {
  }

}
