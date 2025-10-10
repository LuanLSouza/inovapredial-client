export interface EquipmentPlanRequest {
  equipmentId: string;
  planId: string;
  startDate: string; // formato date (YYYY-MM-DD)
}

export interface EquipmentPlanResponse {
  equipmentId: string;
  equipmentIdentification: string;
  planId: string;
  planDescription: string;
  startDate: string; // formato date (YYYY-MM-DD)
  nextDueDate: string; // formato date (YYYY-MM-DD)
  realized: boolean;
  buildingId: string;
}

export interface EquipmentPlanUpdateRequest {
  realized: boolean;
}
