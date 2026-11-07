import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  Package,
  Heart,
  Palette,
  X,
  Zap,
  Tag,
  Star,
  ChevronDown,
  ShoppingBag,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA } from '../../utils/formatters';

interface AiBoutiqueWizardProps {
  onFinish: (generatedData: any) => void;
  onCancel: () => void;
  initialProduct?: {
    name?: string;
    selling_price?: number;
    purchase_price?: number;
    image?: string;
    category?: string;
    description?: string;
  };
}

// Preset starter sample photos for quick testing
export const SAMPLE_PRODUCT_PHOTOS = [
  {
    name: 'Sérum Éclaircissant Anti-Taches Niacinamide',
    category: 'Beauté & Soins',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    price: 3500,
    comparePrice: 6000,
    purchasePrice: 1500,
    themeColor: '#be185d',
    pitch: 'Ce sérum facial à la niacinamide et à l’acide tranexamique cible les taches brunes et unifie le teint en profondeur. Texture soyeuse, absorption rapide sans effet gras.',
    bannerText: 'Promo de lancement : 20% de remise immédiate !',
  },
  {
    name: 'Smartwatch T800 Ultra Série 9',
    category: 'High-Tech',
    url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
    price: 15000,
    comparePrice: 25000,
    purchasePrice: 7000,
    themeColor: '#2563eb',
    pitch: 'Montre connectée étanche avec écran HD infini, appels Bluetooth haute clarté, capteurs santé complets et autonomie record de 5 jours.',
    bannerText: 'Stock limité Dakar : Livraison express en 24h chrono !',
  },
  {
    name: 'Boubou Bazin Riche Brodé Dakar Prestige',
    category: 'Mode & Bazin',
    url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&auto=format&fit=crop&q=80',
    price: 35000,
    comparePrice: 48000,
    purchasePrice: 18000,
    themeColor: '#059669',
    pitch: 'Bazin riche teinté d’exception avec broderie fine fils d’or, coupe moderne idéale pour cérémonies, mariages et vendredis chics.',
    bannerText: 'Nouvelle collection Dakar Couture disponible !',
  },
  {
    name: 'Écouteurs Sans Fil Pro TWS ANC',
    category: 'High-Tech',
    url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    price: 12000,
    comparePrice: 20000,
    purchasePrice: 5000,
    themeColor: '#1e293b',
    pitch: 'Immersion sonore totale avec réduction active du bruit ambiant, basses puissantes, micro clair pour appels et boîtier compact.',
    bannerText: 'Offre spéciale du mois : Satisfait ou remboursé sous 7 jours !',
  },
];

