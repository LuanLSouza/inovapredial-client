import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoriesService } from 'src/app/services/inventories.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { Inventory, InventorySearchParams, InventoryFilter } from 'src/app/models/inventory.interface';
import { Employee, EmployeeSearchParams } from 'src/app/models/employee.interface';
import { PaginatedResponse } from 'src/app/models/paginatedResponse';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-inventories',
  templateUrl: './inventories.page.html',
  styleUrls: ['./inventories.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, FormsModule]
})
export class InventoriesPage implements OnInit {

  inventories: Inventory[] = [];
  loading = false;
  loadingMore = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;

  searchFilters: InventoryFilter = {};

  searchName = '';
  searchItemType = '';
  searchEmployeeId = '';

  employees: Employee[] = [];
  employeeOptions: { label: string; value: string }[] = [];
  loadingEmployees = false;

  pageSizeOptions = [5, 10, 20, 50, 100];

  currentSortBy = 'name';
  currentSortDirection: 'ASC' | 'DESC' = 'ASC';

  sortOptions = [
    { field: 'name', label: 'Nome' },
    { field: 'itemType', label: 'Tipo' },
    { field: 'cost', label: 'Custo' },
    { field: 'quantity', label: 'Quantidade' },
    { field: 'minimumStock', label: 'Estoque Mínimo' }
  ];

  itemTypeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'MATERIAL', label: 'Material' },
    { value: 'PART', label: 'Peça' }
  ];

  constructor(
    private inventoriesService: InventoriesService,
    private employeesService: EmployeesService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadEmployees();
    this.loadInventories();
  }

  loadInventories() {
    this.loading = true;

    const searchParams: InventorySearchParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.currentSortBy,
      sortDirection: this.currentSortDirection
    };

    this.inventoriesService.getInventories(searchParams, this.searchFilters)
    .subscribe({
      next: (response: PaginatedResponse<Inventory>) => {
        this.inventories = response.content;
        this.updatePagination(response);
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }

  private updatePagination(response: PaginatedResponse<Inventory>) {
    this.currentPage = response.pageNumber;
    this.pageSize = response.pageSize;
    this.totalElements = response.totalElements;
    this.totalPages = response.totalPages;
    this.hasNext = response.hasNext;
    this.hasPrevious = response.hasPrevious;
  }

  clearFilters() {
    this.searchName = '';
    this.searchItemType = '';
    this.searchEmployeeId = '';
    this.searchFilters = {};
    this.currentSortBy = 'name';
    this.currentSortDirection = 'ASC';
    this.loadInventories();
  }

  applyFilters() {
    this.searchFilters = {};

    if (this.searchName.trim()) {
      this.searchFilters.name = this.searchName.trim();
    }
    
    if (this.searchItemType) {
      this.searchFilters.itemType = this.searchItemType as any;
    }

    if (this.searchEmployeeId) {
      this.searchFilters.employeeId = this.searchEmployeeId;
    }

    this.loadInventories();
  }

  goToPreviousPage() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadInventories();
    }
  }

  goToNextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadInventories();
    }
  }

  goToFirtPage() {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.loadInventories();
    }
  }

  goToLastPage() {
    if (this.totalPages > 0 && this.currentPage < this.totalPages -1) {
      this.currentPage = this.totalPages - 1;
      this.loadInventories();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadInventories();
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize = size || this.pageSize;
    this.currentPage = 0;
    this.loadInventories();
  }

  displayItemType(itemType: Inventory['itemType'] | undefined) {
    if (!itemType) return '-';
    const map: Record<string, string> = {
      MATERIAL: 'Material',
      PART: 'Peça',
    };
    return map[itemType] ?? itemType;
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

  onView(inventory: Inventory) {
    this.router.navigate(['/inventories/view', inventory.id]);
  }

  onEdit(inventory: Inventory) {
    this.router.navigate(['/inventories/edit', inventory.id]);
  }

  async onDelete(inventory: Inventory) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o item "${inventory.name}"? Esta ação não pode ser desfeita.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.deleteInventory(inventory);
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToNewInventory() {
    this.router.navigate(['/inventories/new']);
  }
  
  getItemTypeColor(itemType: Inventory['itemType'] | undefined): string {
    if (!itemType) return 'medium';
    const colorMap: Record<string, string> = {
      MATERIAL: 'primary',
      PART: 'secondary',
    };
    return colorMap[itemType] ?? 'medium';
  }

  getStockStatusColor(inventory: Inventory): string {
    if (!inventory.minimumStock) return 'medium';
    
    if (inventory.quantity <= inventory.minimumStock) {
      return 'danger';
    } else if (inventory.quantity <= inventory.minimumStock * 1.5) {
      return 'warning';
    } else {
      return 'success';
    }
  }

  getStockStatusText(inventory: Inventory): string {
    if (!inventory.minimumStock) return 'Normal';
    
    if (inventory.quantity <= inventory.minimumStock) {
      return 'Estoque Baixo';
    } else if (inventory.quantity <= inventory.minimumStock * 1.5) {
      return 'Atenção';
    } else {
      return 'Normal';
    }
  }

  sortBy(field: string) {
    if (this.currentSortBy === field) {
      this.currentSortDirection = this.currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortBy = field;
      this.currentSortDirection = 'ASC';
    }
    
    this.loadInventories();
  }

  isSortedBy(field: string): boolean {
    return this.currentSortBy === field;
  }

  getSortDirection(field: string): 'ASC' | 'DESC' | null {
    return this.isSortedBy(field) ? this.currentSortDirection : null;
  }
  
  private deleteInventory(inventory: Inventory) {
    this.loading = true;
    
    this.inventoriesService.deleteInventory(inventory.id!)
      .subscribe({
        next: () => {
          this.showToast('Item excluído com sucesso!', 'success');
          this.loadInventories();
        },
        error: (error) => {
          this.showToast('Erro ao excluir item: ' + error.error.message, 'danger');
          this.loading = false;
        }
      });
  }

  getEmployeeName(employeeId: string | undefined): string {
    if (!employeeId) return '-';
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : '-';
  }

  private loadEmployees() {
    this.loadingEmployees = true;
    
    const searchParams: EmployeeSearchParams = {
      page: 0,
      size: 1000,
      sortBy: 'name',
      sortDirection: 'ASC'
    };

    this.employeesService.getEmployees(searchParams)
      .subscribe({
        next: (response: PaginatedResponse<Employee>) => {
          this.employees = response.content;
          this.employeeOptions = [
            { label: 'Todos os funcionários', value: '' },
            ...this.employees.map(employee => ({
              label: employee.name,
              value: employee.id
            }))
          ];
          this.loadingEmployees = false;
        },
        error: (error) => {
          this.loadingEmployees = false;
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
