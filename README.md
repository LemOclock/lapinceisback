# La Pince — API

> Application web gratuite de gestion de budget personnel, pensée pour celles et ceux qui ne sont pas experts en finance.

🌐 **Démo en ligne : [lapince.belema.uk](https://lapince.belema.uk)**
🎨 Front-end : [LemOclock/lapinceisfront](https://github.com/LemOclock/lapinceisfront)

Ce dépôt contient l'**API REST** de La Pince : authentification, comptes, opérations, catégories, budgets et alertes de dépassement.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Modèle de données](#modèle-de-données)
- [Installation en local](#installation-en-local)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts](#scripts)
- [Routes principales](#routes-principales)
- [Sécurité](#sécurité)
- [Déploiement](#déploiement)
- [Équipe](#équipe)

## Fonctionnalités

- **Comptes utilisateurs** : inscription, connexion par token JWT, modification du profil et du mot de passe, suppression du compte.
- **Compte bancaire** : banque, devise, solde initial et calcul du **solde courant** à partir des opérations.
- **Opérations** : revenus et dépenses avec catégorie, moyen de paiement, date et image facultative (Cloudinary). Filtrage par mois ou par jour.
- **Catégories** : 36 catégories système de revenus et de dépenses, créées automatiquement au démarrage.
- **Budgets** : un plafond mensuel par catégorie, avec le montant dépensé et le pourcentage consommé.
- **Alertes** : notifications à 50 %, 80 % et 100 % du budget.
- **Administration** : routes réservées au rôle `admin`.

## Stack technique

| Domaine | Outils |
|---|---|
| Serveur | Node.js 22, Express 5 |
| Base de données | PostgreSQL 17, ORM Sequelize 6 |
| Authentification | JWT (`jsonwebtoken`), mots de passe hachés avec `bcrypt` |
| Sécurité | `helmet`, `express-rate-limit`, `cors`, `validator` |
| Fichiers | `multer` + Cloudinary (facultatif) |
| Déploiement | Docker, Docker Compose, Nginx, Cloudflare Tunnel |

## Architecture

```
lapinceisback/
├── index.js              # Point d'entrée : Express, helmet, CORS, routeur
├── sync.js               # Crée les tables manquantes
├── seed.js               # Insère les catégories et modèles d'alertes
├── app/
│   ├── config/           # Lecture des variables d'environnement, Cloudinary
│   ├── database.js       # Connexion Sequelize
│   ├── models/           # Utilisateur, Compte, Operation, Categorie, Budget, Alerte
│   ├── controllers/      # Logique métier de chaque ressource
│   ├── routes/           # Définition des routes par ressource
│   ├── router.js         # Routeur principal (/login, /register, sous-routeurs)
│   ├── middlewares/      # isLogged, isAdmin, rateLimit, upload, validateId, errorHandler
│   └── utils/            # Validation, vérification de propriété, dates
├── deploy/               # Docker Compose de production + guide de déploiement
└── Dockerfile
```

En production, le site et l'API sont servis sur le même domaine :

```
Visiteur ──HTTPS──> Cloudflare ──tunnel──> web (Nginx : site React)
                                             └── /api/* ──> api (Express)
                                                             └──> db (PostgreSQL, réseau interne)
```

## Modèle de données

```
Utilisateur 1───1 Compte 1───n Operation n───1 Categorie
                     │                              │
                     └──1───n Budget n──────────────┘
                                │
                                1───n Alerte
```

- Un **utilisateur** possède un **compte**.
- Un compte regroupe des **opérations** et des **budgets**, chacun rattaché à une **catégorie**.
- Un budget peut déclencher des **alertes**.

## Installation en local

Prérequis : Node.js ≥ 20 et PostgreSQL.

```bash
git clone https://github.com/LemOclock/lapinceisback.git
cd lapinceisback
npm install
cp .env.example .env   # puis remplir PG_URL et JWT_SECRET
npm run setup          # crée les tables manquantes + catégories système
npm run dev            # API sur http://localhost:3000
```

Pour brancher le front en local, voir le [README du front](https://github.com/LemOclock/lapinceisfront#installation-en-local).

## Variables d'environnement

| Variable | Rôle | Exemple |
|---|---|---|
| `PG_URL` | Connexion PostgreSQL | `postgres://lapince:mdp@localhost:5432/lapince` |
| `JWT_SECRET` | Secret de signature des tokens (≥ 32 caractères aléatoires) | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Durée de validité d'un token | `1h` |
| `PORT` | Port de l'API | `3000` |
| `TRUST_PROXY` | Nombre de reverse proxies devant l'API | `1` en local, `2` en production |
| `CORS_ORIGIN` | Origines autorisées, séparées par des virgules (vide si même domaine) | `http://localhost:1234` |
| `CLOUDINARY_*` | Images des opérations (facultatif) | |
| `DB_LOGGING` | Afficher les requêtes SQL | `false` |

## Scripts

| Script | Rôle |
|---|---|
| `npm start` | Lance l'API |
| `npm run dev` | Lance l'API avec rechargement automatique |
| `npm run setup` | `sync` + `seed` (à lancer au premier déploiement) |
| `npm run sync` | Crée les tables manquantes (ne modifie pas les tables existantes) |
| `npm run sync:alter` | Adapte les tables existantes aux modèles. **Faire une sauvegarde avant.** |
| `npm run seed` | Insère les catégories système et les modèles d'alertes |

## Routes principales

Toutes les routes sauf `/login` et `/register` attendent `Authorization: Bearer <token>`.
Chaque utilisateur n'accède qu'à ses propres données. Les routes d'administration exigent le rôle `admin`.

| Méthode | Route | Description |
|---|---|---|
| POST | `/login`, `/register` | Authentification (limitée à 10 essais / 15 min / IP) |
| GET/PUT/DELETE | `/utilisateurs/me` | Profil de l'utilisateur connecté |
| PUT | `/utilisateurs/me/password` | Changement de mot de passe |
| POST | `/comptes` | Création du compte bancaire |
| GET | `/comptes/getcomptebyuserid` | Compte de l'utilisateur (avec `solde_courant`) |
| GET | `/categories` | Catégories (`type_categorie` : revenu / depense) |
| GET/POST | `/budgets/user`, `/budgets` | Budgets (avec `depense` et `pourcentage`) |
| PUT/DELETE | `/budgets/:id` | Modification / suppression d'un budget |
| GET/POST | `/operations/account` | Opérations de l'utilisateur |
| GET | `/operations/account/month?month=&year=` | Opérations d'un mois |
| GET | `/operations/account/getoperationbydate?date_operation=AAAA-MM-JJ` | Opérations d'un jour |
| PUT/DELETE | `/operations/account/:id` | Modification / suppression |
| GET | `/operations/budget?budget=:id` | Dépenses rattachées à un budget |

## Sécurité

- Mots de passe hachés avec **bcrypt**. Politique imposée : 12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.
- **Limite de tentatives** sur la connexion et l'inscription (anti brute-force), basée sur l'IP réelle du visiteur (`TRUST_PROXY`).
- **Contrôle de propriété** sur chaque ressource : un utilisateur ne peut ni lire ni modifier les données d'un autre.
- Validation systématique des entrées (`validator`) et requêtes paramétrées via Sequelize (pas d'injection SQL).
- En-têtes de sécurité avec **helmet**.
- En production, l'API tourne dans un conteneur **non-root** et la base de données sur un réseau Docker **interne**, sans accès à Internet.

## Déploiement

L'application complète (base de données, API et front) se déploie avec Docker Compose. Toutes les étapes sont décrites dans **[deploy/DEPLOY.md](deploy/DEPLOY.md)** :

```bash
cd deploy
cp .env.example .env   # puis générer les secrets
docker compose up -d --build
```

Donner le rôle admin à un utilisateur (il doit se reconnecter ensuite) :

```bash
docker compose exec db psql -U lapince -d lapince -c "UPDATE utilisateur SET role='admin' WHERE email='vous@exemple.fr';"
```

## Équipe

Projet de fin de formation réalisé en équipe :

| Rôle | Nom |
|---|---|
| Product Owner | Benoit |
| Scrum Master | Elyes |
| Lead dev back | Isahia |
| Lead dev front | Andy |
