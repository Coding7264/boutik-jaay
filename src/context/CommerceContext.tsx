import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialCategories,
  initialCustomers,
  initialEmployees,
  initialExpenses,
  initialInvoices,
  initialOrders,
  initialProducts,
  initialSales,
  initialStockMovements,
  initialStore,
  initialSuppliers,
  initialSupplyOrders,
} from '../data/mockData';
import {
  CartItem,
  Category,
  Customer,
  Employee,
  Expense,
  Invoice,
  NotificationItem,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductVariant,
  Sale,
  StockMovement,
  StockMovementType,
  Store,
  Supplier,
  SupplyOrder,
} from '../types';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}

interface CommerceContextType {
  store: Store;
  categories: Category[];
  products: Product[];
  stockMovements: StockMovement[];
  sales: Sale[];
  orders: Order[];
  customers: Customer[];
  suppliers: Supplier[];
  supplyOrders: SupplyOrder[];
  expenses: Expense[];
  invoices: Invoice[];
  employees: Employee[];
  currentUser: Employee;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  isDarkMode: boolean;
  supabaseConfig: SupabaseConfig;

  // Actions
  updateStore: (partial: Partial<Store>) => void;
  addProduct: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Product;
  updateProduct: (id: string, partial: Partial<Product>) => void;
  archiveProduct: (id: string) => void;
  deleteProduct: (id: string) => void;

  addCategory: (categoryData: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, partial: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  recordStockMovement: (
    productId: string,
    type: StockMovementType,
    quantity: number,
    reason: string,
    variantId?: string,
    referenceId?: string
  ) => boolean;

  recordSale: (saleData: {
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
    notes?: string;
  }) => Sale;
  cancelSale: (saleId: string, reason: string) => void;

  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'date' | 'updated_at'>) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;

  addCustomer: (customerData: Omit<Customer, 'id' | 'total_spent' | 'orders_count' | 'credit_balance' | 'created_at'>) => Customer;
  updateCustomer: (id: string, partial: Partial<Customer>) => void;

  addSupplier: (supplierData: Omit<Supplier, 'id' | 'balance_due' | 'created_at'>) => Supplier;
  updateSupplier: (id: string, partial: Partial<Supplier>) => void;
  createSupplyOrder: (orderData: Omit<SupplyOrder, 'id' | 'reference' | 'date'>) => SupplyOrder;
  receiveSupplyOrder: (supplyOrderId: string) => void;

  addExpense: (expenseData: Omit<Expense, 'id' | 'date' | 'created_by'>) => Expense;

  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'document_number' | 'issue_date'>) => Invoice;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  convertQuoteToInvoice: (quoteId: string) => Invoice | null;

  setCurrentUser: (employee: Employee) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, partial: Partial<Employee>) => void;

  toggleDarkMode: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (title: string, message: string, type: NotificationItem['type'], linkView?: string) => void;

  updateSupabaseConfig: (url: string, anonKey: string) => void;
  resetToInitialData: () => void;
  exportDataAsJSON: () => string;
  importDataFromJSON: (jsonString: string) => boolean;
}

