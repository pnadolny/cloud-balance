import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, Payee, User } from './models';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private readonly transactionUrl = '/ng/resources/transaction';
  private readonly payeeUrl = '/ng/resources/payee';
  private readonly userUrl = '/ng/resources/user';

  getUser(): Observable<User[]> {
    return this.http.get<User[]>(this.userUrl);
  }

  getTransactions(month?: number, year?: number): Observable<Transaction[]> {
    let params = new HttpParams();
    if (month !== undefined && year !== undefined) {
      params = params.set('month', month.toString());
      params = params.set('year', year.toString());
    }
    return this.http.get<Transaction[]>(this.transactionUrl, { params });
  }

  deleteTransaction(transaction: Transaction): Observable<any> {
    const params = new HttpParams()
      .set('id', transaction.name)
      .set('parentid', transaction.payee);
    return this.http.delete(this.transactionUrl, { params });
  }

  saveTransaction(transaction: Transaction): Observable<any> {
    const ISO = 'YYYY-MM-DDTHH:mm:ss.SSS';
    const d = moment(transaction.date).hour(6);
    const date = d.format(ISO) + 'Z';

    const params = new HttpParams()
      .set('name', transaction.name || '')
      .set('memo', transaction.memo || '')
      .set('payee', transaction.payee)
      .set('amount', transaction.amount.toString())
      .set('date', date)
      .set('transaction-type', transaction.type);

    return this.http.put(this.transactionUrl, null, { params });
  }

  getPayees(year?: number): Observable<Payee[]> {
    let params = new HttpParams();
    if (year !== undefined) {
      params = params.set('year', year.toString());
    }
    return this.http.get<Payee[]>(this.payeeUrl, { params });
  }

  deletePayee(payee: Payee): Observable<any> {
    const params = new HttpParams().set('id', payee.name);
    return this.http.delete(this.payeeUrl, { params });
  }

  savePayee(payee: Payee): Observable<any> {
    const params = new HttpParams()
      .set('name', payee.name)
      .set('type', payee.type);
    return this.http.put(this.payeeUrl, null, { params });
  }
}
