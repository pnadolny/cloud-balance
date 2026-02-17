export interface Transaction {
  name: string;
  payee: string;
  amount: number;
  date: Date;
  memo: string;
  type: TransactionType;
  marked: string;
  balance?: number;
  today?: boolean;
}

export interface Payee {
  name: string;
  type: TransactionType;
}

export interface User {
  email: string;
  logoutURL: string;
}

export interface CashFlow {
  month: string;
  thisMonth: boolean;
  monthlyCashFlow: number;
  income: number;
  static: number;
  discretionary: number;
  future: number;
  other: number;
}

export enum TransactionType {
  i = 'i', // Income
  s = 's', // Static
  d = 'd', // Discretionary
  f = 'f', // Future
}

export interface Filters {
  payee?: string;
  month?: string;
}
