import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EquipmentsService } from 'src/app/services/equipments.service';
import { Equipment, EquipmentSearchParams, EquipmentFilter } from 'src/app/models/equipment.interface';
import { PaginatedResponse } from 'src/app/models/paginatedResponse';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { ImageService } from 'src/app/services/image.service';

@Component({
  selector: 'app-equipments',
  templateUrl: './equipments.page.html',
  styleUrls: ['./equipments.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, FormsModule]
})
export class EquipmentsPage implements OnInit {

  equipments: Equipment[] = [];
  loading = false;
  loadingMore = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;

  searchFilters: EquipmentFilter = {};

  searchIdentification = '';
  searchClassification = '';
  searchEquipmentStatus = '';

  pageSizeOptions = [5, 10, 20, 50, 100];

  currentSortBy = 'identification';
  currentSortDirection: 'ASC' | 'DESC' = 'ASC';

  sortOptions = [
    { field: 'identification', label: 'Identificação' },
    { field: 'description', label: 'Descrição' },
    { field: 'serialNumber', label: 'Número de Série' },
    { field: 'classification', label: 'Classificação' },
    { field: 'location', label: 'Localização' },
    { field: 'criticality', label: 'Criticidade' },
    { field: 'equipmentStatus', label: 'Status' },
    { field: 'group', label: 'Grupo' },
    { field: 'model', label: 'Modelo' },
    { field: 'costCenter', label: 'Centro de Custo' }
  ];

  classificationOptions = [
    { value: '', label: 'Todas as classificações' },
    { value: 'COMPONENT', label: 'Componente' },
    { value: 'EQUIPMENT', label: 'Equipamento' }
  ];

  equipmentStatusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'UNDER_MAINTENANCE', label: 'Em Manutenção' }
  ];

  constructor(
    private equipmentsService: EquipmentsService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef,
    private imageService: ImageService
  ) { }

  ngOnInit() {
    this.loadEquipments();
  }

  loadEquipments() {
    this.loading = true;

    const searchParams: EquipmentSearchParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.currentSortBy,
      sortDirection: this.currentSortDirection
    };

    this.equipmentsService.getEquipments(searchParams, this.searchFilters)
    .subscribe({
      next: (response: PaginatedResponse<Equipment>) => {
        this.equipments = response.content;
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

  private updatePagination(response: PaginatedResponse<Equipment>) {
    this.currentPage = response.pageNumber;
    this.pageSize = response.pageSize;
    this.totalElements = response.totalElements;
    this.totalPages = response.totalPages;
    this.hasNext = response.hasNext;
    this.hasPrevious = response.hasPrevious;
  }

  clearFilters() {
    this.searchIdentification = '';
    this.searchClassification = '';
    this.searchEquipmentStatus = '';
    this.searchFilters = {};
    this.currentSortBy = 'identification';
    this.currentSortDirection = 'ASC';
    this.loadEquipments();
  }

  applyFilters() {
    this.searchFilters = {};

    if (this.searchIdentification.trim()) {
      this.searchFilters.identification = this.searchIdentification.trim();
    }
    
    if (this.searchClassification) {
      this.searchFilters.classification = this.searchClassification as any;
    }
    
    if (this.searchEquipmentStatus) {
      this.searchFilters.equipmentStatus = this.searchEquipmentStatus as any;
    }

    this.loadEquipments();
  }

  goToPreviousPage() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadEquipments();
    }
  }

  goToNextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadEquipments();
    }
  }

  goToFirtPage() {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.loadEquipments();
    }
  }

  goToLastPage() {
    if (this.totalPages > 0 && this.currentPage < this.totalPages -1) {
      this.currentPage = this.totalPages - 1;
      this.loadEquipments();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadEquipments();
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize = size || this.pageSize;
    this.currentPage = 0;
    this.loadEquipments();
  }

  displayClassification(classification: Equipment['classification'] | undefined) {
    if (!classification) return '-';
    const map: Record<string, string> = {
      COMPONENT: 'Componente',
      EQUIPMENT: 'Equipamento',
    };
    return map[classification] ?? classification;
  }

  displayCriticality(criticality: Equipment['criticality'] | undefined) {
    if (!criticality) return '-';
    const map: Record<string, string> = {
      HIGH: 'Alta',
      MEDIUM: 'Média',
      LOW: 'Baixa',
    };
    return map[criticality] ?? criticality;
  }

  displayEquipmentStatus(status: Equipment['equipmentStatus'] | undefined) {
    if (!status) return '-';
    const map: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      UNDER_MAINTENANCE: 'Em Manutenção',
    };
    return map[status] ?? status;
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

  onView(equipment: Equipment) {
    this.router.navigate(['/equipments/view', equipment.id]);
  }

  onEdit(equipment: Equipment) {
    this.router.navigate(['/equipments/edit', equipment.id]);
  }

  async onDelete(equipment: Equipment) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o equipamento "${equipment.identification}"? Esta ação não pode ser desfeita.`,
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
            this.deleteEquipment(equipment);
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToNewEquipment() {
    this.router.navigate(['/equipments/new']);
  }
  
  getCriticalityColor(criticality: Equipment['criticality'] | undefined): string {
    if (!criticality) return 'medium';
    const colorMap: Record<string, string> = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'success',
    };
    return colorMap[criticality] ?? 'medium';
  }

  getEquipmentStatusColor(status: Equipment['equipmentStatus'] | undefined): string {
    if (!status) return 'medium';
    const colorMap: Record<string, string> = {
      ACTIVE: 'success',
      INACTIVE: 'medium',
      UNDER_MAINTENANCE: 'warning',
    };
    return colorMap[status] ?? 'medium';
  }

  sortBy(field: string) {
    if (this.currentSortBy === field) {
      this.currentSortDirection = this.currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortBy = field;
      this.currentSortDirection = 'ASC';
    }
    
    this.loadEquipments();
  }

  isSortedBy(field: string): boolean {
    return this.currentSortBy === field;
  }

  getSortDirection(field: string): 'ASC' | 'DESC' | null {
    return this.isSortedBy(field) ? this.currentSortDirection : null;
  }
  
  private async deleteEquipment(equipment: Equipment) {
    this.loading = true;
    
    const imageUrlToDelete = equipment.imageUrl;
    
    this.equipmentsService.deleteEquipment(equipment.id!)
      .subscribe({
        next: async () => {
          if (imageUrlToDelete && !imageUrlToDelete.startsWith('http')) {
            await this.imageService.deleteImage(imageUrlToDelete);
          }
          
          this.showToast('Equipamento excluído com sucesso!', 'success');
          this.loadEquipments();
        },
        error: (error) => {
          this.showToast('Erro ao excluir equipamento: ' + error.error.message, 'danger');
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
