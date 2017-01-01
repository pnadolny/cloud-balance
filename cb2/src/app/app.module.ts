import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import {AppService} from "./app.service";
import { MaterialModule} from '@angular/material';
import {Repo} from "./app.model";
import {TransactionDialog} from "./edit-transaction";
import {PayeeDialog} from "./edit-payee";
import 'hammerjs';
import { FiltersCmp } from './filters/filters.component';
import {createFiltersObject} from "./create_filters_object";


@NgModule({
  declarations: [
    AppComponent,TransactionDialog,PayeeDialog,FiltersCmp
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpModule,MaterialModule.forRoot()
  ],
  providers: [AppService,Repo, {provide: 'createFiltersObject', useValue: createFiltersObject}],
  bootstrap: [AppComponent],
  entryComponents: [TransactionDialog,PayeeDialog]
})
export class AppModule { }
