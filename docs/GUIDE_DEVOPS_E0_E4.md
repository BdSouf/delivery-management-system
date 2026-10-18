# Guide pratique DevOps — Étapes terminées (E0 → E6)

Ce guide te permet de **refaire toi-même** tout ce qui a déjà été réalisé sur le monorepo *Delivery Management System*.

**Uniquement les étapes terminées.** Pas de Kubernetes / AWS encore.

| Étape | Titre | Statut |
|-------|--------|--------|
| E0 | Hygiène monorepo & documentation | Terminée |
| E1 | Build local reproductible | Terminée |
| E2 | Configuration & secrets | Terminée |
| E3 | Docker pilote (MySQL + Eureka + auth) | Terminée |
| E4 | Docker Compose stack complète | Terminée |
| E5 | GitHub Actions CI | Terminée |
| E6 | CD images → GHCR | Terminée (workflow créé — à pousser manuellement) |

---

## Comment utiliser ce guide

1. Ouvre PowerShell à la **racine** du repo :
   ```powershell
   cd C:\Users\DELL\Desktop\devoops\gestion_Liv_colis_production\delivery-management-system
   ```
2. Suis les étapes **dans l’ordre** (E0 → E4).
3. Pour chaque commande : lis **À quoi ça sert**, puis exécute-la.
4. Valide avec la checklist avant de passer à la suite.

---

## Prérequis machine (Windows)

| Outil | Rôle |
|-------|------|
| JDK 17+ (Java 21 OK) | Compiler les microservices Spring Boot |
| Node.js + **npm** | Build / run du frontend Next.js |
| Docker Desktop | Containers (à partir de E3) |
| Git | Voir l’état du dépôt |

### Vérifier les outils

```powershell
java -version
node -v
npm -v
git --version
docker version
```

| Commande | Explication |
|----------|-------------|
| `java -version` | Vérifie que le JDK est installé |
| `node -v` / `npm -v` | Vérifie Node et npm |
| `docker version` | Vérifie client **et** serveur Docker (Desktop doit être démarré) |

---

## Architecture (rappel)

```
Navigateur
    │
    ▼
Frontend Next.js (:3010 en Docker)
    │
    ▼
API Gateway (:8080)
    │
    ├── auth-service     (:8090)  → MySQL authdb
    ├── user-service     (:8091)  → MySQL userdb
    ├── client-service   (:8092)  → MySQL clientdb
    ├── courier-service  (:8093)  → MySQL courierdb
    └── package-service  (:8094)  → MySQL package_db
    │
Eureka discovery-server (:8761)
MySQL (:3307 sur le host → 3306 dans Docker)
```

**Config Server** : présent dans le code mais **hors scope** (ne pas le démarrer).

---

# E0 — Hygiène monorepo & documentation

## Objectif

Rendre le projet compréhensible et prêt pour le DevOps : documentation, conventions Git, inventaire des secrets, choix de npm.

## Workflow

1. Documenter le projet (README)
2. Inventaire des secrets dangereux
3. Standardiser npm (pas pnpm)
4. Déclarer Config Server hors scope

## Fichiers livrés (déjà dans le repo)

| Fichier | Rôle |
|---------|------|
| `README.md` | Vue d’ensemble, ports, démarrage |
| `docs/SECRETS_INVENTORY.md` | Liste des secrets / risques |
| `.gitignore` | Ignore `.env`, `target/`, lockfiles pnpm/yarn |
| `docs/GUIDE_DEVOPS_E0_E4.md` | Ce guide |

## Commandes utiles

```powershell
# Voir l’état Git
git status

# Voir la branche et le remote
git branch -vv
git remote -v
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `git status` | Affiche fichiers modifiés / non suivis | Savoir ce qui va être commit |
| `git remote -v` | Affiche l’URL GitHub | Confirmer que le repo est déjà poussé |

## Conventions retenues

- Branche principale : `main`
- Travail : `feature/...` ou `devops/...` + Pull Request
- Package manager frontend : **npm** uniquement (`package-lock.json`)
- Ne **jamais** committer `.env`

## Validation E0

- [ ] Tu as lu le README et tu connais les ports
- [ ] Tu sais où sont les secrets (fichier inventaire)
- [ ] Tu n’utilises pas pnpm sur ce projet

---

# E1 — Build local reproductible

## Objectif

Compiler les **8 services** Java et le **frontend** sans démarrer MySQL.  
Si ça ne compile pas en local, une CI future sera inutile.

## Workflow

1. Lancer le script monorepo (ou Maven service par service)
2. Vérifier que chaque service produit un JAR
3. (Optionnel) builder le frontend avec npm

## Commandes

### Option A — Script tout-en-un (recommandé)

```powershell
cd C:\Users\DELL\Desktop\devoops\gestion_Liv_colis_production\delivery-management-system

