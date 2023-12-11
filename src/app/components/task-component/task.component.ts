import {Component, Input} from '@angular/core';
import {Category} from "../category-component/category.component";
import {CategoryService} from "../../services/category-service/category.service";
import {Router} from "@angular/router";


export function stringify(obj: any) {
  let cache: any[] = [];
  let str = JSON.stringify(obj, function (key, value) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);

      if (key === 'subtasks') {
        return value.map((subtask: any) => ({
          id: subtask.id,
          name: subtask.name,
          description: subtask.description,
          fromDate: subtask.fromDate,
          toDate: subtask.toDate,
          completed: subtask.completed,
          subtasks: [],
        }));
      }
    }
    return key === 'category' ? { id: value.id, name: value.name } : value;
  });

  cache = [];
  return str;
}


export class Task{
  id: number;
  name: string;
  completed: boolean;
  category: Category;
  description?: string | undefined;
  subtasks?: Task[] | undefined;
  parentTask?: Task | undefined;
  fromDate?: Date | undefined;
  toDate?: Date | undefined;
  constructor(
    id: number,
    name: string,
    completed: boolean,
    category: Category,
    subtasks?: Task[],
    fromDate?: Date,
    toDate?: Date,
    description?: string,
    parentTask?: Task,
  ) {
    this.id = id;
    this.name = name;
    this.completed = completed;
    this.category = category;
    this.description = description;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.parentTask = parentTask;
    this.subtasks = subtasks;
  }

  static fromJSON(json: any): Task {
    const reviver = (key: string, value: any) => {
      if (key === 'fromDate' || key === 'toDate') {
        return value ? new Date(value) : undefined;
      }
      return value;
    };

    return Object.assign(new Task(0, '', false, new Category(0, '', '', '', [])), JSON.parse(json, reviver));
  }

}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent {

  @Input() task!: Task;
  hoveringDelete : boolean = false;

  constructor(private categoryService: CategoryService, public router: Router){}

  onTaskClick(task: Task) {
    task.completed = !task.completed;

    if(task === this.task){
      this.task.subtasks?.forEach(t =>{
        t.completed = task.completed;
      });
    }
    else if (this.task.subtasks) {
      const allSubtasksCompleted = this.task.subtasks.every(t => t.completed);

      if (allSubtasksCompleted) {
        this.task.completed = true;
      }
      else if(!task.completed && this.task.completed){
        this.task.completed = false;
      }
    }
    this.categoryService.updateTask(this.task);
  }

  editTask() {
    this.router.navigate(["main/edit-task", {task: stringify(this.task)}])
  }
  removeTask() {
    this.categoryService.deleteTask(this.task);
  }
}
