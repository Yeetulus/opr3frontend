import {Component, OnInit} from '@angular/core';
import {CategoryService} from "../../services/category-service/category.service";
import { Task } from '../task-component/task.component';

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css'],
})
export class TaskBoardComponent implements OnInit {
  tasks : Task[] = [];
  constructor(public categoryService: CategoryService) {}

  ngOnInit(): void {
    this.categoryService.tasksSubject.subscribe(newTasks => {
      this.tasks = newTasks;
    });
  }
}
