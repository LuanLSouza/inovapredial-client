export interface OwnUserRequestDTO {
  username: string;
  password: string;
  email: string;
  role?: 'ADMIN' | 'USER';
  buildingIds?: string[];
}


