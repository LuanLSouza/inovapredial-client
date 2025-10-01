import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { SelectedBuildingService } from "./selected-building.service";
import { 
  Inventory, 
  InventorySearchParams, 
  InventoryFilter,
  InventoryRequest, 
} from "../models/inventory.interface";
import { PaginatedResponse } from "../models/paginatedResponse";

@Injectable({
    providedIn: 'root'
  })
export class InventoriesService {
    private readonly API_URL = environment.apiUrl; 

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private selectedBuildingService: SelectedBuildingService
    ) {}

    /**
     * Busca itens de inventário com paginação e filtros
     * @param searchParams Parâmetros de paginação e ordenação
     * @param searchRequest Filtros de busca (opcionais)
     * @returns Observable com resposta paginada dos itens de inventário
     */
    getInventories(
      searchParams: InventorySearchParams, 
      searchRequest?: InventoryFilter
    ) {
      // Configurar parâmetros de query
      let params = new HttpParams()
        .set('page', searchParams.page.toString())
        .set('size', searchParams.size.toString())
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      if (searchParams.sortBy) {
        params = params.set('sortBy', searchParams.sortBy);
      }

      if (searchParams.sortDirection) {
        params = params.set('sortDirection', searchParams.sortDirection);
      }

      // Preparar o body da requisição
      const body = searchRequest || {};

      return this.http.post<PaginatedResponse<Inventory>>(
        `${this.API_URL}/inventories/search`,
        body,
        { params,
          headers: this.authService.getAuthHeaders()
        }
      );
    }

    createInventory(inventory: InventoryRequest) {
      console.log('Creating inventory with payload:', inventory);
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.post<Inventory>(
        `${this.API_URL}/inventories`,
        inventory,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    deleteInventory(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.delete<void>(
        `${this.API_URL}/inventories/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    updateInventory(id: string, inventory: InventoryRequest) {
      console.log('Updating inventory with payload:', inventory);
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.put<Inventory>(
        `${this.API_URL}/inventories/${id}`,
        inventory,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    getInventoryById(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.get<Inventory>(
        `${this.API_URL}/inventories/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }
}
