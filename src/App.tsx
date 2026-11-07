/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CommerceProvider } from './context/CommerceContext';
import { BottomNav } from './components/layout/BottomNav';
import { Sidebar, AdafrikTab } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewView } from './components/dashboard/OverviewView';
import { PosView } from './components/pos/PosView';
import { OrdersView } from './components/orders/OrdersView';
import { ProductsView } from './components/products/ProductsView';
import { StoreThemeView } from './components/store/StoreThemeView';
import { MarketingView } from './components/marketing/MarketingView';
import { FindProductView } from './components/sourcing/FindProductView';
import { FavoritesView } from './components/favorites/FavoritesView';
import { SettingsView } from './components/settings/SettingsView';
import { SubscriptionView } from './components/subscription/SubscriptionView';
import { ProfileView } from './components/profile/ProfileView';
import { X } from 'lucide-react';

function DashboardContent() {
  // Default to 'store' (Ma boutique) to match the screenshot user provided, or user can tap any item
  const [activeTab, setActiveTab] = useState<AdafrikTab>('store');
  const [isOpenMobileDrawer, setIsOpenMobileDrawer] = useState(false);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [showPosModal, setShowPosModal] = useState(false);

  const handleOpenNewProduct = () => {
    setActiveTab('products');
    setOpenProductModal(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <OverviewView
            setActiveTab={setActiveTab}
            onOpenPos={() => setShowPosModal(true)}
            onOpenNewProduct={handleOpenNewProduct}
          />
        );
      case 'orders':
        return <OrdersView />;
      case 'products':
        return (
          <ProductsView
            initialOpenModal={openProductModal}
            onNavigateToStore={() => setActiveTab('store')}
          />
        );
      case 'marketing':
        return <MarketingView />;
      case 'store':
        return <StoreThemeView />;
      case 'find_product':
        return <FindProductView />;
      case 'favorites':
        return <FavoritesView onFindMore={() => setActiveTab('find_product')} />;
      case 'settings':
        return <SettingsView />;
      case 'subscription':
        return <SubscriptionView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <StoreThemeView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 font-sans transition-colors">
      {/* Sidebar (Desktop permanent, Mobile slide-out drawer matching screenshot) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobileDrawer}
        setIsOpenMobile={setIsOpenMobileDrawer}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Header matching screenshot */}
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsOpenMobileDrawer(true)}
        />

        {/* Scrollable Viewport (with pb-20 on mobile to leave space for BottomNav) */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {renderActiveView()}
        </main>

        {/* Fixed Bottom Navigation for Mobile Smartphones (md:hidden) */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsOpenMobileDrawer(true)}
        />
      </div>

      {/* Quick POS Register Modal (Accessible from Dashboard / Caisse) */}
      {showPosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl h-[90vh] rounded-3xl bg-white dark:bg-neutral-900 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-bold text-sm text-neutral-900 dark:text-white">
                Caisse Enregistreuse POS Jaay
              </span>
              <button
                onClick={() => setShowPosModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PosView />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CommerceProvider>
      <DashboardContent />
    </CommerceProvider>
  );
}
