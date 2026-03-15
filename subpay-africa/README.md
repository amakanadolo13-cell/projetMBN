# SubPay Africa 🌍

**Application mobile de paiement d'abonnements numériques en Afrique Centrale**

Payez Netflix, Spotify, Apple Music et PSN avec votre Mobile Money local (Orange Money, MTN MoMo, Airtel Money, etc.) et recevez votre code d'activation en moins de 30 secondes.

---

## Pays Supportés

| Pays | Opérateurs |
|------|-----------|
| 🇨🇲 Cameroun | MTN Mobile Money, Orange Money |
| 🇨🇩 Congo RDC | Orange Money DRC, Airtel Money |
| 🇨🇬 Congo-Brazzaville | Airtel Money, MTN MoMo |
| 🇬🇦 Gabon | Airtel Money, Moov Money |
| 🇧🇫 Burkina Faso | Orange Money, Moov Money, Coris Money |

## Services Disponibles

| Service | Plans |
|---------|-------|
| 🎬 Netflix | Standard ($15.49), Premium ($22.99) |
| 🎵 Spotify | Premium 1 mois ($9.99), 3 mois ($29.97) |
| 🎶 Apple Music | 1 mois ($10.99), iTunes $25 |
| 🎮 PlayStation | PSN $10, PSN $20 |

---

## Architecture

```
subpay-africa/
├── backend/          # Node.js + Express + TypeScript
│   ├── prisma/       # Schéma PostgreSQL
│   └── src/
│       ├── config/   # Database, Redis, Countries
│       ├── controllers/  # Auth, Orders, Webhooks
│       ├── routes/       # API routes
│       └── services/
│           ├── payments/     # Orange Money, MTN MoMo, Airtel
│           └── subscriptions/ # Reloadly, Catalog
├── mobile/           # React Native + Expo
│   └── src/
│       ├── screens/  # Splash, Onboarding, Auth, Home, Catalog, Payment, Orders, Profile
│       ├── store/    # Redux Toolkit
│       ├── navigation/ # React Navigation
│       ├── services/ # API, Socket
│       ├── components/ # UI réutilisables
│       └── theme/    # Design System 2026
├── docs/
│   ├── market-analysis.md     # Analyse marché Afrique Centrale
│   └── api-integration-guide.md # Guide APIs paiement
└── docker-compose.yml
```

---

## Flux de Paiement (< 30 secondes)

```
1. Utilisateur sélectionne un abonnement
2. Choisit son opérateur (Orange/MTN/Airtel)
3. Saisit son numéro Mobile Money
4. Reçoit un USSD push → entre son PIN
5. Paiement confirmé par webhook
6. Reloadly génère le code instantanément
7. App affiche le code + bouton "Ouvrir Netflix/Spotify..."
8. Deep link → App concernée pour activer
```

---

## Installation

### Prérequis
- Node.js 20+
- Docker & Docker Compose
- Expo CLI

### Backend

```bash
cd backend

# Copier le fichier de config
cp .env.example .env
# Remplir les clés API dans .env

# Démarrer PostgreSQL + Redis
docker-compose up postgres redis -d

# Installer les dépendances
npm install

# Migrer la base de données
npm run db:migrate

# Démarrer le serveur
npm run dev
```

Le serveur démarre sur http://localhost:3000

### Mobile

```bash
cd mobile

# Installer les dépendances
npm install

# Démarrer l'app
npx expo start
```

Scanner le QR code avec l'app Expo Go sur votre téléphone.

### Docker (tout en un)

```bash
# À la racine du projet
docker-compose up --build
```

---

## APIs de Paiement — Configuration

### Orange Money
1. Créer un compte développeur sur developer.orange.com
2. Créer une application et obtenir les clés
3. Configurer `ORANGE_CLIENT_ID_CM` et `ORANGE_CLIENT_SECRET_CM` dans `.env`

### MTN Mobile Money
1. S'inscrire sur momodeveloper.mtn.com
2. S'abonner à l'API Collection
3. Configurer `MTN_SUBSCRIPTION_KEY_COLLECTION_CM`, `MTN_API_USER_CM`, `MTN_API_KEY_CM`

### Airtel Money
1. Demander un accès sur openapi.airtel.africa
2. Configurer `AIRTEL_CLIENT_ID` et `AIRTEL_CLIENT_SECRET`

### Reloadly (Codes d'activation)
1. Créer un compte sur reloadly.com
2. Copier les clés API
3. Configurer `RELOADLY_CLIENT_ID` et `RELOADLY_CLIENT_SECRET`

---

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| POST | /api/auth/refresh | Refresh token |
| GET | /api/auth/me | Profil utilisateur |
| GET | /api/orders/catalog | Catalogue produits |
| POST | /api/orders | Créer une commande |
| GET | /api/orders | Liste des commandes |
| GET | /api/orders/:id | Détail commande |
| POST | /api/webhooks/orange | Webhook Orange Money |
| POST | /api/webhooks/mtn | Webhook MTN MoMo |
| POST | /api/webhooks/airtel | Webhook Airtel Money |

---

## UI/UX Design System

- **Dark mode** activé par défaut (toggle dans le profil)
- **Glassmorphism** sur les cards avec BlurView
- **Animations** React Native Reanimated 3 (spring physics, fade, zoom)
- **Gradients** violet/bleu pour dark, blanc/lavande pour light
- **Deep links** directs vers Spotify, Netflix, Apple Music, PSN

---

## Licence

Propriétaire — SubPay Africa © 2026
