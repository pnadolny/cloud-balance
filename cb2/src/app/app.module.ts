import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {AppService} from "./app.service";
import { MaterialModule} from '@angular/material';
import {Repo} from "./app.model";
import {TransactionDialog} from "./edit-transaction";
import {PayeeDialog} from "./edit-payee";

@NgModule({
  declarations: [
    AppComponent,TransactionDialog,PayeeDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,MaterialModule.forRoot()
  ],
  providers: [AppService,Repo],
  bootstrap: [AppComponent],
  entryComponents: [TransactionDialog,PayeeDialog]
})
export class AppModule { }
