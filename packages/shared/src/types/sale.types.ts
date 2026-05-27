import { PaymentMethod } from '../enums/PaymentMethod';
import { SaleStatus } from '../enums/SaleStatus';
import { SaleItemType } from '../enums/SaleItemType';

export interface SaleItem {
  id: string;
  saleId: string;
  productId?: string;
  serviceId?: string;
  itemType: SaleItemType;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  specifications?: Record<string, unknown>;
}

export interface Sale {
  id: string;
  ticketNumber: string;
  userId: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  notes?: string;
  status: SaleStatus;
  cancelledBy?: string;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
  items: SaleItem[];
}

export interface CreateSaleItemDto {
  productId?: string;
  serviceId?: string;
  quantity: number;
  specifications?: Record<string, unknown>;
}

export interface CreateSaleDto {
  items: CreateSaleItemDto[];
  discountAmount?: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  notes?: string;
}
