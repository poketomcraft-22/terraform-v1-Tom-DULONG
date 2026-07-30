# Rapport de Sécurisation et Déploiement Conteneurisé (TP2)

---

## 1. Description de l'Architecture
L'infrastructure déployée repose sur une architecture conteneurisée serverless sur AWS, orchestrée par **Terraform**.

* **Registre d'images** : AWS ECR (`883395775398.dkr.ecr.us-east-1.amazonaws.com/tp2-docker-ecs`) avec analyse automatique des vulnérabilités au push (`scan_on_push = true`).
* **Orchestration** : AWS ECS (`tp2-docker-ecs-cluster`) exécuté en mode **Fargate** (allocation de 256 CPU et 512 MiB de RAM).
* **Réseau & Sécurité** : Déploiement dans le VPC par défaut avec assignation d'IP publique, filtré par un Security Group (`tp2-docker-ecs-sg`) restreignant les accès entrants au port TCP `8080`.
* **Identités (IAM)** : Utilisation de `LabRole` (`arn:aws:iam::883395775398:role/LabRole`) pour les rôles d'exécution et de tâche ECS.

---

## 2. Déploiement de l'Infrastructure (Terraform)
L'initialisation et la création des ressources ont été exécutées via WSL / Terraform :

```bash
cd terraform
terraform init
terraform apply -auto-approve
```

Extrait des outputs Terraform :
```text
ECR Repository URL : 883395775398.dkr.ecr.us-east-1.amazonaws.com/tp2-docker-ecs
ECS Cluster Name : tp2-docker-ecs-cluster
Security Group ID : sg-0692b76fbee183beb
VPC ID : vpc-0fa18b3ec423dc3bb
```

---

## 3. Analyse de Sécurité de l'Image Conteneur (Docker Scout)
L'image conteneurisée repose sur la base de données légère Alpine Linux (`nginx:1-alpine`).

* **Image de base** : `nginx:1-alpine`
* **Conformité aux bonnes pratiques** :
  * Utilisateur non-root configuré (`Default non-root user` -> **PASSED**).
  * Aucune vulnérabilité à haut profil globale (`High-profile vulnerabilities` -> **PASSED**).
* **Bilan des vulnérabilités (CVE)** :
  * Critical : `1C`
  * High : `12H`
  * Medium : `21M`
  * Low : `7L`

**Plan de mitigation / Recommandations** :
1. *Mise à jour de l'image de base* : Migrer vers la déclinaison `nginx:1-alpine-slim` ou effectuer un re-build en rafraîchissant les paquets Alpine afin d'éliminer la vulnérabilité critique et les 12 vulnérabilités hautes.
2. *Scan ECR* : Activer le suivi continu des rapports de vulnérabilités nativement dans AWS ECR à chaque push de nouvelle version.

---

## 4. Hardening Nginx & Entêtes OWASP
Le fichier de configuration `nginx.conf` a été durci afin de répondre aux recommandations de sécurité OWASP et d'atténuer la prise d'empreinte (*fingerprinting*) :

* **Masquage de version** : `server_tokens off;` (l'en-tête `Server` renvoie uniquement `nginx`).
* **Protection contre le Clickjacking** : `X-Frame-Options "DENY"`
* **Protection contre le Sniffing MIME** : `X-Content-Type-Options "nosniff"`
* **Restriction du contenu (CSP)** : `Content-Security-Policy "default-src 'self'"`

---

## 5. Validation du Déploiement Fargate & Tests HTTP
Le service a été déployé et validé à l'adresse publique du conteneur Fargate : `http://44.203.218.74:8080`.

Vérification du statut et des en-têtes (PowerShell) :
```powershell
$res = Invoke-WebRequest -Uri "http://44.203.218.74:8080" -Method Head
$res.StatusCode
$res.Headers
```

**Résultats obtenus** :
```text
StatusCode : 200

Key                    Value
---                    -----
Server                 nginx
Date                   ...
Content-Type           text/html
Content-Length         ...
Connection             keep-alive
X-Frame-Options        DENY
X-Content-Type-Options nosniff
Content-Security-Policy default-src 'self'
```

* **Statut HTTP** : `200 OK`
* **Validation de sécurité** : L'ensemble des en-têtes OWASP configurés est correctement distribué par l'instance Fargate et la version exacte de Nginx reste masquée.
