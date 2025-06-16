
## Instructions d'installation et d'utilisation

### Installation

```bash
# Cloner ou créer le projet
mkdir plausible-api-express
cd plausible-api-express

# Initialiser le projet
npm init -y

# Installer les dépendances
npm install express cors helmet express-rate-limit dotenv axios joi jsonwebtoken node-cache

# Installer les dépendances de développement
npm install --save-dev nodemon jest supertest eslint

# Créer la structure des dossiers
mkdir -p routes controllers services middleware validators utils logs public

# Créer le fichier .env
touch .env
```

### Configuration .env

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
PLAUSIBLE_BASE_URL=https://plausible.io
PLAUSIBLE_API_VERSION=v2
JWT_SECRET=votre_secret_jwt_super_securise
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CACHE_TTL=300
```

### Utilisation

```bash
# Démarrer en mode développement
npm run dev

# Démarrer en mode production
npm start

# Tester l'API
curl -X GET "http://localhost:3000/api/plausible/realtime?site_id=example.com" \
  -H "Authorization: Bearer VOTRE_CLE_API_PLAUSIBLE"
```

### Endpoints disponibles

- `GET /api/plausible/realtime?site_id=example.com` - Visiteurs en temps réel
- `GET /api/plausible/timeseries?site_id=example.com&period=7d` - Données temporelles
- `GET /api/plausible/breakdown/visit:source?site_id=example.com` - Répartition par source
- `GET /api/plausible/aggregate?site_id=example.com` - Métriques agrégées
- `POST /api/plausible/test-connection` - Test de connexion