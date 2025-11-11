export type TaskActivityStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TaskRequest {
  title: string;
  description?: string;
  activityStatus?: TaskActivityStatus;
  estimatedTime?: number;
  startDate?: string; // ISO date-time
  endDate?: string;   // ISO date-time
  timeSpent?: number;
  cost?: number;
  workOrderId: string; // uuid
  employeeId?: string; // uuid
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  activityStatus: TaskActivityStatus;
  estimatedTime?: number;
  startDate?: string; 
  endDate?: string;   
  timeSpent?: number;
  cost?: number;
  workOrderId: string; 
  employeeId?: string; 
  buildingId: string; 
  reason?: string; 
}

export interface TaskFilter {
  title?: string;
  description?: string;
  activityStatus?: TaskActivityStatus;
  estimatedTimeMin?: number;
  estimatedTimeMax?: number;
  startDateStart?: string;
  startDateEnd?: string;
  endDateStart?: string;
  endDateEnd?: string;
  timeSpentMin?: number;
  timeSpentMax?: number;
  costMin?: number;
  costMax?: number;
  workOrderId?: string; 
  employeeId?: string; 
}

export interface TaskSearchParams {
  page: string;
  size: string;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

