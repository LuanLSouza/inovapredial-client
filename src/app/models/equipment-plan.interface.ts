export interface EquipmentPlanRequest {
  equipmentId: string;
  planId: string;
  startDate: string; 
}

export interface EquipmentPlanResponse {
  equipmentId: string;
  equipmentIdentification: string;
  planId: string;
  planDescription: string;
  startDate: string; 
  nextDueDate: string; 
  realized: boolean;
  buildingId: string;
}

export interface EquipmentPlanUpdateRequest {
  realized: boolean;
}
