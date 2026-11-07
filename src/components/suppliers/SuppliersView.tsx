import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  PackageCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
  Edit,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { Supplier, SupplyOrder, SupplyOrderItem } from '../../types';
import { formatFCFA, formatDate, formatDateTime, formatPhoneNumber } from '../../utils/formatters';

export const SuppliersView: React.FC = () => {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    supplyOrders,
    createSupplyOrder,
    receiveSupplyOrder,
    products,
    currentUser,
  } = useCommerce();

  // Search & tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers');

  // Modal 1: Supplier creation/edit
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [productsSupplied, setProductsSupplied] = useState('');

  // Modal 2: Supply Order creation
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([
    { productId: products[0]?.id || '', quantity: 10, unitPrice: products[0]?.purchase_price || 5000 },
  ]);
  const [orderNotes, setOrderNotes] = useState('');

  const canEdit = currentUser.permissions.canEditStock;

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setProductsSupplied('');
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setName(s.name);
    setContactName(s.contact_name);
    setPhone(s.phone);
    setEmail(s.email || '');
    setAddress(s.address || '');
    setProductsSupplied(s.products_supplied.join(', '));
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const productsList = productsSupplied
      ? productsSupplied.split(',').map((p) => p.trim())
      : [];

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name,
        contact_name: contactName,
        phone,
        email,
        address,
        products_supplied: productsList,
      });
    } else {
      addSupplier({
        name,
        contact_name: contactName,
        phone,
        email,
        address,
        products_supplied: productsList,
      });
    }

    setShowSupplierModal(false);
  };

  const handleOpenCreateOrder = () => {
    setSelectedSupplierId(suppliers[0]?.id || '');
    setOrderItems([
      { productId: products[0]?.id || '', quantity: 10, unitPrice: products[0]?.purchase_price || 5000 },
    ]);
    setOrderNotes('');
    setShowOrderModal(true);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier || orderItems.length === 0) return;

    const formattedItems: SupplyOrderItem[] = orderItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      return {
        product_id: prod.id,
        product_name: prod.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        received_quantity: 0,
      };
    });

    const total = formattedItems.reduce((acc, i) => acc + i.quantity * i.unit_price, 0);

    createSupplyOrder({
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      items: formattedItems,
      total,
      status: 'COMMANDE',
      payment_status: 'IMPAYE',
      notes: orderNotes,
    });

    setShowOrderModal(false);
  };

  const totalDettesFournisseurs = useMemo(() => {
    return suppliers.reduce((acc, s) => acc + s.balance_due, 0);
  }, [suppliers]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Fournisseurs & Approvisionnements
          </h2>
          <p className="text-xs text-neutral-500">
            Gestion des achats, bons de commande et réceptions de marchandises avec mise à jour automatique du stock
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpenCreateOrder}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Nouveau Bon de Commande</span>
            </button>
            <button
              onClick={handleOpenAddSupplier}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Fournisseur</span>
            </button>
          </div>
        )}
      </div>

      {/* Dettes & Commandes KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Partenaires Fournisseurs</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
            {suppliers.length}
          </p>
          <span className="text-[11px] text-neutral-400">Sandaga, Colobane, importateurs</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Bons d'Approvisionnement</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {supplyOrders.length}
          </p>
          <span className="text-[11px] text-neutral-400">Historique des achats</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Montant Total Dû (Dettes)</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-rose-600">
            {currentUser.permissions.canViewFinances ? formatFCFA(totalDettesFournisseurs) : '•••••• FCFA'}
          </p>
          <span className="text-[11px] text-neutral-400">Soldes créditeurs à régler</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === 'suppliers'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          Annuaire des Fournisseurs ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            activeTab === 'orders'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
          }`}
        >
          Bons d'Approvisionnement & Réceptions ({supplyOrders.length})
        </button>
      </div>

      {activeTab === 'suppliers' ? (
        /* SUPPLIERS GRID */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {sup.name}
                  </h3>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEditSupplier(sup)}
                      className="rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-neutral-500 mt-1">
                  Contact : <strong className="text-neutral-800 dark:text-neutral-200">{sup.contact_name}</strong>
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="font-mono">{formatPhoneNumber(sup.phone)}</span>
                  </p>
                  {sup.address && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{sup.address}</span>
                    </p>
                  )}
                </div>

                {sup.products_supplied.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                      Produits fournis :
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {sup.products_supplied.map((prod, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Solde dû :</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    sup.balance_due > 0 ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {currentUser.permissions.canViewFinances ? formatFCFA(sup.balance_due) : '•••••• FCFA'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* SUPPLY ORDERS TABLE */
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
                <tr>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Fournisseur</th>
                  <th className="py-3 px-3">Articles commandés</th>
                  <th className="py-3 px-3 text-right">Montant Total</th>
                  <th className="py-3 px-3 text-center">Statut Réception</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {supplyOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {ord.reference}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-mono text-[11px]">
                      {formatDate(ord.date)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-800 dark:text-neutral-200">
                      {ord.supplier_name}
                    </td>
                    <td className="py-3 px-3">
                      {ord.items.map((i, idx) => (
                        <div key={idx} className="truncate max-w-xs">
                          {i.quantity}x {i.product_name}
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                      {currentUser.permissions.canViewFinances ? formatFCFA(ord.total) : '•••••• FCFA'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ord.status === 'RECU_TOTAL'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {ord.status === 'RECU_TOTAL' ? 'Réceptionné' : 'En attente livraison'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ord.status !== 'RECU_TOTAL' && canEdit && (
                        <button
                          onClick={() => receiveSupplyOrder(ord.id)}
                          className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-sm"
                        >
                          <PackageCheck className="h-3.5 w-3.5" />
                          <span>Réceptionner (+Stock)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT SUPPLIER */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSaveSupplier}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                {editingSupplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Raison sociale / Nom entreprise *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Comptoir Textile Sandaga"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Nom du contact / Responsable
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mamadou Lamine Cissé"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Téléphone (Sénégal) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 77 633 21 45"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Adresse / Marché
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marché Sandaga, Dakar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Articles fournis (séparés par virgule)
                </label>
                <input
                  type="text"
                  placeholder="Bazin, Soie, Écouteurs..."
                  value={productsSupplied}
                  onChange={(e) => setProductsSupplied(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: CREATE SUPPLY PURCHASE ORDER */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSaveOrder}
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Créer une Commande d'Approvisionnement
              </h3>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Fournisseur *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.contact_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items selection */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    Articles à commander
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOrderItems([
                        ...orderItems,
                        {
                          productId: products[0]?.id || '',
                          quantity: 5,
                          unitPrice: products[0]?.purchase_price || 5000,
                        },
                      ])
                    }
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    + Ajouter une ligne
                  </button>
                </div>

                {orderItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const updated = [...orderItems];
                        const prod = products.find((p) => p.id === e.target.value);
                        updated[idx].productId = e.target.value;
                        if (prod) updated[idx].unitPrice = prod.purchase_price;
                        setOrderItems(updated);
                      }}
                      className="col-span-6 rounded border border-neutral-200 p-1.5 dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...orderItems];
                        updated[idx].quantity = Number(e.target.value) || 1;
                        setOrderItems(updated);
                      }}
                      className="col-span-2 rounded border border-neutral-200 p-1.5 text-center font-mono dark:border-neutral-700 dark:bg-neutral-800"
                    />

                    <input
                      type="number"
                      placeholder="Prix Achat"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const updated = [...orderItems];
                        updated[idx].unitPrice = Number(e.target.value) || 0;
                        setOrderItems(updated);
                      }}
                      className="col-span-3 rounded border border-neutral-200 p-1.5 font-mono dark:border-neutral-700 dark:bg-neutral-800 text-right"
                    />

                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
                        className="col-span-1 text-neutral-400 hover:text-rose-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Notes ou conditions de livraison
                </label>
                <input
                  type="text"
                  placeholder="Ex: Livraison prévue lundi matin..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md"
              >
                Valider le Bon de Commande
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
