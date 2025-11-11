import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoriesService } from 'src/app/services/inventories.service';
import { EmployeesService } from 'src/app/services/employees.service';
import { Inventory } from 'src/app/models/inventory.interface';
import { Employee, EmployeeSearchParams } from 'src/app/models/employee.interface';
import { PaginatedResponse } from 'src/app/models/paginatedResponse';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-view-inventory',
  templateUrl: './view-inventory.page.html',
  styleUrls: ['./view-inventory.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule]
})
export class ViewInventoryPage implements OnInit {

  inventory: Inventory | null = null;
  loading = false;
  inventoryId: string | null = null;
  employees: Employee[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inventoriesService: InventoriesService,
    private employeesService: EmployeesService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadEmployees();
    
    this.inventoryId = this.route.snapshot.paramMap.get('id');
    if (this.inventoryId) {
      this.loadInventory();
    } else {
      this.showToast('ID do item não encontrado', 'danger');
      this.router.navigate(['/inventories']);
    }
  }

  loadInventory() {
    if (!this.inventoryId) return;
    
    this.loading = true;
    
    this.inventoriesService.getInventoryById(this.inventoryId)
      .subscribe({
        next: (inventory: Inventory) => {
          this.inventory = inventory;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar item:', error);
          this.showToast('Erro ao carregar item. Tente novamente.', 'danger');
          this.loading = false;
          this.router.navigate(['/inventories']);
        }
      });
  }

  displayItemType(itemType: Inventory['itemType'] | undefined) {
    if (!itemType) return '-';
    const map: Record<string, string> = {
      MATERIAL: 'Material',
      PART: 'Peça',
    };
    return map[itemType] ?? itemType;
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

  formatCurrency(value: number | undefined): string {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  onEdit() {
    if (this.inventory?.id) {
      this.router.navigate(['/inventories/edit', this.inventory.id]);
    }
  }

  onBack() {
    this.router.navigate(['/inventories']);
  }

  getEmployeeName(employeeId: string | undefined): string {
    if (!employeeId) return '-';
    const employee = this.employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : '-';
  }

  private loadEmployees() {
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
        },
        error: (error) => {
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
