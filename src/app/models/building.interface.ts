export interface Address {
  id?: string;
  street?: string;
  number?: number;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Building {
  id: string;
  name: string;
  buildingType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED' | 'OTHER';
  constructionYear: number;
  description: string;
  address: Address | null;
}

export interface BuildingRequest {
  name: string;
  buildingType: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED' | 'OTHER';
  constructionYear: number;
  description: string;
  addressRequest?: Address | null;
}

export interface BuildingSearchRequest {
  name?: string;
  buildingType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'MIXED' | 'OTHER';
  constructionYear?: number;
  description?: string;
  street?: string;
  number?: number;
  district?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface BuildingSearchParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}