# Backend + frontend
.\scripts\build-all.ps1

# Backend seulement (utile avant Docker)
.\scripts\build-all.ps1 -SkipFrontend

# Frontend seulement
.\scripts\build-all.ps1 -SkipBackend
```

| Commande / option | Explication | Rôle |
|-------------------|-------------|------|
| `.\scripts\build-all.ps1` | Enchaîne Maven sur les 8 services puis `npm run build` | Gate de build monorepo |
| `-SkipFrontend` | Ne build que le backend | Plus rapide avant `docker compose` |
| `-DskipTests` (dans le script) | Skip les tests Spring | Évite d’avoir besoin de MySQL pour compiler |

### Option B — Un service à la main

```powershell
cd backend\discovery-server\discovery-server
.\mvnw.cmd -DskipTests package
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `.\mvnw.cmd` | Maven Wrapper (télécharge Maven si besoin) | Même version Maven pour tous |
| `-DskipTests` | Ne lance pas les tests | Build sans DB |
| `package` | Compile + crée le JAR dans `target/` | Artefact prêt pour Docker |

### Frontend seul

```powershell
cd frontend\delivery-app-frontend
npm ci
npm run build
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `npm ci` | Installe les deps **exactement** comme `package-lock.json` | Build reproductible |
| `npm run build` | Build production Next.js | Vérifie que le front compile |

## Validation E1

- [ ] `.\scripts\build-all.ps1 -SkipFrontend` se termine sans erreur
- [ ] Des JAR existent sous `backend\*\*\target\*.jar`

---

# E2 — Configuration & secrets

## Objectif

Externaliser DB, Eureka, JWT, URLs inter-services et clé interne.  
Le même JAR doit pouvoir tourner en local **et** dans Docker via des variables d’environnement.

## Workflow

1. Propriétés Spring du type `${VAR:défaut}`
2. Plus de secrets hardcodés dans le Java
3. Gateway : ne plus exposer `/internal/**`
4. Fichier modèle `.env.example`

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `backend/*/src/main/resources/application.properties` | Config paramétrable |
| `.env.example` | Modèle des variables (à copier vers `.env`) |
| `docs/SECRETS_INVENTORY.md` | Suivi sécurité |

## Variables principales

| Variable | Rôle |
|----------|------|
| `JWT_SECRET` | Signature des tokens (même valeur partout) |
| `INTERNAL_API_KEY` | Header `X-INTERNAL-KEY` entre services |
| `MYSQL_URL` / `MYSQL_USER` / `MYSQL_PASSWORD` | Connexion DB |
| `EUREKA_URL` | Adresse du discovery server |
| `AUTH_SERVICE_URL`, `USER_SERVICE_URL`, `COURIER_SERVICE_URL` | Appels inter-services |
| `NEXT_PUBLIC_API_URL` | URL gateway vue par le navigateur |

## Commandes

```powershell
cd C:\Users\DELL\Desktop\devoops\gestion_Liv_colis_production\delivery-management-system

