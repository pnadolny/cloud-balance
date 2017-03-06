import {Component, Input} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {Transaction, Payee} from "./app.model";
import {List} from "immutable";


@Component({
  selector: 'transaction-dialog',
  styles: ['div {display: flex;flex-direction: column;flex-grow: 1;}'],
  template: `





  <div>
  
    <md-input-container>
      <input mdInput placeholder="Amount" [(ngModel)]="transaction.amount" align="end">
       <span md-prefix>$&nbsp;</span>
    </md-input-container>
  
   <md-input-container>
      <input mdInput type="date" placeholder="Date" [(ngModel)]="transaction.date" align="end">
   
   </md-input-container>
   
      <select class="form-control" id="payee"
              [(ngModel)]="transaction.payee" [disabled]="transaction.name!=null">
        <option *ngFor="let payee of payees" [value]="payee.name">{{payee.name}}
        </option>
      </select>
    
  </div>
    <button md-button (click)="dialogRef.close(transaction)">Save</button>
  <button md-button (click)="dialogRef.close(null)">Cancel</button>

  `
})

export class TransactionDialog {

  transaction: Transaction;
  payees: List<Payee>

  constructor(public dialogRef: MdDialogRef<TransactionDialog>) { }
}
