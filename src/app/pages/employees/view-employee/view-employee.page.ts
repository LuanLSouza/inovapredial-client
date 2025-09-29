import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeesService } from 'src/app/services/employees.service';
import { Employee } from 'src/app/models/employee.interface';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.page.html',
  styleUrls: ['./view-employee.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule]
})
export class ViewEmployeePage implements OnInit {

  employee: Employee | null = null;
  loading = false;
  employeeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeesService: EmployeesService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.loadEmployee();
    } else {
      this.showToast('ID do funcionário não encontrado', 'danger');
      this.router.navigate(['/employees']);
    }
  }

  loadEmployee() {
    if (!this.employeeId) return;
    
    this.loading = true;
    
    this.employeesService.getEmployeeById(this.employeeId)
      .subscribe({
        next: (employee: Employee) => {
          this.employee = employee;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar funcionário:', error);
          this.showToast('Erro ao carregar funcionário. Tente novamente.', 'danger');
          this.loading = false;
          this.router.navigate(['/employees']);
        }
      });
  }

  formatDateTime(dateTimeString: string | undefined): string {
    if (!dateTimeString) return '-';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('pt-BR');
    } catch {
      return '-';
    }
  }

  onEdit() {
    if (this.employee?.id) {
      this.router.navigate(['/employees/edit', this.employee.id]);
    }
  }

  onBack() {
    this.router.navigate(['/employees']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

}