# Créer ton fichier local (ne pas le committer)
copy .env.example .env
```

| Action | Explication | Rôle |
|--------|-------------|------|
| `copy .env.example .env` | Duplique le modèle | Tes vraies valeurs restent hors Git |
| Éditer `.env` | Mettre de vrais secrets pour Docker/prod | Sécurité |

**Important :** Spring Boot **ne charge pas** `.env` tout seul. Les variables sont injectées par :
- l’IDE (Run Configuration), ou
- Docker Compose (`environment:`), ou
- variables d’environnement Windows.

## Sécurité Gateway (fait en E2)

- Route `/internal/**` **supprimée** du Gateway
- `denyAll()` sur `/internal/**` au niveau Security Gateway  
→ les appels internes passent **service → service**, pas via l’entrée publique.

## Validation E2

- [ ] Tu as un `.env` local (non commit)
- [ ] Tu comprends que Docker utilisera `mysql` / `discovery-server` au lieu de `localhost`

---

# E3 — Docker pilote (apprentissage progressif)

## Objectif

Apprendre Docker sur un **petit** périmètre : MySQL + Eureka + auth, avant toute la stack (E4).

## Méthode retenue (importante)

1. **Compiler le JAR sur Windows** (`mvnw package`)
2. **Dockerfile runtime** : image `amazoncorretto:17` + `COPY` du JAR  

→ Plus rapide et plus fiable que Maven dans Docker sur cette machine.

---

## E3.1 — Vérifier Docker Desktop

### Workflow

1. Démarrer Docker Desktop (icône verte)
2. Tester avec `hello-world`

### Commandes

```powershell
docker version
docker run --rm hello-world
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `docker version` | Affiche client + serveur | Confirme que le daemon répond |
| `docker run --rm hello-world` | Télécharge et exécute un container test | Preuve que Docker fonctionne |
| `--rm` | Supprime le container après exécution | Ne laisse pas de déchets |

### Validation E3.1

- [ ] Tu vois le message *Hello from Docker!*

---

## E3.2 — MySQL seul + 5 bases

### Workflow

1. Script SQL crée `authdb`, `userdb`, `clientdb`, `courierdb`, `package_db`
2. Compose lance uniquement MySQL
3. Port host **3307** (évite le conflit avec XAMPP sur 3306)

### Fichiers

| Fichier | Rôle |
|---------|------|
| `docker/mysql/init/01-databases.sql` | Création des bases au premier démarrage |
| `docker-compose.mysql.yml` | Service MySQL seul |

### Commandes

```powershell
cd C:\Users\DELL\Desktop\devoops\gestion_Liv_colis_production\delivery-management-system

# Démarrer MySQL
docker compose -f docker-compose.mysql.yml up -d

# Voir le statut
docker compose -f docker-compose.mysql.yml ps

# Lister les bases
docker exec delivery-mysql mysql -uroot -proot -e "SHOW DATABASES;"

# Arrêter (garde les données)
docker compose -f docker-compose.mysql.yml down

# Arrêter + supprimer les données
docker compose -f docker-compose.mysql.yml down -v
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `docker compose -f ... up -d` | Crée réseau/volume/container en arrière-plan | DB disponible |
| `docker exec ... mysql ...` | Exécute une commande **dans** le container | Vérifier les DB |
| `down` | Stop + remove containers | Libère les ports |
| `down -v` | + supprime le volume | Reset complet des données |

### Connexion depuis Windows

- Host : `localhost`
- Port : **3307**
- User : `root`
- Password : `root`

### Validation E3.2

- [ ] Container `delivery-mysql` = healthy
- [ ] Les 5 bases apparaissent dans `SHOW DATABASES`

---

## E3.3 — discovery-server (Eureka) en Docker

### Workflow

1. Build JAR local
2. Build image Docker
3. Run container sur le port 8761

### Fichiers

| Fichier | Rôle |
|---------|------|
| `backend/discovery-server/discovery-server/Dockerfile` | Image runtime Eureka |
| `.dockerignore` | N’envoie que le JAR au build |

### Commandes

```powershell
cd backend\discovery-server\discovery-server

# 1) JAR
.\mvnw.cmd -DskipTests package

# 2) Image
docker build -t delivery/discovery-server:pilot .

# 3) Container
docker run -d --name delivery-discovery -p 8761:8761 delivery/discovery-server:pilot

# 4) Logs / UI
docker logs delivery-discovery
# Navigateur : http://localhost:8761

# Arrêt
docker stop delivery-discovery
docker rm delivery-discovery
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `docker build -t nom:tag .` | Construit une image depuis le Dockerfile du dossier courant | Artefact Docker |
| `docker run -d -p 8761:8761` | Lance le container, mappe le port host→container | Eureka accessible depuis Windows |
| `-d` | Mode détaché | Terminal libre |
| `docker logs` | Affiche la sortie Java | Déboguer le démarrage |

### Validation E3.3

- [ ] http://localhost:8761 s’ouvre (UI Eureka)

---

## E3.4 — auth-service relié à MySQL + Eureka

### Workflow

1. Créer un réseau Docker partagé
2. Y connecter MySQL et Eureka (avec alias DNS)
3. Build + run auth avec variables d’environnement (E2)

### Idée clé

Dans Docker, **`localhost` = le container lui-même**.  
Pour joindre MySQL : hostname `mysql`.  
Pour Eureka : hostname `discovery-server`.

### Commandes (manuel — pédagogique)

```powershell
# Réseau
docker network create delivery-net
docker network connect --alias mysql delivery-net delivery-mysql
docker network connect --alias discovery-server delivery-net delivery-discovery

# Build auth
cd backend\auth-service\auth-service
.\mvnw.cmd -DskipTests package
docker build -t delivery/auth-service:pilot .

# Run auth
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

docker logs delivery-auth
# Eureka UI doit lister AUTH-SERVICE
```

| Élément | Explication | Rôle |
|---------|-------------|------|
| `--network delivery-net` | Place auth sur le même réseau | Communication inter-containers |
| `--alias` | Nom DNS stable | `mysql`, `discovery-server` |
| `-e VAR=value` | Injecte une variable d’env | Active la config E2 |

### Validation E3.4

- [ ] Logs auth : HikariPool / Started … sans erreur JDBC
- [ ] Eureka : **AUTH-SERVICE** = UP

---

## E3.5 — Compose pilote (3 services d’un coup)

### Objectif

Remplacer les `docker run` manuels par **un seul fichier Compose**.

### Fichier

`docker-compose.pilot.yml` → MySQL + discovery-server + auth-service

### Commandes

```powershell
cd C:\Users\DELL\Desktop\devoops\gestion_Liv_colis_production\delivery-management-system

# JAR requis (Dockerfiles runtime)
cd backend\discovery-server\discovery-server ; .\mvnw.cmd -DskipTests package
cd ..\..\auth-service\auth-service       ; .\mvnw.cmd -DskipTests package
cd ..\..\..

# Si MySQL-only tourne déjà, l’arrêter (conflit de nom/port)
docker compose -f docker-compose.mysql.yml down

# Lancer le pilote
docker compose -f docker-compose.pilot.yml up --build -d

docker compose -f docker-compose.pilot.yml ps
docker compose -f docker-compose.pilot.yml logs -f auth-service

docker compose -f docker-compose.pilot.yml down
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `up --build -d` | Rebuild les images si besoin + démarre | Stack pilote |
| `ps` | Statut des services | Healthcheck MySQL, ports |
| `logs -f` | Suit les logs en direct | Debug |

Compose crée automatiquement le réseau et les DNS (`mysql`, `discovery-server`, `auth-service`).

### Validation E3.5

- [ ] 3 containers up, MySQL healthy
- [ ] Eureka + AUTH-SERVICE UP

### Attention

Ne **pas** lancer en même temps :
- `docker-compose.mysql.yml`
- `docker-compose.pilot.yml`
- `docker-compose.yml` (E4)

→ même nom `delivery-mysql` / port 3307 = conflit.

---

# E4 — Docker Compose stack complète

## Objectif

Faire tourner **toute** l’application :

- MySQL  
- Eureka  
- auth, user, client, courier, package  
- api-gateway  
- frontend Next.js  

(sans config-server)

## Workflow

1. Arrêter le pilote E3 s’il tourne
2. Build tous les JAR backend
3. `docker compose up --build -d`
4. Vérifier Eureka + Gateway + Frontend

## Fichiers

| Fichier | Rôle |
|---------|------|
| `docker-compose.yml` | Stack complète (`delivery-full`) |
| `backend/*/Dockerfile` | Images runtime des services |
| `frontend/delivery-app-frontend/Dockerfile` | Image Next standalone |
| `frontend/.../next.config.mjs` | `output: "standalone"` |

## Commandes

```powershell
cd C:\Users\DELL\Desktop\devoops\gestion_Liv_colis_production\delivery-management-system

