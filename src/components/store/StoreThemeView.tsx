import React, { useState } from 'react';
import {
  Eye,
  Check,
  Sparkles,
  Share2,
  Copy,
  ExternalLink,
  MessageSquare,
  Smartphone,
  Palette,
  Settings,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  X,
  CreditCard,
  ChevronRight,
  Store,
  Sliders,
  Plus,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA, formatPhoneNumber, generateWhatsAppUrl } from '../../utils/formatters';
import { AiBoutiqueWizard, SAMPLE_PRODUCT_PHOTOS } from './AiBoutiqueWizard';
import { BoutiqueVisualEditor } from './BoutiqueVisualEditor';
import { StoreThemePreviewModal } from './StoreThemePreviewModal';

export type StoreThemeId = 'tech_dark' | 'cosmetic_soft' | 'fashion_prestige';

interface ThemeOption {
  id: StoreThemeId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  previewBg: string;
  accentColor: string;
  accentBg: string;
  mockup: {
    announcement: string;
    heroTitle: string;
    heroSubtitle: string;
    productPlaceholderType: 'tech' | 'cosmetic' | 'fashion';
    trustBadges: string[];
  };
}

export const STORE_THEMES: ThemeOption[] = [
  {
    id: 'tech_dark',
    name: 'Épuré & High-Tech',
    tagline: 'Qualité à votre portée',
    description: 'Design épuré au ton sombre, simple et élégant pour maximiser les conversions et valoriser les gadgets & high-tech.',
    badge: 'Populaire',
    previewBg: 'bg-neutral-950 text-white',
    accentColor: 'text-blue-500',
    accentBg: 'bg-blue-600',
    mockup: {
      announcement: 'Garantie 1 an · Livraison express 24h Dakar',
      heroTitle: 'La technologie qui simplifie votre quotidien',
      heroSubtitle: 'Accessoires, écouteurs, montres & gadgets certifiés',
      productPlaceholderType: 'tech',
      trustBadges: ['Service 7j/7', 'Paiement Wave/OM', 'Retours faciles', 'Garantie 100%'],
    },
  },
  {
    id: 'cosmetic_soft',
    name: 'Élégance & Cosmétique',
    tagline: 'Votre rituel beauté au naturel',
    description: 'Palette douce et chaleureuse pour sublimes soins corporels, savons artisanaux, parfums et cosmétiques.',
    badge: 'Recommandé',
    previewBg: 'bg-amber-50/60 text-neutral-900 border-amber-200/60',
    accentColor: 'text-amber-700',
    accentBg: 'bg-amber-700',
    mockup: {
      announcement: 'Paiement à la livraison · Suivi de commande WhatsApp',
      heroTitle: 'Révélez l’éclat de votre peau avec des soins purs',
      heroSubtitle: 'Ingrédients d’Afrique de l’Ouest et formules d’exception',
      productPlaceholderType: 'cosmetic',
      trustBadges: ['100% Naturel', 'Livraison soignée', 'Conseils beauté WhatsApp', 'Paiement à réception'],
    },
  },
  {
    id: 'fashion_prestige',
    name: 'Mode & Bazin Prestige',
    tagline: 'L’élégance africaine contemporaine',
    description: 'Ambiance raffinée et visuels immersifs pour créateurs de mode, boubous bazin, wax, sacs et chaussures.',
    badge: 'Nouveau',
    previewBg: 'bg-neutral-900 text-white',
    accentColor: 'text-emerald-500',
    accentBg: 'bg-emerald-600',
    mockup: {
      announcement: 'Atelier Dakar · Sur-mesure & Prêt-à-porter',
      heroTitle: 'Collections couture et étoffes d’exception',
      heroSubtitle: 'Créations sénégalaises authentiques taillées pour sublimer',
      productPlaceholderType: 'fashion',
      trustBadges: ['Confection artisanale', 'Finitions soignées', 'Livraison partout au Sénégal', 'Échange garanti'],
    },
  },
];

