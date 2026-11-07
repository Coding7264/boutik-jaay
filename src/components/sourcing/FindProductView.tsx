import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  TrendingUp,
  PackagePlus,
  Bookmark,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA } from '../../utils/formatters';

export interface SourcingProduct {
  id: string;
  name: string;
  category: string;
  image: string;
  wholesale_price: number;
  suggested_price: number;
  estimated_margin: number;
  delivery_time: string;
  supplier_location: string;
  popularity_score: number;
  description: string;
}

export const SOURCING_CATALOG: SourcingProduct[] = [
  {
    id: 'src-1',
    name: 'Smartwatch T800 Ultra Série 9',
    category: 'High-Tech',
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&auto=format&fit=crop&q=80',
    wholesale_price: 6500,
    suggested_price: 15000,
    estimated_margin: 8500,
    delivery_time: '24h (Stock Dakar)',
    supplier_location: 'Dakar Sandaga',
    popularity_score: 98,
    description: 'Montre connectée étanche, appels Bluetooth, capteurs de fréquence cardiaque, compatible iPhone & Android.',
  },
  {
    id: 'src-2',
    name: 'Écouteurs Sans Fil Pro TWS ANC',
    category: 'High-Tech',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80',
    wholesale_price: 5000,
    suggested_price: 13000,
    estimated_margin: 8000,
    delivery_time: '24h (Stock Dakar)',
    supplier_location: 'Dakar Plateau',
    popularity_score: 95,
    description: 'Réduction active du bruit, boîtier recharge sans fil, 24h d’autonomie totale, son basse haute fidélité.',
  },
  {
    id: 'src-3',
    name: 'Sérum Éclat Vitamine C & Acide Hyaluronique',
    category: 'Beauté & Soins',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&auto=format&fit=crop&q=80',
    wholesale_price: 3500,
    suggested_price: 9000,
    estimated_margin: 5500,
    delivery_time: '48h (Dakar)',
    supplier_location: 'Almadies Dakar',
    popularity_score: 91,
    description: 'Soin anti-tâches et anti-âge formulated for tropical skin, testé dermatologiquement, forte demande.',
  },
  {
    id: 'src-4',
    name: 'Robe Djellaba Bazin Riche Brodé 2 Pièces',
    category: 'Mode & Bazin',
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&auto=format&fit=crop&q=80',
    wholesale_price: 18000,
    suggested_price: 35000,
    estimated_margin: 17000,
    delivery_time: '24h - 48h',
    supplier_location: 'HLM Dakar',
    popularity_score: 96,
    description: 'Bazin riche teinté haut de gamme avec broderie fils d’or, finitions coutures prestige.',
  },
  {
    id: 'src-5',
    name: 'Mini Projecteur LED Portable 1080P WiFi',
    category: 'High-Tech',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=80',
    wholesale_price: 22000,
    suggested_price: 45000,
    estimated_margin: 23000,
    delivery_time: '24h (Stock Dakar)',
    supplier_location: 'Dakar Colobane',
    popularity_score: 89,
    description: 'Cinéma maison portable compatible YouTube/Netflix via smartphone, haut-parleur intégré.',
  },
  {
    id: 'src-6',
    name: 'Savon Noir Artisanal & Beurre de Karité Bio',
    category: 'Beauté & Soins',
    image: 'https://images.unsplash.com/photo-1607006314392-5d438062ec4d?w=400&auto=format&fit=crop&q=80',
    wholesale_price: 1500,
    suggested_price: 4500,
    estimated_margin: 3000,
    delivery_time: '24h',
    supplier_location: 'Thiès / Dakar',
    popularity_score: 88,
    description: 'Savon purifiant traditionnel sans produits chimiques, élimine les imperfections et adoucit la peau.',
  },
];

export const FindProductView: React.FC = () => {
  const { addProduct } = useCommerce();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [favoritedIds, setFavoritedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('adafrik_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const categories = ['TOUS', 'High-Tech', 'Beauté & Soins', 'Mode & Bazin'];

  const filtered = SOURCING_CATALOG.filter((item) => {
    const matchCat = selectedCategory === 'TOUS' || item.category === selectedCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleImport = (product: SourcingProduct) => {
    addProduct({
      store_id: 'store-1',
      name: product.name,
      sku: `SRC-${Math.floor(1000 + Math.random() * 9000)}`,
      category_id: 'cat-1',
      purchase_price: product.wholesale_price,
      selling_price: product.suggested_price,
      quantity: 15,
      min_stock_alert: 3,
      is_published: true,
      is_archived: false,
      variants: [],
      images: [product.image],
      description: `${product.description} (Fournisseur vérifié: ${product.supplier_location})`,
    });

    setImportedIds([...importedIds, product.id]);
    alert(`"${product.name}" a été ajouté à votre catalogue de produits avec 15 unités en stock !`);
  };

  const handleToggleFavorite = (product: SourcingProduct) => {
    const isFav = favoritedIds.includes(product.id);
    let updated: string[];
    if (isFav) {
      updated = favoritedIds.filter((id) => id !== product.id);
    } else {
      updated = [...favoritedIds, product.id];
    }
    setFavoritedIds(updated);
    localStorage.setItem('adafrik_favorites', JSON.stringify(updated));
  };

  return (
    <div className="p-3.5 sm:p-6 max-w-5xl mx-auto space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            <Search className="h-6 w-6 text-blue-600" />
            <span>Trouver un Produit Gagnant</span>
          </h1>
          <p className="text-neutral-500 mt-1">
            Approvisionnez votre boutique avec des articles à forte marge déjà stockés au Sénégal
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-semibold self-start sm:self-auto">
          <Zap className="h-4 w-4 text-blue-600" />
          <span>Fournisseurs vérifiés Jaay</span>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher smartwatch, sérum, bazin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`rounded-xl px-3 py-2 font-bold whitespace-nowrap transition-colors min-h-[36px] ${
                selectedCategory === c
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sourcing Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isImported = importedIds.includes(item.id);
          const isFav = favoritedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between space-y-3 transition-all hover:shadow-md"
            >
              <div className="space-y-2.5">
                {/* Product Image & Badges */}
                <div className="relative h-44 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-full bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 shadow-xs">
                    Score {item.popularity_score}%
                  </span>

                  <button
                    onClick={() => handleToggleFavorite(item)}
                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-700 hover:text-rose-600 shadow-md backdrop-blur-xs transition-colors"
                    title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Bookmark className={`h-4 w-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Details */}
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Pricing / Margin breakdown */}
                <div className="rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-800/80 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Prix de gros :</span>
                    <span className="font-mono font-bold text-neutral-700 dark:text-neutral-200">
                      {formatFCFA(item.wholesale_price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Revente conseillée :</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {formatFCFA(item.suggested_price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200 dark:border-neutral-700">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Marge estimée :
                    </span>
                    <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                      +{formatFCFA(item.estimated_margin)}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-400 flex items-center justify-between">
                  <span>📍 {item.supplier_location}</span>
                  <span>⚡ {item.delivery_time}</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleImport(item)}
                disabled={isImported}
                className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold transition-all min-h-[40px] ${
                  isImported
                    ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-xs'
                }`}
              >
                {isImported ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Importé dans vos produits</span>
                  </>
                ) : (
                  <>
                    <PackagePlus className="h-4 w-4" />
                    <span>Importer dans ma boutique</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
