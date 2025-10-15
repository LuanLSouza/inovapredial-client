import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaintenancePlansService } from 'src/app/services/maintenance-plans.service';
import { MaintenancePlan, MaintenancePlanSearchParams, MaintenancePlanFilter } from 'src/app/models/maintenance-plan.interface';
import { PaginatedResponse } from 'src/app/models/paginatedResponse';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-maintenance-plans',
  templateUrl: './maintenance-plans.page.html',
  styleUrls: ['./maintenance-plans.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, FormsModule]
})
export class MaintenancePlansPage implements OnInit {

  maintenancePlans: MaintenancePlan[] = [];
  loading = false;
  loadingMore = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;

  searchFilters: MaintenancePlanFilter = {};

  searchDescription = '';
  searchMaintenanceType = '';
  searchRequiresShutdown = '';

  pageSizeOptions = [5, 10, 20, 50, 100];

  currentSortBy = 'description';
  currentSortDirection: 'ASC' | 'DESC' = 'ASC';

  sortOptions = [
    { field: 'description', label: 'Descrição' },
    { field: 'frequencyDays', label: 'Frequência (dias)' },
    { field: 'maintenanceType', label: 'Tipo de Manutenção' },
    { field: 'requiresShutdown', label: 'Requer Parada' }
  ];

  maintenanceTypeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'CORRECTIVE', label: 'Corretiva' },
    { value: 'PREVENTIVE', label: 'Preventiva' },
    { value: 'PREDICTIVE', label: 'Preditiva' }
  ];

  requiresShutdownOptions = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Sim' },
    { value: 'false', label: 'Não' }
  ];

  constructor(
    private maintenancePlansService: MaintenancePlansService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadMaintenancePlans();
  }

  loadMaintenancePlans() {
    this.loading = true;

    const searchParams: MaintenancePlanSearchParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.currentSortBy,
      sortDirection: this.currentSortDirection
    };

    this.maintenancePlansService.getMaintenancePlans(searchParams, this.searchFilters)
    .subscribe({
      next: (response: PaginatedResponse<MaintenancePlan>) => {
        this.maintenancePlans = response.content;
        this.updatePagination(response);
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar planos de manutenção:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }

  private updatePagination(response: PaginatedResponse<MaintenancePlan>) {
    this.currentPage = response.pageNumber;
    this.pageSize = response.pageSize;
    this.totalElements = response.totalElements;
    this.totalPages = response.totalPages;
    this.hasNext = response.hasNext;
    this.hasPrevious = response.hasPrevious;
  }

  clearFilters() {
    this.searchDescription = '';
    this.searchMaintenanceType = '';
    this.searchRequiresShutdown = '';
    this.searchFilters = {};
    this.currentSortBy = 'description';
    this.currentSortDirection = 'ASC';
    this.loadMaintenancePlans();
  }

  applyFilters() {
    this.searchFilters = {};

    if (this.searchDescription.trim()) {
      this.searchFilters.description = this.searchDescription.trim();
    }
    
    if (this.searchMaintenanceType) {
      this.searchFilters.maintenanceType = this.searchMaintenanceType as any;
    }
    
    if (this.searchRequiresShutdown) {
      this.searchFilters.requiresShutdown = this.searchRequiresShutdown === 'true';
    }

    this.loadMaintenancePlans();
  }

  goToPreviousPage() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadMaintenancePlans();
    }
  }

  goToNextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadMaintenancePlans();
    }
  }

  goToFirtPage() {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.loadMaintenancePlans();
    }
  }

  goToLastPage() {
    if (this.totalPages > 0 && this.currentPage < this.totalPages -1) {
      this.currentPage = this.totalPages - 1;
      this.loadMaintenancePlans();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadMaintenancePlans();
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize = size || this.pageSize;
    this.currentPage = 0;
    this.loadMaintenancePlans();
  }

  displayMaintenanceType(maintenanceType: MaintenancePlan['maintenanceType'] | undefined) {
    if (!maintenanceType) return '-';
    const map: Record<string, string> = {
      CORRECTIVE: 'Corretiva',
      PREVENTIVE: 'Preventiva',
      PREDICTIVE: 'Preditiva',
    };
    return map[maintenanceType] ?? maintenanceType;
  }

  displayRequiresShutdown(requiresShutdown: boolean | undefined) {
    if (requiresShutdown === undefined) return '-';
    return requiresShutdown ? 'Sim' : 'Não';
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

  onView(maintenancePlan: MaintenancePlan) {
    this.router.navigate(['/maintenance-plans/view', maintenancePlan.id]);
  }

  onEdit(maintenancePlan: MaintenancePlan) {
    this.router.navigate(['/maintenance-plans/edit', maintenancePlan.id]);
  }

  async onDelete(maintenancePlan: MaintenancePlan) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o plano de manutenção "${maintenancePlan.description || 'sem descrição'}"? Esta ação não pode ser desfeita.`,
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
            this.deleteMaintenancePlan(maintenancePlan);
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToNewMaintenancePlan() {
    this.router.navigate(['/maintenance-plans/new']);
  }
  
  getMaintenanceTypeColor(maintenanceType: MaintenancePlan['maintenanceType'] | undefined): string {
    if (!maintenanceType) return 'medium';
    const colorMap: Record<string, string> = {
      CORRECTIVE: 'danger',
      PREVENTIVE: 'warning',
      PREDICTIVE: 'success',
    };
    return colorMap[maintenanceType] ?? 'medium';
  }

  getRequiresShutdownColor(requiresShutdown: boolean | undefined): string {
    if (requiresShutdown === undefined) return 'medium';
    return requiresShutdown ? 'danger' : 'success';
  }

  sortBy(field: string) {
    if (this.currentSortBy === field) {
      this.currentSortDirection = this.currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortBy = field;
      this.currentSortDirection = 'ASC';
    }
    
    this.loadMaintenancePlans();
  }

  isSortedBy(field: string): boolean {
    return this.currentSortBy === field;
  }

  getSortDirection(field: string): 'ASC' | 'DESC' | null {
    return this.isSortedBy(field) ? this.currentSortDirection : null;
  }
  
  private deleteMaintenancePlan(maintenancePlan: MaintenancePlan) {
    this.loading = true;
    
    this.maintenancePlansService.deleteMaintenancePlan(maintenancePlan.id!)
      .subscribe({
        next: () => {
          this.showToast('Plano de manutenção excluído com sucesso!', 'success');
          this.loadMaintenancePlans(); // Recarrega a lista
        },
        error: (error) => {
          this.showToast('Erro ao excluir plano de manutenção: ' + error.error.message, 'danger');
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
