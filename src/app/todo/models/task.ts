//task models
export interface Task {
  uuid: string;
  name: string;
}
//error model 
export interface TaskError {
  [key: string]: { status: boolean; message: string };
}
//loading model
export interface TaskLoading {
  [key: string]: boolean;
}
