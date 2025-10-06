import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { SelectedBuildingService } from "./selected-building.service";
import { 
  WorkOrder, 
  WorkOrderSearchParams, 
  WorkOrderFilter,
  WorkOrderRequest, 
} from "../models/work-order.interface";
import { PaginatedResponse } from "../models/paginatedResponse";

@Injectable({
    providedIn: 'root'
  })
export class WorkOrdersService {
    private readonly API_URL = environment.apiUrl; 

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private selectedBuildingService: SelectedBuildingService
    ) {}

    /**
     * Busca ordens de serviço com paginação e filtros
     * @param searchParams Parâmetros de paginação e ordenação
     * @param searchRequest Filtros de busca (opcionais)
     * @returns Observable com resposta paginada das ordens de serviço
     */
    getWorkOrders(
      searchParams: WorkOrderSearchParams, 
      searchRequest?: WorkOrderFilter
    ) {
      // Configurar parâmetros de query
      let params = new HttpParams()
        .set('page', searchParams.page)
        .set('size', searchParams.size)
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      if (searchParams.sortBy) {
        params = params.set('sortBy', searchParams.sortBy);
      }

      if (searchParams.sortDirection) {
        params = params.set('sortDirection', searchParams.sortDirection);
      }

        // Preparar o body da requisição
        const body = searchRequest || {};

        return this.http.post<PaginatedResponse<WorkOrder>>(
          `${this.API_URL}/work-orders/search`,
          body,
          { params,
            headers: this.authService.getAuthHeaders()
          }
        );
    }

    createWorkOrder(workOrder: WorkOrderRequest) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.post<WorkOrder>(
        `${this.API_URL}/work-orders`,
        workOrder,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    deleteWorkOrder(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.delete<void>(
        `${this.API_URL}/work-orders/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    updateWorkOrder(id: string, workOrder: WorkOrderRequest) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.put<WorkOrder>(
        `${this.API_URL}/work-orders/${id}`,
        workOrder,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }

    getWorkOrderById(id: string) {
      const params = new HttpParams()
        .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

      return this.http.get<WorkOrder>(
        `${this.API_URL}/work-orders/${id}`,
        { 
          params,
          headers: this.authService.getAuthHeaders() 
        }
      );
    }
}
