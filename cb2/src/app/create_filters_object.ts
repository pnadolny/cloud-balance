import {Filters} from "./app.model";

export function createFiltersObject({payee}: {payee: string}): Filters {
  return {payee};
}
