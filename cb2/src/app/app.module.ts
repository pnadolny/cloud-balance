import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {AppComponent} from "./app.component";
import {AppService} from "./app.service";
import {Repo} from "./app.model";
import {TransactionDialog} from "./edit-transaction";
import {PayeeDialog} from "./edit-payee";
import "hammerjs";
import {FiltersCmp} from "./filters/filters.component";
import {createFiltersObject} from "./create_filters_object";
import {ConfirmationDialog} from "./confirmation";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatButtonModule,
  MatDatepickerModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from "@angular/material";


@NgModule({
  declarations: [
    AppComponent, TransactionDialog, PayeeDialog, FiltersCmp, ConfirmationDialog
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatTableModule, MatButtonModule, MatTooltipModule, MatToolbarModule,
    MatInputModule, MatDialogModule, MatSnackBarModule, MatTabsModule, MatSelectModule,
    FormsModule,
    HttpModule,
  ],
  providers: [AppService, Repo, {provide: 'createFiltersObject', useValue: createFiltersObject}],
  bootstrap: [AppComponent],
  entryComponents: [TransactionDialog, PayeeDialog, ConfirmationDialog]
})
export class AppModule {
}
