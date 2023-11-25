import {Injectable} from '@angular/core';
import {Category} from "../../components/category-component/category.component";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, catchError, map, Observable, tap} from "rxjs";
import { Task } from 'src/app/components/task-component/task.component';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = 'http://localhost:8080/api';
  private categoriesSubject: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  private tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
  private categoriesLoaded: boolean = false;

  constructor(private http: HttpClient) {
    this.fetchCategories();
  }

  getCategories(): Observable<Category[]> {
    if (!this.categoriesLoaded) {
      this.fetchCategories();
    }

    return this.categoriesSubject.asObservable();
  }
  getDisplayedTasks(): Observable<Task[]> {

    return this.tasksSubject.asObservable();
  }

  public updateDisplayedTasks(): void {
    this.categoriesSubject.pipe(
      map(categories => this.combineAndSortTasks(categories)),
    ).subscribe(filteredTasks => {
      this.tasksSubject.next(filteredTasks);
    });
  }

  private combineAndSortTasks(categories: Category[]): Task[] {
    const allTasks: Task[] = [];

    categories.forEach(category => {
      if (category.isVisible && category.tasks) {
        const filteredTasks = this.filterCompletedTasks(category.tasks);
        allTasks.push(...filteredTasks);
      }
    });

    return this.sortTasks(allTasks);
  }

  private sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      const dateA = a.fromDate instanceof Date ? a.fromDate.getTime() : Number.MAX_SAFE_INTEGER;
      const dateB = b.fromDate instanceof Date ? b.fromDate.getTime() : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });
  }
  private filterCompletedTasks(tasks: Task[]): Task[] {
    const showCompleted = localStorage.getItem('showCompleted') === 'true';

    if (showCompleted) {
      return tasks;
    } else {
      return tasks.filter(task => !task.completed);
    }
  }

  createCategory(category: Category): Observable<Category> {
    const accessToken = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    });
    return this.http.post<Category>(`${this.baseUrl}/categories/create`, category, { headers })
      .pipe(tap(createdCategory => this.updateCategories(createdCategory)));
  }

  private updateCategories(newCategory: Category): void {
    const currentCategories = this.categoriesSubject.getValue();
    const updatedCategories = [...currentCategories, newCategory];
    this.categoriesSubject.next(updatedCategories);
  }

  private fetchCategories(): void {
    const accessToken = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    });

    this.http.get<Category[]>(`${this.baseUrl}/categories/get-all`, { headers })
      .subscribe(categories => {
        this.categoriesSubject.next(categories);
        this.categoriesLoaded = true;

        this.setupCategories(categories);
        this.updateDisplayedTasks();
      });
  }

  private setupCategories(categories: Category[]) {
    categories.forEach(category => {
      category.isVisible = true;
      if (category.tasks) {
        category.tasks.forEach(task => {
          task.category = category;
          task.subtasks?.forEach(subtask => subtask.category = category);
        });
      }
    });
  }

  public updateTask(task: Task) {
    this.updateDisplayedTasks();

    const accessToken = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
    const endpoint = `${this.baseUrl}/tasks/edit`;
    const body = this.convertTaskToTaskRequest(task);

    return this.http.put(endpoint, body, { headers }).subscribe(data =>
      console.log(data));
  }
  private convertTaskToTaskRequest(task: Task): any {
    return {
      name: task.name,
      id: task.id,
      description: task.description,
      categoryId: task.category.id,
      completed: task.completed,
      fromDate: task.fromDate,
      toDate: task.toDate,
      subtasks: task.subtasks? task.subtasks.map(subtask => this.convertTaskToTaskRequest(subtask)) : undefined,
    };
  }

}