const STORAGE_PREFIX = 'jaay_commerce_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage', err);
  }
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<Store>(() => loadFromStorage('store', initialStore));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories', initialCategories));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', initialProducts));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => loadFromStorage('stockMovements', initialStockMovements));
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage('sales', initialSales));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage('orders', initialOrders));
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('customers', initialCustomers));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('suppliers', initialSuppliers));
  const [supplyOrders, setSupplyOrders] = useState<SupplyOrder[]>(() => loadFromStorage('supplyOrders', initialSupplyOrders));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', initialExpenses));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('invoices', initialInvoices));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage('employees', initialEmployees));
  const [currentUser, setCurrentUser] = useState<Employee>(() => employees[0] || initialEmployees[0]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage('notifications', [
      {
        id: 'notif_01',
        title: 'Alerte Stock Faible',
        message: 'Le produit "Coffret Encens Royal Gowé" n\'a plus que 3 unités disponibles.',
        type: 'stock',
        read: false,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        link_view: 'stock',
      },
      {
        id: 'notif_02',
        title: 'Nouvelle Commande WhatsApp',
        message: 'Commande CMD-2026-076 reçue de Modou Fall pour 23 500 FCFA.',
        type: 'order',
        read: false,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        link_view: 'orders',
      },
    ])
  );

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return loadFromStorage('dark_mode', false);
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() =>
    loadFromStorage('supabase_config', {
      url: '',
      anonKey: '',
      connected: false,
    })
  );

  // Sync to local storage
  useEffect(() => saveToStorage('store', store), [store]);
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('stockMovements', stockMovements), [stockMovements]);
  useEffect(() => saveToStorage('sales', sales), [sales]);
  useEffect(() => saveToStorage('orders', orders), [orders]);
  useEffect(() => saveToStorage('customers', customers), [customers]);
  useEffect(() => saveToStorage('suppliers', suppliers), [suppliers]);
  useEffect(() => saveToStorage('supplyOrders', supplyOrders), [supplyOrders]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('invoices', invoices), [invoices]);
  useEffect(() => saveToStorage('employees', employees), [employees]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('supabase_config', supabaseConfig), [supabaseConfig]);
  useEffect(() => {
    saveToStorage('dark_mode', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const addNotification = (title: string, message: string, type: NotificationItem['type'], linkView?: string) => {
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      link_view: linkView,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const updateStore = (partial: Partial<Store>) => {
    setStore((prev) => ({ ...prev, ...partial }));
    addNotification('Boutique mise à jour', 'Les informations de votre boutique ont été actualisées.', 'system');
  };

  // PRODUCTS
  const addProduct = (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product => {
    const id = `prod_${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Initial stock movement if quantity > 0
    if (newProduct.quantity > 0) {
      const movement: StockMovement = {
        id: `mov_${Date.now()}`,
        product_id: id,
        product_name: newProduct.name,
        type: 'ENTREE_ACHAT',
        quantity: newProduct.quantity,
        previous_quantity: 0,
        new_quantity: newProduct.quantity,
        reason: 'Stock initial à la création du produit',
        user_name: currentUser.name,
        date: new Date().toISOString(),
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    addNotification('Nouveau produit', `Le produit "${newProduct.name}" a été ajouté au catalogue.`, 'stock', 'products');
    return newProduct;
  };

  const updateProduct = (id: string, partial: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...partial, updated_at: new Date().toISOString() } : p))
    );
  };

  const archiveProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_archived: !p.is_archived, updated_at: new Date().toISOString() } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // CATEGORIES
  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCat: Category = { ...categoryData, id: `cat_${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, partial: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // TRANSACTIONAL STOCK MOVEMENT ENGINE
  const recordStockMovement = (
    productId: string,
    type: StockMovementType,
    quantityDelta: number,
    reason: string,
    variantId?: string,
    referenceId?: string
  ): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    const prevQty = product.quantity;
    const newQty = Math.max(0, prevQty + quantityDelta);

    let updatedVariants = product.variants;
    let variantName: string | undefined;

    if (variantId) {
      updatedVariants = product.variants.map((v) => {
        if (v.id === variantId) {
          variantName = v.name;
          return { ...v, quantity: Math.max(0, v.quantity + quantityDelta) };
        }
        return v;
      });
    }

    // Update product quantity
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQty, variants: updatedVariants, updated_at: new Date().toISOString() } : p))
    );

    // Create immutable audit movement
    const movement: StockMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      product_id: productId,
      product_name: product.name,
      variant_id: variantId,
      variant_name: variantName,
      type,
      quantity: quantityDelta,
      previous_quantity: prevQty,
      new_quantity: newQty,
      reason,
      user_name: currentUser.name,
      date: new Date().toISOString(),
      reference_id: referenceId,
    };
    setStockMovements((prev) => [movement, ...prev]);

    // Check low stock alert
    if (newQty <= product.min_stock_alert) {
      addNotification(
        newQty === 0 ? 'Rupture de Stock !' : 'Stock Faible',
        `Le produit "${product.name}" n'a plus que ${newQty} unité(s) disponible(s).`,
        'stock',
        'stock'
      );
    }

    return true;
  };

  // POS / PHYSICAL SALES
  const recordSale = (saleData: {
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
    notes?: string;
  }): Sale => {
    const saleId = `vte_${Date.now()}`;
    const saleNumber = `VTE-2026-${String(sales.length + 93).padStart(3, '0')}`;

    // Atomically decrement stock for each sold item
    saleData.items.forEach((item) => {
      recordStockMovement(
        item.product.id,
        'VENTE',
        -item.quantity,
        `Vente caisse comptoir #${saleNumber}`,
        item.variant?.id,
        saleId
      );
    });

    // Update customer stats if linked
    if (saleData.customer_id) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === saleData.customer_id) {
            const addedCredit = saleData.payment_method === 'CREDIT' ? saleData.total : 0;
            return {
              ...c,
              total_spent: c.total_spent + saleData.total,
              orders_count: c.orders_count + 1,
              credit_balance: c.credit_balance + addedCredit,
            };
          }
          return c;
        })
      );
    }

    const newSale: Sale = {
      id: saleId,
      sale_number: saleNumber,
      store_id: store.id,
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      total: saleData.total,
      payment_method: saleData.payment_method,
      amount_received: saleData.amount_received,
      change_given: saleData.change_given,
      customer_id: saleData.customer_id,
      customer_name: saleData.customer_name || 'Client de passage',
      customer_phone: saleData.customer_phone,
      cashier_name: currentUser.name,
      status: 'COMPLETE',
      date: new Date().toISOString(),
      notes: saleData.notes,
    };

    setSales((prev) => [newSale, ...prev]);
    addNotification('Vente Enregistrée', `Vente ${saleNumber} de ${saleData.total.toLocaleString()} FCFA effectuée.`, 'sale', 'pos');

    return newSale;
  };

  const cancelSale = (saleId: string, reason: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'ANNULEE') return;

    // Restore stock
    sale.items.forEach((item) => {
      recordStockMovement(
        item.product.id,
        'RETOUR_CLIENT',
        item.quantity,
        `Annulation de la vente #${sale.sale_number} : ${reason}`,
        item.variant?.id,
        saleId
      );
    });

    // Restore customer credit if applicable
    if (sale.customer_id && sale.payment_method === 'CREDIT') {
      setCustomers((prev) =>
        prev.map((c) => (c.id === sale.customer_id ? { ...c, credit_balance: Math.max(0, c.credit_balance - sale.total) } : c))
      );
    }

    setSales((prev) => prev.map((s) => (s.id === saleId ? { ...s, status: 'ANNULEE', notes: `${s.notes || ''} [Annulée: ${reason}]` } : s)));
    addNotification('Vente Annulée', `La vente #${sale.sale_number} a été annulée et les articles réintégrés au stock.`, 'sale');
  };

  // ORDERS
  const createOrder = (orderData: Omit<Order, 'id' | 'order_number' | 'date' | 'updated_at'>): Order => {
    const id = `ord_${Date.now()}`;
    const orderNumber = `CMD-2026-${String(orders.length + 77).padStart(3, '0')}`;
    const newOrder: Order = {
      ...orderData,
      id,
      order_number: orderNumber,
      date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    addNotification('Nouvelle Commande', `Commande ${orderNumber} de ${newOrder.customer.name} reçue.`, 'order', 'orders');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Avoid double stock deduction: only deduct if moving to 'CONFIRMEE' / 'LIVREE' and wasn't already deducted
    if ((newStatus === 'CONFIRMEE' || newStatus === 'LIVREE') && order.order_status === 'EN_ATTENTE') {
      order.items.forEach((item) => {
        recordStockMovement(
          item.product_id,
          'VENTE',
          -item.quantity,
          `Validation commande client #${order.order_number}`,
          item.variant_id,
          order.id
        );
      });
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus, updated_at: new Date().toISOString() } : o))
    );
    addNotification('Statut Commande', `Commande #${order.order_number} passée en "${newStatus}".`, 'order', 'orders');
  };

  // CUSTOMERS
  const addCustomer = (customerData: Omit<Customer, 'id' | 'total_spent' | 'orders_count' | 'credit_balance' | 'created_at'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      total_spent: 0,
      orders_count: 0,
      credit_balance: 0,
      created_at: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    addNotification('Nouveau Client', `Client ${newCust.name} ajouté au CRM.`, 'system', 'customers');
    return newCust;
  };

  const updateCustomer = (id: string, partial: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  // SUPPLIERS & PROCUREMENT
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'balance_due' | 'created_at'>): Supplier => {
    const newSup: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
      balance_due: 0,
      created_at: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSup, ...prev]);
    return newSup;
  };

  const updateSupplier = (id: string, partial: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  };

  const createSupplyOrder = (orderData: Omit<SupplyOrder, 'id' | 'reference' | 'date'>): SupplyOrder => {
    const newOrd: SupplyOrder = {
      ...orderData,
      id: `sup_ord_${Date.now()}`,
      reference: `APP-2026-${String(supplyOrders.length + 19).padStart(3, '0')}`,
      date: new Date().toISOString(),
    };
    setSupplyOrders((prev) => [newOrd, ...prev]);
    addNotification('Bon d\'Approvisionnement', `Commande fournisseur ${newOrd.reference} créée.`, 'stock', 'suppliers');
    return newOrd;
  };

  const receiveSupplyOrder = (supplyOrderId: string) => {
    const supplyOrd = supplyOrders.find((s) => s.id === supplyOrderId);
    if (!supplyOrd || supplyOrd.status === 'RECU_TOTAL') return;

    // Increment stocks for all received items
    supplyOrd.items.forEach((item) => {
      recordStockMovement(
        item.product_id,
        'ENTREE_ACHAT',
        item.quantity,
        `Réception commande fournisseur ${supplyOrd.reference} (${supplyOrd.supplier_name})`,
        undefined,
        supplyOrderId
      );
    });

    setSupplyOrders((prev) =>
      prev.map((s) =>
        s.id === supplyOrderId
          ? { ...s, status: 'RECU_TOTAL', payment_status: 'PAYE', received_date: new Date().toISOString() }
          : s
      )
    );
    addNotification('Marchandises Reçues', `La commande ${supplyOrd.reference} a été réceptionnée et les stocks ont été augmentés.`, 'stock', 'stock');
  };

  // EXPENSES
  const addExpense = (expenseData: Omit<Expense, 'id' | 'date' | 'created_by'>): Expense => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}`,
      date: new Date().toISOString(),
      created_by: currentUser.name,
    };
    setExpenses((prev) => [newExp, ...prev]);
    addNotification('Dépense Enregistrée', `Dépense de ${newExp.amount.toLocaleString()} FCFA (${newExp.category}) enregistrée.`, 'system', 'expenses');
    return newExp;
  };

  // INVOICES & QUOTES
  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'document_number' | 'issue_date'>): Invoice => {
    const prefix = invoiceData.type === 'FACTURE' ? 'FAC' : 'DEV';
    const docNumber = `${prefix}-2026-${String(invoices.length + 45).padStart(4, '0')}`;
    const newDoc: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      document_number: docNumber,
      issue_date: new Date().toISOString(),
    };
    setInvoices((prev) => [newDoc, ...prev]);
    addNotification('Document Créé', `${newDoc.type === 'FACTURE' ? 'Facture' : 'Devis'} #${docNumber} créé pour ${newDoc.customer_name}.`, 'system', 'invoices');
    return newDoc;
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices((prev) => prev.map((i) => (i.id === invoiceId ? { ...i, status } : i)));
  };

  const convertQuoteToInvoice = (quoteId: string): Invoice | null => {
    const quote = invoices.find((i) => i.id === quoteId && i.type === 'DEVIS');
    if (!quote) return null;

    const facNumber = `FAC-2026-${String(invoices.length + 50).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      ...quote,
      id: `inv_${Date.now()}`,
      document_number: facNumber,
      type: 'FACTURE',
      status: 'ENVOYE',
      issue_date: new Date().toISOString(),
      converted_from_quote_id: quote.id,
      notes: `${quote.notes || ''} [Converti depuis devis #${quote.document_number}]`,
    };

    setInvoices((prev) => [
      newInvoice,
      ...prev.map((i) => (i.id === quoteId ? { ...i, status: 'ACCEPTE' as const } : i)),
    ]);

    addNotification('Devis Converti', `Le devis #${quote.document_number} a été converti en facture #${facNumber}.`, 'system', 'invoices');
    return newInvoice;
  };

  // EMPLOYEES & RBAC
  const addEmployee = (emp: Omit<Employee, 'id'>): Employee => {
    const newEmp: Employee = { ...emp, id: `emp_${Date.now()}` };
    setEmployees((prev) => [...prev, newEmp]);
    return newEmp;
  };

  const updateEmployee = (id: string, partial: Partial<Employee>) => {
    setEmployees((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...partial } : e));
      if (currentUser.id === id) {
        const currentUpdated = updated.find((e) => e.id === id);
        if (currentUpdated) setCurrentUser(currentUpdated);
      }
      return updated;
    });
  };

  // SUPABASE CONNECTOR CONFIG
  const updateSupabaseConfig = (url: string, anonKey: string) => {
    const connected = Boolean(url && anonKey);
    setSupabaseConfig({ url, anonKey, connected });
    addNotification('Connexion Supabase', connected ? 'Connecteur Supabase activé.' : 'Paramètres Supabase mis à jour.', 'system');
  };

  const resetToInitialData = () => {
    setStore(initialStore);
    setCategories(initialCategories);
    setProducts(initialProducts);
    setStockMovements(initialStockMovements);
    setSales(initialSales);
    setOrders(initialOrders);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setSupplyOrders(initialSupplyOrders);
    setExpenses(initialExpenses);
    setInvoices(initialInvoices);
    setEmployees(initialEmployees);
    setCurrentUser(initialEmployees[0]);
    addNotification('Données Réinitialisées', 'Le cockpit a été restauré avec le jeu de données officiel Jaay.', 'system');
  };

  const exportDataAsJSON = (): string => {
    const payload = {
      store,
      categories,
      products,
      stockMovements,
      sales,
      orders,
      customers,
      suppliers,
      supplyOrders,
      expenses,
      invoices,
      employees,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataFromJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.store) setStore(data.store);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
      if (data.stockMovements) setStockMovements(data.stockMovements);
      if (data.sales) setSales(data.sales);
      if (data.orders) setOrders(data.orders);
      if (data.customers) setCustomers(data.customers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.supplyOrders) setSupplyOrders(data.supplyOrders);
      if (data.expenses) setExpenses(data.expenses);
      if (data.invoices) setInvoices(data.invoices);
      if (data.employees) setEmployees(data.employees);
      addNotification('Import Réussi', 'Toutes les données ont été importées avec succès.', 'system');
      return true;
    } catch (err) {
      console.error('Import error', err);
      return false;
    }
  };

  return (
    <CommerceContext.Provider
      value={{
        store,
        categories,
        products,
        stockMovements,
        sales,
        orders,
        customers,
        suppliers,
        supplyOrders,
        expenses,
        invoices,
        employees,
        currentUser,
        notifications,
        unreadNotificationsCount,
        isDarkMode,
        supabaseConfig,

        updateStore,
        addProduct,
        updateProduct,
        archiveProduct,
        deleteProduct,

        addCategory,
        updateCategory,
        deleteCategory,

        recordStockMovement,
        recordSale,
        cancelSale,

        createOrder,
        updateOrderStatus,

        addCustomer,
        updateCustomer,

        addSupplier,
        updateSupplier,
        createSupplyOrder,
        receiveSupplyOrder,

        addExpense,

        createInvoice,
        updateInvoiceStatus,
        convertQuoteToInvoice,

        setCurrentUser,
        addEmployee,
        updateEmployee,

        toggleDarkMode,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,

        updateSupabaseConfig,
        resetToInitialData,
        exportDataAsJSON,
        importDataFromJSON,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
};
