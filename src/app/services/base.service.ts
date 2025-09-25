import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { SelectedBuildingService } from './selected-building.service';

/**
 * Serviço base que fornece funcionalidades comuns para serviços
 * que precisam incluir o ID da edificação selecionada nas requisições
 */
@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected readonly API_URL = environment.apiUrl;

  constructor(
    protected http: HttpClient,
    protected authService: AuthService,
    protected selectedBuildingService: SelectedBuildingService
  ) {}

  /**
   * Obtém os headers de autenticação com o ID da edificação selecionada
   * @returns Headers com autenticação e ID da edificação
   */
  protected getAuthHeadersWithBuilding() {
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
  protected addBuildingIdToParams(params: URLSearchParams): URLSearchParams {
    const selectedBuildingId = this.selectedBuildingService.getSelectedBuildingId();
    
    if (selectedBuildingId) {
      params.set('buildingId', selectedBuildingId);
    }
    
    return params;
  }

  /**
   * Adiciona o ID da edificação selecionada ao body da requisição
   * @param body Body existente
   * @returns Body com o ID da edificação adicionado
   */
  protected addBuildingIdToBody(body: any): any {
    const selectedBuildingId = this.selectedBuildingService.getSelectedBuildingId();
    
    if (selectedBuildingId) {
      return { ...body, buildingId: selectedBuildingId };
    }
    
    return body;
  }

  /**
   * Verifica se há uma edificação selecionada
   * @returns true se há uma edificação selecionada
   */
  protected hasSelectedBuilding(): boolean {
    return this.selectedBuildingService.getSelectedBuildingId() !== null;
  }

  /**
   * Obtém o ID da edificação selecionada
   * @returns ID da edificação ou null
   */
  protected getSelectedBuildingId(): string | null {
    return this.selectedBuildingService.getSelectedBuildingId();
  }
}
