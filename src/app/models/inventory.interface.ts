export interface Inventory {
  id: string;
  itemType: 'MATERIAL' | 'PART';
  name: string;
  cost: number;
  quantity: number;
  minimumStock?: number;
  employeeId?: string;
  buildingId: string;
}

export interface InventoryRequest {
  itemType: 'MATERIAL' | 'PART';
  name: string;
  cost: number;
  quantity: number;
  minimumStock?: number;
  employeeId?: string;
}

export interface InventoryFilter {
  itemType?: 'MATERIAL' | 'PART';
  name?: string;
  employeeId?: string;
}

export interface InventorySearchParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
