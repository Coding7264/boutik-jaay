import React, { useState } from 'react';
import {
  Palette,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Check,
  ShoppingBag,
  Search,
  Menu,
  Star,
  Sparkles,
  Share2,
  Copy,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Truck,
  RotateCcw,
  Crown,
  ChevronDown,
  Save,
  Plus,
  Smartphone,
  Monitor,
  ArrowLeft,
  X,
  Phone,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA, generateWhatsAppUrl } from '../../utils/formatters';

interface BoutiqueVisualEditorProps {
  initialData?: any;
  onOpenWizard: () => void;
}

export const BoutiqueVisualEditor: React.FC<BoutiqueVisualEditorProps> = ({
  initialData,
  onOpenWizard,
}) => {
  const { store, updateStore } = useCommerce();

  // Mode: 'editor' (Visual customizer with toolbars) vs 'preview' (Grand format, client view before publish)
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'desktop'>('mobile');

  // Page selector & publication modal
  const [pageView, setPageView] = useState<'home' | 'product' | 'checkout'>('home');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isPublishedSuccess, setIsPublishedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Cart quantity inside preview
  const [orderQuantity, setOrderQuantity] = useState(1);

  // Editable sections
  const [bannerText, setBannerText] = useState(
    initialData?.promoBanner || 'Promo limitée : 20% de remise sur votre commande !'
  );
  const [bannerBg, setBannerBg] = useState(initialData?.promoBannerBg || '#13274F');
  const [bannerVisible, setBannerVisible] = useState(true);

  const [productTitle, setProductTitle] = useState(
    initialData?.heroTitle || 'Sérum Éclaircissant Anti-Taches à la Niacinamide'
  );
  const [productPitch, setProductPitch] = useState(
    initialData?.heroPitch ||
      'Ce sérum facial à la niacinamide et à l’acide tranexamique cible les taches brunes et unifie le teint. Avec une formulation légère, il est idéal pour une peau éclatante et soyeuse.'
  );
  const [productPrice, setProductPrice] = useState<number>(initialData?.sellingPrice || 3500);
  const [comparedPrice, setComparedPrice] = useState<number>(initialData?.comparedPrice || 6000);
  const [productPhoto, setProductPhoto] = useState(
    initialData?.photoUrl ||
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
  );
  const [socialProof, setSocialProof] = useState('1000+ clients satisfaits au Sénégal');

  const [benefits, setBenefits] = useState<Array<{ title: string; desc: string }>>(
    initialData?.benefits || [
      {
        title: 'Qualité Certifiée & Résultats Visibles',
        desc: 'Formulation testée offrant des résultats concrets et durables dès les premiers jours.',
      },
      {
        title: 'Livraison Rapide 24h à Dakar & Banlieue',
        desc: 'Expédition express à domicile ou au bureau avec suivi WhatsApp en temps réel.',
      },
      {
        title: 'Paiement Sécurisé à la Réception ou Wave',
        desc: 'Réglez en espèces à la livraison ou par virement instantané sans aucun frais caché.',
      },
    ]
  );

  const publicUrl = `https://jaay.sn/${store.slug || 'momo'}`;

  const bannerColorPalette = [
    '#13274F', // deep navy jaay
    '#1e293b', // slate
    '#059669', // emerald
    '#be185d', // rose
    '#d97706', // amber
    '#2563eb', // blue
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveCustomizations = () => {
    updateStore({
      name: store.name,
      description: productPitch,
    });
    alert('Modifications de la boutique enregistrées avec succès !');
  };

  return (
    <div className="space-y-4">
      {/* Top Customizer Action Bar matching screenshot IMG_4758 */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2">
          {/* Mode Switcher: Éditeur vs Grand Aperçu Client */}
          <div className="flex items-center rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'editor'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-neutral-700 dark:text-blue-400'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Éditeur</span>
            </button>

            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'preview'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-neutral-700 dark:text-blue-400'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Aperçu Client</span>
            </button>
          </div>

          {/* Quick Price Input */}
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400">Prix :</span>
            <input
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(Number(e.target.value))}
              className="w-20 bg-transparent font-mono font-bold text-xs text-neutral-900 dark:text-white focus:outline-hidden"
            />
            <span className="text-[11px] font-bold text-neutral-400">FCFA</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Regenerate with AI button */}
          <button
            onClick={onOpenWizard}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400 min-h-[38px] transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Régénérer avec l’IA</span>
          </button>

          {/* Save button */}
          <button
            onClick={handleSaveCustomizations}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 min-h-[38px]"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Enregistrer</span>
          </button>

          {/* Publish Blue Button matching screenshot IMG_4758 */}
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-blue-700 shadow-sm active:scale-95 transition-all min-h-[38px]"
          >
            <span>Publier</span>
          </button>
        </div>
      </div>

      {/* MODE 1: VISUAL CUSTOMIZER EDITOR (with floating toolbars) */}
      {viewMode === 'editor' && (
        <div className="space-y-4">
          <div className="max-w-md mx-auto rounded-3xl border-2 border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden relative">
            {/* SECTION 1: BANNER WITH FLOATING TOOLBAR (IMG_4758) */}
            {bannerVisible && (
              <div className="relative group">
                <div className="sticky top-0 z-30 flex items-center justify-between bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 px-3 py-1.5 text-[10px] font-bold shadow-xs backdrop-blur-xs">
                  <span className="text-neutral-700 dark:text-neutral-200 flex items-center gap-1">
                    <span>Bannière d'accueil</span>
                  </span>

                  <div className="flex items-center gap-1 text-neutral-500">
                    <div className="flex items-center gap-1 px-1">
                      {bannerColorPalette.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setBannerBg(c)}
                          className="h-3.5 w-3.5 rounded-full border border-white shadow-xs hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }}
                          title="Changer de couleur"
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setBannerVisible(false)}
                      className="p-1 hover:text-neutral-800 dark:hover:text-white"
                      title="Masquer la bannière"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  className="py-2.5 px-3 text-center text-xs font-semibold text-white transition-colors cursor-pointer"
                  style={{ backgroundColor: bannerBg }}
                  onClick={() => {
                    const newText = prompt('Modifier le texte de la bannière :', bannerText);
                    if (newText) setBannerText(newText);
                  }}
                  title="Cliquez pour modifier le texte"
                >
                  <p className="truncate">{bannerText}</p>
                </div>
              </div>
            )}

            {/* SECTION 2: STORE HEADER (IMG_4758) */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <button className="text-neutral-700 dark:text-neutral-300">
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  <img
                    src={productPhoto}
                    alt="Logo"
                    className="h-6 w-6 rounded-md object-cover shadow-xs"
                  />
                  <span className="font-extrabold text-xs tracking-tight text-neutral-900 dark:text-white">
                    {store.name || 'Boutique Jaay'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-600 dark:text-neutral-400">
                <Search className="h-4 w-4" />
                <div className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white">
                    1
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: HERO PRODUCT DISPLAY (IMG_4758 & IMG_4759) */}
            <div className="p-4 space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 shadow-inner group">
                <img
                  src={productPhoto}
                  alt={productTitle}
                  className="h-72 w-full object-contain p-4 transition-transform group-hover:scale-105 duration-300"
                />
                {comparedPrice > productPrice && (
                  <span className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                    -{Math.round(((comparedPrice - productPrice) / comparedPrice) * 100)}% RÉDUCTION
                  </span>
                )}
              </div>

              {/* Ratings & Social Proof */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-500 text-xs">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span
                    onClick={() => {
                      const proof = prompt('Modifier les avis clients :', socialProof);
                      if (proof) setSocialProof(proof);
                    }}
                    className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer hover:underline"
                  >
                    {socialProof}
                  </span>
                </div>

                {/* Title (editable) */}
                <h1
                  onClick={() => {
                    const t = prompt('Modifier le titre du produit :', productTitle);
                    if (t) setProductTitle(t);
                  }}
                  className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg p-1 -ml-1"
                  title="Cliquez pour modifier"
                >
                  {productTitle}
                </h1>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-mono text-2xl font-black text-neutral-900 dark:text-white">
                    {formatFCFA(productPrice)}
                  </span>
                  {comparedPrice > productPrice && (
                    <span className="font-mono text-xs text-neutral-400 line-through">
                      {formatFCFA(comparedPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Sales pitch description */}
              <p
                onClick={() => {
                  const p = prompt('Modifier la description de vente :', productPitch);
                  if (p) setProductPitch(p);
                }}
                className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg p-1.5 -ml-1.5 border border-dashed border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
                title="Cliquez pour modifier la description"
              >
                {productPitch}
              </p>

              {/* SECTION 4: BENEFITS & HIGHLIGHTS */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                  Points forts & Garantie
                </h3>
                <div className="space-y-2">
                  {benefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800"
                    >
                      <p className="font-bold text-xs text-neutral-900 dark:text-white">{b.title}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: DIRECT WHATSAPP ORDER FORM */}
              <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                    Commande Express par WhatsApp
                  </span>
                  <span className="rounded-full bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5">
                    Livraison Dakar 24h
                  </span>
                </div>

                <a
                  href={generateWhatsAppUrl(
                    store.whatsapp || '+221778451290',
                    `Bonjour ${store.name}, je souhaite commander : ${productTitle} (${formatFCFA(
                      productPrice
                    )})\nLivraison rapide à Dakar svp.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm active:scale-95 transition-all w-full min-h-[44px]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Commander maintenant sur WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: GRAND APERÇU CLIENT IMMERSIF (AVANT PUBLICATION) */}
      {viewMode === 'preview' && (
        <div className="space-y-4">
          {/* Top Device & Control Bar for Merchant */}
          <div className="flex items-center justify-between rounded-2xl bg-neutral-900 text-white p-3 shadow-md">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">Aperçu en direct (Vue Client)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-neutral-800 p-1">
                <button
                  onClick={() => setDeviceFrame('mobile')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    deviceFrame === 'mobile' ? 'bg-blue-600 text-white' : 'text-neutral-400'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  onClick={() => setDeviceFrame('desktop')}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    deviceFrame === 'desktop' ? 'bg-blue-600 text-white' : 'text-neutral-400'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Plein écran</span>
                </button>
              </div>

              <button
                onClick={() => setShowPublishModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
              >
                <RocketIcon className="h-3.5 w-3.5" />
                <span>Publier cette boutique</span>
              </button>
            </div>
          </div>

          {/* Device Frame View */}
          <div
            className={`mx-auto bg-white dark:bg-neutral-950 transition-all ${
              deviceFrame === 'mobile'
                ? 'max-w-sm rounded-[40px] border-[10px] border-neutral-900 shadow-2xl overflow-hidden'
                : 'max-w-4xl rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-lg'
            }`}
          >
            {/* Announcement Banner */}
            {bannerVisible && (
              <div
                className="py-2 px-3 text-center text-xs font-semibold text-white truncate"
                style={{ backgroundColor: bannerBg }}
              >
                {bannerText}
              </div>
            )}

            {/* Store Navigation Bar */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
              <div className="flex items-center gap-3">
                <Menu className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-md bg-[#13274F] flex items-center justify-center text-white font-black text-xs">
                    j
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-neutral-900 dark:text-white">
                    {store.name || 'Momo Store Dakar'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                <Search className="h-4 w-4" />
                <div className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {orderQuantity}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Body */}
            <div
              className={`p-4 sm:p-6 ${
                deviceFrame === 'desktop' ? 'grid grid-cols-2 gap-8 items-start' : 'space-y-5'
              }`}
            >
              {/* Image Gallery */}
              <div className="space-y-3">
                <div className="relative rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 shadow-sm aspect-square flex items-center justify-center">
                  <img
                    src={productPhoto}
                    alt={productTitle}
                    className="h-full w-full object-contain p-6"
                  />
                  {comparedPrice > productPrice && (
                    <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                      -{Math.round(((comparedPrice - productPrice) / comparedPrice) * 100)}% REMISE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[productPhoto, productPhoto, productPhoto].map((img, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 h-16 dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <img src={img} alt="" className="h-full w-full object-contain p-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info & Buy Box */}
              <div className="space-y-4">
                {/* Star rating */}
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                    {socialProof}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                  {productTitle}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-black text-neutral-900 dark:text-white">
                    {formatFCFA(productPrice)}
                  </span>
                  {comparedPrice > productPrice && (
                    <span className="font-mono text-sm text-neutral-400 line-through">
                      {formatFCFA(comparedPrice)}
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 dark:bg-emerald-950/60 dark:text-emerald-300">
                    En Stock
                  </span>
                </div>

                {/* Pitch description */}
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {productPitch}
                </p>

                {/* Quantity selector */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Quantité :
                  </span>
                  <div className="flex items-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                    <button
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                      className="px-3 py-1.5 font-bold text-neutral-600 hover:text-black dark:text-neutral-300"
                    >
                      -
                    </button>
                    <span className="px-3 font-mono font-bold text-xs text-neutral-900 dark:text-white">
                      {orderQuantity}
                    </span>
                    <button
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                      className="px-3 py-1.5 font-bold text-neutral-600 hover:text-black dark:text-neutral-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* WhatsApp Direct Buy Button */}
                <div className="space-y-2 pt-2">
                  <a
                    href={generateWhatsAppUrl(
                      store.whatsapp || '+221778451290',
                      `Bonjour ${store.name}, je souhaite commander ${orderQuantity}x : ${productTitle} (${formatFCFA(
                        productPrice * orderQuantity
                      )})\nMon adresse de livraison : `
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-black text-white hover:bg-emerald-700 shadow-md active:scale-95 transition-all w-full min-h-[48px]"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Commander sur WhatsApp ({formatFCFA(productPrice * orderQuantity)})</span>
                  </a>

                  <p className="text-[11px] text-center text-neutral-500">
                    Paiement sécurisé à la livraison ou Wave · Réponse immédiate
                  </p>
                </div>

                {/* Guarantees Box */}
                <div className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                    <Truck className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Livraison express en moins de 24h à Dakar et banlieue</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Garantie 100% authentique et certifié</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
                    <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Échange ou retour sous 7 jours</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-xs uppercase text-neutral-400 tracking-wider">
                    Pourquoi choisir ce produit :
                  </h4>
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-neutral-900 dark:text-white">{b.title} : </strong>
                        <span>{b.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH MODAL MATCHING SCREENSHOT IMG_4760 */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 text-xs">
            {/* Header with Close */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-neutral-400 block">Passer à</span>
                <h3 className="font-black text-xl text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span>Jaay</span>
                  <span className="text-blue-600 font-extrabold italic">Pro+</span>
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-amber-500 font-bold text-xs flex items-center gap-0.5">
                  👑 4.9/5
                </span>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <p className="text-neutral-600 dark:text-neutral-300">
              Publie ta boutique aujourd'hui et commence à vendre.
            </p>

            {/* Toggle Monthly / Annual (IMG_4760) */}
            <div className="grid grid-cols-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800 text-center font-bold">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-lg py-2 transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white shadow-xs text-neutral-900 dark:bg-neutral-700 dark:text-white'
                    : 'text-neutral-500'
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-lg py-2 transition-all flex items-center justify-center gap-1 ${
                  billingCycle === 'annual'
                    ? 'bg-white shadow-xs text-neutral-900 dark:bg-neutral-700 dark:text-white'
                    : 'text-neutral-500'
                }`}
              >
                <span>Annuel</span>
                <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  -50%
                </span>
              </button>
            </div>

            {/* Price (IMG_4760) */}
            <div className="text-center py-1">
              <span className="text-3xl font-black text-neutral-900 dark:text-white font-mono">
                {billingCycle === 'monthly' ? '13 000 FCFA' : '78 000 FCFA'}
              </span>
              <span className="text-neutral-400 text-xs">
                {billingCycle === 'monthly' ? ' / mois' : ' / an'}
              </span>
            </div>

            {/* Features Checklist (IMG_4760) */}
            <div className="space-y-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
              {[
                'Mettre en ligne la boutique',
                'Boutique personnalisable à tout moment',
                'Formulaire de commande inclus',
                '10 crédits IA par mois',
                'Accès à l’application mobile',
              ].map((feat, fIdx) => (
                <div key={fIdx} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <Check className="h-4 w-4 text-neutral-900 dark:text-white shrink-0 stroke-[2.5]" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action button (IMG_4760) */}
            <button
              onClick={() => {
                setIsPublishedSuccess(true);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 font-black text-white hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 shadow-md active:scale-95 transition-all min-h-[44px]"
            >
              <span>Publier ma boutique →</span>
            </button>

            {isPublishedSuccess && (
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Boutique en ligne publiée avec succès !
                </p>
                <div className="flex items-center justify-between rounded-lg bg-white p-2 border border-emerald-200 dark:bg-neutral-800">
                  <span className="font-mono text-[11px] truncate">{publicUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="font-bold text-xs text-blue-600 hover:underline shrink-0"
                  >
                    {copiedLink ? 'Copié' : 'Copier'}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
                  >
                    Ouvrir ma boutique
                  </a>
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}
