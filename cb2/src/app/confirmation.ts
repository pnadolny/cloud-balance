import {Component} from "@angular/core";
import {MatDialogRef} from "@angular/material";


@Component({
  selector: 'confirmation-dialog',
  styles: ['div {display: flex;flex-direction: column;flex-grow: 1;}'],
  template: `

  <div>
  Are you sure?  
  </div>
  
  <md-dialog-actions>
  <button mat-button (click)="dialogRef.close('yes')">Yes</button>
  <button mat-button (click)="dialogRef.close(null)">No</button>

  </md-dialog-actions>
  
  
  `
})

export class ConfirmationDialog {


  constructor(public dialogRef: MatDialogRef<ConfirmationDialog>) { }
}
