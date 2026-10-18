# Journal DevOps — Delivery Management System

Fichier **journal** du parcours DevOps (notes de session, historique).

**Pour refaire les manipulations terminées (E0→E4) avec commandes + explications :**  
voir **[GUIDE_DEVOPS_E0_E4.md](GUIDE_DEVOPS_E0_E4.md)** (guide pratique dédié).

**État actuel :** E0–E5 terminés (Docker + CI GitHub Actions)

---

## Comment utiliser ce fichier

1. Suivre les étapes dans l’ordre (E0 → E10).
2. Copier-coller les commandes depuis ici.
3. Quand une étape est validée, cocher la case.
4. Ajouter tes propres notes en bas de chaque section.

---

## Prérequis machine (Windows)

| Outil | Usage |
|-------|--------|
| JDK 17+ | Build Maven des microservices |
| Node.js + npm | Frontend Next.js |
| Docker Desktop | Containers (E3+) |
| Git | Branches / PR / GitHub |
| (plus tard) Minikube, kubectl | Kubernetes (E7) |
| (plus tard) compte GitHub | CI/CD Actions (E5–E6) |
| (plus tard) AWS CLI / Terraform | Cloud (E9–E10) |

Vérifications rapides :

```powershell
java -version
node -v
npm -v
docker version
git --version
```

---

## Structure du projet (rappel)

```
delivery-management-system/
├── backend/          # 8 services Spring Boot
├── frontend/         # Next.js
├── docker/           # Fichiers Docker (MySQL init, etc.)
├── docs/             # Ce journal + secrets
├── scripts/          # build-all.ps1
└── .env.example      # Modèle de variables (E2)
```

Ports utiles :

| Service | Port |
|---------|------|
| Eureka (discovery) | 8761 |
| API Gateway | 8080 |
| auth-service | 8090 |
| user / client / courier / package | 8091–8094 |
| Frontend | 3000 |
| MySQL (Docker E3) | **3307** (host) → 3306 (container) |

---

## E0 — Hygiène monorepo

- [x] README racine
- [x] Inventaire secrets (`docs/SECRETS_INVENTORY.md`)
- [x] npm uniquement (suppression `pnpm-lock.yaml`)
- [x] Config Server hors scope

**Git (base) :**

```powershell
git status
git checkout -b devops/e0-hygiene
git add README.md docs/ .gitignore
git commit -m "docs: add DevOps E0 hygiene and secrets inventory"
# plus tard: git push -u origin HEAD
# puis ouvrir une Pull Request sur GitHub
```

---

## E1 — Build local

- [x] Script `scripts/build-all.ps1`
- [x] POMs corrigés (plugin / tests)
- [x] Build 8 JAR + frontend OK

```powershell
# Tout le monorepo (sans tests Spring / sans MySQL)
.\scripts\build-all.ps1

# Backend seulement
.\scripts\build-all.ps1 -SkipFrontend

# Un service
cd backend\discovery-server\discovery-server
.\mvnw.cmd -DskipTests package
```

---

## E2 — Config & secrets

- [x] Variables d’environnement (`JWT_SECRET`, `INTERNAL_API_KEY`, `MYSQL_*`, `EUREKA_URL`, …)
- [x] `.env.example`
- [x] Clé interne plus hardcodée
- [x] Gateway : `/internal/**` fermé (`denyAll`)

```powershell
copy .env.example .env
# Éditer JWT_SECRET et INTERNAL_API_KEY
# Spring ne charge pas .env tout seul → IDE / export / Docker Compose
```

Détail : [SECRETS_INVENTORY.md](SECRETS_INVENTORY.md)

---

## E3 — Docker (par sous-étapes)

### E3.1 — Docker Desktop

- [x] `docker run --rm hello-world` OK

```powershell
docker version
docker run --rm hello-world
```

### E3.2 — MySQL seul

- [x] `docker-compose.mysql.yml`
- [x] 5 bases créées (`authdb`, `userdb`, `clientdb`, `courierdb`, `package_db`)
- [x] Container `delivery-mysql` healthy

