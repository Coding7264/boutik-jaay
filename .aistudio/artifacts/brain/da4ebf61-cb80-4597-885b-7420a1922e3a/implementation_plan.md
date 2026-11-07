# Dashboard Commerçant Jaay — Cockpit de Gestion Commerciale

Un centre de pilotage commercial unifié et professionnel pour les commerçants, détaillants et e-commerçants au Sénégal, synchronisant les ventes en magasin physique (POS), les commandes WhatsApp et la vitrine en ligne dans un environnement fluide et transactionnel.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Les choix d'architecture et d'expérience ont été arrêtés lors de la phase de clarification :
> - **Modèle de données & Persistance** : Moteur local-first conforme au schéma relationnel Supabase de Jaay (tables `stores`, `products`, `variants`, `categories`, `stock_movements`, `orders`, `sales`, `customers`, `suppliers`, `expenses`, `invoices`, `users_roles`), assurant une fluidité immédiate avec connecteur d'export/synchronisation Supabase.
> - **Canaux de vente unifiés** : Écran de caisse POS rapide, commandes WhatsApp avec message pré-formaté et suivi de commande, et gestion de la boutique en ligne publique.
> - **Densité visuelle "Commerce Cockpit"** : Interface de haute précision ergonomique, typographie avec chiffres tabulaires (`tabular-nums`), tarification en FCFA (XOF), et intégration native des flux de paiement sénégalais (Wave, Orange Money, Espèces, Paiement à crédit).

- **Décision 1 — Monnaie et formats régionaux** : Montants formatés en FCFA (`XOF`) sans décimales inutiles avec séparateur d'espace (`15 000 FCFA`), téléphones indicatifs Sénégal (+221), et intégration des flux de paiement Wave et Orange Money avec génération de reçus de caisse au format ticket thermique et A4.
- **Décision 2 — Isolation stricte des rôles (RBAC)** : Matrice de permissions active masquant automatiquement le chiffre d'affaires, les marges et les dépenses aux profils "Vendeur" et "Gestionnaire de stock", tout en déverrouillant la caisse et la recherche catalogue.
- **Décision 3 — Intégrité des mouvements de stock** : Aucune mise à jour de stock arbitraire ; chaque vente au comptoir, commande validée, retour client ou réception fournisseur émet une ligne immuable dans l'historique des mouvements avec motif et auteur.

---

## 1. Overview & Core Concept

- **Ce que fait le produit** : Jaay Dashboard permet au commerçant sénégalais de piloter l'intégralité de son entreprise au quotidien : enregistrer une vente en boutique en 10 secondes avec paiement Wave/Orange Money/Espèces, gérer le catalogue avec déclinaisons (tailles, couleurs), suivre les ruptures de stock, centraliser les commandes WhatsApp et du site web, enregistrer les dépenses d'exploitation, émettre des devis/factures proforma et mesurer son bénéfice net réel.
- **Public cible & Personas** :
  - *Commerçant / Détaillant physique* (Dakar, Touba, Saint-Louis, etc.) opérant une boutique de mode, cosmétique, électronique ou épicerie fine.
  - *Vendeur de comptoir* nécessitant une interface tactile ultra-rapide sans accès aux chiffres confidentiels du patron.
  - *E-commerçant Instagram/WhatsApp* convertissant des leads en commandes confirmées avec suivi de livraison.
- **Valeur clé** : Élimination des pertes de stock, centralisation des encaissements multi-canaux, traçabilité des employés et visibilité financière claire en temps réel.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Parcours Caisse Express (POS)** :
   Le vendeur recherche un produit par mot-clé, catégorie ou SKU -> sélectionne la variante (ex: Taille L, Couleur Noir) -> ajuste la quantité ou applique une remise autorisée -> sélectionne ou crée un client rapide (nom + téléphone WhatsApp) -> choisit le mode de paiement (Wave avec QR code/numéro, Orange Money, Espèces avec calcul du rendu de monnaie) -> valide la vente -> le stock est décrémenté instantanément et un ticket de caisse est généré (impression ou envoi WhatsApp en un clic).
2. **Parcours Commande WhatsApp & Boutique** :
   Réception d'une commande via la boutique en ligne ou message WhatsApp -> consultation de l'adresse et des articles demandés -> passage en "En préparation" -> validation de l'expédition -> notification client et encaissement sans double déduction de stock.
3. **Parcours Réception Fournisseur & Entrée Stock** :
   Sélection du fournisseur -> saisie des articles et quantités reçues -> mise à jour du prix d'achat et actualisation immédiate de la valeur du stock avec traçabilité complète.
4. **Parcours Factures & Devis B2B** :
   Création d'un devis numéroté avec le logo de l'entreprise -> envoi au client par PDF ou lien WhatsApp -> conversion en facture d'un clic lors de l'acceptation avec enregistrement des acomptes.

### Visual Identity & Theme

