import {Component, OnInit} from "@angular/core";
import {AppService} from "./app.service";
import {Transaction, Entity} from "./app.model";
import {BehaviorSubject} from "rxjs";
import {asObservable} from "./asObservable";
import {List} from "immutable";
import * as moment from 'moment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Transactions';
  _transactions: BehaviorSubject<List<Transaction>> = new BehaviorSubject(List([]));
  transaction: Transaction;



  constructor(private appService: AppService) {
  }

  ngOnInit() {

    this.appService.get().subscribe(result => {
      let transactions = (result.json() as Transaction[]);
      let t = List<Transaction>(transactions);
      this._transactions.next(t);
    });


    this._transactions.subscribe(transactions => {
      let balance = 0.00;
      for (let t of transactions.toArray()) {
          balance = Number.parseFloat(t.amount) + balance;
          t.balance = balance;
     }
    })
  }

  get transactions() {
    return asObservable(this._transactions);
  }

  delete(transaction: Transaction) {
    this.appService.delete(transaction).subscribe(res => {
      let transactions: List<Transaction> = this._transactions.getValue();
      let index = transactions.findIndex((r) => r.name == transaction.name);
      this._transactions.next(transactions.delete(index));
    })
  }

  copy(transaction: Transaction, nextMonth: boolean) {
    let copy = new Transaction();
    copy.name="";
    copy.type = transaction.type;
    copy.date = transaction.date;

    if (nextMonth) {

      copy.date = moment.utc(copy.date,"'YYYY-MM-DD HH:mm:ss.SSS-05:00')").add(1,'month').toISOString();

    }

    copy.amount = transaction.amount;
    copy.memo = transaction.memo;
    copy.payee = transaction.payee;
    this.appService.save(copy).subscribe(response => {
      let entity = (response.json() as Entity);
      copy.name = "" + entity.key.id;
      this._transactions.next(this._transactions.getValue().push(copy));
      console.log(response);
    })
  }

  edit(transaction: Transaction) {
    this.transaction = transaction;
  }

  save(transaction: Transaction) {
    this.appService.save(transaction).subscribe(response => {
      let entity = (response.json() as Entity);
      if (transaction.name ==null) {
        transaction.name = ""+entity.key.id;
        this._transactions.next(this._transactions.getValue().push(transaction));
     } else {
        this._transactions.next(this._transactions.getValue())
      }
      this.transaction = null;
      console.log(response);
    },() => {


    })
  }

}
