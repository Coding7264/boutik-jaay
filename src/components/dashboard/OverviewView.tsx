import React, { useMemo } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Truck,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA, formatDateTime, formatPhoneNumber, generateWhatsAppUrl, getOrderStatusLabel, getPaymentMethodLabel } from '../../utils/formatters';
import { AdafrikTab } from '../layout/Sidebar';

interface OverviewViewProps {
  setActiveTab: (tab: AdafrikTab) => void;
  onOpenPos: () => void;
  onOpenNewProduct: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  setActiveTab,
  onOpenPos,
  onOpenNewProduct,
}) => {
  const { products, sales, orders, store } = useCommerce();

  // Today calculations
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const todaySales = useMemo(() => {
    return sales.filter((s) => s.status === 'COMPLETE' && new Date(s.date).getTime() >= startOfToday);
  }, [sales, startOfToday]);

  const todayOrders = useMemo(() => {
    return orders.filter((o) => o.payment_status === 'PAYE' && new Date(o.date).getTime() >= startOfToday);
  }, [orders, startOfToday]);

  const caJour = useMemo(() => {
    return (
      todaySales.reduce((acc, s) => acc + s.total, 0) +
      todayOrders.reduce((acc, o) => acc + o.total, 0)
    );
  }, [todaySales, todayOrders]);

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.order_status === 'EN_ATTENTE');
  }, [orders]);

  const stockAlerts = useMemo(() => {
    return products.filter((p) => p.quantity <= p.min_stock_alert && !p.is_archived);
  }, [products]);

  return (
    <div className="p-3.5 sm:p-6 max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="rounded-2xl bg-neutral-900 p-4 sm:p-6 text-white shadow-sm dark:bg-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
              {store.name}
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
              Bonjour ! Prêt pour les ventes ?
            </h1>
            <p className="text-xs text-neutral-300 mt-1">
              Gérez votre caisse physique, vos commandes WhatsApp et vos stocks depuis ce cockpit.
            </p>
          </div>

          {/* Quick Big CTA Buttons */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={onOpenPos}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition-all min-h-[44px]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Encaisser (POS)</span>
            </button>

            <button
              onClick={onOpenNewProduct}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-neutral-800 px-3.5 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 active:scale-95 transition-all min-h-[44px] border border-neutral-700"
            >
              <Plus className="h-4 w-4" />
              <span>+ Produit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Essential MVP Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. CA du Jour */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">CA du Jour</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 text-lg sm:text-xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
            {formatFCFA(caJour)}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {todaySales.length} encaissement(s)
          </span>
        </div>

        {/* 2. Total Ventes Caisse */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Ventes Magasin</span>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-1.5 text-lg sm:text-xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
            {sales.filter((s) => s.status === 'COMPLETE').length}
          </p>
          <span className="text-[11px] text-neutral-500">Tickets au comptoir</span>
        </div>

        {/* 3. Commandes en attente */}
        <div
          onClick={() => setActiveTab('orders')}
          className="rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Commandes à Traiter</span>
            <Truck className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1.5 text-lg sm:text-xl font-black font-mono tabular-nums text-amber-600">
            {pendingOrders.length}
          </p>
          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
            WhatsApp & Web <ArrowRight className="h-3 w-3" />
          </span>
        </div>

        {/* 4. Alertes Stock */}
        <div
          onClick={() => setActiveTab('products')}
          className="rounded-2xl border border-neutral-200 bg-white p-3.5 sm:p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-medium">Alertes Stock</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-1.5 text-lg sm:text-xl font-black font-mono tabular-nums text-rose-600">
            {stockAlerts.length}
          </p>
          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
            Rupture / Faible <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Stock Alert Warning Banner if any */}
      {stockAlerts.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
          <div className="flex items-center gap-2 truncate pr-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="truncate">
              <strong>{stockAlerts.length} article(s)</strong> nécessitent un réapprovisionnement ({stockAlerts.map((p) => p.name).slice(0, 2).join(', ')}...)
            </span>
          </div>
          <button
            onClick={() => setActiveTab('products')}
            className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shrink-0 hover:bg-amber-700"
          >
            Ajuster
          </button>
        </div>
      )}

      {/* 2-Columns: Recent Orders & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Orders (WhatsApp focus) */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Commandes Récentes
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Voir tout ({orders.length})
            </button>
          </div>

          <div className="space-y-2">
            {orders.slice(0, 4).map((ord) => (
              <div
                key={ord.id}
                className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 text-xs dark:bg-neutral-800/60"
              >
                <div className="truncate pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white truncate">
                      {ord.customer.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        ord.order_status === 'EN_ATTENTE'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : ord.order_status === 'LIVREE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {getOrderStatusLabel(ord.order_status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                    {ord.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                    {formatFCFA(ord.total)}
                  </span>
                  <a
                    href={generateWhatsAppUrl(
                      ord.customer.phone,
                      `Bonjour ${ord.customer.name}, ici ${store.name} pour votre commande ${ord.order_number}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    title="Contacter sur WhatsApp"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent In-store Sales */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Dernières Ventes en Magasin
              </h3>
            </div>
            <button
              onClick={onOpenPos}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Caisse
            </button>
          </div>

          <div className="space-y-2">
            {sales.slice(0, 4).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 text-xs dark:bg-neutral-800/60"
              >
                <div>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {sale.sale_number}
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    {sale.items.reduce((a, b) => a + b.quantity, 0)} article(s) · {getPaymentMethodLabel(sale.payment_method)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatFCFA(sale.total)}
                  </span>
                  <span className="block text-[10px] text-neutral-400">
                    {formatDateTime(sale.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