```powershell
# Démarrer
docker compose -f docker-compose.mysql.yml up -d

# Statut
docker compose -f docker-compose.mysql.yml ps
docker exec delivery-mysql mysql -uroot -proot -e "SHOW DATABASES;"

# Arrêter (garde les données)
docker compose -f docker-compose.mysql.yml down

# Arrêter + supprimer les données
docker compose -f docker-compose.mysql.yml down -v
```

Connexion host : `localhost:3307` / user `root` / password `root`

### E3.3 — discovery-server (Eureka) en Docker

- [x] JAR buildé en local
- [x] Dockerfile runtime (`amazoncorretto:17`)
- [x] Image `delivery/discovery-server:pilot`
- [x] Eureka UI sur http://localhost:8761 (HTTP 200)

```powershell
# 1) Build JAR
cd backend\discovery-server\discovery-server
.\mvnw.cmd -DskipTests package

# 2) Build image
docker build -t delivery/discovery-server:pilot .

# 3) Lancer (détaché)
docker run -d --name delivery-discovery -p 8761:8761 delivery/discovery-server:pilot

# 4) Vérifier
docker logs delivery-discovery
# Navigateur: http://localhost:8761

# Arrêter / supprimer
docker stop delivery-discovery
docker rm delivery-discovery
```

**Note :** on build le JAR sur Windows puis on le copie dans l’image → plus rapide et plus fiable que Maven dans Docker.

### E3.4 — auth-service en Docker

- [x] Dockerfile runtime + image `delivery/auth-service:pilot`
- [x] Réseau partagé `delivery-net` (alias `mysql`, `discovery-server`)
- [x] Connecté à MySQL (`authdb`) via `jdbc:mysql://mysql:3306/authdb`
- [x] Enregistré dans Eureka comme **AUTH-SERVICE** (UP)

```powershell
# Réseau commun (une seule fois)
docker network create delivery-net
docker network connect --alias mysql delivery-net delivery-mysql
docker network connect --alias discovery-server delivery-net delivery-discovery

# Build JAR + image
cd backend\auth-service\auth-service
.\mvnw.cmd -DskipTests package
docker build -t delivery/auth-service:pilot .

# Lancer auth
docker run -d --name delivery-auth `
  --network delivery-net `
  --network-alias auth-service `
  -p 8090:8090 `
  -e EUREKA_URL=http://discovery-server:8761/eureka/ `
  -e MYSQL_URL=jdbc:mysql://mysql:3306/authdb `
  -e MYSQL_USER=root `
  -e MYSQL_PASSWORD=root `
  -e JWT_SECRET=dev-only-change-me-before-docker `
  -e INTERNAL_API_KEY=dev-internal-key `
  -e USER_SERVICE_URL=http://user-service `
  delivery/auth-service:pilot

# Vérifier
docker logs delivery-auth
# Eureka UI: http://localhost:8761  → doit lister AUTH-SERVICE
# Auth:      http://localhost:8090

docker stop delivery-auth
docker rm delivery-auth
```

**Point clé E2→E3 :** sans variables d’env, auth chercherait `localhost` et échouerait dans Docker.

> **Note :** les commandes `docker run` de E3.3 / E3.4 restent utiles pour apprendre.  
> Au quotidien, préférer **E3.5 Compose** (ci-dessous).

### E3.5 — Compose pilote (MySQL + Eureka + auth) — FAIT

- [x] Fichier `docker-compose.pilot.yml`
- [x] Un seul réseau Compose `delivery-net` (DNS = noms de services : `mysql`, `discovery-server`, `auth-service`)
- [x] Healthcheck MySQL → auth démarre seulement quand MySQL est healthy
- [x] AUTH-SERVICE visible UP dans Eureka

**Prérequis :** JAR déjà compilés (Dockerfile = runtime only) :

```powershell
cd backend\discovery-server\discovery-server
.\mvnw.cmd -DskipTests package
cd ..\..\auth-service\auth-service
.\mvnw.cmd -DskipTests package
cd ..\..\..
```

**Lancer / contrôler / arrêter :**

```powershell
# Lancer (build images + start)
docker compose -f docker-compose.pilot.yml up --build -d

