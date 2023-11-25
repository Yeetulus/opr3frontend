import {Component, Input, OnInit} from '@angular/core';
import {Task } from '../task-component/task.component';
import {CategoryService} from "../../services/category-service/category.service";

export class Category {
  id : number;
  name: string;
  color: string;
  description: string | undefined;
  tasks: Task[] | undefined;
  public isVisible: boolean = true;
  constructor(
    categoryId: number,
    name: string,
    color: string,
    description?: string,
    tasks?: Task[]
  ) {
    this.id = categoryId;
    this.name = name;
    this.color = color;
    this.description = description;
    this.tasks = tasks;
  }
}

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit{

  @Input() category!: Category;

  constructor(private service: CategoryService){

  }

  ngOnInit(): void {
  }

  onCheckboxChange() {
    this.category.isVisible = !this.category.isVisible;
    this.service.updateDisplayedTasks();
  }

  onClick() {
    this.onCheckboxChange();
  }
}
