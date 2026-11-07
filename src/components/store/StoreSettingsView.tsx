import React, { useState } from 'react';
import {
  Store,
  Share2,
  Copy,
  Check,
  Eye,
  MessageSquare,
  CreditCard,
  RotateCcw,
  X,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA, formatPhoneNumber, generateWhatsAppUrl } from '../../utils/formatters';

export const StoreSettingsView: React.FC = () => {
  const { store, updateStore, resetToInitialData, products } = useCommerce();

  const [name, setName] = useState(store.name);
  const [whatsapp, setWhatsapp] = useState(store.whatsapp);
  const [address, setAddress] = useState(store.address);
  const [waveNumber, setWaveNumber] = useState(store.wave_number);
  const [omNumber, setOmNumber] = useState(store.om_number);

  const [copiedLink, setCopiedLink] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const publicUrl = `https://jaay.sn/${store.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      name,
      whatsapp,
      address,
      wave_number: waveNumber,
      om_number: omNumber,
    });
    alert('Paramètres de la boutique enregistrés avec succès !');
  };

  const publishedProducts = products.filter((p) => p.is_published && !p.is_archived);

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Ma Boutique & Réglages
        </h2>
        <p className="text-xs text-neutral-500">
          Votre vitrine en ligne, vos comptes Wave/OM et vos coordonnées
        </p>
      </div>

      {/* Public Store Link Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
            Lien Public Client
          </span>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 dark:text-emerald-400"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Voir ma boutique</span>
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-emerald-200 dark:bg-neutral-900 dark:border-emerald-800">
          <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white truncate pr-2">
            {publicUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-300 min-h-[32px]"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedLink ? 'Copié' : 'Copier'}</span>
          </button>
        </div>

        <a
          href={generateWhatsAppUrl(
            '',
            `Découvrez notre boutique ${store.name} sur Jaay !\nCommandez directement en ligne : ${publicUrl}`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm active:scale-95 transition-all min-h-[44px]"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Partager ma boutique sur WhatsApp</span>
        </a>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
          Coordonnées Commerciales
        </h3>

        <div>
          <label className="font-semibold block mb-1">Nom de la boutique</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold block mb-1">Numéro WhatsApp Marchand</label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Adresse ou Quartier</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
        </div>

        <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pt-2 pb-2 dark:border-neutral-800">
          Numéros de Paiement (Mobile Money Sénégal)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold block mb-1">Numéro Wave</label>
            <input
              type="tel"
              value={waveNumber}
              onChange={(e) => setWaveNumber(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Numéro Orange Money</label>
            <input
              type="tel"
              value={omNumber}
              onChange={(e) => setOmNumber(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all min-h-[44px]"
        >
          Enregistrer les Coordonnées
        </button>
      </form>

      {/* Reset demo data */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 flex items-center justify-between text-xs">
        <div>
          <strong className="text-neutral-900 dark:text-white block">Données Démo Jaay</strong>
          <span className="text-neutral-500">Restaurer les articles et commandes de test</span>
        </div>
        <button
          onClick={() => {
            if (confirm('Restaurer les données officielles Jaay ?')) resetToInitialData();
          }}
          className="flex items-center gap-1 text-rose-600 hover:bg-rose-50 rounded-lg p-2 font-semibold dark:hover:bg-rose-950/40"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Réinitialiser</span>
        </button>
      </div>

      {/* LIVE PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3">
          <div className="w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-neutral-900 space-y-4 p-4">
            <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                Aperçu Public Client
              </span>
              <button onClick={() => setShowPreviewModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-neutral-900 p-4 text-white text-center space-y-1">
                <h2 className="text-lg font-black">{store.name}</h2>
                <p className="text-[11px] text-neutral-300">{store.description}</p>
                <p className="text-[10px] text-emerald-400">
                  {store.address} · WhatsApp: {formatPhoneNumber(store.whatsapp)}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                  Nos Articles ({publishedProducts.length})
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {publishedProducts.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-neutral-100 p-2 dark:border-neutral-800 flex flex-col justify-between"
                    >
                      <div className="h-20 rounded-lg bg-neutral-100 overflow-hidden dark:bg-neutral-800 mb-1.5">
                        {p.images[0] && (
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p className="font-bold text-[11px] truncate">{p.name}</p>
                      <span className="font-mono font-bold text-emerald-600 text-xs">
                        {formatFCFA(p.selling_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
