export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  driverId?: number;
  username: string;
  fullName?: string;
  email?: string;
  roleName?: string;
  isActive?: boolean;
}

export interface LoginResponse {
  token: string;
  userId: number;
  driverId?: number;
  username: string;
  fullName?: string;
  email?: string;
  roleName?: string;
  isActive?: boolean;
  message?: string;
}