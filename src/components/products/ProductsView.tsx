import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Heart,
  Check,
  Camera,
  Image as ImageIcon,
  DollarSign,
  RotateCcw,
  Sliders,
  ShoppingBag,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { Product } from '../../types';
import { formatFCFA } from '../../utils/formatters';
import { AiBoutiqueWizard, SAMPLE_PRODUCT_PHOTOS } from '../store/AiBoutiqueWizard';

interface ProductsViewProps {
  initialOpenModal?: boolean;
  onNavigateToStore?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  initialOpenModal = false,
  onNavigateToStore,
}) => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    recordStockMovement,
    store,
  } = useCommerce();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(initialOpenModal);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAiWizard, setShowAiWizard] = useState(false);

  // Form Fields (matching IMG_4754 & IMG_4755)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(3500);
  const [comparedPrice, setComparedPrice] = useState<number>(6000);
  const [purchasePrice, setPurchasePrice] = useState<number>(1500);
  const [quantity, setQuantity] = useState<number>(20);
  const [minStockAlert, setMinStockAlert] = useState<number>(3);
  const [imageUrl, setImageUrl] = useState('');
  const [isFavorite, setIsFavorite] = useState(true);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Favorites in-memory set
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['prod_01', 'prod_03']);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.is_archived) return false;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && p.is_published) ||
        (statusFilter === 'INACTIVE' && !p.is_published);
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategoryId(categories[0]?.id || 'cat_01');
    setSku(`JAAY-${Date.now().toString().slice(-4)}`);
    setSellingPrice(3500);
    setComparedPrice(6000);
    setPurchasePrice(1500);
    setQuantity(20);
    setMinStockAlert(3);
    setImageUrl(SAMPLE_PRODUCT_PHOTOS[0].url);
    setIsFavorite(true);
    setStatus('ACTIVE');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || '');
    setCategoryId(p.category_id);
    setSku(p.sku);
    setSellingPrice(p.selling_price);
    setComparedPrice(p.promo_price || p.selling_price * 1.5);
    setPurchasePrice(p.purchase_price || p.selling_price * 0.5);
    setQuantity(p.quantity);
    setMinStockAlert(p.min_stock_alert);
    setImageUrl(p.images[0] || '');
    setIsFavorite(favoriteIds.includes(p.id));
    setStatus(p.is_published ? 'ACTIVE' : 'INACTIVE');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || sellingPrice <= 0) return;

    const images = imageUrl
      ? [imageUrl]
      : editingProduct?.images || [SAMPLE_PRODUCT_PHOTOS[0].url];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        description,
        category_id: categoryId,
        sku,
        selling_price: sellingPrice,
        promo_price: comparedPrice > sellingPrice ? comparedPrice : undefined,
        purchase_price: purchasePrice,
        quantity,
        min_stock_alert: minStockAlert,
        images,
        is_published: status === 'ACTIVE',
      });
    } else {
      addProduct({
        store_id: store.id,
        name,
        description,
        category_id: categoryId || categories[0]?.id || 'cat_01',
        sku,
        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        promo_price: comparedPrice > sellingPrice ? comparedPrice : undefined,
        quantity,
        min_stock_alert: minStockAlert,
        images,
        is_published: status === 'ACTIVE',
        is_archived: false,
        variants: [],
      });
    }

    setShowModal(false);
  };

  const handleLaunchAiFromProduct = () => {
    setShowModal(false);
    setShowAiWizard(true);
  };

  const toggleFavorite = (id: string) => {
    if (favoriteIds.includes(id)) {
      setFavoriteIds(favoriteIds.filter((fav) => fav !== id));
    } else {
      setFavoriteIds([...favoriteIds, id]);
    }
  };

  const handleQuickStockAdjust = (p: Product, delta: number) => {
    recordStockMovement(
      p.id,
      delta > 0 ? 'ENTREE_ACHAT' : 'SORTIE_PERTE',
      delta,
      'Ajustement rapide en rayon'
    );
  };

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Top Banner matching screenshot IMG_4754 */}
      <div className="rounded-2xl bg-neutral-900 p-3.5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Active ta boutique</h4>
            <p className="text-[11px] text-neutral-400">
              Tu peux créer des produits et concevoir ta boutique avec l'IA.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAiWizard(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-900 hover:bg-neutral-100 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Générer ma boutique (IA) →</span>
        </button>
      </div>

      {/* Header matching screenshot IMG_4756 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-3 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Produits
          </h2>
          <p className="text-xs text-neutral-500">
            Gère ton catalogue produits et le stock disponible
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Boutique Creation Button */}
          <button
            onClick={() => setShowAiWizard(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400 min-h-[40px] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Créer boutique (IA)</span>
          </button>

          {/* Standard Add Product Button (IMG_4756) */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all min-h-[40px] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau produit</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters Bar (IMG_4756) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-4 text-xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-white min-h-[40px]"
          />
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 px-3 text-xs font-semibold dark:border-neutral-800 dark:bg-neutral-900 dark:text-white min-h-[40px]"
          >
            <option value="ALL">Statut : Tous</option>
            <option value="ACTIVE">Actif uniquement</option>
            <option value="INACTIVE">Inactif</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setStatusFilter('ALL');
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-100 dark:border-neutral-800 shrink-0"
            title="Réinitialiser les filtres"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Pills Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[34px] transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
          }`}
        >
          Tous ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap min-h-[34px] transition-colors ${
              selectedCategory === c.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* PRODUCTS LIST TABLE / CARDS (Matching IMG_4756) */}
      <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">PRODUIT</div>
          <div className="col-span-2">PRIX</div>
          <div className="col-span-2">STATUT</div>
          <div className="col-span-2 text-right">ACTION</div>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {filteredProducts.map((p) => {
            const isFav = favoriteIds.includes(p.id);

            return (
              <div
                key={p.id}
                className="p-3.5 sm:px-4 sm:py-3.5 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-3 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50 transition-colors"
              >
                {/* Mobile & Desktop Thumbnail + Name */}
                <div className="col-span-6 flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 hidden sm:block shrink-0"
                  />

                  <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-700">
                    {p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-neutral-400">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                      SKU: {p.sku} · Stock: {p.quantity} en rayon
                    </p>
                  </div>
                </div>

                {/* Price (FCFA) */}
                <div className="col-span-2 flex sm:block items-center justify-between text-xs">
                  <span className="sm:hidden text-neutral-400">Prix :</span>
                  <span className="font-mono font-black text-neutral-900 dark:text-white">
                    {formatFCFA(p.selling_price)}
                  </span>
                </div>

                {/* Status Badge (Actif / Inactif) (IMG_4756) */}
                <div className="col-span-2 flex sm:block items-center justify-between">
                  <span className="sm:hidden text-neutral-400 text-xs">Statut :</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.is_published
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                    }`}
                  >
                    {p.is_published ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {/* Actions & Heart Coup de Coeur */}
                <div className="col-span-2 flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => toggleFavorite(p.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 transition-colors"
                    title={isFav ? 'Retirer coup de coeur' : 'Mettre en coup de coeur'}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    title="Modifier le produit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Supprimer le produit "${p.name}" ?`)) deleteProduct(p.id);
                    }}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FULL-SCREEN / MODAL PRODUCT CREATION FORM (Exact layout from IMG_4754 & IMG_4755) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-3xl bg-white shadow-2xl dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-5 text-xs max-h-[92vh] overflow-y-auto"
          >
            {/* Top Bar with "< Nouveau produit", "Annuler", "✓ Enregistrer le produit" (IMG_4754) */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-neutral-200 px-3 py-2 font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 font-bold text-white hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer le produit</span>
                </button>
              </div>
            </div>

            {/* Quick AI Generator Banner inside Modal */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-900/40 dark:bg-blue-950/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-bold text-blue-900 dark:text-blue-300">
                  Générer automatiquement une boutique avec ce produit ?
                </span>
              </div>
              <button
                type="button"
                onClick={handleLaunchAiFromProduct}
                className="rounded-xl bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700 shadow-xs active:scale-95 shrink-0"
              >
                Lancer l’IA →
              </button>
            </div>

            {/* SECTION 1: Informations générales (IMG_4754) */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-3">
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Informations générales
              </h4>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Nom du produit <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">{name.length}/100</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: T-shirt Dakar Premium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-medium dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Description du produit
                  </label>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {description.length}/5000
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Détails, matière, conseils d'utilisation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            {/* SECTION 2: Médias du produit (IMG_4754 & IMG_4755) */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-3">
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Médias du produit
              </h4>

              <div className="flex items-center gap-3">
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800 shrink-0 shadow-xs">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Produit" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-neutral-400">
                      Photo
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 right-1 bg-blue-600 text-white text-[8px] font-bold text-center py-0.5 rounded-md">
                    Image 1
                  </span>
                </div>

                <div className="flex-1 space-y-1.5">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de l'image"
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2 font-mono text-[11px] dark:border-neutral-700 dark:bg-neutral-800"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                    {SAMPLE_PRODUCT_PHOTOS.map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setImageUrl(sample.url);
                          if (!name) setName(sample.name);
                          if (!description) setDescription(sample.pitch);
                        }}
                        className="h-6 px-2 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 text-[10px] font-semibold whitespace-nowrap"
                      >
                        {sample.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Prix et informations (IMG_4755) */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-3">
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Prix et informations
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">
                    Prix <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={100}
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-mono font-bold dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-neutral-400 text-xs">
                      FCFA
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">
                    Prix comparé <span className="text-neutral-400">(optionnel)</span>
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
                  <label className="font-semibold block mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    placeholder="Ex: Vêtement, Beauté..."
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">SKU (Référence)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Ex: CBP-001"
                    className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-mono dark:border-neutral-700 dark:bg-neutral-800"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Statut du produit (IMG_4755) */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-3">
              <h4 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                Statut du produit
              </h4>

              <div>
                <label className="font-semibold block mb-1">Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-2.5 font-bold text-emerald-600 dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <option value="ACTIVE">• Actif</option>
                  <option value="INACTIVE">• Inactif</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <div className="text-[11px]">
                  <p className="font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                    <span>Coup de cœur</span>
                  </p>
                  <p className="text-neutral-500">
                    Affiche ce produit dans le carrousel « Nos coups de cœur » de l’accueil.
                  </p>
                </div>
              </label>
            </div>

            {/* Modal Bottom action buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2.5 font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
              >
                Fermer
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLaunchAiFromProduct}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 font-bold text-blue-600 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Générer avec l’IA</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700 shadow-sm active:scale-95 transition-all"
                >
                  <Check className="h-4 w-4" />
                  <span>Enregistrer le produit</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* AI Wizard from inside ProductsView */}
      {showAiWizard && (
        <AiBoutiqueWizard
          initialProduct={{
            name: name || undefined,
            selling_price: sellingPrice || undefined,
            purchase_price: purchasePrice || undefined,
            image: imageUrl || undefined,
            category: categoryId || undefined,
            description: description || undefined,
          }}
          onFinish={(data) => {
            setShowAiWizard(false);
            if (onNavigateToStore) {
              onNavigateToStore();
            }
          }}
          onCancel={() => setShowAiWizard(false)}
        />
      )}
    </div>
  );
};
