export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  isbn?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  stockAlert: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  categoryId?: string;
  isbn?: string;
  salePrice: number;
  stockAlert?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface Service {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  purchaseCost: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ServiceVariant[];
}

export interface ServiceVariant {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  price: number;
  purchaseCost: number;
  createdAt: string;
}
