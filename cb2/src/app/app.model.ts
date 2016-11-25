import {Injectable} from "@angular/core";
export class Transaction {
  name: string;
  payee: string;
  date: string;
  amount: string;
  type: string;
  balance: number;
  memo: string;

}

export class Entity {
  key: Key;


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
