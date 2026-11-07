import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Globe,
  Moon,
  Sun,
  LogOut,
  Check,
  Building,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';

export const ProfileView: React.FC = () => {
  const { currentUser, isDarkMode, toggleDarkMode, store } = useCommerce();

  const [name, setName] = useState(currentUser.name || 'Henri');
  const [email, setEmail] = useState('gueyehenri8@gmail.com');
  const [phone, setPhone] = useState('+221 77 845 12 90');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [language, setLanguage] = useState<'fr' | 'wo'>('fr');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    alert('Mot de passe mis à jour avec succès.');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="p-3.5 sm:p-6 max-w-3xl mx-auto space-y-6 text-xs">
      {/* Header */}
      <div className="border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-blue-600" />
          <span>Mon Profil Utilisateur</span>
        </h1>
        <p className="text-neutral-500 mt-1">
          Gérez vos informations personnelles, votre sécurité et vos préférences de compte
        </p>
      </div>

      {/* Account Badge Card */}
      <div className="rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white font-extrabold text-2xl shadow-sm shrink-0">
          G
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white truncate">
              Henri
            </h2>
            <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
              Commerçant Propriétaire
            </span>
          </div>
          <p className="font-mono text-neutral-500 text-[11px] truncate mt-0.5">
            gueyehenri8@gmail.com
          </p>
          <p className="text-neutral-400 text-[10px] mt-1 flex items-center gap-1">
            <Building className="h-3 w-3" />
            <span>Boutique active : <strong>Momo</strong> ({store.name})</span>
          </p>
        </div>
      </div>

      {/* Form: General info */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-4 shadow-xs"
      >
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800">
          Informations Personnelles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold block mb-1">Prénom & Nom</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800 font-medium"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Adresse Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Numéro de Téléphone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Langue de l'interface</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <option value="fr">Français (Sénégal)</option>
              <option value="wo">Wolof (Bêss na)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isSaved && (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <Check className="h-4 w-4" />
              Modifications enregistrées !
            </span>
          )}
          <button
            type="submit"
            className="ml-auto rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700 active:scale-95 transition-all min-h-[40px]"
          >
            Mettre à jour mon profil
          </button>
        </div>
      </form>

      {/* Form: Password change */}
      <form
        onSubmit={handleUpdatePassword}
        className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-4 shadow-xs"
      >
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white border-b border-neutral-100 pb-2 dark:border-neutral-800 flex items-center gap-2">
          <Key className="h-4 w-4 text-neutral-500" />
          <span>Sécurité & Mot de passe</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold block mb-1">Mot de passe actuel</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              placeholder="Minimum 8 caractères"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl border border-neutral-300 px-4 py-2 font-bold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 min-h-[38px]"
          >
            Changer le mot de passe
          </button>
        </div>
      </form>

      {/* Preferences: Dark Mode */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-white">Apparence de l'application</h4>
          <p className="text-neutral-500 text-[11px]">
            {isDarkMode ? 'Mode sombre activé' : 'Mode clair standard activé'}
          </p>
        </div>

        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3.5 py-2 font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          <span>{isDarkMode ? 'Passer en clair' : 'Passer en sombre'}</span>
        </button>
      </div>

      {/* Logout */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-950/60 dark:bg-rose-950/20 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-rose-900 dark:text-rose-300">Fermer la session</h4>
          <p className="text-rose-700/80 dark:text-rose-400/80 text-[11px]">
            Déconnexion de votre espace commerçant Jaay
          </p>
        </div>

        <button
          onClick={() => alert('Session fermée.')}
          className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white hover:bg-rose-700 active:scale-95 transition-all min-h-[38px]"
        >
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};
