import {Component, OnInit} from "@angular/core";
import {AppService} from "./app.service";
import {Transaction} from "./app.model";
import {BehaviorSubject} from "rxjs";
import {asObservable} from "./asObservable";
import {List} from "immutable";


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

      transactions.reverse();

      for (let t of transactions.toArray()) {

          let tt = t as Transaction;

          console.log(tt.amount);

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
  edit(transaction: Transaction) {
    this.transaction = transaction;
  }

  save(transaction: Transaction) {

    this.appService.save(transaction).subscribe(response => {


      console.log(response);

    })
  }

}