# Statut
docker compose -f docker-compose.pilot.yml ps

# Logs
docker compose -f docker-compose.pilot.yml logs -f auth-service
docker compose -f docker-compose.pilot.yml logs --tail 50 discovery-server

# Vérifications
# Eureka UI : http://localhost:8761  → AUTH-SERVICE
# Auth      : http://localhost:8090
# MySQL     : localhost:3307 (root / root)

# Arrêt (garde le volume MySQL)
docker compose -f docker-compose.pilot.yml down

# Arrêt + suppression des données MySQL du pilote
docker compose -f docker-compose.pilot.yml down -v
```

**Fichiers liés E3 :**

| Fichier | Rôle |
|---------|------|
| `docker-compose.pilot.yml` | Stack pilote complète (E3.5) |
| `docker-compose.mysql.yml` | MySQL seul (E3.2) — optionnel pour tests DB |
| `docker/mysql/init/01-databases.sql` | Création des 5 bases |
| `backend/discovery-server/discovery-server/Dockerfile` | Image Eureka |
| `backend/auth-service/auth-service/Dockerfile` | Image auth |

**Critères de validation E3 (tous OK) :**

1. `docker compose -f docker-compose.pilot.yml ps` → 3 containers up (MySQL healthy)
2. http://localhost:8761 répond
3. **AUTH-SERVICE** listé UP
4. Logs auth sans erreur JDBC MySQL

---

## E4 — Docker Compose stack complète — FAIT

Objectif atteint : MySQL + Eureka + 5 services métier + api-gateway + frontend Next.js  
(**config-server hors scope**).

- [x] `docker-compose.yml` (projet `delivery-full`)
- [x] Dockerfiles : user, client, courier, package, api-gateway, frontend
- [x] `next.config.mjs` → `output: "standalone"` (image frontend légère)
- [x] Tous les services UP dans Eureka
- [x] Gateway route vers auth (plus de 503 « Unable to find instance »)
- [x] Frontend HTTP 200 sur le port host **3010**

### Prérequis avant `compose up`

```powershell
# 1) JARs backend (Dockerfiles = runtime only)
.\scripts\build-all.ps1 -SkipFrontend

# 2) Ne pas avoir le pilote E3 en parallèle (mêmes ports / noms)
docker compose -f docker-compose.pilot.yml down
```

### Lancer / contrôler

```powershell
docker compose up --build -d
docker compose ps
docker compose logs -f api-gateway
docker compose logs --tail 50 auth-service

# Arrêt
docker compose down
# + données MySQL:
docker compose down -v
```

### URLs (host Windows)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:**3010** |
| API Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| MySQL | localhost:**3307** (root / root) |
| auth / user / client / courier / package | 8090–8094 |

### Validation E4

1. `docker compose ps` → 9 containers (mysql healthy + 7 JVM + frontend)
2. Eureka liste : AUTH, USER, CLIENT, COURIER, PACKAGE, API-GATEWAY
3. `POST http://localhost:8080/api/auth/login` → **pas** 503 (401/403 OK avec mauvais login)
4. http://localhost:3010 → page frontend

### Fichiers ajoutés / touchés en E4

| Fichier | Rôle |
|---------|------|
| `docker-compose.yml` | Stack complète |
| `backend/*/Dockerfile` | Images runtime JAR |
| `frontend/.../Dockerfile` | Next standalone |
| `frontend/.../next.config.mjs` | `output: "standalone"` |

### Pièges E4

