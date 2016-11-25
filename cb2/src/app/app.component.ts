import {Component, OnInit} from "@angular/core";
import {AppService} from "./app.service";
import {Transaction, Entity, Response, Repo, Payee} from "./app.model";
import {BehaviorSubject} from "rxjs";
import {asObservable} from "./asObservable";
import {List} from "immutable";
import * as moment from "moment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit {
  title = 'Transactions';
  _transactions: BehaviorSubject<List<Transaction>> = new BehaviorSubject(List([]));
  _payees: BehaviorSubject<List<Payee>> = new BehaviorSubject(List([]));


  transaction: Transaction;
  UTC: string = "'YYYY-MM-DD HH:mm:ss.SSS-05:00')";

  constructor(private appService: AppService,private repo: Repo) {
  }

  ngOnInit() {


    this.appService.get().subscribe(result => {
      let transactions = (result.json() as Transaction[]);
      let t = List<Transaction>(transactions);
      this._transactions.next(this.sort(t));
    });

    this.appService.getPayees().subscribe((result => {
      let payees = (result.json() as Payee[]);
      let payeeList = List<Payee>(payees);
      this._payees.next(payeeList);
    }))


    this._transactions.subscribe(transactions => {
      let balance = 0.00;
      for (let t of transactions.reverse().toArray()) {
        balance = Number.parseFloat(t.amount) + balance;
        t.balance = balance;
      }

    })
  }

  get count() {
    return this._transactions.getValue().count();
  }

  get payees() {
    return asObservable(this._payees);

  }
  get transactions() {
    return asObservable(this._transactions);
  }

  delete(transaction: Transaction) {
    this.appService.delete(transaction).subscribe(res => {

      let response = res.json() as Response;


      let transactions: List<Transaction> = this._transactions.getValue();
      let index = transactions.findIndex((r) => r.name == transaction.name);
      this._transactions.next(transactions.delete(index));



    },error => {

    })
  }


  sort(list: List<Transaction>): List<Transaction> {
    let l = list.sort((n1, n2) => {
      if (n1.date == n2.date) {
        return 0;
      }
      if (moment.utc(n1.date, this.UTC).isBefore(moment.utc(n2.date, this.UTC))) {
        return 1;
      } else {
        return -1;
      }
    });
    return l.toList();
  }


  copy(transaction: Transaction, nextMonth: boolean) {
    let copy = new Transaction();
    copy.name = "";
    copy.type = transaction.type;
    copy.date = transaction.date;
    if (nextMonth) {
      copy.date = moment.utc(copy.date, "'YYYY-MM-DD HH:mm:ss.SSS-05:00')").add(1, 'month').toISOString();
    }
    copy.amount = transaction.amount;
    copy.memo = transaction.memo;
    copy.payee = transaction.payee;
    this.appService.save(copy).subscribe(response => {
      let entity = (response.json() as Entity);
      copy.name = "" + entity.key.id
      this._transactions.next(this.sort(this._transactions.getValue().push(copy)));

    })
  }

  edit(transaction: Transaction) {

    transaction.date = moment(transaction.date).format('YYYY-MM-DD');

    this.transaction = transaction;
  }

  save(transaction: Transaction) {
    transaction.date = moment.utc(transaction.date, "'YYYY-MM-DD HH:mm:ss.SSS-00:00')").toISOString();

    this.appService.save(transaction).subscribe(response => {
      let entity = (response.json() as Entity);



      if (transaction.name == null) {
        transaction.name = "" + entity.key.id;
        this._transactions.next(this._transactions.getValue().push(transaction));
      } else {
        this._transactions.next(this._transactions.getValue())
      }
      this.transaction = null;
      console.log(response);
    }, () => {


    })
  }

}