# 1) Libérer les ports si le pilote tourne
docker compose -f docker-compose.pilot.yml down

# 2) Compiler les JAR
.\scripts\build-all.ps1 -SkipFrontend

# 3) Lancer toute la stack
docker compose up --build -d

# 4) Contrôler
docker compose ps
docker compose logs -f api-gateway

# 5) Arrêter
docker compose down
# Reset DB :
docker compose down -v
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `.\scripts\build-all.ps1 -SkipFrontend` | Produit tous les JAR | Requis avant build des images Java |
| `docker compose up --build -d` | Build images + démarre 9 containers | Environnement complet |
| `docker compose ps` | Tableau statut / ports | Validation rapide |
| `docker compose logs -f api-gateway` | Logs gateway | Voir les 503 / routes |

## URLs (host Windows)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:**3010** |
| API Gateway | http://localhost:8080 |
| Eureka | http://localhost:8761 |
| MySQL | localhost:**3307** (root / root) |
| auth → package | 8090 → 8094 |

**Pourquoi 3010 ?** Les ports 3000 et 3001 étaient souvent déjà utilisés sur Windows.

**Pourquoi `NEXT_PUBLIC_API_URL=http://localhost:8080` ?**  
Le navigateur tourne sur ta machine, pas dans le réseau Docker. Il doit appeler la gateway via `localhost`.