export const StoreThemeView: React.FC = () => {
  const { store, updateStore, products } = useCommerce();

  // Selected Theme State (persisted in localStorage or store.meta)
  const [selectedThemeId, setSelectedThemeId] = useState<StoreThemeId>(() => {
    return (localStorage.getItem('jaay_selected_theme') as StoreThemeId) || 'tech_dark';
  });

  // Active sub-tab: 'editor' (Visual customizer) vs 'themes' (Theme catalog) vs 'customizer' (Links & Mobile money)
  const [activeTabSub, setActiveTabSub] = useState<'editor' | 'themes' | 'customizer'>('editor');
  const [showAiWizard, setShowAiWizard] = useState(false);
  const [generatedBoutiqueData, setGeneratedBoutiqueData] = useState<any>(null);

  const [previewThemeId, setPreviewThemeId] = useState<StoreThemeId | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for customizer
  const [storeName, setStoreName] = useState(store.name || 'Momo Boutique');
  const [whatsappNum, setWhatsappNum] = useState(store.whatsapp || '+221778451290');
  const [waveNum, setWaveNum] = useState(store.wave_number || '+221778451290');
  const [omNum, setOmNum] = useState(store.om_number || '+221782345678');
  const [deliveryDakar, setDeliveryDakar] = useState('1500');
  const [deliveryRegions, setDeliveryRegions] = useState('3000');

  const publicStoreUrl = `https://jaay.sn/${store.slug || 'momo'}`;

  const handleSelectTheme = (themeId: StoreThemeId) => {
    setSelectedThemeId(themeId);
    localStorage.setItem('jaay_selected_theme', themeId);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicStoreUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      name: storeName,
      whatsapp: whatsappNum,
      wave_number: waveNum,
      om_number: omNum,
    });
    alert('Réglages de votre boutique enregistrés avec succès !');
  };

  const handleFinishAiWizard = (data: any) => {
    setGeneratedBoutiqueData(data);
    setShowAiWizard(false);
    setActiveTabSub('editor');
  };

  const activeTheme = STORE_THEMES.find((t) => t.id === selectedThemeId) || STORE_THEMES[0];
  const publishedProducts = products.filter((p) => p.is_published && !p.is_archived);

  return (
    <div className="p-3.5 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
        <div>
          {/* Main Title matching screenshot with italic serif accent */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Ma <span className="font-serif italic font-normal text-blue-600 dark:text-blue-400">boutique</span> en ligne
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Générez votre vitrine avec l'IA et personnalisez vos visuels, textes et prix.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Generator CTA */}
          <button
            onClick={() => setShowAiWizard(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm min-h-[40px]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Créer avec l’IA</span>
          </button>

          {/* View live store responsive modal button */}
          <button
            onClick={() => setPreviewThemeId(selectedThemeId)}
            className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400 min-h-[40px] transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Aperçu responsive</span>
            <span className="sm:hidden">Aperçu</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: 'Personnaliser' vs 'Thèmes de boutique' vs 'Lien public & Paiements' */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTabSub('editor')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTabSub === 'editor'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Personnaliser ma boutique (Éditeur)</span>
        </button>

        <button
          onClick={() => setActiveTabSub('themes')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTabSub === 'themes'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Thèmes graphiques ({STORE_THEMES.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('customizer')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTabSub === 'customizer'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Lien public & Paiements</span>
        </button>
      </div>

      {/* SUBTAB 1: VISUAL BOUTIQUE EDITOR (IMG_4758 & IMG_4759) */}
      {activeTabSub === 'editor' && (
        <div className="space-y-4">
          <BoutiqueVisualEditor
            initialData={generatedBoutiqueData}
            onOpenWizard={() => setShowAiWizard(true)}
          />
        </div>
      )}

      {/* SUBTAB 2: THEME CATALOG (Previous Screenshot) */}
      {activeTabSub === 'themes' && (
        <div className="space-y-6">
          <div className="space-y-6">
            {STORE_THEMES.map((theme) => {
              const isSelected = selectedThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  className={`rounded-3xl border-2 transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? 'border-blue-600 ring-4 ring-blue-500/10 shadow-lg dark:border-blue-500'
                      : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                  }`}
                >
                  {/* Theme Preview Frame (Visual Mockup of the mobile storefront) */}
                  <div className={`p-4 sm:p-6 ${theme.previewBg} relative select-none`}>
                    {/* Floating 'Aperçu' button like in screenshot */}
                    <div className="absolute bottom-5 right-5 z-10">
                      <button
                        onClick={() => setPreviewThemeId(theme.id)}
                        className="flex items-center gap-1.5 rounded-full bg-black/85 hover:bg-black text-white px-3.5 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md transition-all active:scale-95"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Aperçu</span>
                      </button>
                    </div>

                    {/* Miniature Browser / Smartphone Frame Mockup */}
                    <div className="max-w-md mx-auto rounded-2xl border border-white/10 bg-neutral-900/60 p-3 shadow-inner space-y-3">
                      {/* Announcement Bar */}
                      <div className="text-center py-1 text-[10px] font-medium opacity-80 border-b border-white/10 truncate">
                        {theme.mockup.announcement}
                      </div>

                      {/* Header bar */}
                      <div className="flex items-center justify-between px-1">
                        <span className="font-bold text-xs tracking-tight text-white flex items-center gap-1.5">
                          <ShoppingBag className="h-3.5 w-3.5 text-blue-400" />
                          {store.name || 'Momo Store'}
                        </span>
                        <div className="flex items-center gap-2 text-white/70">
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">Rechercher</span>
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Mockup Center Graphic / Hero */}
                      <div className="rounded-xl bg-neutral-800/80 p-6 flex flex-col items-center justify-center text-center space-y-3">
                        {theme.mockup.productPlaceholderType === 'tech' && (
                          <div className="h-24 w-24 rounded-3xl bg-blue-950/60 border border-blue-500/40 flex flex-col items-center justify-center shadow-lg">
                            <div className="h-10 w-12 rounded-xl border-2 border-blue-400 flex items-center justify-center gap-1.5 mb-1">
                              <div className="h-3 w-3 rounded-full bg-blue-400" />
                              <div className="h-3 w-3 rounded-full bg-blue-400" />
                            </div>
                            <div className="h-1 w-2 rounded-full bg-blue-400" />
                          </div>
                        )}

                        {theme.mockup.productPlaceholderType === 'cosmetic' && (
                          <div className="h-24 w-24 rounded-3xl bg-amber-100 border border-amber-300/60 flex items-center justify-center shadow-md">
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-4 bg-neutral-800 rounded-t-xs" />
                              <div className="h-12 w-10 bg-amber-700/80 rounded-xl" />
                            </div>
                          </div>
                        )}

                        {theme.mockup.productPlaceholderType === 'fashion' && (
                          <div className="h-24 w-24 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center shadow-lg">
                            <span className="text-3xl">👘</span>
                          </div>
                        )}

                        <div className="space-y-1">
                          <p className="font-extrabold text-sm text-white">{theme.mockup.heroTitle}</p>
                          <p className="text-[11px] text-neutral-400">{theme.mockup.heroSubtitle}</p>
                        </div>
                      </div>

                      {/* Trust badges footer */}
                      <div className="flex items-center justify-around py-1.5 border-t border-white/10 text-[9px] text-neutral-400 overflow-x-auto gap-2">
                        {theme.mockup.trustBadges.map((badge, bIdx) => (
                          <span key={bIdx} className="whitespace-nowrap flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-blue-400" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Theme Info & Selection Button (Under the preview frame) */}
                  <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                          {theme.name}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {theme.tagline}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {theme.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          <Check className="h-4 w-4" />
                          <span>Sélectionné</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectTheme(theme.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 text-xs font-bold dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors active:scale-95 min-h-[40px]"
                        >
                          <span>Activer ce thème</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: PUBLIC LINK & PAYMENTS */}
      {activeTabSub === 'customizer' && (
        <div className="space-y-5">
          {/* Public Link Card */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                Lien Public de votre Boutique en ligne
              </span>
              <button
                onClick={() => setPreviewThemeId(selectedThemeId)}
                className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 dark:text-blue-400"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Tester la vitrine (Responsive)</span>
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-blue-200 dark:bg-neutral-900 dark:border-blue-800">
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white truncate pr-2">
                {publicStoreUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-300 min-h-[34px] transition-colors"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            <a
              href={generateWhatsAppUrl(
                '',
                `Découvrez ma boutique en ligne sur Jaay :\n${publicStoreUrl}\nCommandez directement avec livraison rapide à Dakar !`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs active:scale-95 transition-all min-h-[44px]"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Partager ma boutique sur WhatsApp</span>
            </a>
          </div>

          {/* Form Settings */}
          <form
            onSubmit={handleSaveSettings}
            className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 space-y-4 text-xs"
          >
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
              Coordonnées de Contact & Réception des Commandes
            </h3>

            <div>
              <label className="font-semibold block mb-1">Nom de votre boutique commerciale</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 p-2.5 font-medium dark:border-neutral-700 dark:bg-neutral-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Numéro WhatsApp (reçoit les commandes)</label>
                <input
                  type="tel"
                  required
                  value={whatsappNum}
                  onChange={(e) => setWhatsappNum(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Tarif Livraison Dakar (FCFA)</label>
                <input
                  type="number"
                  value={deliveryDakar}
                  onChange={(e) => setDeliveryDakar(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
            </div>

            <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pt-3 pb-2 dark:border-neutral-800">
              Paiements Mobile Money Sénégal (Affichés aux clients)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Numéro de compte Wave</label>
                <input
                  type="tel"
                  value={waveNum}
                  onChange={(e) => setWaveNum(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Numéro Orange Money</label>
                <input
                  type="tel"
                  value={omNum}
                  onChange={(e) => setOmNum(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 active:scale-95 transition-all min-h-[44px]"
            >
              Enregistrer les Réglages
            </button>
          </form>
        </div>
      )}

      {/* AI BOUTIQUE GENERATOR MODAL WIZARD */}
      {showAiWizard && (
        <AiBoutiqueWizard
          onFinish={handleFinishAiWizard}
          onCancel={() => setShowAiWizard(false)}
        />
      )}

      {/* RESPONSIVE THEME PREVIEW MODAL */}
      {previewThemeId && (
        <StoreThemePreviewModal
          themeId={previewThemeId}
          onClose={() => setPreviewThemeId(null)}
          onApplyTheme={(themeId) => handleSelectTheme(themeId)}
          onPublish={() => setActiveTabSub('editor')}
        />
      )}
    </div>
  );
};
