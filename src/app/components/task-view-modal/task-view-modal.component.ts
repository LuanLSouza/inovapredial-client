import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { TaskResponse, TaskActivityStatus } from 'src/app/models/task.interface';
import { Employee } from 'src/app/models/employee.interface';
import { EmployeesService } from 'src/app/services/employees.service';

@Component({
  selector: 'app-task-view-modal',
  templateUrl: './task-view-modal.component.html',
  styleUrls: ['./task-view-modal.component.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule]
})
export class TaskViewModalComponent {
  @Input() task!: TaskResponse;
  
  employeeName: string | null = null;
  loadingEmployee = false;

  constructor(
    private modalController: ModalController,
    private employeesService: EmployeesService
  ) {}

  ngOnInit() {
    this.loadEmployee();
  }

  private loadEmployee() {
    if (this.task.employeeId) {
      this.loadingEmployee = true;
      this.employeesService.getEmployeeById(this.task.employeeId).subscribe({
        next: (employee: Employee) => {
          this.employeeName = employee.name;
          this.loadingEmployee = false;
        },
        error: () => {
          this.employeeName = 'Funcionário não encontrado';
          this.loadingEmployee = false;
        }
      });
    }
  }

  displayActivityStatus(status: TaskActivityStatus): string {
    const map: Record<TaskActivityStatus, string> = {
      OPEN: 'Aberta',
      IN_PROGRESS: 'Em Progresso',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada'
    };
    return map[status] || status;
  }

  getActivityStatusColor(status: TaskActivityStatus): string {
    const colorMap: Record<TaskActivityStatus, string> = {
      OPEN: 'warning',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    };
    return colorMap[status] || 'medium';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR');
    } catch {
      return '-';
    }
  }

  formatCurrency(value: number | undefined): string {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatTime(minutes: number | undefined): string {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }

  close() {
    this.modalController.dismiss();
  }
}
