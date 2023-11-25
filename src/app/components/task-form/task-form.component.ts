import { Component } from '@angular/core';
import {CategoryService} from "../../services/category-service/category.service";

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent {

  constructor(public categoryService: CategoryService) {
  }
}
