import React, { useState } from 'react';
import {
  Tag,
  MessageSquare,
  Sparkles,
  Percent,
  Copy,
  Check,
  Send,
  Plus,
  Trash2,
  Calendar,
  Gift,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA, generateWhatsAppUrl } from '../../utils/formatters';

interface PromoCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  min_order_amount: number;
  is_active: boolean;
  uses_count: number;
}

export const MarketingView: React.FC = () => {
  const { store, customers } = useCommerce();

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    {
      id: 'promo-1',
      code: 'BIENVENUE10',
      type: 'PERCENTAGE',
      value: 10,
      min_order_amount: 15000,
      is_active: true,
      uses_count: 14,
    },
    {
      id: 'promo-2',
      code: 'DAKAR2025',
      type: 'FIXED',
      value: 2000,
      min_order_amount: 25000,
      is_active: true,
      uses_count: 6,
    },
    {
      id: 'promo-3',
      code: 'WAVEPROMO',
      type: 'PERCENTAGE',
      value: 5,
      min_order_amount: 10000,
      is_active: false,
      uses_count: 22,
    },
  ]);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [newValue, setNewValue] = useState(10);
  const [newMinAmount, setNewMinAmount] = useState(10000);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      code: newCode.toUpperCase().replace(/\s+/g, ''),
      type: newType,
      value: Number(newValue),
      min_order_amount: Number(newMinAmount),
      is_active: true,
      uses_count: 0,
    };

    setPromoCodes([newPromo, ...promoCodes]);
    setShowAddModal(false);
    setNewCode('');
  };

  const toggleStatus = (id: string) => {
    setPromoCodes(promoCodes.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p)));
  };

  const handleDelete = (id: string) => {
    setPromoCodes(promoCodes.filter((p) => p.id !== id));
  };

  const templatesWhatsApp = [
    {
      title: 'Promo Flash du Week-End (-15%)',
      desc: 'Idéal pour booster les ventes de vendredi à dimanche',
      message: `🔥 PROMO FLASH chez ${store.name} !\nProfitez de -15% sur tous nos articles ce week-end avec le code : FLASH15.\n👉 Commandez ici : https://adafrik.com/boutique/${store.slug}\nLivraison rapide à Dakar !`,
    },
    {
      title: 'Nouveautés & Arrivages Frais',
      desc: 'Annoncer les nouveaux produits arrivés en magasin',
      message: `✨ NOUVEAUX ARRIVAGES disponibles dès aujourd'hui chez ${store.name} !\nStock limité, découvrez notre nouvelle sélection en ligne :\n👉 https://adafrik.com/boutique/${store.slug}\nRépondez à ce message pour réserver votre article !`,
    },
    {
      title: 'Fidélité & Cadeau Livraison Offerte',
      desc: 'Remercier vos clients réguliers',
      message: `🎁 Merci pour votre confiance chez ${store.name} !\nPour votre prochaine commande, la livraison à Dakar vous est OFFERTE dès 25 000 FCFA.\nContactez-nous directement pour commander !`,
    },
  ];

  return (
    <div className="p-3.5 sm:p-6 max-w-4xl mx-auto space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            <Tag className="h-6 w-6 text-blue-600" />
            <span>Marketing & Ventes</span>
          </h1>
          <p className="text-neutral-500 mt-1">
            Codes de réduction, campagnes WhatsApp et fidélisation de vos clients
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all self-start sm:self-auto min-h-[40px]"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau code promo</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[11px] font-semibold text-neutral-500 block">Codes Actifs</span>
          <span className="text-xl font-black text-neutral-900 dark:text-white mt-1 block">
            {promoCodes.filter((c) => c.is_active).length}
          </span>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[11px] font-semibold text-neutral-500 block">Utilisations Totales</span>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
            {promoCodes.reduce((acc, c) => acc + c.uses_count, 0)} fois
          </span>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-neutral-500 block">Clients Contactables</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {customers.length} clients
          </span>
        </div>
      </div>

      {/* Section 1: Active Coupons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
            <Gift className="h-4 w-4 text-blue-600" />
            <span>Vos Codes Promotionnels</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {promoCodes.map((promo) => (
            <div
              key={promo.id}
              className={`rounded-2xl border p-4 transition-all bg-white dark:bg-neutral-900 ${
                promo.is_active
                  ? 'border-neutral-200 dark:border-neutral-800 shadow-xs'
                  : 'border-neutral-100 dark:border-neutral-800/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                    {promo.code}
                  </span>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    title="Copier le code"
                  >
                    {copiedCode === promo.code ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => toggleStatus(promo.id)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    promo.is_active
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                  }`}
                >
                  {promo.is_active ? 'Actif' : 'Désactivé'}
                </button>
              </div>

              <div className="space-y-1 text-neutral-600 dark:text-neutral-300">
                <p className="font-semibold text-xs">
                  Réduction :{' '}
                  <span className="text-blue-600 font-bold">
                    {promo.type === 'PERCENTAGE' ? `-${promo.value}%` : `-${formatFCFA(promo.value)}`}
                  </span>
                </p>
                <p className="text-[11px] text-neutral-500">
                  Minimum d’achat : {formatFCFA(promo.min_order_amount)} · Utilisé {promo.uses_count} fois
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="text-neutral-400 hover:text-rose-600 p-1 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: WhatsApp Broadcast Templates */}
      <div className="space-y-3">
        <h2 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-600" />
          <span>Messages Prêts à Diffuser sur WhatsApp</span>
        </h2>
        <p className="text-neutral-500 text-[11px]">
          Copiez ou envoyez directement ces textes commerciaux à vos contacts ou dans vos groupes clients.
        </p>

        <div className="space-y-3">
          {templatesWhatsApp.map((tmpl, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">{tmpl.title}</h3>
                  <p className="text-[11px] text-neutral-500">{tmpl.desc}</p>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-50 p-3 font-mono text-[11px] text-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-300 whitespace-pre-line border border-neutral-100 dark:border-neutral-800">
                {tmpl.message}
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => handleCopy(tmpl.message)}
                  className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copier le texte</span>
                </button>

                <a
                  href={generateWhatsAppUrl('', tmpl.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-700"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Ouvrir dans WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateCode}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Créer un code promotionnel
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-neutral-400">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Code Promo (Ex: PROMO20)</label>
                <input
                  type="text"
                  required
                  placeholder="EXEMPLE20"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 font-mono uppercase dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED">Montant fixe (FCFA)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Valeur {newType === 'PERCENTAGE' ? '(%)' : '(FCFA)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newValue}
                    onChange={(e) => setNewValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Montant minimum d'achat (FCFA)</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={newMinAmount}
                  onChange={(e) => setNewMinAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700"
            >
              Enregistrer le code
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
