import { Component, OnInit } from '@angular/core';
import {Category} from "../category-component/category.component";
import {CategoryService} from "../../services/category-service/category.service";
import {map} from "rxjs";
import { Task } from '../task-component/task.component';

@Component({
  selector: 'app-task-board',
  templateUrl: './task-board.component.html',
  styleUrls: ['./task-board.component.css'],
})
export class TaskBoardComponent implements OnInit {

  constructor(public categoryService: CategoryService) {}

  ngOnInit(): void {
  }
}
