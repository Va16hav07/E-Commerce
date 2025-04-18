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
  // ...other user fields
}

// Add other types if needed
export enum OrderStatus {
  PLACED = 'PLACED',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  ON_THE_WAY = 'ON_THE_WAY',
  DELIVERED = 'DELIVERED',
  UNDELIVERED = 'UNDELIVERED',
}

// This is a barrel file that re-exports everything from types/index.ts
export * from './types/index';