- **Direction esthétique** : "Modern Commerce Cockpit" — sobre, dense, hautement lisible, sans gadgets superflus ni dégradés criards, inspiré des meilleurs logiciels de caisse et ERP modernes.
- **Palette chromatique (Discipline 60-30-10)** :
  - *Canvas (60%)* : Fond neutre structuré (`bg-neutral-50` en mode clair, `bg-neutral-950` en mode sombre) pour une concentration maximale sur les données.
  - *Surfaces structurelles (30%)* : Panneaux et tables épurés avec bordures fines (`border-neutral-200 dark:border-neutral-800`), barres d'outils nettes, typographie contrastée.
  - *Accents de conversion (10%)* : Vert émeraude profond (`#059669` / `emerald-600`) pour les validations financières et statuts sains, bleu profond (`#2563EB`) pour les actions primaires, jaune ambré (`#D97706`) pour les alertes de stock faible, et touches distinctives Wave (cyan ciel `#00B2FE`) et Orange Money (`#FF7900`) pour la reconnaissance immédiate des moyens de paiement.
- **Typographie & Hiérarchie** :
  - Police d'affichage et d'interface : *Plus Jakarta Sans* / *DM Sans* pour une excellente lisibilité à toutes les densités.
  - Chiffres financiers et compteurs : *Monospace Tabular* (`tabular-nums font-mono`) pour garantir l'alignement vertical strict des prix en FCFA, des quantités et des SKU.
  - Zéro pilule statique inutile : les statuts et métadonnées utilisent des séparateurs typographiques discrets et des indicateurs sobres conformes aux règles anti-slop.

---

## 3. Key Product Decisions & Trade-Offs

### Décision 1 : Moteur Transactionnel de Stock & Historique Immuable
- *Approche retenue* : Aucune mutation directe de la colonne `quantity`. Toute modification passe obligatoirement par la création d'un enregistrement `StockMovement` (type: VENTE, ENTREE_ACHAT, SORTIE_PERTE, AJUSTEMENT_INVENTAIRE, RETOUR_CLIENT). La quantité actuelle d'un produit est toujours vérifiée et garantie atomique.
- *Pourquoi* : Évite les incohérences de caisse, permet les audits d'inventaire fiables et prévient les vols ou erreurs d'employés.
- *Alternatives écartées* : Mise à jour manuelle non auditée de la quantité dans la fiche produit.

### Décision 2 : Architecture Multi-Canaux Sans Doublons
- *Approche retenue* : Les commandes WhatsApp / Web ont un statut clair de réservation de stock. Lorsqu'une commande passe de "En attente" à "Confirmée/Livrée", la transition déduit le stock une seule fois sous le libellé de la commande, évitant la double déduction lors d'une validation caisse.
- *Pourquoi* : Problème classique des commerçants sénégalais qui vendent le même article simultanément en magasin et sur WhatsApp.

