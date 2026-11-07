import React, { useState } from 'react';
import {
  Receipt,
  Check,
  ShieldCheck,
  Zap,
  CreditCard,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { formatFCFA } from '../../utils/formatters';

export const SubscriptionView: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<'STARTER' | 'PRO'>('STARTER');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plans = [
    {
      id: 'FREE',
      name: 'Gratuit',
      priceMonthly: 0,
      priceAnnual: 0,
      tag: 'Découverte',
      features: [
        '1 boutique en ligne',
        'Jusqu’à 15 produits',
        'Commandes WhatsApp de base',
        'Support standard par email',
      ],
      isCurrent: false,
    },
    {
      id: 'STARTER',
      name: 'Starter',
      priceMonthly: 15000,
      priceAnnual: 150000,
      tag: 'Plan Actuel',
      badge: 'Recommandé',
      features: [
        '3 boutiques en ligne',
        'Produits & Catégories illimités',
        'Synchronisation WhatsApp & Wave direct',
        'Caisse enregistreuse POS & Reçus',
        'Gestion de stock avec alertes de rupture',
        'Support prioritaire WhatsApp Sénégal',
      ],
      isCurrent: true,
    },
    {
      id: 'PRO',
      name: 'Pro Entreprise',
      priceMonthly: 30000,
      priceAnnual: 300000,
      tag: 'Commerce & Gros',
      features: [
        'Boutiques & Utilisateurs illimités',
        'Nom de domaine personnalisé (.sn ou .com)',
        'Gestion multi-caisses & Vendeurs',
        'Facturation & Devis professionnels',
        'Accès anticipé aux produits gagnants',
        'Gestionnaire de compte dédié à Dakar',
      ],
      isCurrent: false,
    },
  ];

  return (
    <div className="p-3.5 sm:p-6 max-w-4xl mx-auto space-y-6 text-xs">
      {/* Header */}
      <div className="border-b border-neutral-200/80 pb-4 dark:border-neutral-800">
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
          <Receipt className="h-6 w-6 text-blue-600" />
          <span>Abonnement & Facturation Jaay</span>
        </h1>
        <p className="text-neutral-500 mt-1">
          Gérez votre forfait, vos factures et les moyens de paiement de votre abonnement
        </p>
      </div>

      {/* Current Plan Overview Card */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 dark:border-blue-900/60 dark:from-blue-950/30 dark:to-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Votre formule active
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white">
            Jaay Starter — 15 000 FCFA / mois
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300">
            Prochain renouvellement automatique le <strong>31 Décembre 2025</strong> via Wave (+221 77 845 12 90).
          </p>
        </div>

        <button
          onClick={() => setShowPaymentModal(true)}
          className="rounded-xl bg-blue-600 px-4 py-2.5 font-bold text-white hover:bg-blue-700 shadow-sm transition-all active:scale-95 shrink-0 self-start sm:self-auto min-h-[40px]"
        >
          Gérer le paiement
        </button>
      </div>

      {/* Pricing Comparison */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
          Changer de formule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const price = billingCycle === 'MONTHLY' ? p.priceMonthly : p.priceAnnual;

            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-white dark:bg-neutral-900 transition-all ${
                  p.isCurrent
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md dark:border-blue-500'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-base text-neutral-900 dark:text-white">
                      {p.name}
                    </h4>
                    {p.isCurrent ? (
                      <span className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                        Actuel
                      </span>
                    ) : p.badge ? (
                      <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                        {p.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="py-1">
                    <span className="text-2xl font-black text-neutral-900 dark:text-white">
                      {price === 0 ? '0 FCFA' : formatFCFA(price)}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {price === 0 ? ' pour toujours' : ' / mois'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    {p.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-[11px] text-neutral-600 dark:text-neutral-300">
                        <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {p.isCurrent ? (
                    <button
                      disabled
                      className="w-full rounded-xl bg-neutral-100 py-2.5 font-bold text-neutral-500 dark:bg-neutral-800 min-h-[38px]"
                    >
                      Formule Actuelle
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full rounded-xl bg-neutral-900 py-2.5 font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-colors active:scale-95 min-h-[38px]"
                    >
                      {p.priceMonthly === 0 ? 'Rétrograder' : 'Passer à cette formule'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-2 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Règlement de l'abonnement
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-neutral-400">
                ✕
              </button>
            </div>

            <p className="text-neutral-600 dark:text-neutral-300">
              Payez votre forfait Jaay instantanément par Wave ou Orange Money :
            </p>

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-900/60 dark:bg-blue-950/30 space-y-2">
              <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-300">
                <span>Wave Marchand Jaay</span>
                <span className="font-mono text-sm">77 845 12 90</span>
              </div>
              <p className="text-[10px] text-neutral-500">
                Indiquez votre email « gueyehenri8@gmail.com » en référence de virement Wave.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                <span>Orange Money Marchand</span>
                <span className="font-mono text-sm">78 234 56 78</span>
              </div>
              <p className="text-[10px] text-neutral-500">
                Code marchand : <strong>JAAY-SN</strong>
              </p>
            </div>

            <button
              onClick={() => {
                alert('Votre confirmation de paiement a été transmise avec succès !');
                setShowPaymentModal(false);
              }}
              className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700"
            >
              J'ai effectué le virement
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
