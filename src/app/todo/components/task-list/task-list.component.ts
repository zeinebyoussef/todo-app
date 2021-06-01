import { TaskError, TaskLoading } from './../../models/task';
import {
  getAllTasks,
  TaskState,
  requestAllTasks,
  requestUpdateTask,
  requestDeleteTask,
  getError,
  getLoading,
} from './../../store/task.store';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Task } from '../../models/task';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  tasks$: Observable<Task[]> = of([]);
  errors$: Observable<TaskError> = of({});
  loadings$: Observable<TaskLoading> = of({});

  constructor(private store: Store<TaskState>) {}

  ngOnInit(): void {
    //initialize tasks list
    this.store.dispatch(requestAllTasks());
    //get all tasks
    this.tasks$ = this.store.pipe(select(getAllTasks), shareReplay());
    //get all errors
    this.errors$ = this.store.pipe(select(getError()), shareReplay());
    //get all loading
    this.loadings$ = this.store.pipe(select(getLoading()), shareReplay());
  }

  //on editTask emitted
  updateTask(task: Task) {
    //dispatch requestUpdate action
    this.store.dispatch(requestUpdateTask({ task: task }));
  }

  //on taskUuid emitted
  removeTask(uuid: string) {
    //dispatch delete request action
    this.store.dispatch(requestDeleteTask({ uuid: uuid }));
  }
  //DOM indexing
  trackByUuid(index: number, item: Task) {
    return item.uuid; // unique id corresponding to the item
  }
}
