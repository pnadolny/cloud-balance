import {Component} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {Transaction, Payee} from "./app.model";
import {List} from "immutable";


@Component({
  selector: 'transaction-dialog',
  templateUrl: 'edit-transaction.html',
  styleUrls: ['./edit-transaction.css']

})

export class TransactionDialog {

  transaction: Transaction;
  payees: List<Payee>

  constructor(public dialogRef: MdDialogRef<TransactionDialog>) { }
}
