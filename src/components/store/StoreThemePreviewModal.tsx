import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  X,
  ShoppingBag,
  Search,
  Menu,
  Star,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Heart,
  Plus,
  Minus,
} from 'lucide-react';
import { StoreThemeId, STORE_THEMES } from './StoreThemeView';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA, generateWhatsAppUrl } from '../../utils/formatters';

interface StoreThemePreviewModalProps {
  themeId: StoreThemeId;
  onClose: () => void;
  onApplyTheme?: (themeId: StoreThemeId) => void;
  onPublish?: () => void;
}

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

export const StoreThemePreviewModal: React.FC<StoreThemePreviewModalProps> = ({
  themeId: initialThemeId,
  onClose,
  onApplyTheme,
  onPublish,
}) => {
  const { store, products } = useCommerce();

  // Active theme being previewed (can be switched inside the modal)
  const [currentThemeId, setCurrentThemeId] = useState<StoreThemeId>(initialThemeId);
  const [viewport, setViewport] = useState<ViewportMode>('mobile');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [cartCount, setCartCount] = useState<number>(1);
  const [activeProductModal, setActiveProductModal] = useState<any | null>(null);

  const activeTheme =
    STORE_THEMES.find((t) => t.id === currentThemeId) || STORE_THEMES[0];

  const publishedProducts = products.filter((p) => p.is_published && !p.is_archived);

  // Theme styling definitions
  const isDark = currentThemeId === 'tech_dark' || currentThemeId === 'fashion_prestige';
  const isCosmetic = currentThemeId === 'cosmetic_soft';
  const isFashion = currentThemeId === 'fashion_prestige';

  const themeAccentColor = isCosmetic
    ? 'text-amber-700 dark:text-amber-500'
    : isFashion
    ? 'text-emerald-500'
    : 'text-blue-500';

  const themeAccentBg = isCosmetic
    ? 'bg-amber-700 hover:bg-amber-800 text-white'
    : isFashion
    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  const themeBadgeBg = isCosmetic
    ? 'bg-amber-100 text-amber-800'
    : isFashion
    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
    : 'bg-blue-950/60 text-blue-300 border border-blue-500/30';

  const themeHeroBg = isCosmetic
    ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50/40 text-neutral-900'
    : isFashion
    ? 'bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white'
    : 'bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white';

  const cardBg = isCosmetic
    ? 'bg-white border-amber-200/70 text-neutral-900 shadow-sm'
    : 'bg-neutral-900/90 border-neutral-800 text-white';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      {/* TOP CONTROL BAR (Merchant Toolbar) */}
      <header className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3 bg-neutral-900 border-b border-neutral-800 text-white shrink-0 z-10 gap-2">
        {/* Left: Title & Live Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-[11px] font-bold text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="hidden sm:inline">Prévisualisation avant publication</span>
            <span className="sm:hidden">Aperçu direct</span>
          </div>

          <span className="text-xs text-neutral-400 hidden md:inline">•</span>
          <span className="text-xs font-bold text-neutral-200 truncate hidden md:inline">
            Thème : {activeTheme.name}
          </span>
        </div>

        {/* Center: Responsive Viewport Switcher */}
        <div className="flex items-center rounded-xl bg-neutral-800/90 p-1 border border-neutral-700/60 shadow-inner">
          <button
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewport === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Vue smartphone (375px)"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>

          <button
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewport === 'tablet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Vue tablette (768px)"
          >
            <Tablet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tablette</span>
          </button>

          <button
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewport === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Vue écran large bureau"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Bureau</span>
          </button>
        </div>

        {/* Right: Theme Switcher & Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Quick Switcher dropdown on desktop */}
          <div className="hidden lg:flex items-center gap-1 bg-neutral-800 rounded-xl p-0.5 border border-neutral-700">
            {STORE_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setCurrentThemeId(t.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  currentThemeId === t.id
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t.name.split('&')[0]}
              </button>
            ))}
          </div>

          {onApplyTheme && (
            <button
              onClick={() => {
                onApplyTheme(currentThemeId);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors active:scale-95"
            >
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Appliquer</span>
            </button>
          )}

          {onPublish && (
            <button
              onClick={() => {
                onClose();
                onPublish();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Publier</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
            title="Fermer la prévisualisation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* VIEWPORT CANVAS CONTAINER */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-6 flex items-start justify-center">
        <div
          className={`transition-all duration-300 ease-out my-auto ${
            viewport === 'mobile'
              ? 'w-[375px] max-w-full rounded-[44px] border-[10px] border-neutral-900 shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10'
              : viewport === 'tablet'
              ? 'w-[768px] max-w-full rounded-[36px] border-[12px] border-neutral-900 shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-white/10'
              : 'w-full max-w-6xl rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden'
          }`}
        >
          {/* THEME STOREFRONT RENDER */}
          <div
            className={`min-h-[600px] flex flex-col font-sans select-none ${
              isCosmetic ? 'bg-amber-50/30 text-neutral-900' : 'bg-neutral-950 text-white'
            }`}
          >
            {/* Top Announcement Bar */}
            <div
              className={`py-2 px-3 text-center text-[11px] font-semibold tracking-wide ${
                isCosmetic
                  ? 'bg-amber-100/90 text-amber-900 border-b border-amber-200'
                  : 'bg-neutral-900/90 text-neutral-300 border-b border-neutral-800'
              }`}
            >
              <p className="truncate">{activeTheme.mockup.announcement}</p>
            </div>

            {/* Storefront Navigation Bar */}
            <nav
              className={`sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md ${
                isCosmetic
                  ? 'bg-white/90 border-amber-100 text-neutral-900'
                  : 'bg-neutral-900/90 border-neutral-800 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <button className="p-1 text-inherit opacity-80 hover:opacity-100">
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#13274F] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    j
                  </div>
                  <span className="font-extrabold text-sm sm:text-base tracking-tight">
                    {store.name || 'Boutique Jaay'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-1 text-inherit opacity-75 hover:opacity-100">
                  <Search className="h-4 w-4" />
                </button>

                <div className="relative cursor-pointer">
                  <button className="p-1 text-inherit opacity-80 hover:opacity-100">
                    <ShoppingBag className="h-5 w-5" />
                  </button>
                  <span
                    className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-bold ${
                      isCosmetic ? 'bg-amber-700 text-white' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {cartCount}
                  </span>
                </div>
              </div>
            </nav>

            {/* Hero Presentation Section */}
            <section className={`p-5 sm:p-8 ${themeHeroBg} text-center space-y-4`}>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs">
                <span className={themeBadgeBg}>{activeTheme.tagline}</span>
              </div>

              <div className="max-w-2xl mx-auto space-y-2">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  {activeTheme.mockup.heroTitle}
                </h1>
                <p className="text-xs sm:text-sm opacity-80 max-w-lg mx-auto leading-relaxed">
                  {activeTheme.mockup.heroSubtitle}
                </p>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[10px] sm:text-xs opacity-90">
                {activeTheme.mockup.trustBadges.map((badge, bIdx) => (
                  <span
                    key={bIdx}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                      isCosmetic
                        ? 'bg-white border-amber-200 text-amber-900'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-200'
                    }`}
                  >
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </section>

            {/* Product Catalog Section */}
            <section className="p-4 sm:p-6 flex-1 space-y-5">
              <div className="flex items-center justify-between border-b pb-2 border-inherit/10">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                  Nos Articles Vedettes ({publishedProducts.length})
                </h2>
                <span className={`text-xs font-bold ${themeAccentColor} cursor-pointer hover:underline`}>
                  Voir tout le catalogue →
                </span>
              </div>

              {/* Product Grid */}
              <div
                className={`grid gap-3 sm:gap-4 ${
                  viewport === 'mobile'
                    ? 'grid-cols-2'
                    : viewport === 'tablet'
                    ? 'grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}
              >
                {publishedProducts.map((p) => {
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveProductModal(p)}
                      className={`rounded-2xl border p-3 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer ${cardBg}`}
                    >
                      <div className="space-y-2">
                        {/* Image Frame */}
                        <div className="relative rounded-xl overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          {p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="h-8 w-8 text-neutral-400" />
                          )}
                          {p.promo_price && (
                            <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              PROMO
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-1 text-amber-400 text-[10px] mb-0.5">
                            <Star className="h-3 w-3 fill-amber-400" />
                            <span className="font-bold">4.9</span>
                            <span className="opacity-60">(48 avis)</span>
                          </div>
                          <h3 className="font-bold text-xs truncate leading-snug">{p.name}</h3>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="font-mono font-black text-xs sm:text-sm">
                              {formatFCFA(p.selling_price)}
                            </span>
                            {p.promo_price && (
                              <span className="font-mono text-[10px] opacity-50 line-through">
                                {formatFCFA(p.promo_price)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Buy Action Button */}
                      <a
                        href={generateWhatsAppUrl(
                          store.whatsapp || '+221778451290',
                          `Bonjour ${store.name}, je souhaite commander : ${p.name} (${formatFCFA(
                            p.selling_price
                          )})`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold shadow-xs transition-transform active:scale-95 ${themeAccentBg}`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Commander</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Guarantees & Reassurance Bar */}
            <section
              className={`border-t p-4 sm:p-6 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3 ${
                isCosmetic
                  ? 'bg-amber-100/40 border-amber-200/60 text-neutral-800'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <p className="font-bold">Livraison 24h à Dakar</p>
                  <p className="text-[10px] opacity-70">Expédition rapide à domicile ou bureau</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold">Paiement à la Livraison</p>
                  <p className="text-[10px] opacity-70">Réglez en espèces ou par Wave / OM</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <RotateCcw className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-bold">Garantie & Support</p>
                  <p className="text-[10px] opacity-70">Assistance client 7j/7 sur WhatsApp</p>
                </div>
              </div>
            </section>

            {/* Storefront Footer */}
            <footer
              className={`p-5 text-center text-xs border-t opacity-75 ${
                isCosmetic
                  ? 'bg-white border-amber-200 text-neutral-600'
                  : 'bg-neutral-950 border-neutral-900 text-neutral-500'
              }`}
            >
              <p className="font-bold">{store.name || 'Boutique Jaay'}</p>
              <p className="text-[10px] mt-0.5">
                Propulsé par Jaay · Dakar, Sénégal · WhatsApp : {store.whatsapp || '+221 77 845 12 90'}
              </p>
            </footer>
          </div>
        </div>
      </div>

      {/* QUICK PRODUCT DETAIL POPUP (Inside the preview simulation) */}
      {activeProductModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border space-y-4 text-xs ${
              isCosmetic
                ? 'bg-white border-amber-200 text-neutral-900'
                : 'bg-neutral-900 border-neutral-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-inherit/20">
              <span className="font-bold text-xs">Fiche Produit</span>
              <button
                onClick={() => setActiveProductModal(null)}
                className="p-1 hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800">
              {activeProductModal.images[0] && (
                <img
                  src={activeProductModal.images[0]}
                  alt={activeProductModal.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-sm">{activeProductModal.name}</h3>
              <p className="font-mono font-black text-base text-emerald-500">
                {formatFCFA(activeProductModal.selling_price)}
              </p>
              <p className="text-[11px] opacity-80 leading-relaxed pt-1">
                {activeProductModal.description ||
                  'Produit certifié et disponible en stock immédiat pour expédition rapide à Dakar.'}
              </p>
            </div>

            <a
              href={generateWhatsAppUrl(
                store.whatsapp || '+221778451290',
                `Bonjour ${store.name}, je souhaite commander : ${activeProductModal.name} (${formatFCFA(
                  activeProductModal.selling_price
                )})`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold ${themeAccentBg}`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Commander sur WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
