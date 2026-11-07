import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  CreditCard,
  Building,
  User,
  Calendar,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { Invoice, InvoiceItem } from '../../types';
import {
  formatFCFA,
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  generateWhatsAppUrl,
} from '../../utils/formatters';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    createInvoice,
    updateInvoiceStatus,
    convertQuoteToInvoice,
    customers,
    products,
    store,
  } = useCommerce();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'FACTURE' | 'DEVIS'>('ALL');

  // Preview & Print Modal
  const [previewDoc, setPreviewDoc] = useState<Invoice | null>(null);

  // New Document Modal
  const [showModal, setShowModal] = useState(false);
  const [docType, setDocType] = useState<'FACTURE' | 'DEVIS'>('FACTURE');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [docNotes, setDocNotes] = useState('Paiement par Wave ou Orange Money accepté.');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: products[0]?.name || 'Article', quantity: 1, unit_price: products[0]?.selling_price || 10000, total: 10000 },
  ]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const matchesSearch =
        i.document_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.customer_phone.includes(searchQuery);
      const matchesType = typeFilter === 'ALL' || i.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [invoices, searchQuery, typeFilter]);

  const handleOpenCreate = (type: 'FACTURE' | 'DEVIS') => {
    setDocType(type);
    setSelectedCustomerId('');
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setDiscountAmount(0);
    setItems([
      { description: products[0]?.name || 'Article', quantity: 1, unit_price: products[0]?.selling_price || 10000, total: 10000 },
    ]);
    setShowModal(true);
  };

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const c = customers.find((cust) => cust.id === id);
    if (c) {
      setClientName(c.name);
      setClientPhone(c.phone);
      setClientAddress(c.address || c.city || 'Dakar');
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      current.total = current.quantity * current.unit_price;
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 5000, total: 5000 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = useMemo(() => {
    return items.reduce((acc, i) => acc + i.total, 0);
  }, [items]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || items.length === 0) {
      alert('Veuillez renseigner le client et les articles.');
      return;
    }

    const created = createInvoice({
      type: docType,
      customer_id: selectedCustomerId || undefined,
      customer_name: clientName,
      customer_phone: clientPhone,
      customer_address: clientAddress,
      items,
      subtotal,
      tax_rate: 0,
      tax_amount: 0,
      discount: discountAmount,
      total,
      amount_paid: docType === 'FACTURE' ? total : 0,
      status: docType === 'FACTURE' ? 'PAYE' : 'ENVOYE',
      due_date: new Date(Date.now() + 15 * 86400000).toISOString(),
      notes: docNotes,
    });

    setShowModal(false);
    setPreviewDoc(created);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Factures & Devis Professionnels
          </h2>
          <p className="text-xs text-neutral-500">
            Émission, numérotation automatique, conversion de devis en facture et partage direct par WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleOpenCreate('DEVIS')}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Devis</span>
          </button>
          <button
            onClick={() => handleOpenCreate('FACTURE')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Facture</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par n° document, client, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              typeFilter === 'ALL'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Tous ({invoices.length})
          </button>
          <button
            onClick={() => setTypeFilter('FACTURE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              typeFilter === 'FACTURE'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Factures
          </button>
          <button
            onClick={() => setTypeFilter('DEVIS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              typeFilter === 'DEVIS'
                ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            Devis
          </button>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
              <tr>
                <th className="py-3 px-4">Type & Numéro</th>
                <th className="py-3 px-3">Date d'émission</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Articles</th>
                <th className="py-3 px-3 text-right">Montant Total</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredInvoices.map((doc) => (
                <tr key={doc.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded mr-2 ${
                        doc.type === 'FACTURE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {doc.type}
                    </span>
                    <strong className="font-mono text-neutral-900 dark:text-white">
                      {doc.document_number}
                    </strong>
                  </td>

                  <td className="py-3 px-3 text-neutral-500 font-mono text-[11px]">
                    {formatDate(doc.issue_date)}
                  </td>

                  <td className="py-3 px-3">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {doc.customer_name}
                    </p>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {formatPhoneNumber(doc.customer_phone)}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                    {doc.items.length} ligne(s)
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                    {formatFCFA(doc.total)}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        doc.status === 'PAYE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : doc.status === 'ACCEPTE'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="rounded border border-neutral-200 px-2 py-1 text-[11px] font-semibold hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      Voir / Imprimer
                    </button>

                    {/* Convert Quote to Invoice Button */}
                    {doc.type === 'DEVIS' && doc.status !== 'ACCEPTE' && (
                      <button
                        onClick={() => {
                          const inv = convertQuoteToInvoice(doc.id);
                          if (inv) setPreviewDoc(inv);
                        }}
                        className="rounded bg-blue-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-blue-700 shadow-sm"
                        title="Transformer ce devis en facture définitive"
                      >
                        Convertir en Facture
                      </button>
                    )}

                    <a
                      href={generateWhatsAppUrl(
                        doc.customer_phone,
                        `*DOCUMENT COMMERCIAL - ${store.name}*\n${doc.type === 'FACTURE' ? 'Facture' : 'Devis'} N° : ${doc.document_number}\nClient : ${doc.customer_name}\nMontant total : ${formatFCFA(doc.total)}\nStatut : ${doc.status}\n\nJërëjëf pour votre confiance !`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      title="Envoyer par WhatsApp"
                    >
                      <Share2 className="h-4 w-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: A4 DOCUMENT PREVIEW & PRINT */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800 no-print">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Aperçu {previewDoc.type} · Conforme impression A4
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* A4 Printable Document Container */}
            <div
              id="printable-a4"
              className="rounded-xl border border-neutral-200 bg-white p-8 text-neutral-900 text-xs space-y-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            >
              {/* Header: Store Identity & Document Type */}
              <div className="flex justify-between items-start border-b border-neutral-200 pb-4 dark:border-neutral-800">
                <div>
                  <h1 className="text-xl font-black text-emerald-700 uppercase tracking-tight">
                    {store.name}
                  </h1>
                  <p className="text-neutral-500 text-[11px] mt-0.5">{store.address}, {store.city}</p>
                  <p className="text-neutral-500 text-[11px]">Tél : {formatPhoneNumber(store.phone)} · WhatsApp : {formatPhoneNumber(store.whatsapp)}</p>
                  <p className="text-neutral-500 text-[11px]">Email : {store.email}</p>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black tracking-tight uppercase text-neutral-900 dark:text-white">
                    {previewDoc.type}
                  </span>
                  <p className="font-mono font-bold text-sm text-neutral-700 dark:text-neutral-300">
                    {previewDoc.document_number}
                  </p>
                  <p className="text-neutral-500 text-[11px] mt-1">
                    Date : <strong>{formatDate(previewDoc.issue_date)}</strong>
                  </p>
                  <p className="text-neutral-500 text-[11px]">
                    Échéance : <strong>{formatDate(previewDoc.due_date)}</strong>
                  </p>
                </div>
              </div>

              {/* Client Info Box */}
              <div className="rounded-lg bg-neutral-50 p-4 border border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Facturé à :
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {previewDoc.customer_name}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400 font-mono">
                  {formatPhoneNumber(previewDoc.customer_phone)}
                </p>
                {previewDoc.customer_address && (
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {previewDoc.customer_address}
                  </p>
                )}
              </div>

              {/* Items Table */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden dark:border-neutral-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 border-b border-neutral-200 font-bold text-neutral-700 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200">
                    <tr>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-center">Quantité</th>
                      <th className="py-2 px-3 text-right">Prix Unitaire</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {previewDoc.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium">{item.description}</td>
                        <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          {formatFCFA(item.unit_price)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                          {formatFCFA(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Sous-total HT :</span>
                    <span className="font-mono">{formatFCFA(previewDoc.subtotal)}</span>
                  </div>
                  {previewDoc.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Remise :</span>
                      <span className="font-mono">-{formatFCFA(previewDoc.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black border-t border-neutral-200 pt-1 dark:border-neutral-700">
                    <span>TOTAL TTC :</span>
                    <span className="font-mono text-emerald-600">
                      {formatFCFA(previewDoc.total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
                    <span>Montant réglé :</span>
                    <span className="font-mono">{formatFCFA(previewDoc.amount_paid)}</span>
                  </div>
                </div>
              </div>

              {/* Footer notes */}
              {previewDoc.notes && (
                <div className="border-t border-neutral-100 pt-3 text-[11px] text-neutral-500 dark:border-neutral-800">
                  <strong>Conditions & Coordonnées :</strong> {previewDoc.notes}
                  <div className="mt-1 font-mono text-[10px]">
                    Wave : {formatPhoneNumber(store.wave_number)} · Orange Money : {formatPhoneNumber(store.om_number)}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer (PDF)</span>
              </button>

              <a
                href={generateWhatsAppUrl(
                  previewDoc.customer_phone,
                  `*DOCUMENT OFFICIEL ${previewDoc.type} - ${store.name}*\nNuméro : ${previewDoc.document_number}\nClient : ${previewDoc.customer_name}\nMontant : ${formatFCFA(previewDoc.total)}\n\nMerci de votre confiance !`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                <Share2 className="h-4 w-4" />
                <span>Envoyer sur WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE INVOICE OR QUOTE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Créer un nouveau document : {docType}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Sélectionner un client existant (optionnel)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="">Nouveau client / Saisie libre</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Nom du client *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Babacar Ndiaye"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Téléphone (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 77 123 45 67"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Adresse de facturation
                </label>
                <input
                  type="text"
                  placeholder="Quartier, Ville..."
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 dark:text-white">Lignes d'articles</span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  + Ajouter un article
                </button>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Désignation article ou prestation"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    className="col-span-6 rounded border border-neutral-200 p-1.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qté"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value) || 1)}
                    className="col-span-2 rounded border border-neutral-200 p-1.5 text-center font-mono dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Prix unitaire"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleItemChange(idx, 'unit_price', Number(e.target.value) || 0)
                    }
                    className="col-span-3 rounded border border-neutral-200 p-1.5 text-right font-mono dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="col-span-1 text-neutral-400 hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Notes & Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Notes et instructions de règlement
                </label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-200 p-1.5 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Remise globale (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  placeholder="0"
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded border border-neutral-200 p-1.5 text-right font-mono dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
            </div>

            {/* Total recap */}
            <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-sm font-bold dark:border-neutral-800">
              <span>Total TTC :</span>
              <span className="font-mono text-emerald-600 text-lg">{formatFCFA(total)}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
              >
                Générer {docType}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
