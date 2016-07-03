import { Injectable } from '@angular/core';

import {TRANSACTIONS} from './mock-transactions';

@Injectable()
export class TransactionService {
 getTransactions() {
 
 	var balance =0;
 	
    for (var i = 0; i < TRANSACTIONS.length; i++) {
    	 balance = balance + TRANSACTIONS[i].amount;
         TRANSACTIONS[i].balance = balance;
    }
 
     return Promise.resolve(TRANSACTIONS);
  }
}