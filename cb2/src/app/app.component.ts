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


  constructor(private appService: AppService) {
  }

  ngOnInit() {

    this.appService.get().subscribe(result => {
      let transactions = (result.json() as Transaction[]);
      this._transactions.next(List(transactions));
    });
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

}
