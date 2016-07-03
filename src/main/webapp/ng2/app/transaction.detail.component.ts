import {Component,OnInit} from '@angular/core';
import {Transaction} from './transaction';


@Component({
    selector: 'transaction-detail',
    template:`
    
     <div *ngIf="transaction">
	    <div>
	      <label>id: </label>
	      <input [(ngModel)]="transaction.amount" placeholder="name"/>
	    </div>
     </div>
    
      `,
    inputs: ['transaction']
})

export class TransactionDetailComponent {
 	public transaction: Transaction;
 	
}
