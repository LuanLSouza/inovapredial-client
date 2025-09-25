import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { SelectedBuildingService } from "./selected-building.service";
import { 
  Building, 
  BuildingSearchRequest, 
  BuildingSearchParams,
  BuildingRequest, 
} from "../models/building.interface";
import { PaginatedResponse } from "../models/paginatedResponse";

@Injectable({
    providedIn: 'root'
  })
export class BuildingsService {
    private readonly API_URL = environment.apiUrl; 

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private selectedBuildingService: SelectedBuildingService
    ) {}

    /**
     * Busca edificações com paginação e filtros
     * @param searchParams Parâmetros de paginação e ordenação
     * @param searchRequest Filtros de busca (opcionais)
     * @returns Observable com resposta paginada das edificações
     */
    getBuildings(
      searchParams: BuildingSearchParams, 
      searchRequest?: BuildingSearchRequest
    ) {
      // Configurar parâmetros de query
      let params = new HttpParams()
        .set('page', searchParams.page.toString())
        .set('size', searchParams.size.toString());

      if (searchParams.sortBy) {
        params = params.set('sortBy', searchParams.sortBy);
      }

      if (searchParams.sortDirection) {
        params = params.set('sortDirection', searchParams.sortDirection);
      }

      // Preparar o body da requisição
      const body = searchRequest || {};

      return this.http.post<PaginatedResponse<Building>>(
        `${this.API_URL}/buildings/search`,
        body,
        { params,
          headers: this.authService.getAuthHeaders()
        }
      );
    }

    createBuilding(building: BuildingRequest) {
      return this.http.post<Building>(
        `${this.API_URL}/buildings`,
        building,
        { headers: this.authService.getAuthHeaders() }
      );
    }

    deleteBuilding(id: string) {
      return this.http.delete<void>(
        `${this.API_URL}/buildings/${id}`,
        { headers: this.authService.getAuthHeaders() }
      );
    }

    updateBuilding(id: string, building: BuildingRequest) {
      return this.http.put<Building>(
        `${this.API_URL}/buildings/${id}`,
        building,
        { headers: this.authService.getAuthHeaders() }
      );
    }

    getBuildingById(id: string) {
      return this.http.get<Building>(
        `${this.API_URL}/buildings/${id}`,
        { headers: this.authService.getAuthHeaders() }
      );
    }

    /**
     * Obtém os headers de autenticação com o ID da edificação selecionada
     * @returns Headers com autenticação e ID da edificação
     */
    private getAuthHeadersWithBuilding() {
      const headers = this.authService.getAuthHeaders();
      const selectedBuildingId = this.selectedBuildingService.getSelectedBuildingId();
      
      if (selectedBuildingId) {
        headers.set('X-Building-Id', selectedBuildingId);
      }
      
      return headers;
    }

    /**
     * Adiciona o ID da edificação selecionada aos parâmetros de query
     * @param params Parâmetros existentes
     * @returns Parâmetros com o ID da edificação adicionado
     */
    private addBuildingIdToParams(params: HttpParams): HttpParams {
      const selectedBuildingId = this.selectedBuildingService.getSelectedBuildingId();
      
      if (selectedBuildingId) {
        return params.set('buildingId', selectedBuildingId);
      }
      
      return params;
    }

    /**
     * Adiciona o ID da edificação selecionada ao body da requisição
     * @param body Body existente
     * @returns Body com o ID da edificação adicionado
     */
    private addBuildingIdToBody(body: any): any {
      const selectedBuildingId = this.selectedBuildingService.getSelectedBuildingId();
      
      if (selectedBuildingId) {
        return { ...body, buildingId: selectedBuildingId };
      }
      
      return body;
    }

}