import {Component} from 'angular2/core';
import {Transaction} from './transaction';
import {TransactionService} from './transaction.service';

@Component({
    selector: 'transactions',
    template:`

    	<h1>Transaction</h1>

      `

})


export class TransactionComponent {
  constructor(private _transactionService: TransactionService) {}
  
}
