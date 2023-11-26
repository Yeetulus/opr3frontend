import { Component } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Category} from "../category-component/category.component";
import {CategoryService} from "../../services/category-service/category.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Task} from "../task-component/task.component";
import {buildTask} from "../task-form/task-form.component";

@Component({
  selector: 'app-task-edit-form',
  templateUrl: './task-edit-form.component.html',
  styleUrls: ['./task-edit-form.component.css']
})
export class TaskEditFormComponent {
  taskForm: FormGroup;
  categories: Category[] = [];
  addButtonClicked = false;

  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  constructor(private route: ActivatedRoute, private fb: FormBuilder, public categoryService: CategoryService,
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

    this.route.params.subscribe(params =>{

    })
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const task: Task = Task.fromJSON(params['task']);
      console.log(task);
      this.updateFormWithTask(task);
    });

    this.categoryService.getCategories().subscribe(data => {
      this.categories = data;
      if (this.subtasks.length === 0) this.addNewSubtask();
    });

  }

  updateFormWithTask(task: Task) {
    let fromDateValue = '';
    let toTime = '';

    if (task.fromDate) {
      const day = ('0' + task.fromDate.getDate()).slice(-2);
      const month = ('0' + (task.fromDate.getMonth() + 1)).slice(-2);
      const year = task.fromDate.getFullYear();
      fromDateValue = `${day}.${month}.${year}`;
    }

    if (task.toDate) {
      const hours = ('0' + task.toDate.getHours()).slice(-2);
      const minutes = ('0' + task.toDate.getMinutes()).slice(-2);
      toTime = `${hours}:${minutes}`;
    }

    this.taskForm.patchValue({
      name: task.name,
      description: task.description,
      category: task.category,
      showDateDiv: !!task.fromDate,
      selectedDate: task.fromDate,
      showTimesDiv: !!task.toDate,
      endTime: toTime,
      showSubtasksDiv: (!!task.subtasks && task.subtasks.length > 0)
    });

    if (task.subtasks) {
      this.updateSubtasksForm(task.subtasks);
    }
  }
  updateSubtasksForm(subtasks: Task[]) {
    const subtasksFormArray = this.taskForm.get('subtasks') as FormArray;

    while (subtasksFormArray.length) {
      subtasksFormArray.removeAt(0);
    }

    subtasks.forEach(subtask => {
      subtasksFormArray.push(this.fb.group({
        name: subtask.name,
        description: subtask.description,
      }));
    });
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
