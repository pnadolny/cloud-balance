import {Injectable} from 'angular2/core';
import {TRANSACTIONS} from './mock-transactions';

@Injectable()
export class TransactionService {
 getTransactions() {
     return Promise.resolve(TRANSACTIONS);
  }
}