export type UserRole = 'owner' | 'store_admin' | 'manager' | 'cashier' | 'stock_manager';

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  store_id: string;
  permissions: {
    canViewProducts: boolean;
    canEditProducts: boolean;
    canEditStock: boolean;
    canMakeSales: boolean;
    canViewFinances: boolean;
    canManageOrders: boolean;
    canViewCustomers: boolean;
    canManageTeam: boolean;
  };
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  opening_hours: string;
  delivery_zones: { name: string; price: number; delay: string }[];
  wave_number: string;
  om_number: string;
  free_money_number?: string;
  currency: string;
  is_published: boolean;
  domain?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  store_id: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  additional_price: number;
  quantity: number;
  options: {
    taille?: string;
    couleur?: string;
    modele?: string;
  };
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string;
  category_id: string;
  sku: string;
  barcode?: string;
  purchase_price: number;
  selling_price: number;
  promo_price?: number;
  quantity: number;
  min_stock_alert: number;
  images: string[];
  is_published: boolean;
  is_archived: boolean;
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export type StockMovementType =
  | 'VENTE'
  | 'ENTREE_ACHAT'
  | 'SORTIE_PERTE'
  | 'AJUSTEMENT_INVENTAIRE'
  | 'RETOUR_CLIENT';

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  type: StockMovementType;
  quantity: number; // positive or negative
  previous_quantity: number;
  new_quantity: number;
  reason: string;
  user_name: string;
  date: string;
  reference_id?: string;
}

export type PaymentMethod = 'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'CARTE' | 'CREDIT';

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface Sale {
  id: string;
  sale_number: string;
  store_id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  amount_received: number;
  change_given: number;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  cashier_name: string;
  status: 'COMPLETE' | 'ANNULEE' | 'REMBOURSEE';
  date: string;
  notes?: string;
}

export type OrderStatus =
  | 'EN_ATTENTE'
  | 'CONFIRMEE'
  | 'EN_PREPARATION'
  | 'PRETE'
  | 'EXPEDIEE'
  | 'LIVREE'
  | 'ANNULEE'
  | 'REMBOURSEE';

export type PaymentStatus = 'EN_ATTENTE' | 'PAYE' | 'REMBOURSE';

export interface OrderItem {
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  channel: 'WHATSAPP' | 'ONLINE_STORE' | 'MANUAL';
  store_id: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  };
  date: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  total_spent: number;
  orders_count: number;
  credit_balance: number;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_name: string;
  phone: string;
  email?: string;
  address?: string;
  products_supplied: string[];
  balance_due: number;
  created_at: string;
}

export interface SupplyOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  received_quantity?: number;
}

export interface SupplyOrder {
  id: string;
  reference: string;
  supplier_id: string;
  supplier_name: string;
  items: SupplyOrderItem[];
  total: number;
  status: 'COMMANDE' | 'RECU_PARTIEL' | 'RECU_TOTAL' | 'ANNULE';
  payment_status: 'IMPAYE' | 'ACOMPTE' | 'PAYE';
  date: string;
  received_date?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'LOYER'
  | 'ELECTRICITE'
  | 'TRANSPORT'
  | 'LIVRAISON'
  | 'SALAIRES'
  | 'PUBLICITE'
  | 'APPROVISIONNEMENT'
  | 'MAINTENANCE'
  | 'AUTRES';

export interface Expense {
  id: string;
  store_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  payment_method: PaymentMethod;
  receipt_url?: string;
  date: string;
  created_by: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  document_number: string;
  type: 'FACTURE' | 'DEVIS';
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  amount_paid: number;
  status: 'BROUILLON' | 'ENVOYE' | 'ACCEPTE' | 'PAYE' | 'ANNULE';
  issue_date: string;
  due_date: string;
  notes?: string;
  converted_from_quote_id?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'sale' | 'stock' | 'payment' | 'system';
  read: boolean;
  timestamp: string;
  link_view?: string;
}
