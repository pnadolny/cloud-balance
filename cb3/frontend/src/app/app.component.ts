import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import * as moment from 'moment';

import { ApiService } from './api.service';
import { Transaction, Payee, CashFlow, TransactionType } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly UTC = 'YYYY-MM-DD HH:mm:ss.SSS-05:00';

  // Signals for reactive state
  transactions = signal<Transaction[]>([]);
  payees = signal<Payee[]>([]);
  email = signal<string>('Loading...');
  logoutURL = signal<string>('');

  // Computed values
  todaysBalance = computed(() => {
    const txs = this.transactions();
    const today = moment().add(1, 'd');
    
    let balance = 0;
    for (const t of txs) {
      if (moment.utc(t.date, this.UTC).isBefore(today)) {
        balance += Number(t.amount);
      }
    }
    return balance;
  });

  balanceBeforeIncome = computed(() => {
    const txs = this.transactions();
    
    // Find next income transaction
    const nextIncome = txs
      .filter(t => moment.utc(t.date, this.UTC).isAfter(moment()))
      .filter(t => t.type === TransactionType.i)
      .reduce((prev, next) => {
        if (!prev) return next;
        return moment.utc(prev.date, this.UTC).isBefore(moment.utc(next.date, this.UTC)) 
          ? prev : next;
      }, null as Transaction | null);

    if (!nextIncome) return 0;

    // Calculate balance before that income
    let balance = 0;
    for (const t of txs) {
      if (moment.utc(t.date, this.UTC).isBefore(moment.utc(nextIncome.date, this.UTC))) {
        if (t.type !== TransactionType.i) {
          balance += Number(t.amount);
        }
      }
    }
    return balance;
  });

  cashFlow = computed(() => {
    const txs = this.transactions();
    const flows: CashFlow[] = [];
    let currentMonth = 'x';
    let cf: CashFlow = this.newCashFlow();

    for (const t of txs) {
      const txMonth = moment(t.date).format('MMM');
      
      if (currentMonth !== txMonth) {
        cf = this.newCashFlow();
        flows.push(cf);
      }

      cf.thisMonth = moment().format('MMM') === txMonth;
      const amount = Number(t.amount);
      cf.month = txMonth;
      cf.monthlyCashFlow += amount;

      switch (t.type) {
        case TransactionType.i:
          cf.income += amount;
          break;
        case TransactionType.s:
          cf.static += amount;
          break;
        case TransactionType.d:
          cf.discretionary += amount;
          break;
        case TransactionType.f:
          cf.future += amount;
          break;
        default:
          cf.other += amount;
      }
      currentMonth = cf.month;
    }

    return flows;
  });

  displayedColumns: string[] = ['date', 'payee', 'amount', 'memo', 'balance', 'actions'];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadTransactions();
    this.loadPayees();
  }

  private loadUser(): void {
    this.apiService.getUser().subscribe({
      next: (users) => {
        if (users.length > 0) {
          this.email.set(users[0].email);
          this.logoutURL.set(users[0].logoutURL);
        }
      },
      error: (err) => console.error('Error loading user:', err)
    });
  }

  private loadTransactions(): void {
    this.apiService.getTransactions().subscribe({
      next: (txs) => {
        // Sort by date descending and calculate balances
        const sorted = txs.sort((a, b) => 
          moment(b.date).valueOf() - moment(a.date).valueOf()
        );

        let balance = 0;
        for (const t of sorted) {
          t.today = moment().dayOfYear() === moment.utc(t.date, this.UTC).dayOfYear();
          balance += Number(t.amount);
          t.balance = balance;
        }

        this.transactions.set(sorted);
      },
      error: (err) => console.error('Error loading transactions:', err)
    });
  }

  private loadPayees(): void {
    this.apiService.getPayees(moment().year()).subscribe({
      next: (payees) => this.payees.set(payees),
      error: (err) => console.error('Error loading payees:', err)
    });
  }

  deleteTransaction(transaction: Transaction): void {
    if (!confirm('Delete this transaction?')) return;

    this.apiService.deleteTransaction(transaction).subscribe({
      next: () => {
        const txs = this.transactions().filter(t => t.name !== transaction.name);
        this.transactions.set(txs);
        this.snackBar.open('Deleted', '', { duration: 500 });
      },
      error: (err) => {
        this.snackBar.open('Error: ' + err.message, 'OK');
      }
    });
  }

  private newCashFlow(): CashFlow {
    return {
      month: '',
      thisMonth: false,
      monthlyCashFlow: 0,
      income: 0,
      static: 0,
      discretionary: 0,
      future: 0,
      other: 0
    };
  }

  get todaysDate(): string {
    return moment().format('MM/DD/YYYY');
  }

  get currentMonth(): string {
    return moment().format('MMMM');
  }

  get transactionCount(): number {
    return this.transactions().length;
  }

  get payeeCount(): number {
    return this.payees().length;
  }
}
