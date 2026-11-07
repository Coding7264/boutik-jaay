import React, { useState, useMemo } from 'react';
import {
  Truck,
  Search,
  Plus,
  MessageSquare,
  CheckCircle2,
  Phone,
  MapPin,
  X,
  Share2,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { Order, OrderStatus } from '../../types';
import {
  formatFCFA,
  formatDateTime,
  formatPhoneNumber,
  generateWhatsAppUrl,
  getOrderStatusLabel,
} from '../../utils/formatters';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, createOrder, products, store } = useCommerce();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // New order fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [deliveryFee, setDeliveryFee] = useState(1500);

  const allStatuses: OrderStatus[] = [
    'EN_ATTENTE',
    'CONFIRMEE',
    'EN_PREPARATION',
    'LIVREE',
    'ANNULEE',
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'ALL' || o.order_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !selectedProductId) return;

    const prod = products.find((p) => p.id === selectedProductId)!;
    const unitPrice = prod.promo_price || prod.selling_price;
    const subtotal = unitPrice * itemQuantity;

    createOrder({
      channel: 'WHATSAPP',
      store_id: store.id,
      items: [
        {
          product_id: prod.id,
          product_name: prod.name,
          quantity: itemQuantity,
          unit_price: unitPrice,
          total_price: subtotal,
        },
      ],
      subtotal,
      delivery_fee: deliveryFee,
      discount: 0,
      total: subtotal + deliveryFee,
      payment_method: 'WAVE',
      payment_status: 'EN_ATTENTE',
      order_status: 'EN_ATTENTE',
      customer: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress || 'Dakar',
        city: 'Dakar',
      },
    });

    setShowNewOrderModal(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
  };

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Commandes ({orders.length})
          </h2>
          <p className="text-xs text-neutral-500">
            Suivi des livraisons et confirmation directe WhatsApp
          </p>
        </div>

        <button
          onClick={() => setShowNewOrderModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all min-h-[40px]"
        >
          <Plus className="h-4 w-4" />
          <span>+ Commande</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par client, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-4 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-white min-h-[40px]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[36px] ${
              statusFilter === 'ALL'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            Toutes ({orders.length})
          </button>
          {allStatuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[36px] ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {getOrderStatusLabel(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Cards List (Mobile & Touch Friendly) */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-xs text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            Aucune commande correspondante.
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
                      {ord.order_number}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        ord.channel === 'WHATSAPP'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {ord.channel === 'WHATSAPP' ? 'WhatsApp' : 'Web'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white mt-1">
                    {ord.customer.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    {formatPhoneNumber(ord.customer.phone)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatFCFA(ord.total)}
                  </span>
                  <span className="block text-[10px] text-neutral-400">
                    {formatDateTime(ord.date)}
                  </span>
                </div>
              </div>

              {/* Items Summary */}
              <div className="rounded-xl bg-neutral-50 p-2.5 text-xs text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-300">
                <span className="font-semibold text-neutral-500 text-[10px] block mb-1">
                  Articles :
                </span>
                <p className="font-medium">
                  {ord.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                </p>
                {ord.customer.address && (
                  <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                    <span>{ord.customer.address}</span>
                  </p>
                )}
              </div>

              {/* Bottom Actions: Status Dropdown & WhatsApp Button */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                <select
                  value={ord.order_status}
                  onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs font-bold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 min-h-[40px]"
                >
                  {allStatuses.map((st) => (
                    <option key={st} value={st}>
                      {getOrderStatusLabel(st)}
                    </option>
                  ))}
                </select>

                <a
                  href={generateWhatsAppUrl(
                    ord.customer.phone,
                    `Bonjour ${ord.customer.name}, ${store.name} vous informe que votre commande ${ord.order_number} (${formatFCFA(ord.total)}) est : *${getOrderStatusLabel(ord.order_status)}*.\nAdresse : ${ord.customer.address}.\n\nJërëjëf !`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all min-h-[40px]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE ORDER MODAL */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateOrder}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm">Nouvelle Commande</h3>
              <button type="button" onClick={() => setShowNewOrderModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="font-semibold block mb-1">Nom du client *</label>
              <input
                type="text"
                required
                placeholder="Ex: Moussa Ndiaye"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Numéro WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="77 450 12 34"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Adresse de livraison</label>
              <input
                type="text"
                placeholder="Ex: Plateau, Rue Carnot"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Article *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatFCFA(p.promo_price || p.selling_price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold block mb-1">Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value) || 1)}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 text-center font-bold dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Livraison (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 text-right font-mono dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 min-h-[44px]"
            >
              Enregistrer la Commande
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
