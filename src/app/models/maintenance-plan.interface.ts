export interface MaintenancePlan {
  id: string;
  frequencyDays: number;
  requiresShutdown: boolean;
  description?: string;
  maintenanceType: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE';
  buildingId: string;
}

export interface MaintenancePlanRequest {
  frequencyDays: number;
  requiresShutdown: boolean;
  description?: string;
  maintenanceType: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE';
}

export interface MaintenancePlanFilter {
  frequencyDays?: number;
  requiresShutdown?: boolean;
  description?: string;
  maintenanceType?: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE';
}

export interface MaintenancePlanSearchParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
