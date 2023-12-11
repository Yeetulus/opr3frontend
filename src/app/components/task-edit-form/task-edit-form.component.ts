import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {Category} from "../category-component/category.component";
import {CategoryService} from "../../services/category-service/category.service";
import {ActivatedRoute} from "@angular/router";
import {Task} from "../task-component/task.component";
import {buildTask} from "../task-form/task-form.component";

@Component({
  selector: 'app-task-edit-form',
  templateUrl: './task-edit-form.component.html',
  styleUrls: ['./task-edit-form.component.css']
})
export class TaskEditFormComponent implements OnInit{
  taskForm: FormGroup;
  categories: Category[] = [];
  addButtonClicked = false;
  task?: Task;

  get subtasks(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  constructor(private route: ActivatedRoute, private fb: FormBuilder, public categoryService: CategoryService) {
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

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.task = Task.fromJSON(params['task']);
      this.updateFormWithTask(this.task);
    });

    this.categoryService.categoriesSubject.subscribe(data =>{
      this.categories = data;
      if (this.subtasks.length === 0) this.addNewSubtask();
      this.setInitialCategory();
    })
  }

  private setInitialCategory() {
    const formReference = this.taskForm.get("category")?.value;
    if (formReference !== undefined) {
      const selected = this.categories.find(element => element.id === formReference.id);
      this.taskForm.get("category")?.setValue(selected);
    }
  }

  updateFormWithTask(task: Task) {
    let fromDateValue:Date = new Date();
    let fromTime = '';
    let toTime = '';

    if (task.fromDate) {
      const year = task.fromDate.getFullYear();
      const month = task.fromDate.getMonth();
      const day = task.fromDate.getDate();
      fromDateValue = new Date(year, month, day);

      const fromHours = ('0' + task.fromDate.getHours()).slice(-2);
      const fromMinutes = ('0' + task.fromDate.getMinutes()).slice(-2);
      fromTime = `${fromHours}:${fromMinutes}`;
    }

    if (task.toDate && task.fromDate) {
      const toHours = ('0' + task.toDate.getHours()).slice(-2);
      const toMinutes = ('0' + task.toDate.getMinutes()).slice(-2);
      toTime = `${toHours}:${toMinutes}`;
    }

    this.taskForm.patchValue({
      name: task.name,
      description: task.description,
      category: task.category,
      showDateDiv: !!task.fromDate,
      selectedDate: fromDateValue,
      showTimesDiv: !!task.toDate,
      startTime: fromTime,
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
    if (this.taskForm.valid && this.task) {
      const task: Task = buildTask(this.taskForm);
      console.log(task);
      const alterSubtasks: boolean = this.task.subtasks?.length !== task.subtasks?.length;

      this.task.name = task.name;
      this.task.description = task.description;
      this.task.fromDate = task.fromDate;
      this.task.toDate = task.toDate;
      this.task.subtasks = [];
      this.task.completed = task.completed;
      task.subtasks?.forEach(subtask => {
        this.task?.subtasks?.push(subtask);
      })

      this.categoryService.updateTask(this.task, alterSubtasks, task.category.id);
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
