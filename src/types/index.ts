
// User types
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  RIDER = 'RIDER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  photo?: string;
  createdAt?: string;
}

// Product types
export interface ProductVariant {
  color: string;
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  variants: ProductVariant[];
  rating: number;
}

// Order types
export enum OrderStatus {
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  PLACED = 'PLACED',
  ON_THE_WAY = 'ON_THE_WAY',
  NOT_DELIVERED = 'NOT_DELIVERED',
}

export interface OrderItem {
  productId: string;
  productName: string;
  name?: string; 
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  imageUrl?: string;
}

export interface Order {
  _id: string;
  id?: string; 
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  riderId?: string;
  riderName?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CartItem {
  product: Product;
  color: string;
  size: string;
  quantity: number;
}
