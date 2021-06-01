import { TaskLoading, TaskError, Task } from './../models/task';
import { TodoService } from './../services/todo.service';

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import {
  createFeatureSelector,
  createSelector,
  createAction,
  props,
  createReducer,
  Action,
  on,
  Store,
  select,
} from '@ngrx/store';

import { catchError, exhaustMap, first, switchMap, tap } from 'rxjs/operators';

//_______________________________________________________________________________
//State:

//state definition
export interface TaskState extends EntityState<Task> {
  loading: TaskLoading;
  error: TaskError;
}

//entity adapter initialization
export const adapter: EntityAdapter<Task> = createEntityAdapter<Task>({
  selectId: selectTaskId,
});

export function selectTaskId(a: Task): string {
  return a.uuid;
}
//state initialisation
export const initialState: TaskState = adapter.getInitialState({
  loading: {},
  error: {},
});

//_______________________________________________________________________________
//Selectors:
export const selectTaskState = createFeatureSelector<TaskState>('Task');

// get the selectors
const { selectIds, selectEntities, selectAll } = adapter.getSelectors();

// select the array of Task ids
export const selectTaskIds = selectIds;

// select the dictionary of Task entities
export const selectTaskEntities = selectEntities;

// select the array of Tasks
export const selectAllTasks = selectAll;

export const getTasktIds = createSelector(
  selectTaskState,
  selectTaskIds // shorthand for TasksState => fromTask.selectTaskIds(TasksState)
);
export const getTaskEntities = createSelector(
  selectTaskState,
  selectTaskEntities
);
export const getAllTasks = createSelector(selectTaskState, selectAllTasks);

//select all loading
export const getLoading = () =>
  createSelector(selectTaskState, (state) => state.loading);

//select all errors
export const getError = () =>
  createSelector(selectTaskState, (state) => state.error);

export const getTaskById = (uuid: string) =>
  createSelector(getTaskEntities, (entities: any) => entities[uuid]);

//_______________________________________________________________________________
// Actions:
export const requestAllTasks = createAction('[Task] request all tasks');

export const requestUpdateTask = createAction(
  '[Task] request update task',
  props<{ task: Task }>()
);
export const requestDeleteTask = createAction(
  '[Task] request delete task',
  props<{ uuid: string }>()
);
export const requestAddTask = createAction(
  '[Task] request add Task',
  props<{ name: string }>()
);

export const setLoading = createAction(
  '[Task] request set loading',
  props<{ actionType: string; status: boolean }>()
);

export const setError = createAction(
  '[Task] request set error',
  props<{ actionType: string; status: boolean; message?: string }>()
);
export const upsertTask = createAction(
  '[Task] Upsert Task',
  props<{ task: Task }>()
);
export const addTasks = createAction(
  '[Task] Add Tasks',
  props<{ tasks: Task[] }>()
);
export const upsertTasks = createAction(
  '[Task] Upsert Tasks',
  props<{ tasks: Task[] }>()
);
export const removeTask = createAction(
  '[Task] remove Task',
  props<{ uuid: string }>()
);
export const clearTasks = createAction('[Task] Clear Tasks');

//_______________________________________________________________________________
//Reducers:
//state modifying actions definition
const taskReducer = createReducer(
  initialState,

  on(upsertTask, (state, { task }) => {
    return adapter.upsertOne(task, state);
  }),
  on(addTasks, (state, { tasks }) => {
    return adapter.addMany(tasks, state);
  }),
  on(upsertTasks, (state, { tasks }) => {
    return adapter.upsertMany(tasks, state);
  }),
  on(removeTask, (state, { uuid }) => {
    return adapter.removeOne(uuid, state);
  }),
  on(setLoading, (state, { actionType, status }) => {
    return {
      ...state,
      loading: { ...state.loading, [actionType]: status },
    };
  }),
  on(setError, (state, { actionType, status, message }) => {
    return {
      ...state,
      error: {
        ...state.error,
        [actionType]: { status: status, message: message ? message : '' },
      },
    };
  })
);

