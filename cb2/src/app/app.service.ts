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

  getPayees(): Observable<any> {


    let year = moment().format('YYYY');

    let options = new RequestOptions({
      search: new URLSearchParams('year='+year)

    });


    return this.http.get( this.payeeUrl,options)
  }

  get(): Observable<any> {

    let options = new RequestOptions({
      search: new URLSearchParams()

    });


    return this.http.get(this.transactionUrl,options);
  }

  delete(transaction: Transaction): Observable<any> {

    return this.http.delete(this.transactionUrl + '?id=' +  `${transaction.name}` + '&parentid=' + `${transaction.payee}` );

  }

  deletePayee(payee: Payee): Observable<any> {
    return this.http.delete(this.payeeUrl + '?id=' + `${payee.name}`);

  }
  savePayee(payee: Payee): Observable<any> {

    let url = this.payeeUrl + '?name=' + `${payee.name}` + '&type=' + `${payee.type}`;

    return this.http.put(url,null);

  }
  save(transaction: Transaction): Observable<any> {
    let ISO: string = "YYYY-MM-DDTHH:mm:ss.SSS";
    let date = moment(transaction.date).format(ISO) + 'Z';
    let url = this.transactionUrl + '?name=' + `${transaction.name}` + '&memo=' + `${transaction.memo}` + '&payee=' + `${transaction.payee}` + '&amount=' + `${transaction.amount}` + '&date=' + `${date}` + '&transaction-type=' + `${transaction.type}`;
    return this.http.put(url,null);

  }

}
