import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {TRANSACTIONS} from './mock-transactions';

import {Transaction} from './transaction';

@Injectable()
export class TransactionService {

    private transactionUrl = '../ng/resources/transaction';  // URL to web api

    constructor(private http: Http) { }

    getTransactions(): Promise<Transaction[]> {

        return this.http.get(this.transactionUrl)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);

    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}