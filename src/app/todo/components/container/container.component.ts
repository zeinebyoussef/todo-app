import {
  getError,
  TaskState,
  requestAddTask,
  getLoading,
} from './../../store/task.store';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
})
export class ContainerComponent implements OnInit {
  //add form definition
  addForm: FormGroup = new FormGroup({});
  error$: Observable<any> = of({});
  loading$: Observable<any> = of({});

  constructor(private store: Store<TaskState>) {}

  ngOnInit(): void {
    //add form initialisation
    this.addForm = new FormGroup({
      name: new FormControl(''),
    });

    //get All errors and extract add errors
    this.error$ = this.store.pipe(
      select(getError()),
      map((errors) => (errors?.add ? errors.add : { status: false })),
      shareReplay()
    );

    //get All loading
    this.loading$ = this.store.pipe(
      select(getLoading()),
      map((loadings) => (loadings?.add ? loadings.add : false)),
      shareReplay()
    );
  }

  //name form control getter
  get name() {
    return this.addForm.get('name');
  }

  //on add callback
  addTask() {
    //do nothing if form invalid
    if (this.addForm.invalid) return;

    //dispatch add task request action
    this.store.dispatch(requestAddTask({ name: this.name?.value }));

    //reset form input
    setTimeout(() => this.addForm.reset(), 500);
  }
}
