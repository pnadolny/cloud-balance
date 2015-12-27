import {Component} from 'angular2/core';
import {TransactionListComponent} from './transaction-list.component';

@Component({
    selector: 'transactions',
    template:`
    	<h1>Transactions! </h1>
    	<transaction-list></transaction-list>
      `
     ,
	
	directives: [TransactionListComponent]
})

export class TransactionComponent {
  
  
  
}
