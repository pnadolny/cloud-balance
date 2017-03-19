import {Component, EventEmitter, Output, Inject} from "@angular/core";
import {FormGroup, FormControl} from "@angular/forms";
import 'rxjs/add/operator/debounceTime';

@Component({
  selector: 'filters-cmp',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersCmp {
  @Output() change = new EventEmitter();

  filters = new FormGroup({
    payee: new FormControl(),
    month: new FormControl()
  });

  constructor(@Inject('createFiltersObject') createFilters: Function) {
    this.filters.valueChanges.distinctUntilChanged().debounceTime(200).subscribe((value) => {
      this.change.next(createFilters(value));
    });
  }
}
