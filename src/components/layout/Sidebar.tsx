import React from 'react';
import {
  Home,
  PackagePlus,
  Package,
  Tag,
  Store,
  Search,
  HeartHandshake,
  Settings,
  Receipt,
  UserPlus,
  LogOut,
  X,
  Bookmark,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { JaayLogo } from '../common/JaayLogo';

export type JaayTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'marketing'
  | 'store'
  | 'find_product'
  | 'favorites'
  | 'settings'
  | 'subscription'
  | 'profile';

export type AdafrikTab = JaayTab;
export type ActiveTab = JaayTab;

interface SidebarProps {
  activeTab: AdafrikTab;
  setActiveTab: (tab: AdafrikTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { orders } = useCommerce();
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'EN_ATTENTE').length;

  const menuSections = [
    {
      title: 'Business',
      items: [
        { id: 'dashboard' as AdafrikTab, label: 'Tableau de bord', icon: Home },
        {
          id: 'orders' as AdafrikTab,
          label: 'Commandes',
          icon: PackagePlus,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
        },
        { id: 'products' as AdafrikTab, label: 'Produits', icon: Package },
      ],
    },
    {
      title: 'Outils',
      items: [
        { id: 'marketing' as AdafrikTab, label: 'Marketing', icon: Tag },
        { id: 'store' as AdafrikTab, label: 'Ma boutique', icon: Store },
      ],
    },
    {
      title: 'Ressources',
      items: [
        { id: 'find_product' as AdafrikTab, label: 'Trouver un produit', icon: Search },
        { id: 'favorites' as AdafrikTab, label: 'Liste de favoris', icon: Bookmark },
      ],
    },
    {
      title: 'Avancés',
      items: [
        { id: 'settings' as AdafrikTab, label: 'Général', icon: Settings },
        { id: 'subscription' as AdafrikTab, label: 'Abonnement', icon: Receipt },
      ],
    },
    {
      title: 'Mon compte',
      items: [
        { id: 'profile' as AdafrikTab, label: 'Profil', icon: UserPlus },
      ],
    },
  ];

  const handleSelectTab = (tab: AdafrikTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } border-r border-neutral-200/80 dark:border-neutral-800 shrink-0`}
      >
        {/* Drawer Header (Mobile close & Jaay Brand) */}
        <div className="flex md:hidden items-center justify-between px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <JaayLogo size="sm" />
          <button
            onClick={() => setIsOpenMobile(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Section List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block px-3 mb-1.5 uppercase tracking-wide">
                {section.title}
              </span>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-all min-h-[44px] ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-bold dark:bg-blue-950/40 dark:text-blue-400'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 stroke-[2] ${
                          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      />
                      <span className="truncate flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Profile Footer (Matching Screenshot) */}
        <div className="border-t border-neutral-100 p-4 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-xs">
                G
              </div>
              <div className="truncate text-left">
                <p className="font-bold text-xs text-neutral-900 dark:text-white truncate">Henri</p>
                <p className="truncate text-[11px] text-neutral-500 font-mono">
                  gueyehenri8@gmail.com
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Session fermée.')}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
