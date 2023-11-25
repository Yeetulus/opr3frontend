import {Component, Input, OnInit} from '@angular/core';
import {Category} from "../category-component/category.component";
import {CategoryService} from "../../services/category-service/category.service";

export enum TaskType {
  Simple = 'SIMPLE',
  Complex = 'COMPLEX',
}

export class Task{
  id: number;
  name: string;
  taskType: TaskType;
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
    taskType: TaskType,
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
    this.taskType = taskType;
    this.completed = completed;
    this.category = category;
    this.description = description;
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.parentTask = parentTask;
    this.subtasks = subtasks;
  }
}

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit{

  @Input() task!: Task;

  constructor(private categoryService: CategoryService){}
  ngOnInit(): void {
  }


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
}
