import {Component, OnDestroy, OnInit} from "@angular/core";
import {AppService} from "./app.service";
import {CashFlow, Entity, Filters, Payee, Repo, Response, Transaction, TransactionType, User} from "./app.model";
import {BehaviorSubject} from "rxjs";
import {asObservable} from "./asObservable";
import {List} from "immutable";
import * as moment from "moment";
import {MatDialog, MatDialogRef, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {TransactionDialog} from "./edit-transaction";
import {PayeeDialog} from "./edit-payee";
import {ConfirmationDialog} from "./confirmation";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']

})
export class AppComponent implements OnInit, OnDestroy {

  readonly UTC: string = "YYYY-MM-DD HH:mm:ss.SSS-05:00";

  _transactions: BehaviorSubject<List<Transaction>> = new BehaviorSubject(List([]));
  _payees: BehaviorSubject<List<Payee>> = new BehaviorSubject(List([]));
  _filters: Filters;

  cashFlow: CashFlow[] = new Array<CashFlow>();
  email = new BehaviorSubject('Loading...');
  logoutURL: string;
  todaysBalance: number = 0.00;
  balanceBeforeIncome: number = 0.00;
  searching: boolean = false;

  dialogRef: MatDialogRef<TransactionDialog>;
  payeeDialog: MatDialogRef<PayeeDialog>;
  confirmationDialog: MatDialogRef<ConfirmationDialog>;


  constructor(private appService: AppService, private repo: Repo, public dialog: MatDialog, private snackBar: MatSnackBar) {
  }


  ngOnInit(): void {

    this.appService.getUser().subscribe(result => {
      let user = (result.json() as User[]);
      this.email.next(user[0].email);
      this.logoutURL = user[0].logoutURL;
      console.log(this.logoutURL)
    })

    this.appService.get().subscribe(result => {
      this._transactions.next(this.sort(List<Transaction>((result.json() as Transaction[]))));
    });

    this.appService.getPayees().subscribe((result => {
      let payees = (result.json() as Payee[]);
      let payeeList = List<Payee>(payees);
      this._payees.next(payeeList);
    }))


    this._transactions.subscribe(transactions => {

      let balance = 0.00;
      for (let t of transactions.reverse().toArray()) {
        t.today = moment().dayOfYear() == moment.utc(t.date, this.UTC).dayOfYear();
        balance = Number.parseFloat(t.amount) + balance;
        t.balance = balance;
      }



      this.todaysBalance = transactions.reverse().toArray().filter(transaction => {
        return (moment.utc(transaction.date, this.UTC).isBefore(moment().add(1,'d')));
      }).map((t) => {
        return t.balance
      }).reduce((previousBalance, nextBalance) => {
        return nextBalance;
      }, 0);


      let initialTransaction = new Transaction();
      initialTransaction.balance = 0.00;


      // Find the balance just before next income item
      let nextPayDateTransaction = transactions.reverse().toArray()

        .filter(transaction => {
          return (moment.utc(transaction.date, this.UTC).isAfter(moment()));
        })

        // is an Income type
        .filter(transaction => {
          return (TransactionType[transaction.type] == TransactionType.i)
        })
        // reduce to earliest income item
        .reduce((previousTransaction, nextTransaction) => {


          return moment.utc(previousTransaction.date, this.UTC).isBefore(moment.utc(nextTransaction.date, this.UTC))
            ? previousTransaction : nextTransaction

        }, initialTransaction);

      this.balanceBeforeIncome = transactions.reverse().toArray()

        .filter(transaction => {
          return (moment.utc(transaction.date, this.UTC).isBefore(moment.utc(nextPayDateTransaction.date, this.UTC)));
        })
        // is not an Income type
        .filter(transaction => {
          return (TransactionType[transaction.type] != TransactionType.i)
        })
        .reduce((previousTransaction, nextTransaction) => {
          return nextTransaction;
        }, initialTransaction).balance;

    })

    // Cash Flows
    this._transactions.subscribe(() => {
      this.computeCashFlow();
    })


  }

  ngOnDestroy() {
    this._transactions.unsubscribe();
    this._payees.unsubscribe();
    this.email.unsubscribe();
  }


  get todaysDate() {
    return moment().format("MM/DD/YYYY")
  }


  batchCopyStaticTransactionsFoward(transactionType: String) {


    let l = this._transactions.getValue().asImmutable().toArray().filter(transaction=> {
      return moment.utc(transaction.date, this.UTC).year() == moment().year();
    }).filter(transaction => {
      return moment.utc(transaction.date, this.UTC).month() == moment().add(1,'M').month();
    }).filter(transaction => {
      return transaction.type == transactionType;
    }).length;

    if (l>0) {
      this.snackBar.open(l + ' static transactions already exist next month', '', {duration: 500});
      return;
    }


    this._transactions.getValue().asImmutable().toArray().filter(transaction=> {
     return moment.utc(transaction.date, this.UTC).year() == moment().year();
    }).filter(transaction => {
      return moment.utc(transaction.date, this.UTC).month() == moment().month();

    }).filter(transaction => {
      return transaction.type == 's';

    }).forEach(transaction => {
       this.copy(transaction,true);
    });





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

  clearSearch() {

    if (this._filters && this._filters.hasOwnProperty("month")) {
      this._filters.month = null;

    }


    this.searching = false;
  }

  editTransaction(transaction: Transaction, isNew?: boolean) {

    this.dialogRef = this.dialog.open(TransactionDialog, {
      disableClose: false
    });

    if (isNew) {
      transaction = new Transaction();
      transaction.date = moment().toDate();
      this.dialogRef.componentInstance.transaction = transaction;

    } else {
      var cloneObj = new Transaction();
      for (var attribut in transaction) {
        cloneObj[attribut] = transaction[attribut];
      }
      this.dialogRef.componentInstance.transaction = cloneObj;

    }
    this.dialogRef.componentInstance.payees = this._payees.getValue();
    this.dialogRef.componentInstance.transaction.date = moment.utc(transaction.date, this.UTC).toDate();
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
      switch (TransactionType[t.type]) {
        case TransactionType.i:
          cf.income = cf.income + amount;
          break;
        case TransactionType.s:
          cf.static = cf.static + amount;
          break;
        case TransactionType.d:
          cf.discretionary = cf.discretionary + amount;
          break;
        case TransactionType.f:
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

  get nextMonth() {
    return moment().add(1,'M').format('MMMM');
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
      }).toList().filter(t => {
        const monthPass = filters.month ? moment(t.date, 'YYYY-MM').isSame(moment(filters.month, 'YYYY-MM')) : true;

        return monthPass
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
        let config = new MatSnackBarConfig();
        this.snackBar.open('Crap..' + r.error.message, 'Ok', config);
      } else {
        let payees: List<Payee> = this._payees.getValue();
        let index = payees.findIndex((p) => p.name == payee.name);
        this._payees.next(payees.delete(index));

      }
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
      copy.date = moment.utc(copy.date, this.UTC).add(1, 'month').toDate();
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
        this.snackBar.open('Done saving..', 'Ok', {duration: 500});


      })
  }

}
