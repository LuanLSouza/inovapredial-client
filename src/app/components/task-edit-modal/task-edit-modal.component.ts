import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { TaskResponse, TaskRequest, TaskActivityStatus } from 'src/app/models/task.interface';
import { Employee } from 'src/app/models/employee.interface';
import { EmployeesService } from 'src/app/services/employees.service';

@Component({
  selector: 'app-task-edit-modal',
  templateUrl: './task-edit-modal.component.html',
  styleUrls: ['./task-edit-modal.component.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, ReactiveFormsModule]
})
export class TaskEditModalComponent {
  @Input() task!: TaskResponse;
  
  form!: FormGroup;
  employees: Employee[] = [];
  loadingEmployees = false;
  saving = false;
  isTaskCompleted = false;

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
    this.isTaskCompleted = this.task.activityStatus === 'COMPLETED';
    this.loadEmployees();
    this.populateForm();
    
    if (this.isTaskCompleted) {
      this.form.disable();
    }
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

  private populateForm() {
    this.form.patchValue({
      title: this.task.title,
      description: this.task.description || '',
      activityStatus: this.task.activityStatus,
      estimatedTime: this.task.estimatedTime || null,
      startDate: this.formatDateForInput(this.task.startDate) || '',
      endDate: this.formatDateForInput(this.task.endDate) || '',
      timeSpent: this.task.timeSpent || null,
      cost: this.task.cost || null,
      employeeId: this.task.employeeId || ''
    });
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
    if (this.isTaskCompleted) {
      return;
    }

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
      workOrderId: this.task.workOrderId,
      employeeId: formValue.employeeId || undefined
    };

    this.saving = true;
    this.modalController.dismiss({ task: taskRequest });
  }

  cancel() {
    this.modalController.dismiss();
  }
}
