import {Component} from "@angular/core";
import {MdDialogRef} from "@angular/material";


@Component({
  selector: 'confirmation-dialog',
  styles: ['div {display: flex;flex-direction: column;flex-grow: 1;}'],
  template: `

  <div>
  Are you sure?  
  </div>
    <button md-button (click)="dialogRef.close('yes')">Yes</button>
  <button md-button (click)="dialogRef.close(null)">No</button>

  `
})

export class ConfirmationDialog {


  constructor(public dialogRef: MdDialogRef<ConfirmationDialog>) { }
}