## Validation E4

- [ ] `docker compose ps` → ~9 containers (MySQL healthy)
- [ ] Eureka liste : AUTH, USER, CLIENT, COURIER, PACKAGE, API-GATEWAY
- [ ] `POST http://localhost:8080/api/auth/login` avec un faux login → **pas** 503 (401/403 = OK, gateway a trouvé auth)
- [ ] http://localhost:3010 répond (page frontend)

### Si gateway renvoie 503 au tout début

Les services mettent 1–2 minutes à s’enregistrer dans Eureka.

```powershell
docker compose restart api-gateway
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `restart api-gateway` | Relance seulement la gateway | Recalcule la liste Eureka |

---

# Aide-mémoire des commandes Docker

```powershell
docker ps                          # containers en cours
docker ps -a                       # tous
docker logs NOM -f                 # logs
docker compose ps                  # statut du compose courant
docker compose up -d               # démarrer
docker compose down                # arrêter
docker compose down -v             # arrêter + volumes
docker images                      # images locales
docker network ls                  # réseaux
```

---

# Checklist “je peux tout refaire”

1. [ ] E1 : `.\scripts\build-all.ps1 -SkipFrontend` OK  
2. [ ] E3.1 : `hello-world` OK  
3. [ ] E3.5 **ou** E4 : un compose up OK (pas les deux)  
4. [ ] Eureka montre les services  
5. [ ] Frontend accessible (E4 : port 3010)  

---

# E5 — GitHub Actions CI

## Objectif

À chaque **push** ou **Pull Request** vers `main`, GitHub compile automatiquement :
- les **8** microservices Java (Maven)
- le **frontend** Next.js (npm)

Résultat : coche verte / rouge dans l’onglet **Actions** — sans lancer Docker.

## Workflow

1. Créer le fichier `.github/workflows/ci.yml` (déjà dans le repo)
2. Commit + push vers GitHub
3. Ouvrir **Actions** sur GitHub et vérifier que le workflow **CI** tourne
4. (Optionnel) Protéger `main` pour interdire le merge si CI rouge

## Fichier

| Fichier | Rôle |
|---------|------|
| `.github/workflows/ci.yml` | Définition du pipeline CI |

## Contenu du pipeline (résumé)

| Job | Ce qu’il fait |
|-----|----------------|
| `backend` (matrix × 8) | `./mvnw -B -DskipTests package` dans chaque service |
| `frontend` | `npm ci` puis `npm run build` |

Pas de MySQL dans la CI (comme E1 : on skip les tests qui ont besoin de la DB).

## Commandes (côté machine)

```powershell
cd C:\Users\DELL\Desktop\devoops\gestion_Liv_colis_production\delivery-management-system

# Vérifier que le fichier existe
Get-Content .github\workflows\ci.yml | Select-Object -First 20

# Commit (exemple) puis push pour déclencher Actions
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI for backend matrix and frontend"
git push origin main
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `git add .github/workflows/ci.yml` | Stage le workflow | Préparer le commit CI |
| `git push origin main` | Envoie sur GitHub | **Déclenche** le workflow `on: push` |
| Onglet Actions (site GitHub) | UI des runs | Voir logs / échecs |

Sur une **Pull Request** vers `main`, le même workflow se lance (`on: pull_request`).

## Lire un run sur GitHub

1. https://github.com/BdSouf/delivery-management-system/actions  
2. Cliquer sur le run **CI**  
3. Ouvrir un job (ex. `Backend — auth-service` ou `Frontend — Next.js`)  
4. Lire les logs étape par étape  

## Validation E5

- [ ] Le fichier `.github/workflows/ci.yml` est dans le dépôt distant
- [ ] Un run apparaît dans **Actions**
- [ ] Jobs backend (8) + frontend sont verts
- [ ] (Bonus) Une modification qui casse un `pom.xml` rend le job rouge

