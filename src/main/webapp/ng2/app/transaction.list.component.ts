import {Component,OnInit} from '@angular/core';

import {Transaction} from './transaction';
import {TransactionService} from './transaction.service';
import {TransactionDetailComponent} from './transaction.detail.component';
import {ToDate} from './pipes/pipes';

@Component({
    selector: 'transaction-list',
    pipes: [ToDate],
    templateUrl:'app/transaction.list.component.html',
    styleUrls:  ['app/md-table.css'],
    providers: [TransactionService],
    directives: [TransactionDetailComponent]
})


export class TransactionListComponent implements OnInit {
   
  constructor(private _transactionService: TransactionService) {}
  public transactions: Transaction[];
  public selectedTransaction: Transaction;
  ngOnInit() {
      this.getTransactions();
  }
	getTransactions() {
        this._transactionService.getTransactions().then(transactions => this.transactions = transactions);
	}

    computeBalance() {
        var balance = 0;
            for (var i = 0; i < this.transactions.length; i++) {
                balance = balance + this.transactions[i].amount;
                this.transactions[i].balance = balance;
            }

    }


	onSelect(transaction: Transaction) { 
		this.selectedTransaction= transaction; 
	}	
 
  
}
