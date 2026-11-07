import React, { useState } from 'react';
import {
  Menu,
  HelpCircle,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Check,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { AdafrikTab } from './Sidebar';
import { JaayLogo } from '../common/JaayLogo';

interface TopBarProps {
  activeTab: AdafrikTab;
  setActiveTab: (tab: AdafrikTab) => void;
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}) => {
  const { store, isDarkMode, toggleDarkMode, notifications, unreadNotificationsCount } = useCommerce();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 md:h-16 w-full items-center justify-between border-b border-neutral-200/80 bg-white px-3 md:px-6 dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
        {/* Left Slot: Hamburger Menu + Official Jaay Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 transition-colors active:scale-95"
            title="Menu de navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Official Jaay Logo & Wordmark */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer active:scale-95 transition-transform"
          >
            <JaayLogo size="md" />
          </div>
        </div>

        {/* Right Slot: Help (?), Notifications (with red badge), User Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            title="Aide & Support"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-bold text-neutral-900 dark:text-white">Notifications</span>
                  <span className="text-[11px] text-blue-600 font-semibold">{unreadNotificationsCount} non lues</span>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-60 overflow-y-auto py-1">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="py-2 space-y-0.5">
                      <p className="font-bold text-neutral-800 dark:text-neutral-200">{n.title}</p>
                      <p className="text-[11px] text-neutral-500">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Pill: [M] Momo (v) */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50 py-1 pl-1 pr-2.5 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-750 transition-colors active:scale-95"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-xs">
                M
              </div>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hidden sm:inline">
                Momo
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <p className="font-bold text-neutral-900 dark:text-white">Henri / Momo</p>
                  <p className="text-[11px] text-neutral-400 font-mono">gueyehenri8@gmail.com</p>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>Mon Profil</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('subscription');
                    setShowUserDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 font-medium"
                >
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span>Mon Abonnement</span>
                </button>

                <button
                  onClick={() => {
                    toggleDarkMode();
                    setShowUserDropdown(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 font-medium"
                >
                  <div className="flex items-center gap-2">
                    {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                    <span>{isDarkMode ? 'Mode clair' : 'Mode sombre'}</span>
                  </div>
                </button>

                <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    onClick={() => {
                      alert('Déconnexion effectuée.');
                      setShowUserDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <JaayLogo size="sm" showWordmark={false} />
                <span>Centre d'Aide & Support Jaay</span>
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-neutral-400">
                ✕
              </button>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              Besoin d'aide pour configurer votre boutique, vos paiements Wave / Orange Money ou vos commandes WhatsApp ?
            </p>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-900 dark:bg-blue-950/30 dark:text-blue-300 space-y-1">
              <p className="font-bold">Support WhatsApp Dédié Sénégal :</p>
              <p className="font-mono text-sm">+221 77 845 12 90</p>
              <p className="text-[11px] text-neutral-500">Disponible du Lundi au Samedi, 8h - 20h</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
