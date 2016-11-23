import {Injectable} from "@angular/core";
import {Http, Headers, Response, RequestOptions, URLSearchParams} from "@angular/http";
import "rxjs/add/operator/toPromise";
import {Observable} from "rxjs";
import {Transaction} from "./app.model";


@Injectable()
export class AppService {


  constructor(private http: Http){}

  private transactionUrl = '../ng/resources/transaction';

  get(): Observable<any> {

    let options = new RequestOptions({
      search: new URLSearchParams()

    });

    return this.http.get( this.transactionUrl,options)
  }

  delete(transaction: Transaction): Observable<any> {

    return this.http.delete(this.transactionUrl + '?id=' +  `${transaction.name}` + '&parentid=' + `${transaction.payee}` );

  }


}
