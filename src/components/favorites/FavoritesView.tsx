import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  PackagePlus,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { SOURCING_CATALOG, SourcingProduct } from '../sourcing/FindProductView';
import { formatFCFA } from '../../utils/formatters';

interface FavoritesViewProps {
  onFindMore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onFindMore }) => {
  const { addProduct } = useCommerce();
  const [favoritedIds, setFavoritedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('adafrik_favorites') || '["src-1", "src-3"]');
    } catch {
      return ['src-1', 'src-3'];
    }
  });

  const favoriteProducts = SOURCING_CATALOG.filter((item) => favoritedIds.includes(item.id));

  const handleRemove = (id: string) => {
    const updated = favoritedIds.filter((item) => item !== id);
    setFavoritedIds(updated);
    localStorage.setItem('adafrik_favorites', JSON.stringify(updated));
  };

  const handleImport = (product: SourcingProduct) => {
    addProduct({
      store_id: 'store-1',
      name: product.name,
      sku: `FAV-${Math.floor(1000 + Math.random() * 9000)}`,
      category_id: 'cat-1',
      purchase_price: product.wholesale_price,
      selling_price: product.suggested_price,
      quantity: 10,
      min_stock_alert: 2,
      is_published: true,
      is_archived: false,
      variants: [],
      images: [product.image],
      description: product.description,
    });
    alert(`"${product.name}" a été ajouté à votre boutique avec 10 unités !`);
  };

  return (
    <div className="p-3.5 sm:p-6 max-w-4xl mx-auto space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-blue-600 fill-blue-600" />
            <span>Liste de Favoris</span>
          </h1>
          <p className="text-neutral-500 mt-1">
            Vos produits repérés auprès des grossistes pour un réassort ou un test rapide
          </p>
        </div>

        <button
          onClick={onFindMore}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all self-start sm:self-auto min-h-[40px]"
        >
          <span>Découvrir d'autres produits</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center space-y-3 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-neutral-900 dark:text-white">Aucun favori enregistré</h3>
          <p className="text-neutral-500 text-xs max-w-sm mx-auto">
            Explorez les produits gagnants dans l'onglet « Trouver un produit » et cliquez sur l'icône de marque-page pour les sauvegarder ici.
          </p>
          <button
            onClick={onFindMore}
            className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Trouver un produit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favoriteProducts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 flex gap-3.5 items-center justify-between"
            >
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase">{p.category}</span>
                <h3 className="font-bold text-xs text-neutral-900 dark:text-white truncate">{p.name}</h3>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-neutral-500">Gros: {formatFCFA(p.wholesale_price)}</span>
                  <span className="font-mono font-bold text-emerald-600">Revente: {formatFCFA(p.suggested_price)}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleImport(p)}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 text-blue-600 px-2.5 py-1 text-[11px] font-bold hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
                  >
                    <PackagePlus className="h-3 w-3" />
                    <span>Ajouter au stock</span>
                  </button>
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="text-neutral-400 hover:text-rose-600 p-1"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
