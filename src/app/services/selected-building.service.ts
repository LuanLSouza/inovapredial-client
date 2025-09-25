import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Building } from '../models/building.interface';

@Injectable({
  providedIn: 'root'
})
export class SelectedBuildingService {
  private selectedBuildingSubject = new BehaviorSubject<Building | null>(null);
  public selectedBuilding$ = this.selectedBuildingSubject.asObservable();

  constructor() {
    // Tentar carregar edificação selecionada do localStorage
    this.loadSelectedBuildingFromStorage();
  }

  /**
   * Define a edificação selecionada
   * @param building Edificação selecionada
   */
  setSelectedBuilding(building: Building | null): void {
    this.selectedBuildingSubject.next(building);
    
    // Salvar no localStorage para persistir entre sessões
    if (building) {
      localStorage.setItem('selectedBuilding', JSON.stringify(building));
    } else {
      localStorage.removeItem('selectedBuilding');
    }
  }

  /**
   * Obtém a edificação atualmente selecionada
   * @returns Edificação selecionada ou null
   */
  getSelectedBuilding(): Building | null {
    return this.selectedBuildingSubject.value;
  }

  /**
   * Obtém o ID da edificação selecionada
   * @returns ID da edificação ou null
   */
  getSelectedBuildingId(): string | null {
    const building = this.getSelectedBuilding();
    return building ? building.id : null;
  }

  /**
   * Carrega a edificação selecionada do localStorage
   */
  private loadSelectedBuildingFromStorage(): void {
    try {
      const storedBuilding = localStorage.getItem('selectedBuilding');
      if (storedBuilding) {
        const building: Building = JSON.parse(storedBuilding);
        this.selectedBuildingSubject.next(building);
      }
    } catch (error) {
      console.error('Erro ao carregar edificação selecionada do localStorage:', error);
      localStorage.removeItem('selectedBuilding');
    }
  }

  /**
   * Limpa a edificação selecionada
   */
  clearSelectedBuilding(): void {
    this.setSelectedBuilding(null);
  }
}
