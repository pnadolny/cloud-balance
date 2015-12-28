import {Component} from 'angular2/core';
import {TransactionListComponent} from './transaction-list.component';

@Component({
    selector: 'transactions',
    template:`
    	<transaction-list></transaction-list>
      `
     ,
	directives: [TransactionListComponent]
})

export class TransactionComponent {
  
  
  
}
