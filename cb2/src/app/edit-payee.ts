import {Component} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {Payee, Repo} from "./app.model";


@Component({
  selector: 'payee-dialog',
  template: `


      <md-input  placeholder="Name" [readonly]="nameReadonly" [(ngModel)]="payee.name" align="begin">
      </md-input>


      <select class="form-control" id="payeetype"
              [(ngModel)]="payee.type">
        <option *ngFor="let t of repo.types" [value]="t.id">{{t.value}}
        </option>
      </select>

  <button md-button (click)="dialogRef.close(payee)">Save</button>
  <button md-button (click)="dialogRef.close(null)">Cancel</button>
  `
})

export class PayeeDialog {

  payee: Payee;
  nameReadonly: boolean =false;


  constructor(public dialogRef: MdDialogRef<PayeeDialog>, private repo: Repo) { }
}
