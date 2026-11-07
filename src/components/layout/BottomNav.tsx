import React from 'react';
import { Home, PackagePlus, Package, Store, Menu } from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { AdafrikTab } from './Sidebar';

interface BottomNavProps {
  activeTab: AdafrikTab;
  setActiveTab: (tab: AdafrikTab) => void;
  onOpenMobileMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}) => {
  const { orders } = useCommerce();
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'EN_ATTENTE').length;

  const tabs = [
    { id: 'dashboard' as AdafrikTab, label: 'Accueil', icon: Home },
    {
      id: 'orders' as AdafrikTab,
      label: 'Commandes',
      icon: PackagePlus,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
    },
    { id: 'products' as AdafrikTab, label: 'Produits', icon: Package },
    { id: 'store' as AdafrikTab, label: 'Boutique', icon: Store },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200/80 dark:border-neutral-800 safe-bottom">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all active:scale-95"
            >
              <div
                className={`relative flex items-center justify-center rounded-xl p-1.5 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 5th button: Menu Drawer Toggle */}
        <button
          onClick={onOpenMobileMenu}
          className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all active:scale-95 text-neutral-500 dark:text-neutral-400"
        >
          <div className="flex items-center justify-center rounded-xl p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Menu className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