export const AiBoutiqueWizard: React.FC<AiBoutiqueWizardProps> = ({
  onFinish,
  onCancel,
  initialProduct,
}) => {
  const { addProduct } = useCommerce();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step state: 'form' -> 'analyzing'
  const [step, setStep] = useState<'form' | 'analyzing'>('form');

  // Form Fields
  const [productName, setProductName] = useState(
    initialProduct?.name || 'Sérum Éclaircissant Anti-Taches à la Niacinamide'
  );
  const [description, setDescription] = useState(
    initialProduct?.description ||
      'Ce sérum facial à la niacinamide et à l’acide tranexamique cible les taches brunes et unifie le teint. Avec une formulation légère, il est idéal pour une peau éclatante.'
  );
  const [photoUrl, setPhotoUrl] = useState(
    initialProduct?.image || SAMPLE_PRODUCT_PHOTOS[0].url
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [sellingPrice, setSellingPrice] = useState<number>(initialProduct?.selling_price || 3500);
  const [comparedPrice, setComparedPrice] = useState<number>(6000);
  const [purchasePrice, setPurchasePrice] = useState<number>(initialProduct?.purchase_price || 1500);
  const [category, setCategory] = useState(initialProduct?.category || 'Beauté & Soins');
  const [sku, setSku] = useState('JAAY-BEA-001');
  const [stockQuantity, setStockQuantity] = useState<number>(25);
  const [isFavorite, setIsFavorite] = useState(true);

  // Analysis Progress (IMG_4757)
  const [progress, setProgress] = useState(15);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const analysisSteps = [
    { title: 'Import de ta photo', subtitle: 'Photo HD analysée avec succès' },
    { title: 'Lecture et reconnaissance de l’image', subtitle: 'Classification du produit et détection des couleurs' },
    { title: 'Collecte des arguments de vente', subtitle: 'Recherche des leviers psychologiques à fort taux de conversion' },
    { title: 'Génération de la charte & visuels premium', subtitle: 'Mise en page, bannières et micro-typographies' },
    { title: 'Rédaction du texte de vente persuasif', subtitle: 'Optimisation pour les commandes directes WhatsApp & Wave' },
  ];

  // Handle local image file upload from phone or computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPhotoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start AI analysis simulation when entering 'analyzing'
  useEffect(() => {
    if (step !== 'analyzing') return;

    setProgress(20);
    setCurrentStepIdx(0);

    const timer1 = setTimeout(() => {
      setProgress(42);
      setCurrentStepIdx(1);
    }, 850);

    const timer2 = setTimeout(() => {
      setProgress(68);
      setCurrentStepIdx(2);
    }, 1750);

    const timer3 = setTimeout(() => {
      setProgress(88);
      setCurrentStepIdx(3);
    }, 2650);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setCurrentStepIdx(4);
    }, 3500);

    const timer5 = setTimeout(() => {
      // Create product in catalog
      const newProd = addProduct({
        store_id: 'store-1',
        name: productName,
        sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        category_id: 'cat-1',
        purchase_price: Number(purchasePrice) || 0,
        selling_price: Number(sellingPrice) || 0,
        promo_price: Number(comparedPrice) || undefined,
        quantity: Number(stockQuantity) || 10,
        min_stock_alert: 3,
        images: [photoUrl],
        is_published: true,
        is_archived: false,
        variants: [],
        description: description,
      });

      // Pass generated data to visual customizer
      onFinish({
        product: newProd,
        productName,
        sellingPrice,
        comparedPrice,
        photoUrl,
        category,
        description,
        heroTitle: productName,
        heroPitch: description,
        promoBanner: 'Promo limitée : 20% de remise sur la première commande !',
        promoBannerBg: '#13274F',
        themeColor:
          category === 'Beauté & Soins'
            ? '#be185d'
            : category === 'Mode & Bazin'
            ? '#059669'
            : '#2563eb',
        ratingText: '★★★★★ 1000+ clients satisfaits au Sénégal',
        benefits: [
          {
            title: 'Qualité Certifiée & Résultats Visibles',
            desc: 'Formulation premium testée offrant des résultats concrets et durables dès les premiers jours.',
          },
          {
            title: 'Livraison Rapide 24h à Dakar & Banlieue',
            desc: 'Expédition soignée à domicile ou au bureau avec suivi WhatsApp en direct.',
          },
          {
            title: 'Paiement Sécurisé à la Réception ou Wave',
            desc: 'Réglez en espèces à la livraison ou par virement instantané sans aucun frais caché.',
          },
        ],
        reviews: [
          {
            name: 'Aïssatou D.',
            comment: 'Très belle surprise, produit conforme à la photo et livraison rapide aux Almadies !',
            rating: 5,
            city: 'Dakar',
          },
          {
            name: 'Moussa S.',
            comment: 'Je recommande à 100%, commande passée via WhatsApp reçue en moins de 24h.',
            rating: 5,
            city: 'Thiès',
          },
          {
            name: 'Fatou K.',
            comment: 'Qualité au rendez-vous, je recommanderai sans hésiter pour toute ma famille.',
            rating: 5,
            city: 'Mermoz',
          },
        ],
      });
    }, 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden my-auto">
        {step === 'form' ? (
          <div className="p-4 sm:p-6 space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            {/* Top Alert Banner */}
            <div className="rounded-2xl bg-[#13274F] p-3.5 text-white flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs truncate">Créateur de Boutique IA Jaay</p>
                  <p className="text-[10px] text-blue-200 truncate">
                    Ajoute la photo de ton produit et ton prix. L'IA concevra une boutique professionnelle prête à vendre.
                  </p>
                </div>
              </div>

              <button
                onClick={onCancel}
                className="text-neutral-400 hover:text-white p-1"
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Header with Title and buttons */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
                  Informations de votre produit
                </h2>
                <p className="text-[11px] text-neutral-500">
                  L'IA utilisera ces données pour générer la boutique, les textes de vente et le design
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-xl border border-neutral-200 px-3 py-1.5 font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => setStep('analyzing')}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Créer avec l’IA</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: PHOTO DU PRODUIT (Upload ou suggestions) */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-blue-600" />
                    <span>Photo de ton produit</span>
                  </h3>
                  <p className="text-[10px] text-neutral-500">
                    Choisis une photo depuis ton téléphone/ordinateur ou utilise un visuel d’exemple
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Photo Preview Frame */}
                <div className="relative h-28 w-28 rounded-2xl overflow-hidden border-2 border-dashed border-blue-300 dark:border-blue-700 bg-white dark:bg-neutral-800 shrink-0 shadow-xs flex items-center justify-center group">
                  <img src={photoUrl} alt="Produit" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 right-1 bg-blue-600 text-white text-[8px] font-bold text-center py-0.5 rounded-md shadow-xs">
                    Photo principale
                  </span>
                </div>

                {/* Upload action buttons */}
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-95 transition-all"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Importer ma photo</span>
                    </button>

                    {uploadedFileName && (
                      <span className="text-[10px] text-neutral-500 font-mono truncate max-w-[150px]">
                        {uploadedFileName}
                      </span>
                    )}
                  </div>

                  {/* Suggestion presets */}
                  <div className="pt-1">
                    <span className="text-[10px] text-neutral-400 block mb-1">
                      Ou choisir une photo type :
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {SAMPLE_PRODUCT_PHOTOS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setProductName(sample.name);
                            setDescription(sample.pitch);
                            setPhotoUrl(sample.url);
                            setSellingPrice(sample.price);
                            setComparedPrice(sample.comparePrice);
                            setPurchasePrice(sample.purchasePrice);
                            setCategory(sample.category);
                            setUploadedFileName(null);
                          }}
                          className={`rounded-lg border px-2 py-1 text-[10px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                            photoUrl === sample.url
                              ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                              : 'border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                          }`}
                        >
                          <img
                            src={sample.url}
                            alt=""
                            className="h-3.5 w-3.5 rounded-full object-cover"
                          />
                          <span>{sample.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: NOM & DESCRIPTION */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-3">
              <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Nom & Description commerciale
              </h3>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Nom du produit <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {productName.length}/100
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Sérum Éclaircissant Anti-Taches"
                  className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-medium dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Description & Bienfaits
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {description.length}/5000
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décris brièvement ton produit, l’IA s’occupe de rédiger les arguments de vente complets..."
                  className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            {/* SECTION 3: PRIX & STOCK */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-3">
              <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Prix & Gestion du stock
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">
                    Prix de vente client <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={100}
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-mono font-bold text-sm text-neutral-900 dark:text-white dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-neutral-400 text-xs">
                      FCFA
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Prix comparé / barré <span className="text-neutral-400">(recommandé)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={comparedPrice}
                      onChange={(e) => setComparedPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-mono text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-neutral-400 text-xs">
                      FCFA
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Prix d'achat (coût fournisseur)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-neutral-400 text-xs">
                      FCFA
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Quantité initiale en stock</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>

              {/* Calculated profit margin */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-2.5 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                <span className="font-semibold text-[11px]">Bénéfice estimé par vente :</span>
                <span className="font-mono font-bold text-sm">
                  +{formatFCFA(Math.max(0, sellingPrice - purchasePrice))}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={() => setStep('analyzing')}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 shadow-md active:scale-95 transition-all text-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>Créer avec l’IA →</span>
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: L'ANALYSE DU PRODUIT (Exact reproduction of IMG_4757) */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Analyse de ton <span className="font-serif italic font-normal text-blue-600 dark:text-blue-400">produit</span>
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                L’IA Jaay conçoit votre vitrine professionnelle et rédige les textes de vente
              </p>
            </div>

            {/* Center card with product photo & EN COURS badge */}
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-neutral-800/60 max-w-md mx-auto space-y-4 shadow-sm text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-xs">
                    <img src={photoUrl} alt="Produit" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-neutral-900 dark:text-white">
                      Ta photo produit
                    </h3>
                    <p className="text-[11px] text-neutral-500 truncate max-w-[180px]">{productName}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-[10px] font-bold dark:bg-blue-950/60 dark:text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                  <span>EN COURS</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">
                    PROGRESSION
                  </span>
                  <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                    {progress}%
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-neutral-200 overflow-hidden dark:bg-neutral-700">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="space-y-2 pt-2">
                {analysisSteps.map((s, idx) => {
                  const isDone = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-blue-50/80 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/60'
                          : isDone
                          ? 'bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-750'
                          : 'opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? 'bg-blue-600 text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white animate-spin'
                              : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700'
                          }`}
                        >
                          {isDone ? (
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          ) : (
                            <span className="text-[10px]">{`0${idx + 1}`}</span>
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-xs text-neutral-900 dark:text-white">
                            {s.title}
                          </p>
                          <p className="text-[10px] text-neutral-500">{s.subtitle}</p>
                        </div>
                      </div>

                      {isDone && (
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                          OK
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-neutral-400">
              Ça prend en général moins d'une minute.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
