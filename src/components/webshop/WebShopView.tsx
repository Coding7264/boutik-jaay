import React, { useState } from 'react';
import {
  Globe,
  Share2,
  Copy,
  ExternalLink,
  Eye,
  Check,
  Smartphone,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  Truck,
  CreditCard,
  Plus,
  Trash2,
  X,
  Upload,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatFCFA, formatPhoneNumber, generateWhatsAppUrl } from '../../utils/formatters';

export const WebShopView: React.FC = () => {
  const { store, updateStore, products, categories } = useCommerce();

  // Form Fields
  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [description, setDescription] = useState(store.description);
  const [address, setAddress] = useState(store.address);
  const [city, setCity] = useState(store.city);
  const [phone, setPhone] = useState(store.phone);
  const [whatsapp, setWhatsapp] = useState(store.whatsapp);
  const [email, setEmail] = useState(store.email);
  const [openingHours, setOpeningHours] = useState(store.opening_hours);
  const [logoUrl, setLogoUrl] = useState(store.logo_url || '');
  const [bannerUrl, setBannerUrl] = useState(store.banner_url || '');
  const [waveNumber, setWaveNumber] = useState(store.wave_number);
  const [omNumber, setOmNumber] = useState(store.om_number);
  const [isPublished, setIsPublished] = useState(store.is_published);
  const [customDomain, setCustomDomain] = useState(store.domain || '');
  const [deliveryZones, setDeliveryZones] = useState(store.delivery_zones);

  // Delivery zone editor row
  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePrice, setNewZonePrice] = useState<number>(2000);
  const [newZoneDelay, setNewZoneDelay] = useState('2h - 4h');

  // Preview Modal
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const publicUrl = `https://jaay.sn/${slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      name,
      slug,
      description,
      address,
      city,
      phone,
      whatsapp,
      email,
      opening_hours: openingHours,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      wave_number: waveNumber,
      om_number: omNumber,
      is_published: isPublished,
      domain: customDomain,
      delivery_zones: deliveryZones,
    });
    alert('Les paramètres de votre boutique en ligne ont été enregistrés avec succès !');
  };

  const handleAddDeliveryZone = () => {
    if (!newZoneName) return;
    setDeliveryZones([...deliveryZones, { name: newZoneName, price: newZonePrice, delay: newZoneDelay }]);
    setNewZoneName('');
    setNewZonePrice(2000);
    setNewZoneDelay('24h');
  };

  const handleRemoveZone = (idx: number) => {
    setDeliveryZones(deliveryZones.filter((_, i) => i !== idx));
  };

  const publishedProducts = products.filter((p) => p.is_published && !p.is_archived);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Ma Boutique en Ligne Jaay
          </h2>
          <p className="text-xs text-neutral-500">
            Personnalisez votre vitrine publique, configurez les expéditions à Dakar et dans les régions et partagez votre lien
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <Eye className="h-4 w-4 text-emerald-600" />
            <span>Aperçu Public Client</span>
          </button>
        </div>
      </div>

      {/* Public Link Share Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              Lien Public de votre Boutique :
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {publicUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-semibold dark:text-emerald-400"
              >
                {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copiedLink ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>
        </div>

        {/* Social Share Shortcuts */}
        <div className="flex items-center gap-2">
          <a
            href={generateWhatsAppUrl(
              '',
              `Découvrez notre boutique officielle ${store.name} sur Jaay !\nCommandez directement en ligne avec livraison partout au Sénégal : ${publicUrl}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Partager WhatsApp</span>
          </a>

          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <span>Facebook</span>
          </a>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveStore} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identity & Visuals */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
              Identité de la Boutique
            </h3>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Nom commercial de la boutique *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Identifiant URL (Slug) *
              </label>
              <div className="mt-1 flex items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800">
                <span>jaay.sn/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="bg-transparent font-bold text-neutral-900 focus:outline-none dark:text-white flex-1"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Slogan & Description commerciale
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  URL du Logo
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  URL de la Bannière d'accueil
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Domaine personnalisé (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: boutique.monentreprise.sn"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Connectez votre nom de domaine .sn ou .com avec redirection DNS automatique
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="pub-shop"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="pub-shop" className="font-semibold text-neutral-800 dark:text-neutral-200">
                Boutique publiée et accessible au public
              </label>
            </div>
          </div>

          {/* Coordonnées & Paiements Locaux */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
              Coordonnées & Paiements Sénégal
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Numéro WhatsApp Marchand *
                </label>
                <input
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Téléphone Fixe / Boutique
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Numéro Wave Marchand (QR / Dépôt)
                </label>
                <input
                  type="tel"
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
                  value={omNumber}
                  onChange={(e) => setOmNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Adresse physique
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Ville / Région
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                Horaires d'ouverture
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Delivery Zones Configuration */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Frais & Zones de Livraison
              </h3>
              <p className="text-neutral-500">
                Tarifs appliqués lors de la commande en ligne et sur les messages de commande WhatsApp
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deliveryZones.map((z, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
              >
                <div>
                  <strong className="text-neutral-900 dark:text-white">{z.name}</strong>
                  <span className="block text-neutral-500 text-[11px]">Délai : {z.delay}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-600 tabular-nums">
                    {formatFCFA(z.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveZone(idx)}
                    className="text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add zone line */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <input
              type="text"
              placeholder="Nom de la zone (ex: Thiès & Mbour)"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              className="sm:col-span-2 rounded border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800"
            />
            <input
              type="number"
              placeholder="Tarif (FCFA)"
              value={newZonePrice}
              onChange={(e) => setNewZonePrice(Number(e.target.value) || 0)}
              className="rounded border border-neutral-200 p-2 font-mono dark:border-neutral-700 dark:bg-neutral-800"
            />
            <button
              type="button"
              onClick={handleAddDeliveryZone}
              className="rounded bg-neutral-800 font-bold text-white hover:bg-neutral-700 dark:bg-neutral-700"
            >
              Ajouter Zone
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
          >
            Enregistrer les Paramètres de la Boutique
          </button>
        </div>
      </form>

      {/* MODAL: LIVE PREVIEW OF PUBLIC SHOP */}
      {showLivePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-neutral-900 space-y-4">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/95 px-6 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95">
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-neutral-900 dark:text-white">
                  Aperçu Public Client · {publicUrl}
                </span>
              </div>
              <button
                onClick={() => setShowLivePreview(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Shop Page Content */}
            <div className="p-6 space-y-6">
              {/* Hero Banner */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-neutral-900">
                {bannerUrl ? (
                  <img src={bannerUrl} alt={name} className="h-full w-full object-cover opacity-80" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-emerald-800 to-neutral-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                  <h1 className="text-2xl font-black">{name}</h1>
                  <p className="text-xs text-neutral-200 mt-1">{description}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">
                    {address}, {city} · Ouvert : {openingHours}
                  </p>
                </div>
              </div>

              {/* Public Catalog Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Nos Articles Disponibles ({publishedProducts.length})
                  </h3>
                  <span className="text-xs text-neutral-500">Commande WhatsApp en 1 clic</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {publishedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-800 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="h-28 w-full rounded-lg bg-neutral-100 overflow-hidden dark:bg-neutral-700">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-neutral-400">
                              {p.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">
                          {p.name}
                        </h4>
                        <p className="text-[11px] font-mono font-bold text-emerald-600">
                          {formatFCFA(p.promo_price || p.selling_price)}
                        </p>
                      </div>

                      <a
                        href={generateWhatsAppUrl(
                          whatsapp,
                          `Bonjour ${name}, je souhaite commander l'article : *${p.name}* (${formatFCFA(p.promo_price || p.selling_price)}). Est-il disponible pour livraison ?`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Commander</span>
                      </a>
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
