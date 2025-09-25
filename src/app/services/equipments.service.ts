import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { SelectedBuildingService } from "./selected-building.service";
import { 
  Equipment, 
  EquipmentSearchParams, 
  EquipmentFilter,
  EquipmentRequest, 
} from "../models/equipment.interface";
import { PaginatedResponse } from "../models/paginatedResponse";

@Injectable({
    providedIn: 'root'
  })
export class EquipmentsService {
    private readonly API_URL = environment.apiUrl; 

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private selectedBuildingService: SelectedBuildingService
    ) {}

    /**
     * Busca equipamentos com paginação e filtros
     * @param searchParams Parâmetros de paginação e ordenação
     * @param searchRequest Filtros de busca (opcionais)
     * @returns Observable com resposta paginada dos equipamentos
     */
    getEquipments(
      searchParams: EquipmentSearchParams, 
      searchRequest?: EquipmentFilter
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

      return this.http.post<PaginatedResponse<Equipment>>(
        `${this.API_URL}/equipments/search`,
        body,
        { params,
          headers: this.authService.getAuthHeaders()
        }
      );
    }

    createEquipment(equipment: EquipmentRequest) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.post<Equipment>(
        `${this.API_URL}/equipments`,
        equipment,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    deleteEquipment(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.delete<void>(
        `${this.API_URL}/equipments/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    updateEquipment(id: string, equipment: EquipmentRequest) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.put<Equipment>(
        `${this.API_URL}/equipments/${id}`,
        equipment,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    getEquipmentById(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.get<Equipment>(
        `${this.API_URL}/equipments/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }
}
