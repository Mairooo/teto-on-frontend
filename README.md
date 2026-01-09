# 🎵 Teto-on UTAU Editor

Plateforme de création et partage de compositions musicales UTAU.

**Stack** : Angular 19 + Directus 11 + Meilisearch

## 🚀 Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configurer le .env
```

### Frontend

```bash
cd frontend
npm install
```

## ▶️ Lancement

```bash
# Terminal 1 - Meilisearch
cd backend && ./meilisearch --master-key="dev-meilisearch-key-123"

# Terminal 2 - Directus
cd backend && npx directus start

# Terminal 3 - Angular
cd frontend && npm start
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| API Directus | http://localhost:8055 |
| Admin Directus | http://localhost:8055/admin |

## 📁 Structure

```
mon-projet-utau/
├── backend/
│   ├── extensions/
│   │   ├── like-manager/        # Toggle like/unlike
│   │   ├── voicebank-api/       # Extraction audio ZIP
│   │   ├── search/              # Recherche Meilisearch
│   │   ├── search-setup/        # Config Meilisearch
│   │   ├── notifications-api/   # Notifications utilisateur
│   │   ├── oauth/               # OAuth GitHub
│   │   └── meilisearch-sync/    # Sync auto
│   ├── migrations/
│   ├── uploads/
│   ├── data.db                  # Base SQLite
│   └── .env.example
│
└── frontend/
    └── src/app/
        ├── pages/
        │   ├── auth/            # Login/Register
        │   ├── home/            # Accueil
        │   ├── composer/        # Éditeur composition
        │   ├── search-results/  # Résultats recherche
        │   ├── project-detail/  # Détail projet
        │   ├── project-edit/    # Édition projet
        │   ├── profile/         # Profil utilisateur
        │   └── settings/        # Paramètres
        └── shared/
            ├── components/      # Composants réutilisables
            ├── services/        # Services API
            ├── guards/          # Auth guards
            ├── interceptors/    # HTTP interceptors
            ├── models/          # Modèles données
            └── interfaces/      # Types TypeScript
```

## ✨ Fonctionnalités

- **Compositions** : Création, édition, publication de projets musicaux
- **Recherche** : Full-text avec Meilisearch, filtres par tags/voicebanks
- **Social** : Likes, compteur de lectures, notifications
- **Auth** : JWT + OAuth GitHub
- **Temps réel** : WebSocket pour mises à jour en direct

## 👤 Auteur

Maïro Febourg - Janvier 2026
