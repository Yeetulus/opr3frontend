import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {CategoryService} from "../../services/category-service/category.service";
import {Category} from "../category-component/category.component";
import {Observable} from "rxjs";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  showCompleted: boolean = false;
  categories: Observable<Category[]> = new Observable<Category[]>();

  constructor(private router: Router, public categoryService: CategoryService) {}

  navigateToAddCategory() {
    this.router.navigate(['/main/add-category']);
  }

  navigateToAddTask() {
    this.router.navigate(['/main/add-task']);
  }

  ngOnInit() {
    this.categories = this.categoryService.getCategories();
    const storedValue = localStorage.getItem('showCompleted');
    if (storedValue !== null) {
      this.showCompleted = JSON.parse(storedValue);
    }
  }

  onSlideToggleChange() {
    localStorage.setItem('showCompleted', JSON.stringify(this.showCompleted));
    this.categoryService.updateDisplayedTasks();
  }
}
