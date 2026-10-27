# La Pince — API

API Express + Sequelize (PostgreSQL) de l'application La Pince.

## Installation

```bash
npm install
cp .env.example .env   # puis remplir PG_URL et JWT_SECRET
npm run setup          # crée les tables manquantes + catégories système
npm start
```

## Scripts

| Script | Rôle |
|---|---|
| `npm start` | Lance l'API |
| `npm run dev` | Lance l'API avec rechargement automatique |
| `npm run setup` | `sync` + `seed` (à lancer au premier déploiement) |
| `npm run sync` | Crée les tables manquantes (ne modifie pas les tables existantes) |
| `npm run sync:alter` | Adapte les tables existantes aux modèles — **faire une sauvegarde avant** |
| `npm run seed` | Insère les catégories système et les modèles d'alertes |

## Routes principales

Toutes les routes sauf `/login` et `/register` attendent `Authorization: Bearer <token>`.
Chaque utilisateur n'accède qu'à ses propres données ; les routes d'administration exigent le rôle `admin`.

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

## Donner le rôle admin à un utilisateur

```sql
UPDATE utilisateur SET role = 'admin' WHERE email = 'vous@exemple.fr';
```
(l'utilisateur doit se reconnecter pour que son token contienne le rôle)
