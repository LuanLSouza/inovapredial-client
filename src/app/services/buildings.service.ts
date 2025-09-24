import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { 
  Building, 
  BuildingSearchRequest, 
  BuildingSearchParams, 
} from "../models/building.interface";
import { PaginatedResponse } from "../models/paginatedResponse";

@Injectable({
    providedIn: 'root'
  })
export class BuildingsService {
    private readonly API_URL = environment.apiUrl; 

    constructor(private http: HttpClient,
        private authService: AuthService
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

}