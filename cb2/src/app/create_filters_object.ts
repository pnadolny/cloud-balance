import {Filters} from "./app.model";

export function createFiltersObject({payee,month}: {payee: string, month: string}): Filters {
  return {payee,month};
}
