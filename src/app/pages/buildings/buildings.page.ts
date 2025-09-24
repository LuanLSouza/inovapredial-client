import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BuildingsService } from 'src/app/services/buildings.service';
import { Building, BuildingSearchParams, BuildingSearchRequest } from 'src/app/models/building.interface';
import { PaginatedResponse } from 'src/app/models/paginatedResponse';
import { IONIC_IMPORTS } from 'src/app/shered/ionic-imports';
import { AlertController, ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-buildings',
  templateUrl: './buildings.page.html',
  styleUrls: ['./buildings.page.scss'],
  standalone: true,
  imports: [...IONIC_IMPORTS, CommonModule, FormsModule]
})
export class BuildingsPage implements OnInit {

  buildings: Building[] = [];
  loading = false;
  loadingMore = false;

  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;

  searchFilters: BuildingSearchRequest = {};

  searchName = '';
  searchBuildingType = '';
  searchConstructionYear: number | null = null;

  pageSizeOptions = [5, 10, 20, 50, 100];

  currentSortBy = 'name';
  currentSortDirection: 'ASC' | 'DESC' = 'ASC';

  sortOptions = [
    { field: 'name', label: 'Nome' },
    { field: 'buildingType', label: 'Tipo de Edificação' },
    { field: 'constructionYear', label: 'Ano de Construção' },
    { field: 'address.city', label: 'Cidade' },
    { field: 'address.street', label: 'Endereço' }
  ];

  buildingTypeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'RESIDENTIAL', label: 'Residencial' },
    { value: 'COMMERCIAL', label: 'Comercial' },
    { value: 'INDUSTRIAL', label: 'Industrial' },
    { value: 'MIXED', label: 'Misto' },
    { value: 'OTHER', label: 'Outros' },
  ]

  constructor(
    private buildingsService: BuildingsService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadBuildings();
  }

  loadBuildings() {
    this.loading = true;

    const searchParams: BuildingSearchParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: this.currentSortBy,
      sortDirection: this.currentSortDirection
    };

    this.buildingsService.getBuildings(searchParams, this.searchFilters)
    .subscribe({
      next: (response: PaginatedResponse<Building>) => {
        this.buildings = response.content;
        this.updatePagination(response);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar edificações:', error);
        this.loading = false;
      }
    })
  }

  private updatePagination(response: PaginatedResponse<Building>) {
    this.currentPage = response.pageNumber;
    this.pageSize = response.pageSize;
    this.totalElements = response.totalElements;
    this.totalPages = response.totalPages;
    this.hasNext = response.hasNext;
    this.hasPrevious = response.hasPrevious;
  }

  clearFilters() {
    this.searchName = '';
    this.searchBuildingType = '';
    this.searchConstructionYear = null;
    this.searchFilters = {};
    this.currentSortBy = 'name';
    this.currentSortDirection = 'ASC';
    this.loadBuildings();
  }

  applyFilters() {
    this.searchFilters = {};

    if (this.searchName.trim()) {
      this.searchFilters.name = this.searchName.trim();
    }
    
    if (this.searchBuildingType) {
      this.searchFilters.buildingType = this.searchBuildingType as any;
    }
    
    if (this.searchConstructionYear) {
      this.searchFilters.constructionYear = this.searchConstructionYear;
    }

    this.loadBuildings();
  }

  goToPreviousPage() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadBuildings();
    }
  }

  goToNextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadBuildings();
    }
  }

  goToFirtPage() {
    if (this.currentPage !== 0) {
      this.currentPage = 0;
      this.loadBuildings();
    }
  }

  goToLastPage() {
    if (this.totalPages > 0 && this.currentPage < this.totalPages -1) {
      this.currentPage = this.totalPages - 1;
      this.loadBuildings();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBuildings();
    }
  }

  onPageSizeChange(size: number) {
    this.pageSize = size || this.pageSize;
    this.currentPage = 0;
    this.loadBuildings();
  }

  displayBuildingType(bt: Building['buildingType'] | undefined) {
    if (!bt) return '-';
    const map: Record<string, string> = {
      RESIDENTIAL: 'Residencial',
      COMMERCIAL: 'Comercial',
      INDUSTRIAL: 'Industrial',
      MIXED: 'Misto',
      OTHER: 'Outros',
    };
    return map[bt] ?? bt;
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


  onView(building: Building) {}

  onEdit(building: Building) {
    this.router.navigate(['/buildings/edit', building.id]);
  }

  async onDelete(building: Building) {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a edificação "${building.name}"? Esta ação não pode ser desfeita.`,
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
            this.deleteBuilding(building);
          }
        }
      ]
    });

    await alert.present();
  }

  navigateToNewBuilding() {
    this.router.navigate(['/buildings/new']);
  }
  
  getBuildingTypeColor(bt: Building['buildingType'] | undefined): string {
    if (!bt) return 'medium';
    const colorMap: Record<string, string> = {
      RESIDENTIAL: 'success',
      COMMERCIAL: 'primary',
      INDUSTRIAL: 'warning',
      MIXED: 'secondary',
      OTHER: 'tertiary',
    };
    return colorMap[bt] ?? 'medium';
  }

  sortBy(field: string) {
    if (this.currentSortBy === field) {
      this.currentSortDirection = this.currentSortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.currentSortBy = field;
      this.currentSortDirection = 'ASC';
    }
    
    this.loadBuildings();
  }

  isSortedBy(field: string): boolean {
    return this.currentSortBy === field;
  }

  getSortDirection(field: string): 'ASC' | 'DESC' | null {
    return this.isSortedBy(field) ? this.currentSortDirection : null;
  }
  
  private deleteBuilding(building: Building) {
    this.loading = true;
    
    this.buildingsService.deleteBuilding(building.id!)
      .subscribe({
        next: () => {
          this.showToast('Edificação excluída com sucesso!', 'success');
          this.loadBuildings(); // Recarrega a lista
        },
        error: (error) => {
          console.error('Erro ao excluir edificação:', error);
          this.showToast('Erro ao excluir edificação. Tente novamente.', 'danger');
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



