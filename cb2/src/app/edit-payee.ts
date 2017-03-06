import {Component} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {Payee, Repo} from "./app.model";


@Component({
  selector: 'payee-dialog',
  styles: ['div {display: flex;flex-direction: column;flex-grow: 1;}'],

  template: `
     <div>
     
     <md-input-container>
      <md-hint align="end">{{payeeName.value.length}} / 100</md-hint>
      <input mdInput [readonly]="nameReadonly" [(ngModel)]="payee.name" align="begin" #payeeName>
     </md-input-container>

      <br>


      <select class="form-control" id="payeetype"
              [(ngModel)]="payee.type">
        <option *ngFor="let t of repo.types" [value]="t.id">{{t.value}}
        </option>
      </select>
</div>
  <button md-button (click)="dialogRef.close(payee)">Save</button>
  <button md-button (click)="dialogRef.close(null)">Cancel</button>
  
  `
})

export class PayeeDialog {

  payee: Payee;
  nameReadonly: boolean = false;


  constructor(public dialogRef: MdDialogRef<PayeeDialog>, private repo: Repo) {


  }
}
