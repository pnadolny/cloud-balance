import {Component, OnInit} from '@angular/core';
import {AppService} from "./app.service";
import {Transaction} from "./app.model";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit{
  title = 'Transactions';
  transactions: Transaction[];


  constructor(private appService: AppService) {}

  ngOnInit() {

    this.appService.get().subscribe(result => {

      let transactions = (result.json() as Transaction[]);
      this.transactions = transactions;


    });


  }

}