//feature reducer export
export function reducer(state: TaskState | undefined, action: Action) {
  return taskReducer(state, action);
}

//______________________________________________________________________________________________
//Effect:
@Injectable()
export class TaskEffect {
  constructor(
    private action$: Actions,
    private todoService: TodoService,
    private store: Store<TaskState>
  ) {}

  // request all tasks side effect
  requestAllTasks$ = createEffect(() =>
    this.action$.pipe(
      ofType(requestAllTasks),
      tap(() => {
        // set loading true
        this.store.dispatch(
          setLoading({ actionType: 'showAll', status: true })
        );
      }),
      switchMap(() =>
        this.todoService.getAll().pipe(
          // get all tasks api call
          switchMap((tasks) => [
            upsertTasks({ tasks: tasks }), // add all tasks to the store
            setLoading({ actionType: 'showAll', status: false }), // set loading false
            setError({ actionType: 'showAll', status: false }), // set error false
          ]),
          catchError((err) => [
            // set error true + message
            setError({
              actionType: 'showAll',
              status: true,
              message: err.error,
            }),
            setLoading({ actionType: 'showAll', status: false }), // set loading false
          ])
        )
      )
    )
  );

  //request add task side effect
  requestAddTask$ = createEffect(() =>
    this.action$.pipe(
      ofType(requestAddTask),
      tap(() => {
        // set loading true
        this.store.dispatch(setLoading({ actionType: 'add', status: true }));
      }),
      switchMap(({ name }) =>
        this.todoService.addTask(name).pipe(
          // add task Api call
          switchMap((task) => [
            upsertTask({ task: task }), //add new tsk to store
            setLoading({ actionType: 'add', status: false }), // set loading false
            setError({ actionType: 'add', status: false }), // set error false
          ]),
          catchError((err) => [
            setError({ actionType: 'add', status: true, message: err.error }), // set error true + message

            setLoading({ actionType: 'add', status: false }), // set loading false
          ])
        )
      )
    )
  );

  //requesst update side effect
  requestUpdateTask$ = createEffect(() =>
    this.action$.pipe(
      ofType(requestUpdateTask),
      tap(({ task }) => {
        // set loading true
        this.store.dispatch(
          setLoading({ actionType: task.uuid, status: true })
        );
      }),
      exhaustMap(({ task }) =>
        this.store.pipe(
          select(getTaskById(task.uuid)), //get task currentlu stored
          first(),
          tap(console.log),
          switchMap((oldTask) =>
            //update task api call
            this.todoService.updateTask(oldTask, task.name).pipe(
              switchMap((task) => [
                upsertTask({ task: task }), // update task in store
                setLoading({ actionType: task.uuid, status: false }), //set loading false
                setError({ actionType: task.uuid, status: false }), //set error false
              ]),
              catchError((err) => [
                //set error true &message
                setError({
                  actionType: task.uuid,
                  status: true,
                  message: err.error,
                }),
                setLoading({ actionType: task.uuid, status: false }), //set loading false
              ])
            )
          )
        )
      )
    )
  );

  //request delete side effect
  requestDeleteTask$ = createEffect(() =>
    this.action$.pipe(
      ofType(requestDeleteTask),
      tap(({ uuid }) => {
        // set loading true
        this.store.dispatch(setLoading({ actionType: uuid, status: true }));
      }),
      switchMap(({ uuid }) =>
        //delete task api call
        this.todoService.deleteTask(uuid).pipe(
          switchMap((task) => [
            removeTask({ uuid: uuid }), //remove task from store
            setLoading({ actionType: uuid, status: false }), //set loading false
            setError({ actionType: uuid, status: false }), //set error false
          ]),
          catchError((err) => [
            //set error true &message
            setError({
              actionType: uuid,
              status: true,
              message: err.error,
            }),
            setLoading({ actionType: uuid, status: false }), //set loading false
          ])
        )
      )
    )
  );
}
