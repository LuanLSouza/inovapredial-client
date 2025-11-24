import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WorkOrdersService } from 'src/app/services/work-orders.service';
import { WorkOrder, WorkOrderSearchParams, WorkOrderFilter } from 'src/app/models/work-order.interface';
import { PaginatedResponse } from 'src/app/models/paginatedResponse';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-work-orders',
  templateUrl: './work-orders.page.html',
  styleUrls: ['./work-orders.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, FormsModule]
})
export class WorkOrdersPage implements OnInit {

  workOrders: WorkOrder[] = [];
  loading = false;
  loadingMore = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;

  searchFilters: WorkOrderFilter = {};

  searchDescription = '';
  searchActivityStatus = '';
  searchPriority = '';

  pageSizeOptions = [5, 10, 20, 50, 100];

  currentSortBy = 'openingDate';
  currentSortDirection: 'ASC' | 'DESC' = 'DESC';

  sortOptions = [
    { field: 'description', label: 'Descrição' },
    { field: 'openingDate', label: 'Data de Abertura' },
    { field: 'closingDate', label: 'Data de Fechamento' },
    { field: 'activityStatus', label: 'Status da Atividade' },
    { field: 'priority', label: 'Prioridade' },
    { field: 'maintenanceType', label: 'Tipo de Manutenção' },
    { field: 'totalCost', label: 'Custo Total' }
  ];

  activityStatusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'OPEN', label: 'Aberta' },
    { value: 'IN_PROGRESS', label: 'Em Progresso' },
    { value: 'COMPLETED', label: 'Concluída' },
    { value: 'CANCELLED', label: 'Cancelada' }
  ];

  priorityOptions = [
    { value: '', label: 'Todos as prioridades' },
    { value: 'LOW', label: 'Baixa' },
    { value: 'MEDIUM', label: 'Média' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' }
  ];

  constructor(
    private workOrdersService: WorkOrdersService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadWorkOrders();
  }

  loadWorkOrders() {
    this.loading = true;

    const searchParams: WorkOrderSearchParams = {
      page: this.currentPage.toString(),
      size: this.pageSize.toString(),
      sortBy: this.currentSortBy,
      sortDirection: this.currentSortDirection
    };

    this.workOrdersService.getWorkOrders(searchParams, this.searchFilters)
    .subscribe({
      next: (response: PaginatedResponse<WorkOrder>) => {
        this.workOrders = response.content;
        this.updatePagination(response);
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar ordens de serviço:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }

  private updatePagination(response: PaginatedResponse<WorkOrder>) {
    this.currentPage = response.pageNumber;
    this.pageSize = response.pageSize;
    this.totalElements = response.totalElements;
    this.totalPages = response.totalPages;
    this.hasNext = response.hasNext;
    this.hasPrevious = response.hasPrevious;
  }

  clearFilters() {
    this.searchDescription = '';
    this.searchActivityStatus = '';
    this.searchPriority = '';
    this.searchFilters = {};
    this.currentSortBy = 'openingDate';
    this.currentSortDirection = 'DESC';
    this.loadWorkOrders();
  }

  applyFilters() {
    this.searchFilters = {};

    if (this.searchDescription.trim()) {
      this.searchFilters.description = this.searchDescription.trim();
    }
    
    if (this.searchActivityStatus) {
      this.searchFilters.activityStatus = this.searchActivityStatus as any;
    }
    
    if (this.searchPriority) {
      this.searchFilters.priority = this.searchPriority as any;
    }

    this.loadWorkOrders();
  }

  goToPreviousPage() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadWorkOrders();
    }
  }

  goToNextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadWorkOrders();
    }
  }

  goToFirtPage() {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.loadWorkOrders();
    }
  }

  goToLastPage() {
    if (this.totalPages > 0 && this.currentPage < this.totalPages -1) {
      this.currentPage = this.totalPages - 1;
      this.loadWorkOrders();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadWorkOrders();
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize = size || this.pageSize;
    this.currentPage = 0;
    this.loadWorkOrders();
  }

  displayActivityStatus(status: WorkOrder['activityStatus'] | undefined) {
    if (!status) return '-';
    const map: Record<string, string> = {
      OPEN: 'Aberta',
      IN_PROGRESS: 'Em Progresso',
      COMPLETED: 'Concluída',
      CANCELLED: 'Cancelada'
    };
    return map[status] ?? status;
  }

  displayPriority(priority: WorkOrder['priority'] | undefined) {
    if (!priority) return '-';
    const map: Record<string, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      URGENT: 'Urgente'
    };
    return map[priority] ?? priority;
  }

  displayMaintenanceType(type: WorkOrder['maintenanceType'] | undefined) {
    if (!type) return '-';
    const map: Record<string, string> = {
      CORRECTIVE: 'Corretiva',
      PREVENTIVE: 'Preventiva',
      PREDICTIVE: 'Preditiva'
    };
    return map[type] ?? type;
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

  onView(workOrder: WorkOrder) {
    this.router.navigate(['/work-orders/view', workOrder.id]);
  }

  onEdit(workOrder: WorkOrder) {
    this.router.navigate(['/work-orders/edit', workOrder.id]);
  }

  async onDelete(workOrder: WorkOrder) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a ordem de serviço "${workOrder.description}"? Esta ação não pode ser desfeita.`,
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
            this.deleteWorkOrder(workOrder);
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToNewWorkOrder() {
    this.router.navigate(['/work-orders/new']);
  }
  
  getActivityStatusColor(status: WorkOrder['activityStatus'] | undefined): string {
    if (!status) return 'medium';
    const colorMap: Record<string, string> = {
      OPEN: 'warning',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'danger'
    };
    return colorMap[status] ?? 'medium';
  }

  getPriorityColor(priority: WorkOrder['priority'] | undefined): string {
    if (!priority) return 'medium';
    const colorMap: Record<string, string> = {
      LOW: 'success',
      MEDIUM: 'warning',
      HIGH: 'orange',
      URGENT: 'danger'
    };
    return colorMap[priority] ?? 'medium';
  }

  getMaintenanceTypeColor(type: WorkOrder['maintenanceType'] | undefined): string {
    if (!type) return 'medium';
    const colorMap: Record<string, string> = {
      CORRECTIVE: 'danger',
      PREVENTIVE: 'warning',
      PREDICTIVE: 'primary'
    };
    return colorMap[type] ?? 'medium';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
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

  sortBy(field: string) {
    if (this.currentSortBy === field) {
      this.currentSortDirection = this.currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortBy = field;
      this.currentSortDirection = 'ASC';
    }
    
    this.loadWorkOrders();
  }

  isSortedBy(field: string): boolean {
    return this.currentSortBy === field;
  }

  getSortDirection(field: string): 'ASC' | 'DESC' | null {
    return this.isSortedBy(field) ? this.currentSortDirection : null;
  }
  
  private deleteWorkOrder(workOrder: WorkOrder) {
    this.loading = true;
    
    this.workOrdersService.deleteWorkOrder(workOrder.id)
      .subscribe({
        next: () => {
          this.showToast('Ordem de serviço excluída com sucesso!', 'success');
          this.loadWorkOrders();
        },
        error: (error) => {
          this.showToast('Erro ao excluir ordem de serviço: ' + error.error.message, 'danger');
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
