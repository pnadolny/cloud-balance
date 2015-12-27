import {Component,OnInit} from 'angular2/core';
import {Transaction} from './transaction';
import {TransactionService} from './transaction.service';


@Component({
    selector: 'transaction-list',
    template:`

    	<h2>transaction details!</h2>
    	
    	<li *ngFor="#transaction of transactions">
        	<span>{{transaction.id}}</span> {{transaction.amount}}
      	</li>
      
      `,
    providers: [TransactionService]
})


export class TransactionListComponent implements OnInit {
   
  constructor(private _transactionService: TransactionService) {}
  public transactions: Transaction[];
  ngOnInit() {
	  this.getTransactions();
	}
	getTransactions() {
	  this._transactionService.getTransactions().then(transactions => this.transactions = transactions);
	}
	
}
