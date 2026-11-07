import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  User,
  Phone,
  Mail,
  Shield,
  Check,
  X,
  Lock,
  Eye,
  Edit,
  ArrowRight,
} from 'lucide-react';
import { useCommerce } from '../../context/CommerceContext';
import { Employee, UserRole } from '../../types';
import { formatPhoneNumber } from '../../utils/formatters';

export const TeamView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, currentUser, setCurrentUser, store } =
    useCommerce();

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');

  // Granular Permissions checkboxes
  const [canViewProducts, setCanViewProducts] = useState(true);
  const [canEditProducts, setCanEditProducts] = useState(false);
  const [canEditStock, setCanEditStock] = useState(false);
  const [canMakeSales, setCanMakeSales] = useState(true);
  const [canViewFinances, setCanViewFinances] = useState(false);
  const [canManageOrders, setCanManageOrders] = useState(true);
  const [canViewCustomers, setCanViewCustomers] = useState(true);
  const [canManageTeam, setCanManageTeam] = useState(false);

  // Preset role permissions mapper
  const applyRolePreset = (r: UserRole) => {
    setRole(r);
    switch (r) {
      case 'owner':
        setCanViewProducts(true);
        setCanEditProducts(true);
        setCanEditStock(true);
        setCanMakeSales(true);
        setCanViewFinances(true);
        setCanManageOrders(true);
        setCanViewCustomers(true);
        setCanManageTeam(true);
        break;
      case 'store_admin':
        setCanViewProducts(true);
        setCanEditProducts(true);
        setCanEditStock(true);
        setCanMakeSales(true);
        setCanViewFinances(true);
        setCanManageOrders(true);
        setCanViewCustomers(true);
        setCanManageTeam(false);
        break;
      case 'manager':
        setCanViewProducts(true);
        setCanEditProducts(true);
        setCanEditStock(true);
        setCanMakeSales(true);
        setCanViewFinances(false);
        setCanManageOrders(true);
        setCanViewCustomers(true);
        setCanManageTeam(false);
        break;
      case 'cashier':
        setCanViewProducts(true);
        setCanEditProducts(false);
        setCanEditStock(false);
        setCanMakeSales(true);
        setCanViewFinances(false); // Masked by default
        setCanManageOrders(true);
        setCanViewCustomers(true);
        setCanManageTeam(false);
        break;
      case 'stock_manager':
        setCanViewProducts(true);
        setCanEditProducts(true);
        setCanEditStock(true);
        setCanMakeSales(false);
        setCanViewFinances(false);
        setCanManageOrders(false);
        setCanViewCustomers(false);
        setCanManageTeam(false);
        break;
    }
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPhone('');
    applyRolePreset('cashier');
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPhone(emp.phone);
    setRole(emp.role);
    setCanViewProducts(emp.permissions.canViewProducts);
    setCanEditProducts(emp.permissions.canEditProducts);
    setCanEditStock(emp.permissions.canEditStock);
    setCanMakeSales(emp.permissions.canMakeSales);
    setCanViewFinances(emp.permissions.canViewFinances);
    setCanManageOrders(emp.permissions.canManageOrders);
    setCanViewCustomers(emp.permissions.canViewCustomers);
    setCanManageTeam(emp.permissions.canManageTeam);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const permissions = {
      canViewProducts,
      canEditProducts,
      canEditStock,
      canMakeSales,
      canViewFinances,
      canManageOrders,
      canViewCustomers,
      canManageTeam,
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        name,
        email,
        phone,
        role,
        permissions,
      });
    } else {
      addEmployee({
        store_id: store.id,
        name,
        email,
        phone,
        role,
        active: true,
        permissions,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Gestion des Employés & Droits d'Accès (RBAC)
          </h2>
          <p className="text-xs text-neutral-500">
            Attribuez des rôles stricts et contrôlez précisément l'accès aux finances, stocks et caisse pour vos collaborateurs
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Inviter un Collaborateur</span>
        </button>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { role: 'Propriétaire', desc: 'Accès total à toute la plateforme et aux bilans financiers.' },
          { role: 'Admin boutique', desc: 'Gestion opérationnelle, catalogue, clients et commandes.' },
          { role: 'Gestionnaire', desc: 'Supervision des flux de vente et coordination magasin.' },
          { role: 'Vendeur (Caisse)', desc: 'Terminal POS et commandes. Données financières masquées.' },
          { role: 'Gestionnaire stock', desc: 'Entrées/sorties d\'inventaire, réceptions fournisseurs.' },
        ].map((r, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-neutral-200 bg-white p-3 text-xs shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <strong className="text-neutral-900 dark:text-white block mb-1">{r.role}</strong>
            <p className="text-neutral-500 text-[11px]">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {employees.map((emp) => {
          const isCurrent = currentUser.id === emp.id;

          return (
            <div
              key={emp.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-neutral-900 flex flex-col justify-between ${
                isCurrent
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {emp.avatar ? (
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="h-10 w-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {emp.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                        {emp.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    title="Modifier les permissions"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-neutral-500 font-mono">
                  <p>{formatPhoneNumber(emp.phone)}</p>
                  <p className="truncate">{emp.email}</p>
                </div>

                {/* Permissions summary */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1 text-[11px]">
                  <span className="font-semibold text-neutral-400 block mb-1">Droits d'accès :</span>
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    <span className={emp.permissions.canMakeSales ? 'text-emerald-600' : 'text-neutral-400 line-through'}>
                      ✓ Vente POS
                    </span>
                    <span className={emp.permissions.canEditStock ? 'text-emerald-600' : 'text-neutral-400 line-through'}>
                      ✓ Stocks
                    </span>
                    <span className={emp.permissions.canViewFinances ? 'text-emerald-600' : 'text-rose-500 font-bold'}>
                      {emp.permissions.canViewFinances ? '✓ Finances' : '✕ Finances'}
                    </span>
                    <span className={emp.permissions.canManageOrders ? 'text-emerald-600' : 'text-neutral-400 line-through'}>
                      ✓ Commandes
                    </span>
                  </div>
                </div>
              </div>

              {/* Fast switch simulator button */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {isCurrent ? (
                  <span className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded-lg dark:bg-emerald-950/40">
                    <Check className="h-3.5 w-3.5" />
                    Utilisateur Actif
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentUser(emp)}
                    className="w-full rounded-lg border border-neutral-200 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Simuler cette session
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                {editingEmployee ? 'Modifier le Collaborateur' : 'Ajouter un Collaborateur'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ibrahima Ndiaye"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="employe@keurjaay.sn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Rôle prédéfini
                </label>
                <select
                  value={role}
                  onChange={(e) => applyRolePreset(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                >
                  <option value="owner">Propriétaire (Tous pouvoirs)</option>
                  <option value="store_admin">Administrateur de Boutique</option>
                  <option value="manager">Gestionnaire</option>
                  <option value="cashier">Vendeur / Caissier (Finances masquées)</option>
                  <option value="stock_manager">Gestionnaire de Stock</option>
                </select>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                <span className="font-bold text-neutral-900 dark:text-white block">
                  Permissions individuelles détaillées :
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={canMakeSales}
                      onChange={(e) => setCanMakeSales(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Enregistrer des ventes (Caisse)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={canViewFinances}
                      onChange={(e) => setCanViewFinances(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      Consulter les finances (CA/Bénéfices)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={canEditStock}
                      onChange={(e) => setCanEditStock(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Modifier les stocks</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={canEditProducts}
                      onChange={(e) => setCanEditProducts(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Ajouter / modifier produits</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={canManageOrders}
                      onChange={(e) => setCanManageOrders(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Gérer les commandes</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={canViewCustomers}
                      onChange={(e) => setCanViewCustomers(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Consulter le fichier client</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md"
              >
                Enregistrer l'employé
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
