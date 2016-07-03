import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Payee} from './payee';

@Injectable()
export class PayeeServer {

    private url = '../ng/resources/payees';  // URL to web api

    constructor(private http: Http) { }

    getTransactions(): Promise<Payee[]> {

        return this.http.get(this.url)
            .toPromise()
            .then(response => response.json())
            .catch(this.handleError);

    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

}