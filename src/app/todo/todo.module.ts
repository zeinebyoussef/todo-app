import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './components/container/container.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { EffectsModule } from '@ngrx/effects';
import * as fromTask from './store/task.store';
import { TaskItemComponent } from './components/task-list/task-item/task-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [ContainerComponent, TaskListComponent, TaskItemComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    StoreModule.forFeature('Task', fromTask.reducer),
    EffectsModule.forFeature([fromTask.TaskEffect]),
  ],
  exports: [ContainerComponent],
})
export class TodoModule {}
