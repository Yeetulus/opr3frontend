import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {CategoryService} from "../../services/category-service/category.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  showCompleted: boolean = false;

  constructor(private router: Router, public categoryService: CategoryService) {}

  navigateToAddCategory() {
    this.router.navigate(['/main/add-category']);
  }

  navigateToAddTask() {
    this.router.navigate(['/main/add-task']);
  }

  ngOnInit() {
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
