export interface Calendar {
  id?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface Equipment {
  id: string;
  identification: string;
  description?: string;
  serialNumber?: string;
  classification: 'COMPONENT' | 'EQUIPMENT';
  location?: string;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  purchaseDate?: string;
  warrantyEndDate?: string;
  price?: number;
  equipmentStatus?: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  imageUrl?: string;
  group?: string;
  model?: string;
  costCenter?: string;
  calendar?: Calendar;
  buildingId: string;
}

export interface EquipmentRequest {
  identification: string;
  description?: string;
  serialNumber?: string;
  classification: 'COMPONENT' | 'EQUIPMENT';
  location?: string;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  purchaseDate?: string;
  warrantyEndDate?: string;
  price?: number;
  equipmentStatus?: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  imageUrl?: string;
  group?: string;
  model?: string;
  costCenter?: string;
  calendar?: Calendar;
}

export interface EquipmentFilter {
  identification?: string;
  description?: string;
  serialNumber?: string;
  classification?: 'COMPONENT' | 'EQUIPMENT';
  location?: string;
  criticality?: 'HIGH' | 'MEDIUM' | 'LOW';
  equipmentStatus?: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  group?: string;
  model?: string;
  costCenter?: string;
}

export interface EquipmentSearchParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
