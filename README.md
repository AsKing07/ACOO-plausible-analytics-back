# ACOO Plausible Analytics Back

API Node.js/Express pour communiquer avec l'API Plausible Analytics v2.

## Sommaire

- [ACOO Plausible Analytics Back](#acoo-plausible-analytics-back)
  - [Sommaire](#sommaire)
  - [Description](#description)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Lancement](#lancement)
  - [Endpoints API](#endpoints-api)
    - [Principaux endpoints](#principaux-endpoints)
  - [Exemples de requêtes](#exemples-de-requêtes)
  - [Développement](#développement)
  - [Licence](#licence)

---

## Description

Ce projet fournit une API REST sécurisée pour interroger les statistiques de vos sites via [Plausible Analytics](https://plausible.io/docs/stats-api).  
Il gère l'authentification par clé API, la validation des paramètres, le cache, la documentation intégrée et la gestion des erreurs.

---

## Installation

1. **Cloner le dépôt :**
   ```bash
   git clone <url-du-repo>
   cd ACOO-plausible-analytics-back
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

---

## Configuration

1. **Créer un fichier `.env` à la racine du projet** (ou copier `.envexemple` puis le renommer en `.env`) :

   ```
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   PLAUSIBLE_BASE_URL=https://plausible.io
   PLAUSIBLE_API_VERSION=v2
   JWT_SECRET=mon_secret_jwt_super_securise
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   CACHE_TTL=300
   ```

2. **Obtenir une clé API Plausible** et l'utiliser dans les requêtes (header `Authorization`).

---

## Lancement

- **Développement (avec hot reload) :**
  ```bash
  npm run dev
  ```
- **Production :**
  ```bash
  npm start
  ```

L'API sera disponible sur [http://localhost:3001](http://localhost:3001).

---

## Endpoints API

La documentation interactive est disponible sur [http://localhost:3001/api/docs](http://localhost:3001/api/docs).

### Principaux endpoints

- **GET `/api/plausible/realtime`**  
  Obtenir le nombre de visiteurs en temps réel.  
  **Query :** `site_id`  
  **Header :** `Authorization: Bearer <API_KEY>`

- **GET `/api/plausible/timeseries`**  
  Obtenir les données de série temporelle.  
  **Query :** `site_id`, `period`, `metrics`, `dimensions`  
  **Header :** `Authorization: Bearer <API_KEY>`

- **GET `/api/plausible/breakdown`**  
  Obtenir les données de répartition (breakdown) par dimension.  
  **Query :** `site_id`, `period`, `metrics`, `dimensions`  
  **Header :** `Authorization: Bearer <API_KEY>`

- **GET `/api/plausible/aggregate`**  
  Obtenir les métriques agrégées.  
  **Query :** `site_id`, `period`, `metrics`, `compare`, `filters`  
  **Header :** `Authorization: Bearer <API_KEY>`

- **POST `/api/plausible/test-connection`**  
  Tester la connexion à l'API Plausible.  
  **Body :** `api_key`, `site_id`

---

## Exemples de requêtes

**Visiteurs en temps réel :**
```http
GET /api/plausible/realtime?site_id=monsite.com
Authorization: Bearer VOTRE_API_KEY
```

**Breakdown par pays :**
```http
GET /api/plausible/breakdown?site_id=monsite.com&period=7d&metrics=visitors&dimensions=visit:country
Authorization: Bearer VOTRE_API_KEY
```

**Timeseries par jour :**
```http
GET /api/plausible/timeseries?site_id=monsite.com&period=7d&metrics=visitors&dimensions=time:day
Authorization: Bearer VOTRE_API_KEY
```

---

## Développement

- **Lint :**  
  ```bash
  npm run lint
  ```
- **Tests unitaires :**  
  ```bash
  npm test
  ```

---

## Licence

MIT

---

**Auteur :** Charbel SONON