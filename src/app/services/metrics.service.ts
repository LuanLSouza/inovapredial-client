import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { AuthService } from './auth.service';
import { SelectedBuildingService } from './selected-building.service';
import { MetricFilterDTO, MetricResponseDTO } from '../models/metrics.interface';

@Injectable({
  providedIn: 'root'
})
export class MetricsService extends BaseService {

  constructor(
    http: HttpClient,
    authService: AuthService,
    selectedBuildingService: SelectedBuildingService
  ) {
    super(http, authService, selectedBuildingService);
  }

  /**
   * Obtém todas as métricas consolidadas
   * @param filters Filtros para as métricas
   * @returns Observable com todas as métricas
   */
  getCompleteMetrics(filters: MetricFilterDTO): Observable<MetricResponseDTO> {
    const url = `${this.API_URL}/metrics/complete`;
    
    // Adiciona o buildingId aos parâmetros de query
    const params = new URLSearchParams();
    this.addBuildingIdToParams(params);
    
    // Adiciona outros filtros aos parâmetros se existirem
    if (filters.startDate) {
      params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params.set('endDate', filters.endDate);
    }
    if (filters.equipmentId) {
      params.set('equipmentId', filters.equipmentId);
    }
    if (filters.employeeId) {
      params.set('employeeId', filters.employeeId);
    }
    if (filters.maintenanceType) {
      params.set('maintenanceType', filters.maintenanceType);
    }

    const fullUrl = `${url}?${params.toString()}`;
    
    return this.http.post<MetricResponseDTO>(fullUrl, {}, {
      headers: this.getAuthHeadersWithBuilding()
    });
  }

  /**
   * Obtém métricas específicas de ordens de serviço
   * @param filters Filtros para as métricas
   * @returns Observable com métricas de ordens de serviço
   */
  getWorkOrderMetrics(filters: MetricFilterDTO): Observable<any> {
    const url = `${this.API_URL}/metrics/work-orders`;
    
    const params = new URLSearchParams();
    this.addBuildingIdToParams(params);
    
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.equipmentId) params.set('equipmentId', filters.equipmentId);
    if (filters.employeeId) params.set('employeeId', filters.employeeId);
    if (filters.maintenanceType) params.set('maintenanceType', filters.maintenanceType);

    const fullUrl = `${url}?${params.toString()}`;
    
    return this.http.post<any>(fullUrl, {}, {
      headers: this.getAuthHeadersWithBuilding()
    });
  }

  /**
   * Obtém métricas de séries temporais
   * @param filters Filtros para as métricas
   * @returns Observable com métricas de séries temporais
   */
  getTimeSeriesMetrics(filters: MetricFilterDTO): Observable<any> {
    const url = `${this.API_URL}/metrics/time-series`;
    
    const params = new URLSearchParams();
    this.addBuildingIdToParams(params);
    
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.equipmentId) params.set('equipmentId', filters.equipmentId);
    if (filters.employeeId) params.set('employeeId', filters.employeeId);
    if (filters.maintenanceType) params.set('maintenanceType', filters.maintenanceType);

    const fullUrl = `${url}?${params.toString()}`;
    
    return this.http.post<any>(fullUrl, {}, {
      headers: this.getAuthHeadersWithBuilding()
    });
  }

  /**
   * Obtém métricas de inventário
   * @param filters Filtros para as métricas
   * @returns Observable com métricas de inventário
   */
  getInventoryMetrics(filters: MetricFilterDTO): Observable<any> {
    const url = `${this.API_URL}/metrics/inventory`;
    
    const params = new URLSearchParams();
    this.addBuildingIdToParams(params);
    
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.equipmentId) params.set('equipmentId', filters.equipmentId);
    if (filters.employeeId) params.set('employeeId', filters.employeeId);
    if (filters.maintenanceType) params.set('maintenanceType', filters.maintenanceType);

    const fullUrl = `${url}?${params.toString()}`;
    
    return this.http.post<any>(fullUrl, {}, {
      headers: this.getAuthHeadersWithBuilding()
    });
  }

  /**
   * Obtém métricas gerais
   * @param filters Filtros para as métricas
   * @returns Observable com métricas gerais
   */
  getGeneralMetrics(filters: MetricFilterDTO): Observable<any> {
    const url = `${this.API_URL}/metrics/general`;
    
    const params = new URLSearchParams();
    this.addBuildingIdToParams(params);
    
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.equipmentId) params.set('equipmentId', filters.equipmentId);
    if (filters.employeeId) params.set('employeeId', filters.employeeId);
    if (filters.maintenanceType) params.set('maintenanceType', filters.maintenanceType);

    const fullUrl = `${url}?${params.toString()}`;
    
    return this.http.post<any>(fullUrl, {}, {
      headers: this.getAuthHeadersWithBuilding()
    });
  }

  /**
   * Obtém métricas de equipamentos
   * @param filters Filtros para as métricas
   * @returns Observable com métricas de equipamentos
   */
  getEquipmentMetrics(filters: MetricFilterDTO): Observable<any> {
    const url = `${this.API_URL}/metrics/equipment`;
    
    const params = new URLSearchParams();
    this.addBuildingIdToParams(params);
    
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.equipmentId) params.set('equipmentId', filters.equipmentId);
    if (filters.employeeId) params.set('employeeId', filters.employeeId);
    if (filters.maintenanceType) params.set('maintenanceType', filters.maintenanceType);

    const fullUrl = `${url}?${params.toString()}`;
    
    return this.http.post<any>(fullUrl, {}, {
      headers: this.getAuthHeadersWithBuilding()
    });
  }
}
