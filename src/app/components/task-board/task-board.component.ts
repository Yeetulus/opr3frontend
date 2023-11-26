import {Component, OnInit} from '@angular/core';
import {CategoryService} from "../../services/category-service/category.service";
import { Task } from '../task-component/task.component';
import {Observable} from "rxjs";

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css'],
})
export class TaskBoardComponent implements OnInit {
  tasks : Observable<Task[]> = new Observable<Task[]>();
  constructor(public categoryService: CategoryService) {}

  ngOnInit(): void {
    this.tasks = this.categoryService.getDisplayedTasks();
    this.tasks.subscribe();
  }
}
