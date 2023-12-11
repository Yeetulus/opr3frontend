import {Injectable} from '@angular/core';
import {Category} from "../../components/category-component/category.component";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {Task} from 'src/app/components/task-component/task.component';
import {NotificationService, NotificationType} from "../notification-service/notification.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = 'http://localhost:8080/api';
  categoriesSubject: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);

  constructor(private http: HttpClient, public notificationService:NotificationService, public router: Router) {
  }

  public updateDisplayedTasks(): void {

    let categories = this.categoriesSubject.getValue();
    let tasks = this.combineAndSortTasks(categories);

    this.tasksSubject.next(tasks);
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

  public fetchCategories(): void {
    const headers = this.getHeaders();

    this.http.get<Category[]>(`${this.baseUrl}/categories/get-all`, { headers }).subscribe(data =>{
      this.setupCategories(data);
      this.categoriesSubject.next(data);
      this.updateDisplayedTasks();
    });
  }

  private getHeaders() {
    const accessToken = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    });
  }

  createCategory(category: Category) {
    const headers = this.getHeaders();
    this.http.post<Category>(`${this.baseUrl}/categories/create`, category, {headers}).subscribe({
      next: (data:Category) => {
        console.log('Category created successfully: ' + category);
        this.notificationService.showNotification("Category created", NotificationType.Success);
        this.updateCategories(data);
        this.router.navigate(['/main']);
      },
      error: (err) => {
        console.log(err);
        this.notificationService.showNotification("Category was not created", NotificationType.Error);
      }
    });
  }

  private updateCategories(newCategory: Category): void {
    const currentCategories = this.categoriesSubject.getValue();
    newCategory.tasks = [];
    const updatedCategories = [...currentCategories, newCategory];
    this.categoriesSubject.next(updatedCategories);
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

  private convertTaskToTaskRequest(task: Task, alterSubtasks?:boolean, newCategory? : number): any {
    let body:any = {
      name: task.name,
      description: task.description,
      categoryId: task.category.id,
      completed: task.completed,
      fromDate: task.fromDate,
      toDate: task.toDate,
      subtasks: task.subtasks ? task.subtasks.map(subtask => this.convertTaskToTaskRequest(subtask, false)) : undefined,
    };
    if(task.id) body.id= task.id;
    if(newCategory) body.newCategoryId = newCategory;
    if(alterSubtasks) body.alterSubtasks = true;
    return body;
  }

  createTask(task: Task, alterSubtasks: boolean){
    const url = `${this.baseUrl}/tasks/create`;
    const headers = this.getHeaders();
    const taskRequest = this.convertTaskToTaskRequest(task, alterSubtasks);
    this.http.post<Task>(url, taskRequest, { headers }).subscribe({
      next: (createdTask: Task) => {
        console.log(createdTask);
        this.notificationService.showNotification("Task created successfully", NotificationType.Success);
        this.router.navigate(["/main"]);
        this.updateCategoriesWithNewTask(createdTask, task.category.id);
      },
      error: error => {
        console.log(error);
        this.notificationService.showNotification("There was an issue with the creation of the task", NotificationType.Error);
      }
    });
  }

  public updateTask(task: Task, alterSubtasks?:boolean, newCategoryId?: number) {

    const headers = this.getHeaders();
    const endpoint = `${this.baseUrl}/tasks/edit`;
    const body = this.convertTaskToTaskRequest(task, alterSubtasks, newCategoryId);

    this.http.put<Task>(endpoint, body, { headers }).subscribe({
      next: (data) =>{
        console.log(data);
        this.notificationService.showNotification("Task updated", NotificationType.Success);
        this.switchTaskCategory(data, body.categoryId, body.newCategoryId);
        this.router.navigate(["/main"]);
      },
      error: (err) => {
        this.notificationService.showNotification("Cannot update", NotificationType.Error);
        console.log(err);
      }
    });
  }

  public deleteTask(task: Task) {
    const endpoint = `${this.baseUrl}/tasks/delete`;
    const headers = this.getHeaders();
    const params = new HttpParams()
      .set('categoryId', task.category.id)
      .set('taskId', task.id);
    this.http.delete(endpoint, { headers, params }).subscribe({
      next: (result) => {
        console.log(result);
        this.removeTaskFromCategory(task.id, task.category.id);
        this.notificationService.showNotification("Task deleted", NotificationType.Success);
        this.router.navigate(["/main"]);
      },
      error: (err) =>{
        console.log(err);
        this.notificationService.showNotification("Cannot delete", NotificationType.Error);
      }
    });

  }

  deleteCategory(selectedCategoryId: number) {
    const categories = this.categoriesSubject.getValue();
    const toDelete: Category | undefined = categories.find(c => c.id === selectedCategoryId);

    if (toDelete) {
      const endpoint = `${this.baseUrl}/categories/delete`;
      const headers = this.getHeaders();
      const params = new HttpParams().set('id', toDelete.id.toString());

      this.http.delete<boolean>(endpoint, { headers, params }).subscribe({
        next: (result) => {
          console.log(result);
          this.notificationService.showNotification("Category deleted", NotificationType.Success);

          const updatedCategories = categories.filter(c => c.id !== selectedCategoryId);
          this.categoriesSubject.next(updatedCategories);

          this.updateDisplayedTasks();
        },
        error: (err) => {
          console.log(err);
          this.notificationService.showNotification("Cannot delete", NotificationType.Error);
        }
      });
    }
  }


  private updateCategoriesWithNewTask(createdTask: Task, categoryId: number): void {

    let categories = this.categoriesSubject.getValue();
    for (let i = 0; i < categories.length; i++) {
      if(categories[i].id === categoryId) {
        createdTask.category = categories[i];
        createdTask.subtasks?.forEach(s => s.category = categories[i])
        categories[i].tasks?.push(createdTask);
        console.log("Added task into its category");
        break;
      }
    }
    this.categoriesSubject.next(categories);
    this.updateDisplayedTasks();
  }

  private switchTaskCategory(task: Task, oldCategoryId: number, newCategoryId: number) {
    const categories = this.categoriesSubject.getValue();

    if (oldCategoryId !== newCategoryId) {
      const oldCategory = categories.find(category => category.id === oldCategoryId);
      const newCategory = categories.find(category => category.id === newCategoryId);

      if (oldCategory && newCategory) {
        const taskIndex = oldCategory.tasks?.findIndex(t => t.id === task.id);

        if (taskIndex !== -1 && oldCategory.tasks) {
          const removedTask = oldCategory.tasks.splice(taskIndex!, 1)[0];
          removedTask.category = newCategory;
          newCategory.tasks?.push(removedTask);
          console.log(categories);
        }
      }
    } else {
      const category = categories.find(category => category.id === oldCategoryId);

      if (category) {
        const taskIndex = category.tasks?.findIndex(t => t.id === task.id);

        if (taskIndex !== -1 && category.tasks) {
          task.category = category;
          category.tasks.splice(taskIndex!, 1, task);
        }
      }
    }

    this.categoriesSubject.next(categories);
    this.updateDisplayedTasks();
  }

  private removeTaskFromCategory(taskId: number, categoryId: number) {
    let categories = this.categoriesSubject.getValue();

    for (let i = 0; i < categories.length; i++) {
      if(categories[i].id === categoryId && categories[i].tasks! !== undefined)
      {
        for (let j = 0; j < categories[i].tasks!.length; j++) {
          if(categories[i].tasks?.[j].id === taskId){
            categories[i].tasks?.splice(j, 1);
          }
        }
      }
    }

    this.categoriesSubject.next(categories);
    this.updateDisplayedTasks();
  }

  cleanup() {
    this.categoriesSubject.next([]);
    this.tasksSubject.next([]);
  }


}
