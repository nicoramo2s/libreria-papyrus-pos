import type { Product } from './product.types';
import type { User } from './user.types';
import type { StockLoadExpenseType } from '../enums/StockLoadExpenseType';
import type { StockLoadStatus } from '../enums/StockLoadStatus';

export interface StockLoadItem {
  id: string;
  stockLoadId: string;
  productId: string;
  product?: Pick<Product, 'id' | 'name' | 'isbn'>;
  quantity: number;
  unitCost: number;
  subtotal: number;
  previousStock: number;
  newStock: number;
}

export interface StockLoadExpense {
  id: string;
  stockLoadId: string;
  type: StockLoadExpenseType;
  description?: string;
  amount: number;
}

export interface StockLoad {
  id: string;
  userId: string;
  user?: Pick<User, 'id' | 'displayName'>;
  supplierName?: string;
  supplierContact?: string;
  invoiceNumber?: string;
  productSubtotal: number;
  expenseTotal: number;
  totalCost: number;
  notes?: string;
  status: StockLoadStatus;
  cancelledBy?: string;
  cancelledByUser?: Pick<User, 'id' | 'displayName'>;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
  items: StockLoadItem[];
  expenses: StockLoadExpense[];
}

export interface CreateStockLoadItemDto {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreateStockLoadExpenseDto {
  type: StockLoadExpenseType;
  description?: string;
  amount: number;
}

export interface CreateStockLoadDto {
  supplierName?: string;
  supplierContact?: string;
  invoiceNumber?: string;
  notes?: string;
  items: CreateStockLoadItemDto[];
  expenses?: CreateStockLoadExpenseDto[];
}