### Décision 3 : Gestion Hors-Ligne & Robustesse Réseau
- *Approche retenue* : Modèle local réactif avec persistance locale (`localStorage` + synchronisation par événements) calqué sur le schéma relationnel de Supabase. L'interface reste immédiatement opérationnelle même en cas de coupure de connexion (très fréquent sur les réseaux mobiles), avec une console de synchronisation et d'export.
- *Pourquoi* : Un commerçant ne peut pas voir sa caisse bloquée parce que la connexion 4G faiblit pendant l'encaissement d'un client pressé.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        JAAY COMMERCE COCKPIT                           │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐  │
│  │   SIDEBAR NAVIGATION │  │              TOP BAR                   │  │
│  │  - Dashboard Global  │  │  [Boutique Active] · [Rôle Actuel]     │  │
│  │  - Caisse POS        │  │  [Recherche rapide / Alerts]           │  │
│  │  - Commandes Unifiées│  └────────────────────────────────────────┘  │
│  │  - Catalogue Produit │                                              │
│  │  - Stock & Mouvements│  ┌────────────────────────────────────────┐  │
│  │  - Clients (CRM)     │  │          ACTIVE VIEW VIEWPORT          │  │
│  │  - Fournisseurs      │  │                                        │  │
│  │  - Dépenses          │  │  [Dashboard KPI] ou [Caisse POS] ou    │  │
│  │  - Devis & Factures  │  │  [Produits] ou [Commandes] ou          │  │
│  │  - Ma Boutique Web   │  │  [Stock] ou [Stats] ou [Paramètres]    │  │
│  │  - Rapports & Stats  │  │                                        │  │
│  │  - Employés & Droits │  └────────────────────────────────────────┘  │
│  │  - Paramètres        │                                              │
│  └──────────────────────┘                                              │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   COMMERCE REPOSITORY & ENGINE                         │
│                                                                        │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────────┐ │
│  │  Products & Stock  │  │  Sales & Checkout  │  │ Orders & WhatsApp │ │
│  │  - Variant Matrix  │  │  - Split Payment   │  │ - Status Pipeline │ │
│  │  - Stock Movements │  │  - Wave / OM / Cash│  │ - WhatsApp Direct │ │
│  │  - Threshold Alerts│  │  - Receipt Print   │  │ - Address & Phone │ │
│  └────────────────────┘  └────────────────────┘  └───────────────────┘ │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────────┐ │
│  │  CRM & Suppliers   │  │ Finance & Invoices │  │  RBAC & Security  │ │
│  │  - Client History  │  │  - Inflow/Outflow  │  │ - Role Switcher   │ │
│  │  - Supplier Debts  │  │  - Margin / Profit │  │ - Permission Mask │ │
│  │  - Procurement     │  │  - PDF & WA Share  │  │ - Audit Logging   │ │
│  └────────────────────┘  └────────────────────┘  └───────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│         PERSISTENCE LAYER (SUPABASE SCHEMA COMPLIANT)                  │
│   Stores · Products · Categories · Variants · Movements · Sales ·      │
│   Orders · Customers · Suppliers · Expenses · Invoices · TeamMembers   │
└────────────────────────────────────────────────────────────────────────┘
```

### Modules Détaillés & Fonctionnalités Réalisées

1. **Tableau de Bord & KPIs Temps Réel** :
   - 10 métriques obligatoires : CA du jour, CA du mois, total ventes, commandes reçues, bénéfice estimé, nb produits, valeur du stock, nb clients, dépenses du mois, commandes en attente.
   - Filtres temporels : Aujourd'hui, Hier, Cette semaine, Ce mois, Mois dernier, Période personnalisée.
   - Graphique interactif de ventes et revenus en FCFA, top des ventes, alertes de réapprovisionnement, flux d'activité récent.
2. **Gestion Complète du Catalogue (Produits & Catégories)** :
   - Création/édition complète : nom, description, catégorie, SKU, code-barres, prix d'achat, prix de vente, prix promo, gestion des variantes (Taille, Couleur, Modèle), seuil d'alerte, publication boutique.
   - Système de recherche instantanée, filtrage par catégorie/statut de stock et pagination fluide.
3. **Moteur de Stock & Inventaire** :
   - Mouvements typés (Entrée, Sortie, Ajustement inventaire, Vente, Retour), motif obligatoire, traçabilité par utilisateur.
   - Liste des produits en rupture et stock faible, valorisation financière globale du stock au prix d'achat et au prix de vente.
4. **Caisse Enregistreuse POS Physique** :
   - Grille de produits rapide avec recherche et filtres par catégorie.
   - Panier dynamique : modification quantités, remises (montant ou pourcentage), sélection/création client à la volée.
   - Modes de règlement : Espèces (calculatrice de rendu automatique), Wave (génération de lien/numéro), Orange Money, Carte Bancaire, Paiement à Crédit (assigné au compte client).
   - Validation transactionnelle avec déduction de stock et ticket de caisse imprimable ou partagé sur WhatsApp.
5. **Gestion Centralisée des Commandes** :
   - Centralisation des commandes e-commerce, WhatsApp et manuelles avec numéro unique (ex: `CMD-2026-084`).
   - Pipeline de statut : En attente -> Confirmée -> En préparation -> Prête -> Expédiée -> Livrée -> Annulée -> Remboursée.
   - Bouton de discussion directe WhatsApp avec message pré-rempli pour le livreur et le client.
6. **CRM Clients & Fournisseurs** :
   - Fiches clients avec total dépensé, panier moyen, historique d'achats, solde crédit et notes internes.
   - Fiches fournisseurs avec bons de commande, réceptions de marchandises mettant à jour le stock et solde dû.
7. **Gestion des Dépenses & Bilan Financier** :
   - Enregistrement des dépenses par catégorie (Loyer, Électricité/Senelec, Transport/Car rapide, Livraison, Salaires, etc.).
   - Calcul de la marge nette réelle : Chiffre d'Affaires - Coût des marchandises vendues - Dépenses opérationnelles.
8. **Devis & Factures Professionnels** :
   - Éditeur de devis et factures numérotés (`FAC-2026-001`, `DEV-2026-001`) avec logo, coordonnées client, tableau d'articles, TVA/remise et acomptes.
   - Transformation d'un devis en facture en un clic, impression propre et partage WhatsApp direct.
9. **Gestion de la Boutique Publique en Ligne** :
   - Paramétrage de la vitrine marchande : nom, logo, bannière, slogan, horaires, options de livraison (Dakar express, Banlieue, Régions), numéro WhatsApp marchand.
   - Prévisualisation directe de la boutique publique avec lien partageable.
10. **Gestion des Employés & Rôles (RBAC)** :
    - Rôles : Propriétaire, Admin boutique, Gestionnaire, Vendeur, Gestionnaire de stock.
    - Sélecteur de simulation de rôle dans le cockpit pour tester immédiatement le masquage des finances pour le profil Vendeur.
11. **Centre de Notifications & Paramètres** :
    - Alertes de rupture de stock, nouvelles commandes, suivi d'activité et configuration générale de la boutique.
