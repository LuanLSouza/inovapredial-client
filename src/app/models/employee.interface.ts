export interface Calendar {
  id?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface Employee {
  id: string;
  name: string;
  specialty?: string;
  contact?: string;
  calendar?: Calendar;
  buildingId: string;
}

export interface EmployeeRequest {
  name: string;
  specialty?: string;
  contact?: string;
  calendar?: Calendar;
}

export interface EmployeeFilter {
  name?: string;
  specialty?: string;
  contact?: string;
}

export interface EmployeeSearchParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
