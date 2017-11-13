import {Injectable} from "@angular/core";
import {Http, RequestOptions, URLSearchParams} from "@angular/http";
import "rxjs/add/operator/toPromise";
import {Observable} from "rxjs";
import {Transaction, Payee, User} from "./app.model";
import * as moment from "moment";

@Injectable()
export class AppService {

  constructor(private http: Http){}

  readonly transactionUrl = '../ng/resources/transaction';
  readonly payeeUrl = '../ng/resources/payee';
  readonly userUrl = '/ng/resources/user';

  getUser(): Observable<any> {
    return this.http.get(this.userUrl);
  }

  get(): Observable<any> {
    return this.http.get(this.transactionUrl);
  }
  delete(transaction: Transaction): Observable<any> {
    return this.http.delete(this.transactionUrl + '?id=' +  `${transaction.name}` + '&parentid=' + `${transaction.payee}` );
  }
  save(transaction: Transaction): Observable<any> {
    const ISO: string = "YYYY-MM-DDTHH:mm:ss.SSS";
    const d = moment(transaction.date).hour(6);
    const date = d.format(ISO) + 'Z';
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('name',`${transaction.name}`);
    urlSearchParams.append('memo',`${transaction.memo}`);
    urlSearchParams.append('payee',`${transaction.payee}`);
    urlSearchParams.append('amount',`${transaction.amount}`);
    urlSearchParams.append('date',`${date}`);
    urlSearchParams.append('transaction-type',`${transaction.type}`);
    const requestOptions = new RequestOptions({
      search: urlSearchParams
    });
    return this.http.put(this.transactionUrl,null,requestOptions);
  }

  getPayees(): Observable<any> {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('year',moment().format('YYYY'));
    const requestOptions = new RequestOptions({
      search: urlSearchParams
    });
    return this.http.get( this.payeeUrl,requestOptions)
  }

  deletePayee(payee: Payee): Observable<any> {
    return this.http.delete(this.payeeUrl + '?id=' + `${payee.name}`);

  }
  savePayee(payee: Payee): Observable<any> {
    const url = this.payeeUrl + '?name=' + `${payee.name}` + '&type=' + `${payee.type}`;
    return this.http.put(url,null);
  }


}
