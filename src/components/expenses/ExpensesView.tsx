import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Calendar,
  X,
  CreditCard,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import {
  formatFCFA,
  formatDate,
  formatDateTime,
  getExpenseCategoryLabel,
  getPaymentMethodLabel,
} from '../../utils/formatters';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, store, currentUser } = useCommerce();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [amount, setAmount] = useState<number>(10000);
  const [category, setCategory] = useState<ExpenseCategory>('TRANSPORT');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');
  const [receiptUrl, setReceiptUrl] = useState('');

  const canViewFinances = currentUser.permissions.canViewFinances;

  const categoriesList: ExpenseCategory[] = [
    'LOYER',
    'ELECTRICITE',
    'TRANSPORT',
    'LIVRAISON',
    'SALAIRES',
    'PUBLICITE',
    'APPROVISIONNEMENT',
    'MAINTENANCE',
    'AUTRES',
  ];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  }, [filteredExpenses]);

  // Breakdown by category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description) {
      alert('Veuillez spécifier un montant positif et une description.');
      return;
    }

    addExpense({
      store_id: store.id,
      amount,
      category,
      description,
      payment_method: paymentMethod,
      receipt_url: receiptUrl || undefined,
    });

    setShowModal(false);
    setDescription('');
    setAmount(10000);
    setReceiptUrl('');
  };

  if (!canViewFinances) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Accès Financier Protégé
        </h2>
        <p className="text-xs text-neutral-500">
          Votre compte utilisateur ({currentUser.name} - {currentUser.role}) ne dispose pas de la
          permission requise pour consulter ou gérer les charges financières et les dépenses de l'entreprise.
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
            Gestion des Dépenses d'Exploitation
          </h2>
          <p className="text-xs text-neutral-500">
            Enregistrez les charges courantes (Loyer, Woyofal/Senelec, transport, salaires) pour calculer le bénéfice net réel
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Dépense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Total Dépenses Enregistrées</span>
          <p className="mt-1 text-2xl font-black font-mono tabular-nums text-rose-600">
            {formatFCFA(totalExpenses)}
          </p>
          <span className="text-[11px] text-neutral-400">{filteredExpenses.length} opérations</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Poste Principal</span>
          <p className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
            {categoryBreakdown[0] ? getExpenseCategoryLabel(categoryBreakdown[0][0]) : 'Aucun'}
          </p>
          <span className="text-[11px] font-mono text-neutral-500">
            {categoryBreakdown[0] ? formatFCFA(categoryBreakdown[0][1]) : '0 FCFA'}
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-xs font-medium text-neutral-500">Paiements Réalisés Par</span>
          <p className="mt-1 text-base font-bold text-neutral-900 dark:text-white">
            Wave & Orange Money
          </p>
          <span className="text-[11px] text-neutral-400">Directement depuis le compte pro</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par description (ex: Senelec, Loyer, Essence)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-4 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <option value="ALL">Toutes les Catégories</option>
          {categoriesList.map((cat) => (
            <option key={cat} value={cat}>
              {getExpenseCategoryLabel(cat)}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Règlement</th>
                <th className="py-3 px-3 text-right">Montant</th>
                <th className="py-3 px-4 text-right">Auteur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-400">
                    Aucune dépense enregistrée.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                    <td className="py-3 px-4 text-neutral-500 font-mono text-[11px]">
                      {formatDateTime(exp.date)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-800 dark:text-neutral-200">
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] dark:bg-neutral-800">
                        {getExpenseCategoryLabel(exp.category)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-900 dark:text-white font-medium">
                      {exp.description}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-medium">
                      {getPaymentMethodLabel(exp.payment_method)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 tabular-nums">
                      -{formatFCFA(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-500">{exp.created_by}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Enregistrer une Dépense Commerciale
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
                  Montant en FCFA *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono text-base font-bold dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Catégorie de la dépense *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {getExpenseCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Description détaillée du motif *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Facture Senelec compteur magasin, recharge crédit..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Moyen de règlement utilisé
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="WAVE">Wave</option>
                  <option value="ORANGE_MONEY">Orange Money</option>
                  <option value="ESPECES">Espèces de la caisse</option>
                  <option value="CARTE">Carte bancaire / Virement</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  URL du justificatif / Reçu (optionnel)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
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
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-md"
              >
                Enregistrer la Dépense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
