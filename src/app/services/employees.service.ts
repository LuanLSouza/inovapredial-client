import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { SelectedBuildingService } from "./selected-building.service";
import { 
  Employee, 
  EmployeeSearchParams, 
  EmployeeFilter,
  EmployeeRequest, 
} from "../models/employee.interface";
import { PaginatedResponse } from "../models/paginatedResponse";

@Injectable({
    providedIn: 'root'
  })
export class EmployeesService {
    private readonly API_URL = environment.apiUrl; 

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private selectedBuildingService: SelectedBuildingService
    ) {}

    /**
     * Busca employees com paginação e filtros
     * @param searchParams Parâmetros de paginação e ordenação
     * @param searchRequest Filtros de busca (opcionais)
     * @returns Observable com resposta paginada dos employees
     */
    getEmployees(
      searchParams: EmployeeSearchParams, 
      searchRequest?: EmployeeFilter
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

      return this.http.post<PaginatedResponse<Employee>>(
        `${this.API_URL}/employees/search`,
        body,
        { params,
          headers: this.authService.getAuthHeaders()
        }
      );
    }

    createEmployee(employee: EmployeeRequest) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.post<Employee>(
        `${this.API_URL}/employees`,
        employee,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    deleteEmployee(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.delete<void>(
        `${this.API_URL}/employees/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    updateEmployee(id: string, employee: EmployeeRequest) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.put<Employee>(
        `${this.API_URL}/employees/${id}`,
        employee,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    getEmployeeById(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.get<Employee>(
        `${this.API_URL}/employees/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }
}
