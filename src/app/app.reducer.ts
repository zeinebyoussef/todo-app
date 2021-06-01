import { ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

import * as fromTask from './todo/store/task.store';


export interface AppState {
  Task: fromTask.TaskState;
}

export const reducers: ActionReducerMap<AppState> = {
  Task: fromTask.reducer,
};

const reducerKeys = ['Task'];
export function localStorageSyncReducer(
  reducer: ActionReducer<any>
): ActionReducer<any> {
  return localStorageSync({ keys: reducerKeys })(reducer);
}

export const metaReducers: MetaReducer<AppState>[] = [localStorageSyncReducer];