1. **Ports 3000/3001 souvent pris** sur Windows → frontend mappé sur **3010**.
2. Après démarrage, attendre 1–2 min que Eureka enregistre tout ; un 503 gateway au tout début est normal → `docker compose restart api-gateway` si besoin.
3. `NEXT_PUBLIC_API_URL=http://localhost:8080` (navigateur = host, pas le nom Docker `api-gateway`).
4. Ne pas lancer `docker-compose.pilot.yml` et `docker-compose.yml` en même temps.

---

## E5 — GitHub Actions CI — FAIT

- [x] `.github/workflows/ci.yml`
- [x] Matrix Maven 8 services (`-DskipTests package`)
- [x] Job frontend (`npm ci` + `npm run build`)
- [x] Documenté dans `docs/GUIDE_DEVOPS_E0_E4.md`

```powershell
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI for backend matrix and frontend"
git push origin main
# Puis : GitHub → onglet Actions → workflow CI
```

Guide détaillé : [GUIDE_DEVOPS_E0_E4.md](GUIDE_DEVOPS_E0_E4.md) section E5.

---

## E6 — Images GHCR (à venir)

```powershell
# Login registry GitHub (exemple)
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
docker tag delivery/discovery-server:pilot ghcr.io/OWNER/discovery-server:sha
docker push ghcr.io/OWNER/discovery-server:sha
```

---

## E7 — Kubernetes / Minikube (à venir)

```powershell
minikube start
kubectl get nodes
kubectl apply -f k8s/
kubectl get pods -A
minikube service api-gateway
# ou: minikube tunnel
```

---

## E8 — Monitoring (à venir)

Prometheus + Grafana (Actuator `/actuator/prometheus`).

---

## E9–E10 — AWS + Terraform (facultatif, à venir)

ECS/RDS puis IaC Terraform — seulement après Minikube stable.

---

## Commandes Git utiles (tout le parcours)

```powershell
git status
git diff
git checkout -b devops/nom-etape
git add .
git commit -m "type: message court"
git push -u origin HEAD
gh pr create   # si GitHub CLI installé
```

Types de commit suggérés : `docs`, `build`, `ci`, `chore`, `fix`, `feat`.

---

## Pièges importants (à retenir)

1. **Port MySQL** : XAMPP = 3306 → Docker host = **3307**.
2. **`localhost` dans un container** = le container lui-même, pas ton PC ni MySQL. Utiliser les noms Compose (`mysql`, `discovery-server`).
3. **Secrets** : jamais committer `.env`.
4. **Gateway** : ne plus exposer `/internal/**`.
5. **Images Java** : sur cette machine, préférer `amazoncorretto:17` (évite certains bugs `eclipse-temurin` / exec format).
6. **Build Docker rapide** : JAR local + Dockerfile runtime (méthode E3.3).
7. **Compose vs `docker run`** : Compose crée le réseau et les DNS automatiquement (`mysql`, `discovery-server`). Plus besoin de `docker network connect` à la main.
8. **Ne pas lancer E3.2 / E3.5 / E4 en même temps** : même `delivery-mysql` et ports → conflit. Un seul compose à la fois.
9. **Volume MySQL** : `down` garde les données ; `down -v` les efface (les bases seront recréées au prochain `up` via le script init).
10. **Frontend host port** : utiliser **3010** si 3000/3001 sont déjà pris.

---

## Journal de session (notes libres)

| Date | Action | Résultat |
|------|--------|----------|
| 2026-10-17 | E0–E2 | OK |
| 2026-10-17 | E3.1 hello-world | OK |
| 2026-10-17 | E3.2 MySQL + 5 DB | OK |
| 2026-10-17 | E3.3 Eureka Docker | OK — http://localhost:8761 |
| 2026-10-17 | E3.4 auth Docker + réseau | OK — AUTH-SERVICE UP + MySQL |
| 2026-10-17 | E3.5 docker-compose.pilot.yml | OK — 3 services via Compose |
| 2026-10-17 | E4 docker-compose.yml full stack | OK — 9 containers, Eureka UP, FE :3010 |
| 2026-10-18 | E5 GitHub Actions ci.yml | Fichier créé — vert après push |
| | | |
