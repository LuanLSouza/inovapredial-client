import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { TaskRequest, TaskActivityStatus } from 'src/app/models/task.interface';
import { Employee } from 'src/app/models/employee.interface';
import { EmployeesService } from 'src/app/services/employees.service';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule, FormsModule]
})
export class TaskModalComponent {
  @Input() workOrderId!: string;
  @Output() tasksCreated = new EventEmitter<TaskRequest[]>();

  form!: FormGroup;
  employees: Employee[] = [];
  loadingEmployees = false;
  saving = false;
  multipleTasks = false;
  taskForms: FormGroup[] = [];

  activityStatusOptions = [
    { label: 'Aberta', value: 'OPEN' },
    { label: 'Em Progresso', value: 'IN_PROGRESS' },
    { label: 'Concluída', value: 'COMPLETED' },
    { label: 'Cancelada', value: 'CANCELLED' },
  ];

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private employeesService: EmployeesService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadEmployees();
    this.addTaskForm();
  }

  get f() { return this.form.controls as any; }

  private initializeForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      activityStatus: ['OPEN'],
      estimatedTime: [null, [Validators.min(0)]],
      startDate: [''],
      endDate: [''],
      timeSpent: [null, [Validators.min(0)]],
      cost: [null, [Validators.min(0)]],
      employeeId: ['']
    });
  }

  private createTaskForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      activityStatus: ['OPEN'],
      estimatedTime: [null, [Validators.min(0)]],
      startDate: [''],
      endDate: [''],
      timeSpent: [null, [Validators.min(0)]],
      cost: [null, [Validators.min(0)]],
      employeeId: ['']
    });
  }

  addTaskForm() {
    this.taskForms.push(this.createTaskForm());
  }

  removeTaskForm(index: number) {
    if (this.taskForms.length > 1) {
      this.taskForms.splice(index, 1);
    }
  }

  toggleMultipleTasks() {
    this.multipleTasks = !this.multipleTasks;
    if (this.multipleTasks && this.taskForms.length === 0) {
      this.addTaskForm();
    }
  }

  private loadEmployees() {
    this.loadingEmployees = true;
    this.employeesService.getEmployees({
      page: 0,
      size: 1000,
      sortBy: 'name',
      sortDirection: 'ASC'
    }, {}).subscribe({
      next: (response) => {
        this.employees = response.content;
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
      }
    });
  }

  formatDateForInput(dateString: string | undefined): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  }

  submit() {
    if (this.multipleTasks) {
      this.submitMultipleTasks();
    } else {
      this.submitSingleTask();
    }
  }

  private submitSingleTask() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const taskRequest: TaskRequest = {
      title: formValue.title,
      description: formValue.description || undefined,
      activityStatus: formValue.activityStatus || 'OPEN',
      estimatedTime: formValue.estimatedTime || undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined,
      timeSpent: formValue.timeSpent || undefined,
      cost: formValue.cost || undefined,
      workOrderId: this.workOrderId,
      employeeId: formValue.employeeId || undefined
    };

    this.saving = true;
    this.modalController.dismiss({ tasks: [taskRequest] });
  }

  private submitMultipleTasks() {
    const invalidForms = this.taskForms.filter(form => form.invalid);
    if (invalidForms.length > 0) {
      invalidForms.forEach(form => form.markAllAsTouched());
      return;
    }

    const tasks: TaskRequest[] = this.taskForms.map(form => {
      const formValue = form.value;
      return {
        title: formValue.title,
        description: formValue.description || undefined,
        activityStatus: formValue.activityStatus || 'OPEN',
        estimatedTime: formValue.estimatedTime || undefined,
        startDate: formValue.startDate || undefined,
        endDate: formValue.endDate || undefined,
        timeSpent: formValue.timeSpent || undefined,
        cost: formValue.cost || undefined,
        workOrderId: this.workOrderId,
        employeeId: formValue.employeeId || undefined
      };
    });

    this.saving = true;
    this.modalController.dismiss({ tasks });
  }

  cancel() {
    this.modalController.dismiss();
  }
}
