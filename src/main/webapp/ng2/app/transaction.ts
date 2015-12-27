
export enum TransactionType {Static, Discretionary, Future,Income,Other};

export interface Transaction {
  transactionType: TransactionType;
  id: number;
  amount: number;
  balance: number;
  payeeName: string;
}

