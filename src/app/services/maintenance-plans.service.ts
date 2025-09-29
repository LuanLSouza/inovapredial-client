import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { SelectedBuildingService } from "./selected-building.service";
import { 
  MaintenancePlan, 
  MaintenancePlanSearchParams, 
  MaintenancePlanFilter,
  MaintenancePlanRequest, 
} from "../models/maintenance-plan.interface";
import { PaginatedResponse } from "../models/paginatedResponse";

@Injectable({
    providedIn: 'root'
  })
export class MaintenancePlansService {
    private readonly API_URL = environment.apiUrl; 

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private selectedBuildingService: SelectedBuildingService
    ) {}

    /**
     * Busca planos de manutenção com paginação e filtros
     * @param searchParams Parâmetros de paginação e ordenação
     * @param searchRequest Filtros de busca (opcionais)
     * @returns Observable com resposta paginada dos planos de manutenção
     */
    getMaintenancePlans(
      searchParams: MaintenancePlanSearchParams, 
      searchRequest?: MaintenancePlanFilter
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

      return this.http.post<PaginatedResponse<MaintenancePlan>>(
        `${this.API_URL}/maintenance-plans/search`,
        body,
        { params,
          headers: this.authService.getAuthHeaders()
        }
      );
    }

    createMaintenancePlan(maintenancePlan: MaintenancePlanRequest) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.post<MaintenancePlan>(
        `${this.API_URL}/maintenance-plans`,
        maintenancePlan,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    deleteMaintenancePlan(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.delete<void>(
        `${this.API_URL}/maintenance-plans/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    updateMaintenancePlan(id: string, maintenancePlan: MaintenancePlanRequest) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.put<MaintenancePlan>(
        `${this.API_URL}/maintenance-plans/${id}`,
        maintenancePlan,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    getMaintenancePlanById(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.get<MaintenancePlan>(
        `${this.API_URL}/maintenance-plans/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }
}
