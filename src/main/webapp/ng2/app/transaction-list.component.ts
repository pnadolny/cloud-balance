import {Component,OnInit} from 'angular2/core';
import {Transaction} from './transaction';
import {TransactionService} from './transaction.service';

@Component({
    selector: 'transaction-list',
    template:`
    	<table class="mdDataTable">
                <thead>
                    <tr>
                     	<th class="leftAlignedColumn">Id</th>
                     	<th class="leftAlignedColumn">Payee</th>
                     	<th class="leftAlignedColumn">Amount</th>
                     	<th class="leftAlignedColumn">Balance</th>
                    </tr>
                    
                </thead>
                
                 <tbody>
                    <tr *ngFor="#transaction of transactions">
                        <td class="column leftAlignedColumn">{{transaction.id}}</td>
                        <td class="column leftAlignedColumn">{{transaction.payeeName}}</td>
                        <td class="column leftAlignedColumn">{{transaction.amount | currency}}</td>
                        <td class="column leftAlignedColumn">{{transaction.balance| currency}}</td>
                    </tr>
                </tbody>
                
                
        </table>
       
      `,
    styles: [`    
    
    .mdDataTable {
  font-size: 15px;
  width: 100%;
  border-collapse: collapse;

}
.mdDataTable table {

}
.mdDataTable td, .mdDataTable th {
  padding: 0;
  margin: 0;
}
.mdDataTable th {
  font-size: 12px;
  font-weight: 500;
  color: #757575;

  white-space: nowrap;
  /* when hoverSortIcons on a non-sorted column*/
  /* when hoverSortIcons on a sorted column*/
}
.mdDataTable th .hoverSortIcons ng-md-icon {
  visibility: hidden;
  fill: #b3b3b3;
}
.mdDataTable th:hover .hoverSortIcons ng-md-icon {
  visibility: visible;
}
.mdDataTable th .sortedColumn .hoverSortIcons ng-md-icon {
  display: none;
}
.mdDataTable th .sortedColumn ng-md-icon {
  fill: #212121;
}
.mdDataTable th svg {
  -webkit-transform: rotate(90deg);
}
.mdDataTable .mdDataTable-header, .mdDataTable .mdDataTable-header-alternate {
  height: 64px;
  padding-left: 24px;
  padding-right: 14px;
}
.mdDataTable .mdDataTable-header md-button, .mdDataTable .mdDataTable-header-alternate md-button {
  margin-left: 24px;
}
.mdDataTable .mdDataTable-header ng-md-icon, .mdDataTable .mdDataTable-header-alternate ng-md-icon {
  fill: #757575;
}
.mdDataTable .mdDataTable-header-alternate {
  background-color: #e3edfd;
}
.mdDataTable .mdDataTable-header-alternate .alternate-text {
  color: #0D47A1;
}
.mdDataTable .mdDataTable-footer, .mdDataTable tr th {
  height: 56px;
}
.mdDataTable .checkboxCell {
  width: 18px;
  /*the next cell should not have just 24px padding */
}
.mdDataTable .checkboxCell md-checkbox {
  margin: 0;
  padding: 0;
}
.mdDataTable .checkboxCell + td, .mdDataTable .checkboxCell + th {
  padding-left: 24px;
}
.mdDataTable tr td {
  padding: 0;
  height: 48px;
  font-size: 13px;
  color: #212121;
}
.mdDataTable td:first-child, .mdDataTable th:first-child {
  padding: 0 0 0 24px;
}
.mdDataTable td:last-child, .mdDataTable th:last-child {
  padding-right: 24px;
}
.mdDataTable .column {
  /* padding-left: 56px; */
}
.mdDataTable .leftAlignedColumn {
  text-align: left;
}
.mdDataTable .rightAlignedColumn {
  text-align: right;
}
.mdDataTable tr th {
  border-bottom: solid 1px #DDDDDD;
}
.mdDataTable tr td {
  border-bottom: solid 1px #DDDDDD;
}
.mdDataTable tr:hover td {
  background: #EEEEEE;
}
.mdDataTable .selectedRow td {
  background: #F5F5F5;
}
.alternate {
    color: #1e88e5;
	background-color: #e3f2fd;
}
    
    
    `],
    
    providers: [TransactionService]
})


export class TransactionListComponent implements OnInit {
   
  constructor(private _transactionService: TransactionService) {}
  public transactions: Transaction[];
  ngOnInit() {
	  this.getTransactions();
	}
	getTransactions() {
	  this._transactionService.getTransactions().then(transactions => this.transactions = transactions);
	}
	
}
