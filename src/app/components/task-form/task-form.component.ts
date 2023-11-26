import {Component} from '@angular/core';
import {CategoryService} from "../../services/category-service/category.service";
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Category} from "../category-component/category.component";
import {Task, TaskType} from '../task-component/task.component';



export function buildTask(taskForm : FormGroup): Task {
  const task: Task = {
    id: -1,
    name: taskForm.get('name')?.value,
    taskType:  TaskType.Simple,
    completed: false,
    category: taskForm.get('category')?.value,
    description: taskForm.get('description')?.value,
    subtasks: buildSubtasks(taskForm),
    parentTask: undefined,
    fromDate: undefined,
    toDate: undefined,
  };

  if (taskForm.get('showDateDiv')?.value) {
    const selectedDate = taskForm.get('selectedDate')?.value;
    task.fromDate = selectedDate && taskForm.get('showTimesDiv')?.value
      ? combineDateAndTime(selectedDate, taskForm.get('startTime')?.value)
      : selectedDate;

    if (taskForm.get('showTimesDiv')?.value) {
      task.toDate = selectedDate
        ? combineDateAndTime(selectedDate, taskForm.get('endTime')?.value)
        : selectedDate;
    }
  }

  return task;
}

export function combineDateAndTime(date: string, time: string): Date {
  const combinedDateTime = `${date}T${time}`;
  return new Date(combinedDateTime);
}

export function buildSubtasks(taskForm : FormGroup): Task[] {
  const subtasks: Task[] = [];

  if (taskForm.get('showSubtasksDiv')?.value) {
    const subtasksFormArray = taskForm.get('subtasks') as FormArray;
    subtasksFormArray.controls.forEach((subtaskControl: AbstractControl) => {
      const subtask: Task = {
        id: -1,
        name: subtaskControl.get('name')?.value,
        taskType: TaskType.Simple,
        completed: false,
        category: taskForm.get('category')?.value,
        description: subtaskControl.get('description')?.value,
        subtasks: [],
        parentTask: undefined,
        fromDate: undefined,
        toDate: undefined,
      };
      subtasks.push(subtask);
    });
  }

  return subtasks;
}



@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent {
  taskForm: FormGroup;
  categories: Category[] = [];
  addButtonClicked = false;

  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  constructor(private fb: FormBuilder, public categoryService: CategoryService,
              private router: Router) {
    this.taskForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      category: ['', [Validators.required]],
      showDateDiv: [false],
      selectedDate: [{ value: null, disabled: true }],
      showTimesDiv: [false],
      startTime: [{ value: '', disabled: true }],
      endTime: [{ value: '', disabled: true }],
      showSubtasksDiv: [false],
      subtasks: this.fb.array([]),
      newSubtask: this.buildSubtaskForm()
    });

    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
      if (this.subtasks.length === 0) this.addNewSubtask();
    });

    this.taskForm.get('showDateDiv')?.valueChanges.subscribe(value => {
      const selectedDateControl = this.taskForm.get('selectedDate');
      if (value) {
        selectedDateControl?.enable();
      } else {
        selectedDateControl?.disable();
      }
    });

    this.taskForm.get('showTimesDiv')?.valueChanges.subscribe(value => {
      const startTimeControl = this.taskForm.get('startTime');
      const endTimeControl = this.taskForm.get('endTime');
      if (value) {
        startTimeControl?.enable();
        endTimeControl?.enable();
      } else {
        startTimeControl?.disable();
        endTimeControl?.disable();
      }
    });

    this.taskForm.get('showSubtasksDiv')?.valueChanges.subscribe(value => {
      if (value) {
        this.subtasks.controls.forEach((control: AbstractControl) => {
          control.get('name')?.enable();
          control.get('description')?.enable();
        });
      } else {
        this.subtasks.controls.forEach((control: AbstractControl) => {
          control.get('name')?.disable();
          control.get('description')?.disable();
        });
      }
    });

    this.taskForm.get('selectedDate')?.setValidators(this.dateValidator());

  }

  submitForm() {
    if (this.taskForm.valid) {
      const task: Task = buildTask(this.taskForm);

      this.categoryService.createTask(task);
    }
  }

  addNewSubtask() {
    this.addButtonClicked = true;
    this.subtasks.push(this.buildSubtaskForm());
  }

  removeSubtask(index: number) {
    if(this.subtasks.length > 1) this.subtasks.removeAt(index);
  }

  buildSubtaskForm() {
    return this.fb.group({
      name: [''],
      description: ['']
    });
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = control.value;
      if (selectedDate === null || selectedDate === '') {
        return { 'invalidDate': true };
      }
      return null;
    };
  }

}
