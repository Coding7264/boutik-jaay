/**
 * Utility functions for Jaay - Senegalese Commerce Platform
 */

export function formatFCFA(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  // Use non-breaking space as thousands separator
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('221') && cleaned.length === 12) {
    return `+221 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
  }
  if (cleaned.length === 9) {
    return `+221 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  }
  return phone;
}

export function generateWhatsAppUrl(phone: string, text: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned.startsWith('221') && cleaned.length === 9) {
    cleaned = '221' + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'WAVE':
      return 'Wave';
    case 'ORANGE_MONEY':
      return 'Orange Money';
    case 'ESPECES':
      return 'Espèces';
    case 'CARTE':
      return 'Carte Bancaire';
    case 'CREDIT':
      return 'Paiement à Crédit';
    default:
      return method;
  }
}

export function getOrderStatusLabel(status: string): string {
  switch (status) {
    case 'EN_ATTENTE':
      return 'En attente';
    case 'CONFIRMEE':
      return 'Confirmée';
    case 'EN_PREPARATION':
      return 'En préparation';
    case 'PRETE':
      return 'Prête';
    case 'EXPEDIEE':
      return 'Expédiée';
    case 'LIVREE':
      return 'Livrée';
    case 'ANNULEE':
      return 'Annulée';
    case 'REMBOURSEE':
      return 'Remboursée';
    default:
      return status;
  }
}

export function getExpenseCategoryLabel(cat: string): string {
  switch (cat) {
    case 'LOYER':
      return 'Loyer commercial';
    case 'ELECTRICITE':
      return 'Électricité / Senelec';
    case 'TRANSPORT':
      return 'Transport & Déplacements';
    case 'LIVRAISON':
      return 'Frais de livraison';
    case 'SALAIRES':
      return 'Salaires & Rémunérations';
    case 'PUBLICITE':
      return 'Publicité & Marketing';
    case 'APPROVISIONNEMENT':
      return 'Achats & Approvisionnement';
    case 'MAINTENANCE':
      return 'Entretien & Réparations';
    case 'AUTRES':
      return 'Autres charges';
    default:
      return cat;
  }
}
