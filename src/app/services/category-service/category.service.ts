import {Injectable} from '@angular/core';
import {Category} from "../../components/category-component/category.component";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, map, Observable, tap} from "rxjs";
import {Task} from 'src/app/components/task-component/task.component';
import {NotificationService, NotificationType} from "../notification-service/notification.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = 'http://localhost:8080/api';
  private categoriesSubject: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  private tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);

  constructor(private http: HttpClient, public notificationService:NotificationService, public router: Router) {
    this.fetchCategories();
  }

  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }
  getDisplayedTasks(): Observable<Task[]> {

    return this.tasksSubject.asObservable();
  }

  public updateDisplayedTasks(): void {
    this.categoriesSubject.pipe(
        map(categories => this.combineAndSortTasks(categories)),
        tap(filteredTasks => this.tasksSubject.next(filteredTasks))
    ).subscribe();

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
          const dateA = a.fromDate? Date.parse(a.fromDate.toString()) : Number.MIN_SAFE_INTEGER;
        const dateB = b.fromDate? Date.parse(b.fromDate.toString()) : Number.MIN_SAFE_INTEGER;

          return dateA > dateB? 1 : (dateA < dateB? -1 : 0);
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
    const headers = this.getHeaders();
    return this.http.post<Category>(`${this.baseUrl}/categories/create`, category, { headers })
      .pipe(tap(createdCategory => this.updateCategories(createdCategory)));
  }

  private updateCategories(newCategory: Category): void {
    const currentCategories = this.categoriesSubject.getValue();
    const updatedCategories = [...currentCategories, newCategory];
    this.categoriesSubject.next(updatedCategories);
  }

  private fetchCategories(): void {
    const headers = this.getHeaders();

    this.http.get<Category[]>(`${this.baseUrl}/categories/get-all`, { headers })
        .pipe(
            tap(categories => {
              this.setupCategories(categories);
              this.categoriesSubject.next(categories);
            }),
            tap(() => this.updateDisplayedTasks())
        )
        .subscribe();
  }

  private getHeaders() {
    const accessToken = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
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

    const headers = this.getHeaders();
    const endpoint = `${this.baseUrl}/tasks/edit`;
    const body = this.convertTaskToTaskRequest(task);

    this.http.put(endpoint, body, { headers }).subscribe(data =>
      console.log(data));
    this.updateDisplayedTasks();

  }
  private convertTaskToTaskRequest(task: Task): any {
    return {
      name: task.name,
      id: task.id? task.id : -1,
      description: task.description,
      categoryId: task.category.id,
      completed: task.completed,
      fromDate: task.fromDate,
      toDate: task.toDate,
      subtasks: task.subtasks? task.subtasks.map(subtask => this.convertTaskToTaskRequest(subtask)) : undefined,
    };
  }

  createTask(task: Task){
    const url = `${this.baseUrl}/tasks/create`;
    const headers = this.getHeaders();
    const taskRequest = this.convertTaskToTaskRequest(task);
    this.http.post<Task>(url, taskRequest, { headers }).subscribe(
      (createdTask: Task) => {
        console.log(createdTask);
        this.notificationService.showNotification("Task created successfully", NotificationType.Success);
        this.updateCategoriesWithNewTask(createdTask);
        this.router.navigate(["/main"]);
      },
      error => {
        console.log(error);
        this.notificationService.showNotification("There was an issue with the creation of the task", NotificationType.Error);
      }
    );
  }


  private updateCategoriesWithNewTask(createdTask: Task): void {
    const currentCategories = this.categoriesSubject.getValue();
    const updatedCategories = currentCategories.map(category => {
      if (category.id === createdTask.category?.id) {
        category.tasks = category.tasks || [];
        category.tasks.push(createdTask);
      }
      return category;
    });

    this.categoriesSubject.next(updatedCategories);
    this.updateDisplayedTasks();
  }

  cleanup() {
    this.categoriesSubject.next([]);
    this.tasksSubject.next([]);
  }

  deleteTask(task: Task) {

  }
}
