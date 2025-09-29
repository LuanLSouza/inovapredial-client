import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeesService } from 'src/app/services/employees.service';
import { Employee, EmployeeSearchParams, EmployeeFilter } from 'src/app/models/employee.interface';
import { PaginatedResponse } from 'src/app/models/paginatedResponse';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, FormsModule]
})
export class EmployeesPage implements OnInit {

  employees: Employee[] = [];
  loading = false;
  loadingMore = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;

  searchFilters: EmployeeFilter = {};

  searchName = '';
  searchSpecialty = '';
  searchContact = '';

  pageSizeOptions = [5, 10, 20, 50, 100];

  currentSortBy = 'name';
  currentSortDirection: 'ASC' | 'DESC' = 'ASC';

  sortOptions = [
    { field: 'name', label: 'Nome' },
    { field: 'specialty', label: 'Especialidade' },
    { field: 'contact', label: 'Contato' }
  ];

  constructor(
    private employeesService: EmployeesService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;

    const searchParams: EmployeeSearchParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.currentSortBy,
      sortDirection: this.currentSortDirection
    };

    this.employeesService.getEmployees(searchParams, this.searchFilters)
    .subscribe({
      next: (response: PaginatedResponse<Employee>) => {
        this.employees = response.content;
        this.updatePagination(response);
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar funcionários:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }

  private updatePagination(response: PaginatedResponse<Employee>) {
    this.currentPage = response.pageNumber;
    this.pageSize = response.pageSize;
    this.totalElements = response.totalElements;
    this.totalPages = response.totalPages;
    this.hasNext = response.hasNext;
    this.hasPrevious = response.hasPrevious;
  }

  clearFilters() {
    this.searchName = '';
    this.searchSpecialty = '';
    this.searchContact = '';
    this.searchFilters = {};
    this.currentSortBy = 'name';
    this.currentSortDirection = 'ASC';
    this.loadEmployees();
  }

  applyFilters() {
    this.searchFilters = {};

    if (this.searchName.trim()) {
      this.searchFilters.name = this.searchName.trim();
    }
    
    if (this.searchSpecialty.trim()) {
      this.searchFilters.specialty = this.searchSpecialty.trim();
    }
    
    if (this.searchContact.trim()) {
      this.searchFilters.contact = this.searchContact.trim();
    }

    this.loadEmployees();
  }

  goToPreviousPage() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadEmployees();
    }
  }

  goToNextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadEmployees();
    }
  }

  goToFirtPage() {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.loadEmployees();
    }
  }

  goToLastPage() {
    if (this.totalPages > 0 && this.currentPage < this.totalPages -1) {
      this.currentPage = this.totalPages - 1;
      this.loadEmployees();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadEmployees();
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize = size || this.pageSize;
    this.currentPage = 0;
    this.loadEmployees();
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    if (total <= 1) return [];
    
    const pages: number[] = [];
    
    if (total <= 3) {
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      let start = this.currentPage - 1;
      let end = this.currentPage + 1;
      
      if (start < 0) {
        start = 0;
        end = 2;
      }
      if (end >= total) {
        end = total - 1;
        start = total - 3;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  get showingStart(): number {
    if (this.totalElements === 0 ) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  get showingEnd(): number {
    const end = (this.currentPage + 1) * this.pageSize;
    return Math.min(end, this.totalElements);
  }

  onView(employee: Employee) {
    this.router.navigate(['/employees/view', employee.id]);
  }

  onEdit(employee: Employee) {
    this.router.navigate(['/employees/edit', employee.id]);
  }

  async onDelete(employee: Employee) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o funcionário "${employee.name}"? Esta ação não pode ser desfeita.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Exclusão cancelada');
          }
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.deleteEmployee(employee);
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToNewEmployee() {
    this.router.navigate(['/employees/new']);
  }

  sortBy(field: string) {
    if (this.currentSortBy === field) {
      this.currentSortDirection = this.currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortBy = field;
      this.currentSortDirection = 'ASC';
    }
    
    this.loadEmployees();
  }

  isSortedBy(field: string): boolean {
    return this.currentSortBy === field;
  }

  getSortDirection(field: string): 'ASC' | 'DESC' | null {
    return this.isSortedBy(field) ? this.currentSortDirection : null;
  }
  
  private deleteEmployee(employee: Employee) {
    this.loading = true;
    
    this.employeesService.deleteEmployee(employee.id!)
      .subscribe({
        next: () => {
          this.showToast('Funcionário excluído com sucesso!', 'success');
          this.loadEmployees(); // Recarrega a lista
        },
        error: (error) => {
          console.error('Erro ao excluir funcionário:', error);
          this.showToast('Erro ao excluir funcionário. Tente novamente.', 'danger');
          this.loading = false;
        }
      });
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
