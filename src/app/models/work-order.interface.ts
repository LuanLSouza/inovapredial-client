export interface WorkOrder {
  id: string;
  description: string;
  openingDate?: string;
  closingDate?: string;
  activityStatus?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  maintenanceType: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE';
  totalCost?: number;
  equipmentId: string;
  employeeId?: string;
  buildingId: string;
}

export interface WorkOrderRequest {
  description: string;
  openingDate?: string;
  closingDate?: string;
  activityStatus?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  maintenanceType: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE';
  totalCost?: number;
  equipmentId: string;
  employeeId?: string;
}

export interface WorkOrderFilter {
  description?: string;
  openingDateStart?: string;
  openingDateEnd?: string;
  closingDateStart?: string;
  closingDateEnd?: string;
  activityStatus?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  maintenanceType?: 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE';
  equipmentId?: string;
  employeeId?: string;
  totalCostMin?: number;
  totalCostMax?: number;
}

export interface WorkOrderSearchParams {
  page: string;
  size: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
