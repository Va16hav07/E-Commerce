// User role enum
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  RIDER = 'RIDER'
}

// User type
export interface User {
  phone: string;
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
}

// Add other types if needed
export enum OrderStatus {
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  NOT_DELIVERED = 'NOT_DELIVERED',
}

export * from './types/index';
