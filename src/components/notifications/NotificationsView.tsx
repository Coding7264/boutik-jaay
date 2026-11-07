import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Truck,
  Package,
  Layers,
  Check,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { formatDateTime } from '../../utils/formatters';
import { ActiveTab } from '../layout/Sidebar';

interface NotificationsViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ setActiveTab }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useCommerce();

  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-emerald-600" />;
      case 'stock':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-neutral-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Centre des Notifications
          </h2>
          <p className="text-xs text-neutral-500">
            Alertes en temps réel sur les commandes WhatsApp, ruptures de stock et encaissements
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 self-start sm:self-auto"
        >
          <Check className="h-4 w-4" />
          <span>Tout marquer comme lu</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'ALL', label: 'Toutes' },
          { id: 'UNREAD', label: 'Non lues' },
          { id: 'order', label: 'Commandes' },
          { id: 'sale', label: 'Ventes' },
          { id: 'stock', label: 'Alertes Stock' },
          { id: 'system', label: 'Système' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`rounded-lg px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            Aucune notification trouvée.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.link_view) setActiveTab(n.link_view as ActiveTab);
              }}
              className={`p-4 flex items-start justify-between gap-3 cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60 ${
                !n.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
                  {getIcon(n.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-300">
                    {n.message}
                  </p>
                  <span className="mt-1 block text-[11px] font-mono text-neutral-400">
                    {formatDateTime(n.timestamp)}
                  </span>
                </div>
              </div>

              {n.link_view && (
                <span className="text-[11px] font-semibold text-emerald-600 hover:underline shrink-0">
                  Consulter →
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
