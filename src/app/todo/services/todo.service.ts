import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  //API url
  API = 'http://localhost:3000/task/';

  constructor(private http: HttpClient) {}

  //get All Tasks
  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API}list`);
  }

  // Add a new task
  addTask(name: string): Observable<Task> {
    return this.http.post<Task>(`${this.API}`, { name: name });
  }

  //update a task
  updateTask(oldTask: Task, newName: string): Observable<Task> {
    return this.http.put<Task>(`${this.API}${oldTask.uuid}`, {
      newName: newName,
      oldName: oldTask.name,
    });
  }

  //delete a task
  deleteTask(uuid: string): Observable<Task> {
    return this.http.delete<Task>(`${this.API}${uuid}`);
  }
}
