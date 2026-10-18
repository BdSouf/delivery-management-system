# Inventaire des secrets (mis a jour apres E2)

## Statut E2

| Element | Avant E2 | Apres E2 |
|---------|----------|----------|
| `jwt.secret` | Valeur en clair dans `application.properties` | `${JWT_SECRET:...}` (defaut dev uniquement) |
| Cle `X-INTERNAL-KEY` | Hardcodee `SECRET123456` dans le Java | `${INTERNAL_API_KEY:...}` / `internal.api.key` |
| MySQL user/password/URL | En clair / localhost fixe | `${MYSQL_USER}`, `${MYSQL_PASSWORD}`, `${MYSQL_URL}` |
| Eureka URL | `localhost:8761` fixe | `${EUREKA_URL}` |
| URLs inter-services | Mix localhost / noms | Env + noms Eureka (`http://auth-service`, etc.) |
| Gateway `/internal/**` | Route publique + permitAll | **Route supprimee** + `denyAll()` |

## Fichiers de reference

- Modele d'env : [`.env.example`](../.env.example) (copier vers `.env`, ne pas committer `.env`)
- Propriete commune : `internal.api.key` / `jwt.secret` dans les `application.properties` des services

## Regles

1. Ne jamais committer `.env`.
2. En Docker / K8s / CI : **toujours** definir `JWT_SECRET` et `INTERNAL_API_KEY` (ne pas compter sur les defauts `dev-only-*`).
3. Les anciennes valeurs (`SECRET123456`, ancien JWT) sont considerees **compromises** (deja dans l'historique Git) — utiliser de nouvelles valeurs hors Git.
4. Les appels `/internal/**` restent service-a-service (RestTemplate) ; ils ne passent plus par la Gateway publique.
