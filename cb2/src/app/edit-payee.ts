import {Component} from "@angular/core";
import {MdDialogRef} from "@angular/material";
import {Payee, Repo} from "./app.model";


@Component({
  selector: 'payee-dialog',
  styleUrls: ['edit-payee.css'],
  templateUrl: 'edit-payee.html'

})

export class PayeeDialog {

  payee: Payee;
  nameReadonly: boolean = false;


  constructor(public dialogRef: MdDialogRef<PayeeDialog>, private repo: Repo) {


  }
}
