# TP-2 : Infrastructure & Déploiement Cloud

Ce dépôt contient la configuration Terraform et Ansible pour le TP-2.

## Prérequis

- [Terraform](https://www.terraform.io/) (>= 1.5.0)
- [Ansible](https://www.ansible.com/)
- [Make](https://www.gnu.org/software/make/)
- [pre-commit](https://pre-commit.com/) (optionnel mais recommandé)

## Guide d'utilisation rapide avec Make

Toutes les étapes d'administration du projet sont centralisées via le `Makefile`.

### 1. Initialiser l'environnement de développement

Pour installer les hooks Git de validation automatique :
```bash
pre-commit install
```

### 2. Valider et formater le code

Pour le formatage récursif de l'IaC et la vérification de la syntaxe :
```bash
make validate
```

### 3. Prévisualiser les changements Terraform

```bash
make plan
```

### 4. Déployer l'infrastructure

```bash
make apply
```

### 5. Exécuter la configuration Ansible

```bash
make ansible-run
```

### 6. Nettoyer / Supprimer les ressources

```bash
make destroy
```

---

## Commandes Make disponibles

| Commande | Description |
| :--- | :--- |
| `make help` | Affiche la liste des commandes disponibles |
| `make fmt` | Formate récursivement le code Terraform (`terraform fmt -recursive`) |
| `make validate` | Vérifie la validité des fichiers Terraform |
| `make plan` | Génère le plan de déploiement |
| `make apply` | Déploie l'infrastructure sur AWS/Cloud |
| `make ansible-run` | Lance la configuration Ansible |
| `make destroy` | Supprime l'infrastructure créée |

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
