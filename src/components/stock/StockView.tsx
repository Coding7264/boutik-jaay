import React, { useState, useMemo } from 'react';
import {
  Boxes,
  PlusCircle,
  MinusCircle,
  ClipboardList,
  AlertTriangle,
  History,
  Search,
  Filter,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  X,
  User,
  Calendar,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { Product, StockMovementType } from '../../types';
import { formatFCFA, formatDateTime } from '../../utils/formatters';

export const StockView: React.FC = () => {
  const {
    products,
    stockMovements,
    recordStockMovement,
    currentUser,
  } = useCommerce();

  // Tab State: 'overview' | 'movements' | 'inventory'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'movements' | 'inventory'>('overview');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [movementFilterType, setMovementFilterType] = useState<string>('ALL');

  // Modal for new stock movement (Entrée, Sortie, Ajustement)
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [modalType, setModalType] = useState<StockMovementType>('ENTREE_ACHAT');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [movementQty, setMovementQty] = useState<number>(1);
  const [movementReason, setMovementReason] = useState('');

  // Selected product object
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  // Stock Totals
  const totalItemsCount = useMemo(() => {
    return products.reduce((acc, p) => acc + p.quantity, 0);
  }, [products]);

  const stockValuePurchase = useMemo(() => {
    return products.reduce((acc, p) => acc + p.quantity * p.purchase_price, 0);
  }, [products]);

  const stockValueSelling = useMemo(() => {
    return products.reduce((acc, p) => acc + p.quantity * p.selling_price, 0);
  }, [products]);

  const outOfStockList = useMemo(() => products.filter((p) => p.quantity === 0), [products]);
  const lowStockList = useMemo(() => products.filter((p) => p.quantity > 0 && p.quantity <= p.min_stock_alert), [products]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return stockMovements.filter((m) => {
      const matchesSearch =
        m.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = movementFilterType === 'ALL' || m.type === movementFilterType;
      return matchesSearch && matchesType;
    });
  }, [stockMovements, searchQuery, movementFilterType]);

  const handleOpenMovementModal = (type: StockMovementType, defaultProduct?: Product) => {
    setModalType(type);
    setSelectedProductId(defaultProduct ? defaultProduct.id : products[0]?.id || '');
    setSelectedVariantId('');
    setMovementQty(1);
    setMovementReason('');
    setShowMovementModal(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !movementReason || movementQty <= 0) {
      alert('Veuillez spécifier un produit, une quantité valide et un motif obligatoire.');
      return;
    }

    const delta =
      modalType === 'ENTREE_ACHAT' || modalType === 'RETOUR_CLIENT'
        ? movementQty
        : modalType === 'SORTIE_PERTE'
        ? -movementQty
        : movementQty; // If adjustment, prompt can also pass delta or net

    recordStockMovement(
      selectedProductId,
      modalType,
      delta,
      movementReason,
      selectedVariantId || undefined
    );

    setShowMovementModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Gestion du Stock & Inventaire
          </h2>
          <p className="text-xs text-neutral-500">
            Suivi des mouvements immuables avec motif et responsable pour chaque variation de stock
          </p>
        </div>

        {currentUser.permissions.canEditStock && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleOpenMovementModal('ENTREE_ACHAT')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Entrée de Stock</span>
            </button>
            <button
              onClick={() => handleOpenMovementModal('SORTIE_PERTE')}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <MinusCircle className="h-4 w-4 text-rose-500" />
              <span>Sortie / Perte</span>
            </button>
            <button
              onClick={() => handleOpenMovementModal('AJUSTEMENT_INVENTAIRE')}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <ClipboardList className="h-4 w-4 text-amber-500" />
              <span>Ajustement</span>
            </button>
          </div>
        )}
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Unités Totales en Rayon</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
            {totalItemsCount}
          </p>
          <span className="text-[11px] text-neutral-400">Sur {products.length} références</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Valeur Vente du Stock</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {currentUser.permissions.canViewFinances ? formatFCFA(stockValueSelling) : '•••••• FCFA'}
          </p>
          <span className="text-[11px] text-neutral-400">Au prix public affiché</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Valeur Achat du Stock</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {currentUser.permissions.canViewFinances ? formatFCFA(stockValuePurchase) : '•••••• FCFA'}
          </p>
          <span className="text-[11px] text-neutral-400">Investissement marchandises</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Alertes Réapprovisionnement</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-rose-600">
            {outOfStockList.length + lowStockList.length}
          </p>
          <span className="text-[11px] text-neutral-400">
            {outOfStockList.length} rupture(s) · {lowStockList.length} faible(s)
          </span>
        </div>
      </div>

      {/* Sub Tabs: Overview vs Movements History */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeSubTab === 'overview'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          Vue des Disponibilités & Alertes
        </button>
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeSubTab === 'movements'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Historique des Mouvements ({stockMovements.length})</span>
        </button>
      </div>

      {activeSubTab === 'overview' ? (
        /* STOCK AVAILABILITY & ALERTS */
        <div className="space-y-6">
          {/* Critical Ruptures / Out of stock */}
          {outOfStockList.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900/60 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Produits en Rupture Immédiate ({outOfStockList.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {outOfStockList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border border-rose-200 dark:bg-neutral-900 dark:border-rose-900"
                  >
                    <div>
                      <p className="font-bold text-xs text-neutral-900 dark:text-white">{p.name}</p>
                      <span className="text-[11px] font-mono text-neutral-400">SKU: {p.sku}</span>
                    </div>
                    {currentUser.permissions.canEditStock && (
                      <button
                        onClick={() => handleOpenMovementModal('ENTREE_ACHAT', p)}
                        className="rounded bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
                      >
                        Approvisionner
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Warning */}
          {lowStockList.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Produits en Stock Faible ({lowStockList.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lowStockList.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm border border-amber-200 dark:bg-neutral-900 dark:border-amber-900"
                  >
                    <div>
                      <p className="font-bold text-xs text-neutral-900 dark:text-white">{p.name}</p>
                      <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                        {p.quantity} restant(s) (seuil : {p.min_stock_alert})
                      </span>
                    </div>
                    {currentUser.permissions.canEditStock && (
                      <button
                        onClick={() => handleOpenMovementModal('ENTREE_ACHAT', p)}
                        className="rounded bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-700"
                      >
                        Ajouter du stock
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Stock List Table */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Inventaire Général des Stocks
              </h3>
              <span className="text-xs text-neutral-500">Mise à jour en direct</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
                  <tr>
                    <th className="py-2.5 px-4">Produit</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Quantité Disponible</th>
                    <th className="py-2.5 px-3 text-center">Seuil Alerte</th>
                    <th className="py-2.5 px-3 text-right">Valeur Vente</th>
                    <th className="py-2.5 px-4 text-right">Actions Rapides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                      <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-400">{p.sku}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            p.quantity === 0
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : p.quantity <= p.min_stock_alert
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {p.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-neutral-500">
                        {p.min_stock_alert}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                        {formatFCFA(p.quantity * p.selling_price)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {currentUser.permissions.canEditStock && (
                          <>
                            <button
                              onClick={() => handleOpenMovementModal('ENTREE_ACHAT', p)}
                              className="rounded border border-neutral-200 px-2 py-1 text-[11px] font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                            >
                              + Entrée
                            </button>
                            <button
                              onClick={() => handleOpenMovementModal('AJUSTEMENT_INVENTAIRE', p)}
                              className="rounded border border-neutral-200 px-2 py-1 text-[11px] font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                            >
                              Ajuster
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* IMMUTABLE MOVEMENTS AUDIT LOG */
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900 space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Filtrer par produit, motif ou auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <select
              value={movementFilterType}
              onChange={(e) => setMovementFilterType(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            >
              <option value="ALL">Tous les Types de Mouvement</option>
              <option value="VENTE">Vente en Caisse</option>
              <option value="ENTREE_ACHAT">Entrée / Achat Fournisseur</option>
              <option value="SORTIE_PERTE">Sortie / Perte</option>
              <option value="AJUSTEMENT_INVENTAIRE">Ajustement d'Inventaire</option>
              <option value="RETOUR_CLIENT">Retour Client</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
                <tr>
                  <th className="py-2.5 px-3">Date / Heure</th>
                  <th className="py-2.5 px-3">Produit</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Variation</th>
                  <th className="py-2.5 px-3 text-center">Avant / Après</th>
                  <th className="py-2.5 px-4">Motif Justificatif</th>
                  <th className="py-2.5 px-3 text-right">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-neutral-400">
                      Aucun mouvement de stock correspondant.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                      <td className="py-3 px-3 text-neutral-500 font-mono text-[11px]">
                        {formatDateTime(m.date)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                        {m.product_name}
                        {m.variant_name && (
                          <span className="block text-[11px] text-neutral-400 font-normal">
                            Variante: {m.variant_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            m.type === 'ENTREE_ACHAT' || m.type === 'RETOUR_CLIENT'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : m.type === 'VENTE'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                        <span className={m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-neutral-500">
                        {m.previous_quantity} →{' '}
                        <strong className="text-neutral-900 dark:text-white">{m.new_quantity}</strong>
                      </td>
                      <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                        {m.reason}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-neutral-600 dark:text-neutral-300">
                        {m.user_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: RECORD STOCK MOVEMENT */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSaveMovement}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Enregistrer un Mouvement de Stock
              </h3>
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Type selector */}
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Type d'opération *
                </label>
                <select
                  value={modalType}
                  onChange={(e) => setModalType(e.target.value as StockMovementType)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="ENTREE_ACHAT">Entrée de Stock (Achat / Réception)</option>
                  <option value="SORTIE_PERTE">Sortie de Stock (Perte / Casse / Usage)</option>
                  <option value="AJUSTEMENT_INVENTAIRE">Ajustement d'Inventaire (+/-)</option>
                  <option value="RETOUR_CLIENT">Retour Client / Échange</option>
                </select>
              </div>

              {/* Product selector */}
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Produit concerné *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setSelectedVariantId('');
                  }}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock actuel: {p.quantity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant selector if product has variants */}
              {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Déclinaison / Variante (optionnel)
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  >
                    <option value="">Toutes / Produit principal</option>
                    {selectedProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} (Dispo: {v.quantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Quantité d'unités *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(Number(e.target.value) || 1)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              {/* Reason (mandatory for audit integrity) */}
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Motif obligatoire de la modification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Réception colis Sandaga, erreur inventaire physique..."
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="rounded-lg bg-neutral-50 p-2.5 text-[11px] text-neutral-500 dark:bg-neutral-800">
                Responsable enregistré : <strong>{currentUser.name}</strong> ({currentUser.role})
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
              >
                Enregistrer le mouvement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
