import {Component,OnInit} from 'angular2/core';
import {TransactionComponent} from './transaction.component';


@Component({
    selector: 'my-app',
    template:`
      <h1>{{title}}</h1>
      <transactions></transactions>
      `
      ,
      directives: [TransactionComponent],
})

export class AppComponent {
	public title = 'Cloud Balance';
}


