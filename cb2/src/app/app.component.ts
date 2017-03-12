import {Component, OnInit} from "@angular/core";
import {AppService} from "./app.service";
import {Transaction, Entity, Response, Repo, Payee, CashFlow, Filters, User} from "./app.model";
import {BehaviorSubject, Subject} from "rxjs";
import {asObservable} from "./asObservable";
import {List} from "immutable";
import * as moment from "moment";
import {MdDialogRef, MdDialog, MdSnackBar, MdSnackBarConfig} from "@angular/material";
import {TransactionDialog} from "./edit-transaction";
import {PayeeDialog} from "./edit-payee";
import {ConfirmationDialog} from "./confirmation";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit {

  UTC: string = "YYYY-MM-DD HH:mm:ss.SSS-05:00";

  _transactions: BehaviorSubject<List<Transaction>> = new BehaviorSubject(List([]));
  _payees: BehaviorSubject<List<Payee>> = new BehaviorSubject(List([]));
  _filters: Filters;

  cashFlow: CashFlow[] = new Array<CashFlow>();
  email = new BehaviorSubject('Loading...');
  todaysBalance: number = 0.00;
  balanceBeforeIncome: number = 0.00;

  dialogRef: MdDialogRef<TransactionDialog>;
  payeeDialog: MdDialogRef<PayeeDialog>;
  confirmationDialog: MdDialogRef<ConfirmationDialog>;


  constructor(private appService: AppService, private repo: Repo, public dialog: MdDialog, private snackBar: MdSnackBar) {
  }

  ngOnInit() {


    this.appService.getUser().subscribe(result => {
      let user = (result.json() as User[]);
      this.email.next(user[0].email);
    })

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


    // Balance and set Today flag
    this._transactions.subscribe(transactions => {
      let balance = 0.00;
      for (let t of transactions.reverse().toArray()) {
        t.today = moment().dayOfYear() == moment.utc(t.date, this.UTC).dayOfYear();
        balance = Number.parseFloat(t.amount) + balance;
        t.balance = balance;
      }


      let currentBalance;
      var dayOfYear = moment().dayOfYear();
      let year = moment().format('YYYY');
      console.log(dayOfYear);
      for (let t of transactions.reverse().toArray()) {
        if (year == moment.utc(t.date, this.UTC).format('YYYY')) {
          if (moment.utc(t.date, this.UTC).dayOfYear() > dayOfYear) {
            break;
          }
        }
        currentBalance = t.balance;
      }
      this.todaysBalance = currentBalance;
      console.log(this.todaysBalance);


      for (let t of transactions.reverse().toArray()) {
        if (year == moment.utc(t.date, this.UTC).format('YYYY')) {
          if (moment.utc(t.date, this.UTC).dayOfYear() > dayOfYear) {
            if (t.type == 'i') {

              break;
            }
          }
        }
        this.balanceBeforeIncome = t.balance;
      }



    })

    // Cash Flows
    this._transactions.subscribe(() => {
      this.computeCashFlow();
    })


  }

  editPayee(payee: Payee, isNew?: boolean) {

    this.payeeDialog = this.dialog.open(PayeeDialog, {
      disableClose: false
    });

    if (isNew) {
      payee = new Payee();

    }
    this.payeeDialog.componentInstance.payee = payee;
    this.payeeDialog.componentInstance.nameReadonly = !isNew;
    this.payeeDialog.afterClosed().subscribe(result => {
      console.log('result: ' + result);
      if (result) {

        this.appService.savePayee(result as Payee).subscribe(res => {
          if (isNew) {
            this._payees.next(this._payees.getValue().push(payee));
          }

        })

      }
      this.payeeDialog = null;
    });

  }

  editTransaction(transaction: Transaction, isNew?: boolean) {

    this.dialogRef = this.dialog.open(TransactionDialog, {
      disableClose: false
    });

    if (isNew) {
      transaction = new Transaction();
      transaction.date = moment().format('YYYY-MM-DD');
      this.dialogRef.componentInstance.transaction = transaction;

    } else {
      var cloneObj = new Transaction();
      for (var attribut in transaction) {
        cloneObj[attribut] = transaction[attribut];
      }
      this.dialogRef.componentInstance.transaction = cloneObj;

    }
    this.dialogRef.componentInstance.payees = this._payees.getValue();
    this.dialogRef.componentInstance.transaction.date = moment.utc(transaction.date, this.UTC).format('YYYY-MM-DD');
    this.dialogRef.afterClosed().subscribe(result => {

      console.log('result: ' + result);
      if (result) {
        this.save(result as Transaction);
        for (var attribut in result) {
          transaction[attribut] = result[attribut];
        }
        transaction = result as Transaction;
      }
      this.dialogRef = null;
    });
  }


  computeCashFlow() {

    this.cashFlow = new Array<CashFlow>();
    let currentMonth: string = "x";
    let cf: CashFlow = new CashFlow();
    for (let t of this._transactions.getValue().toArray()) {

      if (currentMonth != moment(t.date).format("MMM")) {
        cf = new CashFlow();
        this.cashFlow.push(cf);
      }

      cf.thisMonth = moment().format('MMM') == moment(t.date).format('MMM');
      let amount = Number(t.amount);
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

  get currentMonth() {
    return moment().format('MMMM');
  }

  get lastMonth() {
    return moment().subtract(1, 'month').format('MMMM')
  }

  get payeeCount() {
    return this._payees.getValue().count();

  }

  get count() {
    return this._transactions.getValue().count();
  }

  get emailAddress() {
    return this.email.getValue();
  }

  get payees() {
    return asObservable(this._payees);

  }

  handleFiltersChange(filters: Filters): void {
    this._filters = filters;
  }

  get transactions() {
    const filters = this._filters;
    if (filters) {
      return new BehaviorSubject(this._transactions.getValue().filter(t => {
        const payeePass = filters.payee ? t.payee.toUpperCase().indexOf(filters.payee.toUpperCase()) > -1 : true;
        return payeePass;
      }).toList());
    } else {
      return asObservable(this._transactions);
    }

  }

  delete(transaction: Transaction) {


    this.confirmationDialog = this.dialog.open(ConfirmationDialog, {
      disableClose: false
    });


    this.confirmationDialog.afterClosed().subscribe(result => {

      if (result) {

        this.appService.delete(transaction).subscribe(res => {
          let transactions: List<Transaction> = this._transactions.getValue();
          let index = transactions.findIndex((r) => r.name == transaction.name);
          this._transactions.next(transactions.delete(index));
          this.snackBar.open('Deleted', '', {duration: 500});

        }, error => {
          this.snackBar.open('Crap..' + error, 'Ok');

        })

      }

    });


  }

  deletePayee(payee: Payee) {
    this.appService.deletePayee(payee).subscribe(response => {
      let r = response.json() as Response;
      if (r.error) {
        console.error(r.error.message);
        let config = new MdSnackBarConfig();
        this.snackBar.open('Crap..' + r.error.message, 'Ok', config);
      } else {
        let payees: List<Payee> = this._payees.getValue();
        let index = payees.findIndex((p) => p.name == payee.name
        );
        this._payees.next(payees.delete(index));

      }


      console.log(r);

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
      this.snackBar.open('Copied', '', {duration: 500});


    })
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
          this._transactions.next(this.sort(this._transactions.getValue()))
        }
      }, err => {

        this.snackBar.open('Bummer..' + err.error.message, 'Ok', err.message);

      },

      () => {
        this.snackBar.open('Done saving..', 'Ok');


      })
  }

}
