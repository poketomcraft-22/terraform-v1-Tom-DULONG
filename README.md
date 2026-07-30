# Procédure d'utilisation et de déploiement - TP-2

Ce document détaille la procédure complète pour initialiser, tester, déployer et détruire l'infrastructure AWS et le conteneur Nginx sécurisé dans le cadre du **TP-2**.

---

## 📋 Prérequis

Avant de commencer, assurez-vous de disposer des outils suivants installés et fonctionnels dans votre environnement Linux / WSL :

- **Git** (avec clé SSH configurée pour s'authentifier sur GitHub)
- **Docker** (pour la construction des images de conteneurs)
- **Terraform** (>= 1.5.0)
- **AWS CLI** (configuré avec vos identifiants ou le rôle de session du laboratoire)

---

## 🛠️ Étape 1 : Préparation du code et Hardening Nginx Local

Cette étape consiste à builder et tester le conteneur Nginx durci (*hardening*) sur votre machine locale.

### 1.1. Se placer dans le dossier de l'application
```bash
cd /mnt/c/Users/TOM/Desktop/TP-2/app
```

### 1.2. Builder l'image Docker locale
```bash
docker build -t tp2-nginx-local .
```

### 1.3. Lancer et tester le conteneur localement
```bash
# Lancer le conteneur sur le port 8080
docker run -d -p 8080:80 --name test-nginx tp2-nginx-local

# Vérifier la présence des en-têtes de sécurité (Security Headers)
curl -I http://localhost:8080
```

*Vérifiez que la sortie contient bien les en-têtes de sécurité OWASP (ex: `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`).*

### 1.4. Nettoyer le conteneur de test local
```bash
docker stop test-nginx && docker rm test-nginx
```

---

## ☁️ Étape 2 : Déploiement de l'Infrastructure sur AWS (Terraform)

### 2.1. Initialisation et validation du code Terraform
Positionnez-vous dans le dossier `terraform` et initialisez les providers :

```bash
cd /mnt/c/Users/TOM/Desktop/TP-2/terraform
terraform init
```

Validez la syntaxe des fichiers de configuration `.tf` :
```bash
terraform validate
```

### 2.2. Planification des ressources (`terraform plan`)
Générez et sauvegardez le plan d'exécution afin de vérifier l'ensemble des ressources qui seront créées sur AWS :

```bash
terraform plan -out=dev.tfplan
```

### 2.3. Déploiement effectif sur AWS (`terraform apply`)
Appliquez le plan sauvegardé pour déployer le cluster ECS Fargate, le registre ECR et le Security Group :

```bash
terraform apply dev.tfplan
```

---

## 🐳 Étape 3 : Publication de l'image Docker sur AWS ECR

Une fois le registre ECR créé par Terraform, vous devez pousser l'image Docker vers AWS ECR.

### 3.1. Authentification Docker auprès d'AWS ECR
```bash
# Remplacez <REGION> et <ACCOUNT_ID> par vos valeurs AWS
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com
```

### 3.2. Tag et Push de l'image
```bash
docker tag tp2-nginx-local:latest <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/tp2-nginx-repo:latest
docker push <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/tp2-nginx-repo:latest
```

---

## 🔍 Étape 4 : Inspection et Gestion de l'État (Partie D)

### 4.1. Détection de dérive (*Drift Detection*)
Pour vérifier si des modifications manuelles ont été apportées sur AWS en dehors de Terraform :

```bash
terraform plan
```

### 4.2. Inspection du fichier d'état (`tfstate`)
Affichez les ressources répertoriées dans le dictionnaire d'état Terraform :

```bash
terraform state list
terraform show -json | jq '.values.root_module.resources[].type'
```

---

## 🚀 Étape 5 : Versioning et Validation CI/CD (GitHub Actions)

### 5.1. Vérification de la signature des commits (Verified Badge)
S'assurer que votre signature SSH est correctement appliquée lors du commit :

```bash
cd /mnt/c/Users/TOM/Desktop/TP-2
git add .
git commit -S -m "feat: deploiement et hardening valides"
```

### 5.2. Push de la branche vers GitHub
Pushez vos modifications sur la branche `tp-2` pour déclencher le pipeline CI/CD :

```bash
git push -u origin tp-2
```

---

## 🧹 Étape 6 : Destruction des ressources AWS (Nettoyage)

Afin d'éviter toute surconsommation de crédits AWS après la validation du TP, détruisez l'intégralité des ressources provisionnées :

```bash
cd /mnt/c/Users/TOM/Desktop/TP-2/terraform
terraform destroy -auto-approve
```
-----------------------------------------------------------------------------------------------

## Part B — Déploiement AWS

### Question 3 : Analyse du plan d'exécution (`terraform plan -out=dev.tfplan`)

Lors de l'exécution de la commande `terraform plan -out=dev.tfplan`, Terraform analyse la configuration locale par rapport à l'état réel et génère le plan d'action.

* **Nombre de ressources créées** : **5 ressources** au total.
* **Détail des ressources prévues à la création (`+ create`)** :
  1. `aws_ecr_repository.app` (Registre de conteneurs ECR)
  2. `aws_ecs_cluster.main` (Cluster ECS Fargate)
  3. `aws_ecs_task_definition.app` (Définition de tâche conteneurisée)
  4. `aws_ecs_service.main` (Service d'orchestration ECS)
  5. `aws_security_group.ecs_sg` (Groupe de sécurité autorisant le port HTTP 8080)

---

## Part D — Dérive, état et destruction

### Question 2 : Détection de la dérive d'infrastructure (`terraform plan`)

Lorsqu'une modification manuelle est effectuée sur AWS (par exemple, la suppression ou la modification hors-code d'un Security Group ou d'une règle de filtrage), `terraform plan` compare l'état réel de l'infrastructure (*real world*) avec le fichier d'état (`tfstate`).

#### Analyse et proposition de Terraform :
* **Ce qu'il détecte** : Une dérive de configuration (*drift*), indiquant qu'une ressource en cloud ne correspond plus à la définition déclarée dans le code `.tf`.
* **Ce qu'il propose** : Il propose d'appliquer les modifications nécessaires pour rétablir la conformité de l'infrastructure avec le code (recréation ou remise à jour de la ressource modifiée).

#### Extrait de la sortie :
```bash
Note: Objects have changed outside of Terraform

Terraform detected the following changes made outside of Terraform since the last perform:

  # aws_security_group.ecs_sg has been changed
  ~ resource "aws_security_group" "ecs_sg" {
      id                     = "sg-0692b76fbee183beb"
      name                   = "tp2-docker-ecs-sg"
      # (1 attribute changed)
    }

Unless you have made changes in your configuration, these changes were made outside of Terraform;
for example, by another party or by an administrative script.

Unless you use -refresh=false, Terraform will reuse this updated state to calculate the next plan.

Plan: 0 to add, 1 to change, 0 to destroy.
```

---

### Question 4 : Inspection du tfstate et fuite de données sensibles

#### Inspection des types de ressources présentes via le State :
```bash
terraform show -json | jq '.values.root_module.resources[].type'
terraform state list
```

Après téléchargement et analyse du fichier `.tfstate` (depuis le bucket S3 backend ou en local), on constate que Terraform stocke l'intégralité des attributs des ressources en clair.

#### 3 informations sensibles identifiées ne devant pas fuiter :
1. **Identifiants et ARNs IAM AWS** : Les identifiants de rôle et les comptes AWS (ex: `arn:aws:iam::883395775398:role/LabRole` et l'ID de compte `883395775398`), révélant l'architecture d'accès et la structure des comptes internes.
2. **Identifiants réseaux et topologies VPC** : Les identifiants précis des sous-réseaux internes (ex: `subnet-0575adab8f85ac3b4`) et du VPC (`vpc-0fa18b3ec423dc3bb`), offrant une cartographie réseau exploitable pour des attaques ciblées.
3. **Jetons de session et clés d'API (Credentials AWS)** : Dans le cas où des variables d'environnement (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`) ou des secrets (mots de passe de BDD, clés privées) sont injectés dans des blocs provider ou resource, ils sont écrits en clair dans le fichier state.