## Branch protection (optionnel, recommandé)

Sur GitHub : **Settings → Branches → Add rule** pour `main` :
- Require a pull request before merging
- Require status checks to pass (sélectionner le workflow CI)

---

# E6 — CD léger : images Docker sur GHCR

## Objectif

Après une **CI verte**, GitHub Actions construit les images Docker et les pousse sur **GHCR** (`ghcr.io`).

```
Push → CI (E5) Success → CD Images (E6) → packages visibles sur GitHub
```

Images produites (exemples) :
- `ghcr.io/bdsouf/delivery-auth-service:xxxxxx`
- `ghcr.io/bdsouf/delivery-api-gateway:xxxxxx`
- `ghcr.io/bdsouf/delivery-frontend:xxxxxx`
- … (+ discovery, user, client, courier, package)

`config-server` n’a pas d’image (hors scope runtime).

## Fichier

| Fichier | Rôle |
|---------|------|
| `.github/workflows/cd-images.yml` | Build JAR → `docker build` → `docker push` GHCR |

## À faire MANUELLEMENT (Git)

Le workflow est dans ton projet local. **Toi** tu dois :

```powershell
cd C:\Users\DELL\Desktop\devoops\gestion_Liv_colis_production\delivery-management-system

git status
git add .github/workflows/cd-images.yml
git add docs/ README.md
git status
git commit -m "ci: add CD workflow to build and push images to GHCR"
git push origin main
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `git add .github/workflows/cd-images.yml` | Stage le workflow CD | Préparer le commit |
| `git push origin main` | Envoie sur GitHub | Déclenche **CI**, puis si CI OK → **CD Images** |

## Ce qui se passe sur GitHub (automatique)

1. Workflow **CI** tourne (comme E5)
2. S’il est **Success**, workflow **CD Images** démarre
3. Pour chaque service : Maven package → Docker build → push `ghcr.io/...`
4. Tags : `:latest` et `:<7 premiers caractères du commit>`

## Vérifier sur GitHub (manuel)

1. Onglet **Actions** → runs **CI** puis **CD Images**
2. Onglet du profil/repo → **Packages** (ou `https://github.com/BdSouf?tab=packages`)
3. Ouvre un package (ex. `delivery-auth-service`)

## Pull d’une image en local (manuel — Docker)

Par défaut les packages GHCR peuvent être **privés**. Deux options :

### Option A — Rendre le package public (simple pour apprendre)

Sur la page du package GitHub → **Package settings** → Change visibility → **Public**.

Puis :

```powershell
docker pull ghcr.io/bdsouf/delivery-auth-service:latest
docker images | Select-String "delivery-auth"
```

### Option B — Login avec un token (si package privé)

1. GitHub → Settings → Developer settings → Personal access tokens  
2. Créer un token avec au moins `read:packages`  
3. Puis :

```powershell
echo TON_TOKEN | docker login ghcr.io -u BdSouf --password-stdin
docker pull ghcr.io/bdsouf/delivery-auth-service:latest
```

| Commande | Explication | Rôle |
|----------|-------------|------|
| `docker login ghcr.io ...` | Authentifie Docker auprès de GHCR | Autorise le pull privé |
| `docker pull ghcr.io/...` | Télécharge l’image | Preuve que le CD a publié l’artefact |

## Validation E6

- [ ] Workflow `cd-images.yml` poussé sur `main`
- [ ] Après CI verte, run **CD Images** vert
- [ ] Packages visibles sur GitHub
- [ ] `docker pull` d’au moins une image OK

## Ne pas confondre

| E6 fait | E6 ne fait pas |
|---------|----------------|
| Publier des images | Déployer sur Minikube (E7) |
| Lier CI → CD | Mettre les secrets dans l’image |

Les secrets (`JWT_SECRET`, etc.) restent au **runtime** (Compose / K8s), pas dans l’image.

---

# Fichiers de référence

| Document | Contenu |
|----------|---------|
| **Ce guide** `docs/GUIDE_DEVOPS_E0_E4.md` | Manipulations terminées E0–E6 |
| `docs/DEVOPS_JOURNEY.md` | Journal + notes de session |
| `docs/SECRETS_INVENTORY.md` | Secrets / risques |
| `README.md` | Vue rapide du projet |

---

*Dernière mise à jour : après ajout E6 (CD Images GHCR).*
