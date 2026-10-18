# Delivery Management System

Monorepo d’une application de gestion de livraison : **8 microservices Spring Boot** + **frontend Next.js**.

Ce dépôt est déjà sur GitHub. Parcours DevOps : **E0–E6** (CI + CD images GHCR).

**Guide pratique (E0→E6) :** [docs/GUIDE_DEVOPS_E0_E4.md](docs/GUIDE_DEVOPS_E0_E4.md)  
**Journal de session :** [docs/DEVOPS_JOURNEY.md](docs/DEVOPS_JOURNEY.md)

## Prérequis

| Outil | Version cible |
|-------|----------------|
| JDK | **17** |
| Maven | via **Maven Wrapper** (`mvnw` / `mvnw.cmd`) dans chaque service |
| Node.js | 18+ recommandé |
| npm | **outil officiel du frontend** (ne pas utiliser pnpm) |
| MySQL | 8.x (local) |

Plus tard (étapes Docker / K8s) : Docker Desktop, Minikube.

## Structure

```
delivery-management-system/
├── backend/
│   ├── discovery-server/discovery-server/   # Eureka
│   ├── config-server/config-server/         # Hors scope DevOps (voir ci-dessous)
│   ├── api-gateway/api-gateway/
│   ├── auth-service/auth-service/
│   ├── user-service/user-service/
│   ├── client-service/client-service/
│   ├── courier-service/courier-service/
│   └── package-service/package-service/
└── frontend/
    └── delivery-app-frontend/
```

Chaque service backend est un projet Maven autonome sous `backend/<nom>/<nom>/`.

## Ports

| Composant | Port | Rôle |
|-----------|------|------|
| discovery-server | **8761** | Service discovery (Eureka) |
| api-gateway | **8080** | Entrée API (frontend → gateway) |
| auth-service | **8090** | Authentification / JWT |
| user-service | **8091** | Utilisateurs |
| client-service | **8092** | Clients |
| courier-service | **8093** | Livreurs |
| package-service | **8094** | Colis |
| frontend (Next.js) | **3000** | UI (`npm run dev`) |
| config-server | 8888 | **Ne pas démarrer** (hors scope) |

## Bases de données MySQL

Créer ces bases avant de lancer les services métier :

| Base | Service |
|------|---------|
| `authdb` | auth-service |
| `userdb` | user-service |
| `clientdb` | client-service |
| `courierdb` | courier-service |
| `package_db` | package-service |

Par défaut local : `MYSQL_USER=root`, `MYSQL_PASSWORD=` vide. Surcharger via variables d’environnement (voir `.env.example`).

## Ordre de démarrage (local)

1. **MySQL** — bases listées ci-dessus  
2. **discovery-server** (Eureka) — `8761`  
3. Services métier (ordre flexible une fois Eureka up) :  
   `auth-service` → `user-service` → `client-service` → `courier-service` → `package-service`  
4. **api-gateway** — `8080`  
5. **frontend** — dans `frontend/delivery-app-frontend` :

```bash
npm ci
npm run dev
```

Le frontend appelle la gateway : `http://localhost:8080` (ou variable `NEXT_PUBLIC_API_URL`).

### Lancer un service backend (exemple)

```bash
cd backend/discovery-server/discovery-server
.\mvnw.cmd spring-boot:run
```

Sous Linux/macOS : `./mvnw spring-boot:run`.

## Config Server — hors scope

Le module `config-server` existe mais :

- aucun dossier de configs natif n’est présent ;
- aucun autre service ne s’y connecte (pas de client Config).

**Ne pas le démarrer** pour le parcours DevOps. La configuration sera externalisée via **variables d’environnement** (étape E2), puis ConfigMaps/Secrets Kubernetes plus tard.

## Git et contribution

| Règle | Détail |
|-------|--------|
| Branche principale | `main` (déjà sur `origin`) |
| Travail | branches `feature/<sujet>` ou `devops/<sujet>` |
| Intégration | Pull Request vers `main` |
| Secrets | ne jamais committer `.env`, mots de passe, JWT, clés API |

Voir aussi : [docs/SECRETS_INVENTORY.md](docs/SECRETS_INVENTORY.md).

## Frontend — npm uniquement

Utiliser **npm** + `package-lock.json`.  
Ne pas générer de `pnpm-lock.yaml` / `yarn.lock`.

## Build local (E1)

Compile les **8 services** Java et le **frontend** sans démarrer MySQL.

```powershell
.\scripts\build-all.ps1
```

Options :

```powershell
.\scripts\build-all.ps1 -SkipFrontend   # backend seulement
.\scripts\build-all.ps1 -SkipBackend    # frontend seulement
.\scripts\build-all.ps1 -RunTests       # inclut les tests (MySQL souvent requis)
```

Par défaut les tests Spring sont **skip** (`-DskipTests`) : ils chargent le contexte applicatif et tentent souvent de joindre MySQL.

Prérequis vérifiés pour E1 : **JDK 17+** (Java 21 OK), **Node.js** + **npm**.

## Configuration et secrets (E2)

Les services lisent la config via variables d’environnement (avec défauts locaux pour le dev).

```text
copy .env.example .env
# puis éditer JWT_SECRET, INTERNAL_API_KEY, MYSQL_*, etc.
```

Variables principales : `JWT_SECRET`, `INTERNAL_API_KEY`, `MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`, `EUREKA_URL`, `AUTH_SERVICE_URL`, `USER_SERVICE_URL`, `COURIER_SERVICE_URL`, `NEXT_PUBLIC_API_URL`.

Notes :

- Spring Boot ne charge **pas** `.env` tout seul : exporter les variables, les définir dans l’IDE, ou les passer via Docker Compose (E4).
- Les routes `/internal/**` ne sont **plus exposées** par l’api-gateway (appels service-à-service uniquement).
- Détail : [docs/SECRETS_INVENTORY.md](docs/SECRETS_INVENTORY.md).

## Docker (E3–E4)

Détail : [docs/DEVOPS_JOURNEY.md](docs/DEVOPS_JOURNEY.md).

### Stack complète (E4) — recommandée

```powershell
.\scripts\build-all.ps1 -SkipFrontend
docker compose up --build -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:**3010** |
| Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| MySQL | localhost:**3307** (root/root) |

Pilote E3 (3 services) : `docker compose -f docker-compose.pilot.yml up -d` — ne pas lancer en même temps que E4.

## Roadmap DevOps (rappel)

| Étape | Contenu |
|-------|---------|
| E0 | Hygiène, README, secrets inventoriés |
| E1 | Build local reproductible (8 JAR + Next) |
| E2 | Config / secrets en variables d’environnement |
| E3 | Docker pilote (MySQL + Eureka + auth) — **fait** |
| E4 | Docker Compose stack complète — **fait** |
| E5 | GitHub Actions CI — **fait** |
| E6 | CD images GHCR — **fait** (`.github/workflows/cd-images.yml` — à pousser) |
| **E7** | Kubernetes / Minikube |
| E7–E8 | Minikube puis monitoring |
| E9–E10 | AWS puis Terraform (facultatif) |

## Sécurité

- Ne jamais committer `.env`.
- En Docker / prod : toujours définir `JWT_SECRET` et `INTERNAL_API_KEY` (ne pas utiliser les défauts `dev-only-*`).
- Anciennes valeurs déjà poussées dans Git = considérées compromises → nouvelles valeurs hors dépôt.
