import {Injectable} from "@angular/core";

export interface Filters {
  payee: string;
  month: string;
}

export class User {

  email: string;
  logoutURL: string;


}

export enum TransactionType {
  i,s,d,f

}


export class Transaction {
  name: string;
  payee: string;
  date: string;
  amount: string;
  type: string;
  balance: number;
  memo: string;
  today: boolean;

}

export class Entity {
  key: Key;
  propertyMap: PropertyMap;

}
export class Error {
  message: String;

}

export class CashFlow {
  month: string;
  income: number =0;
  future: number= 0;
  static: number =0;
  other: number= 0;
  cashFlow: number =0;
  discretionary: number =0;
  averageCashFlow: number= 0;
  monthlyCashFlow: number = 0;
  thisMonth: boolean;

}

export class Payee {
  name: string;
  type: string;
  description: string;
  total: string;
  lastAmount: string;
  average: string;
  thisMonth: string;
  lastMonth: string;
}


export class Key {
  id:number;

}

export class Response {

  success: Success;
  error: Error;

}

export class PropertyMap {

}

export class Success {

  message: string;

}
export interface Lookup {
  id: string;
  value: string;

}


@Injectable()
export class Repo {
  types: Lookup[] = [
    {id: "i", value: "Income"},{id: "s", value: "Static"},{id: "d", value: "Discretionary"},{id: "f", value: "Future"},{id: "o", value: "Other"}];


}
