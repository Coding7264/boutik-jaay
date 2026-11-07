import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  PieChart,
  ArrowUpRight,
  ShieldAlert,
  Printer,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA, formatDate } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const { sales, orders, expenses, products, customers, currentUser } = useCommerce();

  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  const canViewFinances = currentUser.permissions.canViewFinances;

  // Completed transactions
  const validSales = useMemo(() => sales.filter((s) => s.status === 'COMPLETE'), [sales]);
  const paidOrders = useMemo(() => orders.filter((o) => o.payment_status === 'PAYE'), [orders]);

  // Total Turnover (CA)
  const totalRevenue = useMemo(() => {
    return (
      validSales.reduce((acc, s) => acc + s.total, 0) +
      paidOrders.reduce((acc, o) => acc + o.total, 0)
    );
  }, [validSales, paidOrders]);

  // Cost of Goods Sold (COGS)
  const totalCOGS = useMemo(() => {
    let cost = 0;
    validSales.forEach((s) => {
      s.items.forEach((item) => {
        cost += item.quantity * item.product.purchase_price;
      });
    });
    paidOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod) cost += item.quantity * prod.purchase_price;
      });
    });
    return cost;
  }, [validSales, paidOrders, products]);

  // Total Expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, e) => acc + e.amount, 0);
  }, [expenses]);

  // Gross Margin & Net Profit
  const grossMargin = totalRevenue - totalCOGS;
  const grossMarginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
  const netProfit = grossMargin - totalExpenses;

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = { WAVE: 0, ORANGE_MONEY: 0, ESPECES: 0, CARTE: 0, CREDIT: 0 };
    validSales.forEach((s) => {
      map[s.payment_method] = (map[s.payment_method] || 0) + s.total;
    });
    paidOrders.forEach((o) => {
      map[o.payment_method] = (map[o.payment_method] || 0) + o.total;
    });
    return Object.entries(map).map(([method, total]) => ({
      method,
      total,
      percentage: totalRevenue > 0 ? (total / totalRevenue) * 100 : 0,
    }));
  }, [validSales, paidOrders, totalRevenue]);

  // Top and Flop products
  const productPerformance = useMemo(() => {
    const counts: Record<string, { product: typeof products[0]; totalSold: number; revenue: number }> = {};
    products.forEach((p) => {
      counts[p.id] = { product: p, totalSold: 0, revenue: 0 };
    });

    validSales.forEach((s) => {
      s.items.forEach((item) => {
        if (counts[item.product.id]) {
          counts[item.product.id].totalSold += item.quantity;
          counts[item.product.id].revenue += item.total_price;
        }
      });
    });

    const list = Object.values(counts);
    const sortedDesc = [...list].sort((a, b) => b.totalSold - a.totalSold);
    const sortedAsc = [...list].sort((a, b) => a.totalSold - b.totalSold);

    return {
      top: sortedDesc.slice(0, 4),
      flop: sortedAsc.slice(0, 4),
    };
  }, [validSales, products]);

  // Top Clients
  const topClients = useMemo(() => {
    return [...customers].sort((a, b) => b.total_spent - a.total_spent).slice(0, 5);
  }, [customers]);

  const handleExportCSV = () => {
    const data = [
      ['Rapport Financier Jaay - Date', new Date().toLocaleDateString('fr-FR')],
      ['Chiffre d\'Affaires Total (FCFA)', totalRevenue],
      ['Cout des Marchandises Vendues (COGS FCFA)', totalCOGS],
      ['Marge Commerciale Brute (FCFA)', grossMargin],
      ['Taux de Marge (%)', grossMarginPercent.toFixed(1) + '%'],
      ['Depenses d\'Exploitation (FCFA)', totalExpenses],
      ['Benefice Net Estime (FCFA)', netProfit],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + data.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rapport_financier_jaay_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!canViewFinances) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Rapports Financiers Réservés
        </h2>
        <p className="text-xs text-neutral-500">
          Les bilans financiers, bénéfices et marges sont strictement confidentiels et inaccessibles avec le profil {currentUser.role}.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Statistiques & Rapports Financiers
          </h2>
          <p className="text-xs text-neutral-500">
            Analyse des encaissements, bénéfices nets, marges commerciales et répartition des paiements au Sénégal
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <Printer className="h-4 w-4" />
            <span>Imprimer Bilan</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exporter Rapport (CSV)</span>
          </button>
        </div>
      </div>

      {/* Financial Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Chiffre d'Affaires Global</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
            {formatFCFA(totalRevenue)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {validSales.length} ventes + {paidOrders.length} commandes
          </span>
        </div>

        {/* COGS & Marge */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Marge Brute Réalisée</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-blue-600">
            {formatFCFA(grossMargin)}
          </p>
          <span className="text-[11px] text-neutral-500">
            Taux de marge : {grossMarginPercent.toFixed(1)}%
          </span>
        </div>

        {/* Dépenses */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Dépenses d'Exploitation</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-rose-600">
            -{formatFCFA(totalExpenses)}
          </p>
          <span className="text-[11px] text-neutral-500">Loyer, électricité, charges</span>
        </div>

        {/* Bénéfice Net */}
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Bénéfice Net Réel</span>
          <p
            className={`mt-1 text-2xl font-black font-mono tabular-nums ${
              netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatFCFA(netProfit)}
          </p>
          <span className="text-[11px] text-neutral-500">
            {netProfit >= 0 ? 'Activité bénéficiaire' : 'Déficit d’exploitation'}
          </span>
        </div>
      </div>

      {/* Row 2: Payment Breakdown & Best Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Distribution */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
            Répartition des Moyens de Paiement
          </h3>

          <div className="space-y-3">
            {paymentBreakdown.map((pm, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-700 dark:text-neutral-300">
                    {pm.method === 'WAVE'
                      ? 'Wave'
                      : pm.method === 'ORANGE_MONEY'
                      ? 'Orange Money'
                      : pm.method === 'ESPECES'
                      ? 'Espèces'
                      : pm.method === 'CARTE'
                      ? 'Carte Bancaire'
                      : 'Paiement à Crédit'}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
                    {formatFCFA(pm.total)} ({pm.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div
                    style={{ width: `${pm.percentage}%` }}
                    className={`h-full rounded-full ${
                      pm.method === 'WAVE'
                        ? 'bg-cyan-500'
                        : pm.method === 'ORANGE_MONEY'
                        ? 'bg-orange-500'
                        : pm.method === 'ESPECES'
                        ? 'bg-emerald-600'
                        : 'bg-blue-600'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Customers */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
            Top 5 Meilleurs Clients (CRM)
          </h3>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {topClients.map((c, idx) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">{c.name}</p>
                  <p className="text-[11px] text-neutral-400">
                    {c.orders_count} achat(s) · {c.city || 'Dakar'}
                  </p>
                </div>
                <span className="font-mono font-bold text-emerald-600 tabular-nums">
                  {formatFCFA(c.total_spent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top & Flop Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Produits les Plus Vendus (Top Ventes)
          </h3>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {productPerformance.top.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-xs">
                  {item.product.name}
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                  {item.totalSold} unité(s) vendue(s)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Flop products */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
            <ArrowUpRight className="h-4 w-4 text-amber-500" />
            Produits Moins Demandés / Stock Dormant
          </h3>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {productPerformance.flop.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-xs">
                  {item.product.name}
                </span>
                <span className="font-mono text-neutral-400">
                  {item.totalSold} vente(s) · Stock: {item.product.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
