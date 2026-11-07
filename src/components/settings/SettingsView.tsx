import React, { useState } from 'react';
import {
  Settings,
  Store as StoreIcon,
  User,
  Shield,
  CreditCard,
  Truck,
  Database,
  Download,
  Upload,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatPhoneNumber } from '../../utils/formatters';

export const SettingsView: React.FC = () => {
  const {
    store,
    updateStore,
    currentUser,
    supabaseConfig,
    updateSupabaseConfig,
    resetToInitialData,
    exportDataAsJSON,
    importDataFromJSON,
  } = useCommerce();

  // Active section
  const [activeSection, setActiveSection] = useState<'profile' | 'store' | 'payments' | 'supabase' | 'backup'>('store');

  // Supabase input fields
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.anonKey);
  const [savedSupabase, setSavedSupabase] = useState(false);

  // Profile fields
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone);

  // Store fields
  const [storeName, setStoreName] = useState(store.name);
  const [storeAddress, setStoreAddress] = useState(store.address);
  const [storeCity, setStoreCity] = useState(store.city);
  const [storePhone, setStorePhone] = useState(store.phone);
  const [storeWhatsapp, setStoreWhatsapp] = useState(store.whatsapp);

  // Payments
  const [waveNumber, setWaveNumber] = useState(store.wave_number);
  const [omNumber, setOmNumber] = useState(store.om_number);
  const [freeMoneyNumber, setFreeMoneyNumber] = useState(store.free_money_number || '');

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      name: storeName,
      address: storeAddress,
      city: storeCity,
      phone: storePhone,
      whatsapp: storeWhatsapp,
    });
    alert('Informations de la boutique enregistrées.');
  };

  const handleSavePayments = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      wave_number: waveNumber,
      om_number: omNumber,
      free_money_number: freeMoneyNumber,
    });
    alert('Moyens de paiement enregistrés.');
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSavedSupabase(true);
    setTimeout(() => setSavedSupabase(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jaay_backup_${store.slug}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataFromJSON(content);
      if (success) {
        alert('Restauration des données effectuée avec succès !');
      } else {
        alert('Erreur lors de la lecture du fichier JSON de sauvegarde.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Paramètres Généraux de Jaay
        </h2>
        <p className="text-xs text-neutral-500">
          Configurez votre boutique, vos comptes Wave & Orange Money, la synchronisation Supabase et vos sauvegardes
        </p>
      </div>

      {/* Settings Layout: Left navigation + Right Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Navigation Tabs (3 cols) */}
        <div className="md:col-span-4 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-1">
          {[
            { id: 'store' as const, label: 'Informations Boutique', icon: StoreIcon },
            { id: 'payments' as const, label: 'Moyens de Paiement (Wave / OM)', icon: CreditCard },
            { id: 'supabase' as const, label: 'Connexion Supabase', icon: Database },
            { id: 'profile' as const, label: 'Profil Utilisateur', icon: User },
            { id: 'backup' as const, label: 'Sauvegarde & Données', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Panel (8 cols) */}
        <div className="md:col-span-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {/* SECTION 1: STORE INFO */}
          {activeSection === 'store' && (
            <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
                Informations Légales & Contact Boutique
              </h3>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Nom de l'établissement
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Adresse physique
                  </label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={storeCity}
                    onChange={(e) => setStoreCity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Téléphone Boutique
                  </label>
                  <input
                    type="tel"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    WhatsApp Commercial
                  </label>
                  <input
                    type="tel"
                    value={storeWhatsapp}
                    onChange={(e) => setStoreWhatsapp(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          )}

          {/* SECTION 2: PAYMENTS */}
          {activeSection === 'payments' && (
            <form onSubmit={handleSavePayments} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
                Numéros Marchands Mobile Money (Sénégal)
              </h3>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Numéro Wave Marchand (pour QR code et virements au comptoir)
                </label>
                <input
                  type="tel"
                  required
                  value={waveNumber}
                  onChange={(e) => setWaveNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Numéro Orange Money Marchand
                </label>
                <input
                  type="tel"
                  required
                  value={omNumber}
                  onChange={(e) => setOmNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Numéro Free Money (optionnel)
                </label>
                <input
                  type="tel"
                  value={freeMoneyNumber}
                  onChange={(e) => setFreeMoneyNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Enregistrer les numéros de paiement
                </button>
              </div>
            </form>
          )}

          {/* SECTION 3: SUPABASE CONNECTOR */}
          {activeSection === 'supabase' && (
            <form onSubmit={handleSaveSupabase} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Connecteur de Données Supabase Jaay
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    supabaseConfig.connected
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {supabaseConfig.connected ? 'Connecté' : 'Mode Local-First'}
                </span>
              </div>

              <p className="text-neutral-500">
                Le cockpit fonctionne en architecture <strong>local-first réactive</strong> conforme
                au schéma de tables Supabase (<code>stores</code>, <code>products</code>, <code>variants</code>, <code>sales</code>, <code>orders</code>, <code>stock_movements</code>).
                Vous pouvez renseigner ci-dessous l'URL et la clé anonyme de votre projet Supabase Jaay pour activer la synchronisation distante.
              </p>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Supabase Anon Key (Clé Publique)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                {savedSupabase && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Configuration Supabase enregistrée !
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Enregistrer les identifiants
                </button>
              </div>
            </form>
          )}

          {/* SECTION 4: USER PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
                Profil de Session Actif
              </h3>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-base">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                    {currentUser.name}
                  </h4>
                  <span className="text-emerald-600 capitalize font-medium">
                    Rôle : {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-100 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    disabled
                    value={formatPhoneNumber(currentUser.phone)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-100 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: BACKUP & DATA RESET */}
          {activeSection === 'backup' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
                Sauvegarde, Restauration & Données
              </h3>

              <p className="text-neutral-500">
                Exportez l'ensemble de votre base marchande (catalogue, ventes, commandes, clients, mouvements de stock) au format JSON pour archivage ou transfert sur un autre poste.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadBackup}
                  className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-neutral-50 p-4 font-bold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  <Download className="h-5 w-5 text-emerald-600" />
                  <span>Télécharger la Sauvegarde Complète (JSON)</span>
                </button>

                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 font-bold text-neutral-800 hover:bg-neutral-100 cursor-pointer dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span>Importer un fichier de Sauvegarde</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset to official demo dataset */}
              <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                  Réinitialiser le jeu de données officiel Jaay
                </h4>
                <p className="text-neutral-500 text-[11px] mb-3">
                  Restaure les produits, commandes WhatsApp, clients sénégalais et mouvements de stock de démonstration Keur Jaay Dakar.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Voulez-vous restaurer les données initiales du cockpit Jaay ?')) {
                      resetToInitialData();
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restaurer les données initiales</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
