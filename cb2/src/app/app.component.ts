import {Component, OnInit} from "@angular/core";
import {AppService} from "./app.service";
import {Transaction, Entity, Response, Repo, Payee, CashFlow} from "./app.model";
import {BehaviorSubject} from "rxjs";
import {asObservable} from "./asObservable";
import {List} from "immutable";
import * as moment from "moment";
import {MdDialogRef, MdDialog} from "@angular/material";
import {TransactionDialog} from "./edit-transaction";

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
  payee: Payee;
  cashFlow: CashFlow[] = new Array<CashFlow>();
  UTC: string = "YYYY-MM-DD HH:mm:ss.SSS-05:00";

  dialogRef: MdDialogRef<TransactionDialog>;


  constructor(private appService: AppService, private repo: Repo, public dialog: MdDialog) {
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
      this.computeCashFlow();
    })
  }

  editTransaction(transaction: Transaction, isNew?: boolean) {

    this.dialogRef = this.dialog.open(TransactionDialog, {
      disableClose: false
    });

    if (isNew) {
      transaction = new Transaction();
      transaction.date = moment().format('YYYY-MM-DD');

    }
    this.dialogRef.componentInstance.transaction = transaction;
    this.dialogRef.componentInstance.payees = this._payees.getValue();
    this.dialogRef.componentInstance.transaction.date = moment(transaction.date).format('YYYY-MM-DD');
    this.dialogRef.afterClosed().subscribe(result => {

      console.log('result: ' + result);
      if (result) {
        this.save(result as Transaction);
      }

      this.dialogRef = null;
    });
  }

  computeCashFlow() {

    console.log('Computing...');
    this.cashFlow = new Array<CashFlow>();
    let currentMonth: string = "x";
    let cf: CashFlow = new CashFlow();
    for (let t of this._transactions.getValue().toArray()) {

      if (currentMonth != moment(t.date).format("MMM")) {
        console.log('New m...');
        cf = new CashFlow();
        this.cashFlow.push(cf);
      }

      let amount = Number(t.amount);
      console.log(amount);
      cf.month = moment(t.date).format("MMM");
      cf.monthlyCashFlow = cf.monthlyCashFlow + amount;
      switch (t.type) {
        case "i":
          cf.income = cf.income + amount;
          break;
        case "s":
          cf.static = cf.static + amount;
          break;
        case "d":
          cf.discretionary = cf.discretionary + amount;
          break;
        case "f":
          cf.future = cf.future + amount;
          break;
        default:
          cf.other
            = cf.other + amount;
      }
      currentMonth = cf.month;


    }


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
    }, error => {

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
      copy.date = moment.utc(copy.date, this.UTC).add(1, 'month').toISOString();
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

  newPayee() {
    this.payee = new Payee();

  }

  savePayee(payee: Payee) {

    this.appService.savePayee(payee).subscribe(res => {


    })

    this.payee = null;


  }

  editPayee(payee: Payee) {

    this.payee = payee;
  }


  findType(payee: string): string {
    for (let p of this._payees.getValue().toArray()) {
      if (p.name == payee) {
        return p.type;
      }
    }
  }

  save(transaction: Transaction) {
    transaction.date = moment.utc(transaction.date, this.UTC).add(6, 'hour').toISOString();
    if (transaction.name == null) {
      transaction.name = "";
    }
    this.appService.save(transaction).subscribe(response => {
      let entity = (response.json() as Entity);
      if (transaction.name == "") {
        transaction.name = "" + entity.key.id;
        transaction.type = this.findType(transaction.payee);
        this._transactions.next(this.sort(this._transactions.getValue().push(transaction)));
      } else {
        this._transactions.next(this._transactions.getValue())
      }
      this.transaction = null;
      console.log(response);
    }, () => {


    })
  }

}
