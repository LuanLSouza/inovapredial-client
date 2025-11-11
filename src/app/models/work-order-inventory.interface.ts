export interface WorkOrderInventoryRequest {
  inventoryId: string;
  quantity: number;
}

export interface WorkOrderInventoryResponse {
  inventoryId: string;
  inventoryName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  outputDate: string; 
}
