import { Component,OnInit } from '@angular/core';

import {TransactionComponent} from './transaction.component';


@Component({
    selector: 'my-app',
    templateUrl:'app/app.component.html',
    directives: [TransactionComponent],
})

export class AppComponent {
	public title = 'Cloud Balance v2';
}


