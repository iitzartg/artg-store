export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  productType: 'GAME' | 'GIFTCARD';
  platform: string;
  region: string;
  category: string;
  images: string[];
  isDigital: boolean;
  isActive: boolean;
  stock: number;
  featured: boolean;
  discount: number;
  createdAt: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  paymentIntentId: string;
  paymentStatus: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  keysDelivered: boolean;
  createdAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  digitalKey?: {
    _id: string;
    encryptedKey: string;
    isUsed: boolean;
    region: string;
  };
}

export interface DigitalKey {
  productName: string;
  key: string;
  region: string;
  isUsed: boolean;
}

export interface PromoCode {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  product: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewStats {
  average_rating?: number;
  total_reviews?: number;
  rating_distribution?: { [key: number]: number };
}



