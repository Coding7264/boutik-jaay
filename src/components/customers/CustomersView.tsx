import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Download,
  MessageSquare,
  Edit,
  X,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { Customer } from '../../types';
import {
  formatFCFA,
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  generateWhatsAppUrl,
} from '../../utils/formatters';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, sales, orders, store } = useCommerce();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dakar');
  const [notes, setNotes] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [customers, searchQuery]);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('Dakar');
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setCity(c.city || 'Dakar');
    setNotes(c.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name,
        phone,
        email,
        address,
        city,
        notes,
      });
      if (selectedCustomer?.id === editingCustomer.id) {
        setSelectedCustomer({
          ...selectedCustomer,
          name,
          phone,
          email,
          address,
          city,
          notes,
        });
      }
    } else {
      const created = addCustomer({
        name,
        phone,
        email,
        address,
        city,
        notes,
      });
      setSelectedCustomer(created);
    }

    setShowModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Telephone', 'Email', 'Adresse', 'Ville', 'Total_Depense_FCFA', 'Commandes', 'Solde_Credit'];
    const rows = customers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.address || ''}"`,
      `"${c.city || ''}"`,
      c.total_spent,
      c.orders_count,
      c.credit_balance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clients_jaay_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get selected customer sales & orders history
  const customerSales = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales.filter((s) => s.customer_id === selectedCustomer.id);
  }, [sales, selectedCustomer]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        o.customer.phone === selectedCustomer.phone ||
        o.customer.name.toLowerCase() === selectedCustomer.name.toLowerCase()
    );
  }, [orders, selectedCustomer]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Gestion de la Clientèle (CRM)
          </h2>
          <p className="text-xs text-neutral-500">
            Fichier client centralisé avec historique d'achats, créances à crédit et contact direct WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <Download className="h-4 w-4" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Client</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Client List (left) & Selected Client Dossier (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customers Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, quartier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-4 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
                  <tr>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Téléphone</th>
                    <th className="py-3 px-3 text-right">Dépenses</th>
                    <th className="py-3 px-3 text-center">Commandes</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-neutral-400">
                        Aucun client correspondant.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCustomer(c)}
                        className={`cursor-pointer transition-colors ${
                          selectedCustomer?.id === c.id
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                            : 'hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <p className="font-bold text-neutral-900 dark:text-white">{c.name}</p>
                          <span className="text-[11px] text-neutral-400">{c.city || 'Dakar'}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-neutral-600 dark:text-neutral-300">
                          {formatPhoneNumber(c.phone)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                          {formatFCFA(c.total_spent)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">{c.orders_count}</td>
                        <td className="py-3 px-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800"
                            title="Modifier"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <a
                            href={generateWhatsAppUrl(
                              c.phone,
                              `Bonjour ${c.name}, ${store.name} vous remercie de votre fidélité ! Avez-vous besoin d'un renseignement sur nos articles ?`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                            title="WhatsApp"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Profile / History Detail */}
        <div className="lg:col-span-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4 min-h-[500px]">
          {selectedCustomer ? (
            <>
              {/* Profile Header */}
              <div className="border-b border-neutral-100 pb-3 dark:border-neutral-800 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    <span className="font-mono">{formatPhoneNumber(selectedCustomer.phone)}</span>
                    <span>·</span>
                    <span>{selectedCustomer.city || 'Dakar'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={generateWhatsAppUrl(
                      selectedCustomer.phone,
                      `Bonjour ${selectedCustomer.name}, ici ${store.name}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Stats & Credit Alert */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                  <span className="text-neutral-500">Total Dépensé</span>
                  <p className="mt-1 font-mono font-bold text-base text-neutral-900 dark:text-white tabular-nums">
                    {formatFCFA(selectedCustomer.total_spent)}
                  </p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                  <span className="text-neutral-500">Solde Crédit / Dû</span>
                  <p
                    className={`mt-1 font-mono font-bold text-base tabular-nums ${
                      selectedCustomer.credit_balance > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatFCFA(selectedCustomer.credit_balance)}
                  </p>
                </div>
              </div>

              {/* Address & Notes */}
              <div className="text-xs space-y-2 text-neutral-700 dark:text-neutral-300">
                {selectedCustomer.address && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                    <span>{selectedCustomer.address}</span>
                  </p>
                )}
                {selectedCustomer.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>{selectedCustomer.email}</span>
                  </p>
                )}
                {selectedCustomer.notes && (
                  <div className="rounded-lg bg-amber-50 p-2.5 text-amber-900 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300">
                    <strong>Note interne :</strong> {selectedCustomer.notes}
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Historique Récent ({customerSales.length} ventes caisse, {customerOrders.length} commandes)
                </span>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {customerSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="rounded-lg border border-neutral-100 p-2 text-xs dark:border-neutral-800 flex justify-between items-center"
                    >
                      <div>
                        <strong className="text-neutral-900 dark:text-white font-mono">
                          {sale.sale_number}
                        </strong>
                        <p className="text-[11px] text-neutral-400">{formatDate(sale.date)}</p>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 tabular-nums">
                        {formatFCFA(sale.total)}
                      </span>
                    </div>
                  ))}

                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="rounded-lg border border-neutral-100 p-2 text-xs dark:border-neutral-800 flex justify-between items-center"
                    >
                      <div>
                        <strong className="text-neutral-900 dark:text-white font-mono">
                          {ord.order_number} ({ord.channel})
                        </strong>
                        <p className="text-[11px] text-neutral-400">{formatDate(ord.date)}</p>
                      </div>
                      <span className="font-mono font-bold text-blue-600 tabular-nums">
                        {formatFCFA(ord.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-xs text-neutral-400">
              <Users className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
              Sélectionnez un client dans la liste pour consulter sa fiche complète et son historique.
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                {editingCustomer ? 'Modifier la Fiche Client' : 'Nouveau Client CRM'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fatoumata Zahra Ba"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Numéro Téléphone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 77 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  placeholder="contact@example.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Ville / Région
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Quartier / Adresse
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mermoz Pyrotechnie"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Notes internes (préférences, mensurations...)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes confidentielles..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
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
    </div>
  );
};
