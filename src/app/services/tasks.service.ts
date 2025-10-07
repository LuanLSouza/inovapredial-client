import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthService } from "./auth.service";
import { SelectedBuildingService } from "./selected-building.service";
import { PaginatedResponse } from "../models/paginatedResponse";
import { TaskFilter, TaskRequest, TaskResponse, TaskSearchParams, TaskActivityStatus } from "../models/task.interface";

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private selectedBuildingService: SelectedBuildingService
  ) {}

  findById(id: string) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

    return this.http.get<TaskResponse>(
      `${this.API_URL}/tasks/${id}`,
      {
        params,
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  update(id: string, request: TaskRequest) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

    return this.http.put<TaskResponse>(
      `${this.API_URL}/tasks/${id}`,
      request,
      {
        params,
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  delete(id: string) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

    return this.http.delete<void>(
      `${this.API_URL}/tasks/${id}`,
      {
        params,
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  createBatch(requests: TaskRequest[]) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '');

    return this.http.post<TaskResponse[]>(
      `${this.API_URL}/tasks`,
      requests,
      {
        params,
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  search(searchParams: TaskSearchParams, filter?: TaskFilter) {
    let params = new HttpParams()
      .set('page', searchParams.page)
      .set('size', searchParams.size)
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '')
      .set('sortBy', searchParams.sortBy || 'startDate')
      .set('sortDirection', searchParams.sortDirection || 'DESC');

    const body = filter || {};

    return this.http.post<PaginatedResponse<TaskResponse>>(
      `${this.API_URL}/tasks/search`,
      body,
      {
        params,
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  updateStatus(id: string, status: TaskActivityStatus, reason: string) {
    const params = new HttpParams()
      .set('buildingId', this.selectedBuildingService.getSelectedBuildingId() || '')
      .set('status', status);

    const body = { reason } as { reason: string };

    return this.http.patch<TaskResponse>(
      `${this.API_URL}/tasks/${id}/status`,
      body,
      {
        params,
        headers: this.authService.getAuthHeaders()
      }
    );
  }
}


