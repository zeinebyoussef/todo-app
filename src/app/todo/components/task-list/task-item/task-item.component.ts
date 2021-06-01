import { Observable, of } from 'rxjs';
import { TaskError, TaskLoading } from './../../../models/task';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Task } from 'src/app/todo/models/task';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
})
export class TaskItemComponent implements OnInit {
  @Input() task!: Task;
  @Input() errors: TaskError | null = {};
  @Input() loadings: TaskLoading | null = {};

  @Output() editedTask = new EventEmitter<Task>();
  @Output() taskUuid = new EventEmitter<string>();

  updateForm: FormGroup = new FormGroup({});
  editing: boolean = false;

  constructor() {}

  ngOnInit(): void {
    //initialize update form
    this.updateForm = new FormGroup({
      name: new FormControl(''),
    });
  }

  //form control accessor
  get name() {
    return this.updateForm.get('name');
  }

  //on edit callback
  editTask() {
    //emit new task
    this.editedTask.emit({ uuid: this.task.uuid, name: this.name?.value });

    //wait for errors before hiding input
    setTimeout(() => {
      if (this.errors && this.errors[this.task.uuid]?.status) return;
      this.editing = false;
    }, 50);
  }

  //on delete callback
  deleteTask() {
    //alert before delete
    const deleteConfirm = confirm(
      'êtes-vous sure de bien vouloir supprimer cette tache?'
    );

    //if confirmed emit current uuid
    if (deleteConfirm) this.taskUuid.emit(this.task.uuid);
  }
}
