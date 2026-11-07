import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Percent,
  UserPlus,
  Printer,
  Share2,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { CartItem, Customer, PaymentMethod, Product, ProductVariant, Sale } from '../../types';
import { formatFCFA, formatDateTime, formatPhoneNumber, generateWhatsAppUrl, getPaymentMethodLabel } from '../../utils/formatters';

export const PosView: React.FC = () => {
  const {
    products,
    categories,
    customers,
    addCustomer,
    recordSale,
    sales,
    cancelSale,
    currentUser,
    store,
  } = useCommerce();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Mobile View state: 'catalog' | 'cart' | 'history'
  const [mobileView, setMobileView] = useState<'catalog' | 'cart'>('catalog');
  const [showHistory, setShowHistory] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Modals
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [amountReceived, setAmountReceived] = useState<number>(0);

  // Completed Receipt Modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Filter available products
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.is_archived) return false;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.total_price, 0);
  }, [cart]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const changeGiven = useMemo(() => {
    if (paymentMethod === 'ESPECES') {
      return Math.max(0, amountReceived - total);
    }
    return 0;
  }, [paymentMethod, amountReceived, total]);

  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    if (product.variants && product.variants.length > 0 && !variant) {
      setVariantModalProduct(product);
      return;
    }

    const availableQty = variant ? variant.quantity : product.quantity;
    if (availableQty <= 0) {
      alert(`Le produit "${product.name}" est en rupture de stock.`);
      return;
    }

    const unitPrice = (product.promo_price || product.selling_price) + (variant?.additional_price || 0);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id
      );

      if (existingIndex >= 0) {
        const item = prev[existingIndex];
        if (item.quantity + 1 > availableQty) {
          alert(`Stock maximum disponible : ${availableQty}`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...item,
          quantity: item.quantity + 1,
          total_price: (item.quantity + 1) * item.unit_price,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            variant,
            quantity: 1,
            unit_price: unitPrice,
            discount: 0,
            total_price: unitPrice,
          },
        ];
      }
    });

    if (variantModalProduct) setVariantModalProduct(null);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const item = prev[index];
      const maxAvailable = item.variant ? item.variant.quantity : item.product.quantity;
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      if (newQty > maxAvailable) {
        alert(`Stock disponible : ${maxAvailable}`);
        return prev;
      }

      const updated = [...prev];
      updated[index] = {
        ...item,
        quantity: newQty,
        total_price: newQty * item.unit_price,
      };
      return updated;
    });
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const created = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      city: 'Dakar',
    });

    setSelectedCustomerId(created.id);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setAmountReceived(total);
    setShowCheckoutModal(true);
  };

  const handleConfirmSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'ESPECES' && amountReceived < total) {
      alert(`Montant insuffisant. Le total dû est de ${formatFCFA(total)}.`);
      return;
    }

    const sale = recordSale({
      items: cart,
      subtotal,
      discount: discountAmount,
      total,
      payment_method: paymentMethod,
      amount_received: paymentMethod === 'ESPECES' ? amountReceived : total,
      change_given: changeGiven,
      customer_id: selectedCustomer?.id,
      customer_name: selectedCustomer?.name,
      customer_phone: selectedCustomer?.phone,
    });

    setCart([]);
    setDiscountAmount(0);
    setSelectedCustomerId('');
    setShowCheckoutModal(false);
    setMobileView('catalog');
    setCompletedSale(sale);
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-3 sm:space-y-4">
      {/* Mobile Top Segmented Bar (Catalog vs Cart vs History) */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 lg:hidden w-full">
          {!showHistory ? (
            <>
              <button
                onClick={() => setMobileView('catalog')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors min-h-[44px] ${
                  mobileView === 'catalog'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                Catalogue ({availableProducts.length})
              </button>

              <button
                onClick={() => setMobileView('cart')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors relative min-h-[44px] ${
                  mobileView === 'cart'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                }`}
              >
                Panier ({totalCartCount})
                {totalCartCount > 0 && mobileView !== 'cart' && (
                  <span className="ml-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-black">
                    · {formatFCFA(total)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowHistory(true)}
                className="p-2 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Historique des tickets"
              >
                <Clock className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 dark:text-neutral-300 py-2 min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Retour à la Caisse</span>
            </button>
          )}
        </div>

        {/* Desktop title & history toggle */}
        <div className="hidden lg:flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(false)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                !showHistory
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              Terminal de Caisse
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                showHistory
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Historique des Ventes ({sales.length})</span>
            </button>
          </div>
          <span className="text-xs text-neutral-500">
            Caissier : <strong className="text-neutral-900 dark:text-white">{currentUser.name}</strong>
          </span>
        </div>
      </div>

      {!showHistory ? (
        /* POS INTERFACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* CATALOG COLUMN (Visible on desktop OR when mobileView === 'catalog') */}
          <div className={`lg:col-span-7 space-y-3 ${mobileView === 'cart' ? 'hidden lg:block' : 'block'}`}>
            {/* Search & Categories */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Rechercher produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-4 text-xs text-neutral-900 shadow-sm focus:border-emerald-600 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white min-h-[44px]"
                />
              </div>

              {/* Category Pills Scroller */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  Tous ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap min-h-[36px] transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid (Big touch cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[calc(100vh-250px)] overflow-y-auto pr-0.5">
              {availableProducts.map((p) => {
                const isOutOfStock = p.quantity <= 0;
                const price = p.promo_price || p.selling_price;
                const hasVariants = p.variants && p.variants.length > 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => handleAddToCart(p)}
                    className={`group relative flex flex-col justify-between rounded-2xl border p-2.5 sm:p-3 text-left transition-all active:scale-[0.98] ${
                      isOutOfStock
                        ? 'border-neutral-200 opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-900/50 dark:border-neutral-800'
                        : 'border-neutral-200 bg-white hover:border-emerald-500 shadow-xs dark:bg-neutral-900 dark:border-neutral-800'
                    }`}
                  >
                    <div className="w-full space-y-1.5">
                      <div className="h-20 sm:h-24 w-full rounded-xl bg-neutral-100 overflow-hidden dark:bg-neutral-800">
                        {p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold text-neutral-400">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between w-full">
                      <span className="font-mono font-black text-xs text-neutral-900 dark:text-white tabular-nums">
                        {formatFCFA(price)}
                      </span>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700'
                            : hasVariants
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {isOutOfStock ? '0 dispo' : hasVariants ? 'Variantes' : `${p.quantity} dispo`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Floating Mobile Cart Bar (When in catalog mode on mobile) */}
            {totalCartCount > 0 && (
              <div className="lg:hidden sticky bottom-18 left-0 right-0 z-30 pt-2">
                <button
                  onClick={() => setMobileView('cart')}
                  className="w-full rounded-2xl bg-emerald-600 p-3.5 text-white font-bold shadow-xl flex items-center justify-between active:scale-[0.98] transition-all min-h-[48px]"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 font-bold text-[11px]">
                      {totalCartCount}
                    </span>
                    <span>Voir le Panier</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-sm font-black">
                    <span>{formatFCFA(total)}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* CART COLUMN (Visible on desktop OR when mobileView === 'cart') */}
          <div
            className={`lg:col-span-5 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between ${
              mobileView === 'catalog' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div>
              {/* Header & Customer Picker */}
              <div className="border-b border-neutral-100 pb-3 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Panier ({totalCartCount})
                    </h3>
                  </div>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-[11px] text-rose-600 font-semibold hover:underline"
                    >
                      Vider
                    </button>
                  )}
                </div>

                {/* Customer select */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 min-h-[40px]"
                  >
                    <option value="">Client au comptoir (de passage)</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({formatPhoneNumber(c.phone)})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowNewCustomerModal(true)}
                    className="rounded-xl border border-neutral-200 p-2 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Nouveau client"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Cart Items List */}
              <div className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[320px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-400">
                    Le panier est vide.
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex-1 truncate pr-2">
                        <p className="font-bold text-neutral-900 dark:text-white truncate">
                          {item.product.name}
                        </p>
                        {item.variant && (
                          <span className="text-[10px] text-emerald-600 font-medium">
                            {item.variant.name}
                          </span>
                        )}
                        <span className="block text-[11px] font-mono text-neutral-400">
                          {formatFCFA(item.unit_price)}
                        </span>
                      </div>

                      {/* Touch Quantity Stepper */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleUpdateQuantity(idx, -1)}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center font-bold font-mono text-xs tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(idx, 1)}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="w-20 text-right font-mono font-bold text-neutral-900 dark:text-white tabular-nums shrink-0 ml-2">
                        {formatFCFA(item.total_price)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Footer */}
            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">Total</span>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatFCFA(total)}
                </span>
              </div>

              {/* Big Checkout Trigger Button */}
              <button
                disabled={cart.length === 0}
                onClick={handleOpenCheckout}
                className="w-full mt-2 rounded-2xl bg-emerald-600 py-3.5 font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm min-h-[48px]"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>Encaisser · {formatFCFA(total)}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SALES HISTORY (COMPACT) */
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
            Dernières Ventes Réalisées ({sales.length})
          </h3>

          <div className="space-y-2">
            {sales.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-neutral-100 p-3 text-xs dark:border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {s.sale_number}
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    {formatDateTime(s.date)} · {getPaymentMethodLabel(s.payment_method)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-600 tabular-nums">
                    {formatFCFA(s.total)}
                  </span>
                  <button
                    onClick={() => setCompletedSale(s)}
                    className="rounded-lg border px-2 py-1 text-[11px] font-semibold hover:bg-neutral-50 dark:border-neutral-700"
                  >
                    Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CHECKOUT */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Règlement : {formatFCFA(total)}
              </h3>
              <button onClick={() => setShowCheckoutModal(false)} className="text-neutral-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Payment Buttons (Wave, OM, Cash) */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'WAVE' as PaymentMethod, label: 'Wave', color: 'border-cyan-500 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300' },
                { id: 'ORANGE_MONEY' as PaymentMethod, label: 'OM', color: 'border-orange-500 bg-orange-50 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300' },
                { id: 'ESPECES' as PaymentMethod, label: 'Espèces', color: 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                    paymentMethod === m.id
                      ? `${m.color} ring-2 ring-emerald-500 shadow-sm`
                      : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'ESPECES' && (
              <div className="rounded-xl bg-neutral-50 p-3 space-y-2 dark:bg-neutral-800 text-xs">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block">
                  Montant Reçu (FCFA) :
                </label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-neutral-200 p-2 text-right font-mono text-base font-bold dark:border-neutral-700 dark:bg-neutral-900"
                />
                <div className="flex justify-between font-bold pt-1">
                  <span>Monnaie à rendre :</span>
                  <span className="font-mono text-emerald-600">{formatFCFA(changeGiven)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmSale}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition-colors min-h-[44px]"
            >
              Valider la Vente
            </button>
          </div>
        </div>
      )}

      {/* MODAL: TICKET DE CAISSE THERMIQUE & WHATSAPP */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <span className="text-xs font-bold text-emerald-600 uppercase">
                Vente #{completedSale.sale_number}
              </span>
              <button onClick={() => setCompletedSale(null)} className="text-neutral-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 font-mono text-xs dark:bg-neutral-950 space-y-2 border border-neutral-200 dark:border-neutral-800">
              <div className="text-center pb-2 border-b border-dashed border-neutral-300 dark:border-neutral-700">
                <p className="font-black text-sm uppercase">{store.name}</p>
                <p className="text-[10px] text-neutral-400">{store.address}, {store.city}</p>
                <p className="text-[10px] text-neutral-400">WhatsApp: {formatPhoneNumber(store.whatsapp)}</p>
              </div>

              <div className="space-y-1 py-1">
                {completedSale.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">{i.quantity}x {i.product.name}</span>
                    <span className="font-bold">{formatFCFA(i.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-neutral-300 dark:border-neutral-700 flex justify-between font-black text-sm">
                <span>TOTAL :</span>
                <span className="text-emerald-600">{formatFCFA(completedSale.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 py-2.5 text-xs font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-200 min-h-[44px]"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer</span>
              </button>

              <a
                href={generateWhatsAppUrl(
                  completedSale.customer_phone || store.whatsapp,
                  `*TICKET DE CAISSE - ${store.name}*\nTicket N° : ${completedSale.sale_number}\nDate : ${formatDateTime(completedSale.date)}\nTotal : ${formatFCFA(completedSale.total)}\nPaiement : ${getPaymentMethodLabel(completedSale.payment_method)}\n\nJërëjëf pour votre achat !`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 min-h-[44px]"
              >
                <Share2 className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VARIANT SELECTOR */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl dark:bg-neutral-900 space-y-3">
            <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                {variantModalProduct.name}
              </h3>
              <button onClick={() => setVariantModalProduct(null)} className="text-neutral-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {variantModalProduct.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleAddToCart(variantModalProduct, v)}
                  className="flex w-full items-center justify-between p-2.5 rounded-xl border border-neutral-200 text-xs hover:border-emerald-500 dark:border-neutral-700 min-h-[44px]"
                >
                  <span className="font-bold">{v.name}</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {formatFCFA(variantModalProduct.selling_price + v.additional_price)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW CUSTOMER */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateCustomer}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm">Ajouter un Client</h3>
              <button type="button" onClick={() => setShowNewCustomerModal(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Nom du client *</label>
              <input
                type="text"
                required
                placeholder="Ex: Aïda Fall"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Téléphone (WhatsApp) *</label>
              <input
                type="tel"
                required
                placeholder="77 123 45 67"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-700 min-h-[44px]"
              >
                Enregistrer le client
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
