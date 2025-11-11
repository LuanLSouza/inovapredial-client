import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BuildingsService } from '../../services/buildings.service';
import { SelectedBuildingService } from '../../services/selected-building.service';
import { Building, BuildingSearchParams } from '../../models/building.interface';

@Component({
  selector: 'app-building-selection-modal',
  templateUrl: './building-selection-modal.component.html',
  styleUrls: ['./building-selection-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BuildingSelectionModalComponent implements OnInit, OnDestroy {
  buildings: Building[] = [];
  loading = false;
  searchTerm = '';
  private destroy$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private buildingsService: BuildingsService,
    private selectedBuildingService: SelectedBuildingService
  ) {}

  ngOnInit() {
    this.loadBuildings();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega a lista de edificações
   */
  loadBuildings() {
    this.loading = true;
    
    const searchParams: BuildingSearchParams = {
      page: 0,
      size: 100, 
      sortBy: 'name',
      sortDirection: 'ASC'
    };

    this.buildingsService.getBuildings(searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.buildings = response.content || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar edificações:', error);
          this.loading = false;
        }
      });
  }

  /**
   * Filtra edificações baseado no termo de busca
   */
  get filteredBuildings(): Building[] {
    if (!this.searchTerm.trim()) {
      return this.buildings;
    }
    
    return this.buildings.filter(building =>
      building.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      building.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectBuilding(building: Building) {
    this.selectedBuildingService.setSelectedBuilding(building);
    this.modalController.dismiss(building);
  }

  dismiss() {
    this.modalController.dismiss();
  }

  isSelected(building: Building): boolean {
    const selectedBuilding = this.selectedBuildingService.getSelectedBuilding();
    return selectedBuilding?.id === building.id;
  }

  getBuildingTypeLabel(buildingType: string): string {
    const labels: { [key: string]: string } = {
      'RESIDENTIAL': 'Residencial',
      'COMMERCIAL': 'Comercial',
      'INDUSTRIAL': 'Industrial',
      'MIXED': 'Misto',
      'OTHER': 'Outro'
    };
    return labels[buildingType] || buildingType;
  }

  getAddressString(address: any): string {
    if (!address) return '';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.number) parts.push(address.number.toString());
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    
    return parts.join(', ');
  }
}
