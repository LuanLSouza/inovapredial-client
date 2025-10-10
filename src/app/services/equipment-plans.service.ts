import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { SelectedBuildingService } from "./selected-building.service";
import { 
  EquipmentPlanRequest,
  EquipmentPlanResponse,
  EquipmentPlanUpdateRequest
} from "../models/equipment-plan.interface";

@Injectable({
  providedIn: 'root'
})
export class EquipmentPlansService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private selectedBuildingService: SelectedBuildingService
  ) {}

  /**
   * Busca todos os planos de manutenção associados a um equipamento
   * @param equipmentId ID do equipamento
   * @returns Observable com lista de planos associados
   */
  getEquipmentPlans(equipmentId: string) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

    return this.http.get<EquipmentPlanResponse[]>(
      `${this.API_URL}/equipment-plans/equipment/${equipmentId}`,
      { 
        params,
        headers: this.authService.getAuthHeaders() 
      }
    );
  }

  /**
   * Adiciona um plano de manutenção a um equipamento
   * @param request Dados da associação (equipmentId, planId, startDate)
   * @returns Observable com resposta da associação
   */
  addPlanToEquipment(request: EquipmentPlanRequest) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

    return this.http.post<EquipmentPlanResponse>(
      `${this.API_URL}/equipment-plans`,
      request,
      { 
        params,
        headers: this.authService.getAuthHeaders() 
      }
    );
  }

  /**
   * Remove um plano de manutenção de um equipamento
   * @param equipmentId ID do equipamento
   * @param planId ID do plano de manutenção
   * @returns Observable vazio (204 No Content)
   */
  removePlanFromEquipment(equipmentId: string, planId: string) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

    return this.http.delete<void>(
      `${this.API_URL}/equipment-plans/equipment/${equipmentId}/maintenance-plan/${planId}`,
      { 
        params,
        headers: this.authService.getAuthHeaders() 
      }
    );
  }

  /**
   * Atualiza o status de realização de um plano de manutenção
   * @param equipmentId ID do equipamento
   * @param planId ID do plano de manutenção
   * @param request Dados da atualização (realized)
   * @returns Observable com resposta atualizada
   */
  updateRealized(equipmentId: string, planId: string, request: EquipmentPlanUpdateRequest) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

    return this.http.patch<EquipmentPlanResponse>(
      `${this.API_URL}/equipment-plans/equipment/${equipmentId}/maintenance-plan/${planId}`,
      request,
      { 
        params,
        headers: this.authService.getAuthHeaders() 
      }
    );
  }
}
