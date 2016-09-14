import {Component,OnInit} from '@angular/core';
import {Transaction} from './transaction';


@Component({
    selector: 'transaction-detail',
    templateUrl:'app/transaction.detail.component.html',
    inputs: ['transaction']
})

export class TransactionDetailComponent {
 	public transaction: Transaction;

    save() {
        alert('x');
    }
}
