# 📚 Fiche de Révision : TP-1 IaC & SecOps

---

## 🛠️ Partie 1 : Fichiers de Configuration du Dépôt

### 1. `.gitattributes`

#### À quoi ça sert ?
Normalise les fins de lignes de texte dans les fichiers pour éviter les bugs cross-platform (*Windows vs Linux/Mac*).

#### Exemple de configuration :
```ini
* text=auto eol=lf
*.sh text eol=lf
Makefile text eol=lf
*.tf text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
```

#### Expliqué ligne par ligne :
* `* text=auto eol=lf` : Pour tous les fichiers (`*`), Git gère automatiquement le texte et force la fin de ligne au format Linux **LF** (*Line Feed*, `\n`), au lieu du format Windows **CRLF** (`\r\n`).
* `*.sh`, `Makefile`, `*.tf`, `*.yml`, `*.yaml` : Règles spécifiques pour s'assurer que les scripts Bash, Makefiles, configurations Terraform et fichiers YAML restent strictement en **LF**.

> 💡 **Question Kahoot possible :** Pourquoi forcer LF sur un Makefile ou un `.sh` ?
> *Parce que Windows insère des `\r\n` invisibles qui font planter Bash et Make sous Linux !*

---

### 2. `.gitignore`

#### À quoi ça sert ?
Indique à Git quels fichiers ou dossiers il doit ignorer et ne jamais suivre/commiter dans le dépôt.

#### Extrait de code :
```gitignore
# Terraform
**/.terraform/*
*.tfstate
*.tfstate.*
*.tfvars
!*.tfvars.example

# Environment & Secrets
.env
.env.*
*.pem
*.key
config/app.env

# OS & IDE
.DS_Store
.vscode/
```

#### Expliqué par bloc :
* `**/.terraform/*`, `*.tfstate*` : Ignore les fichiers de cache et les états Terraform (qui contiennent souvent des secrets ou des données sensibles d'infrastructure).
* `*.tfvars` vs `!*.tfvars.example` : Ignore tous les fichiers de variables Terraform (ex: `terraform.tfvars`), sauf (`!`) le fichier d'exemple modèle (`*.tfvars.example`).
* `config/app.env`, `*.key`, `*.pem` : Ignore les clés privées SSH/TLS et les fichiers de variables d'environnement contenant des mots de passe ou clés d'API.
* `.vscode/`, `.DS_Store` : Ignore les fichiers système spécifiques aux éditeurs de code ou à macOS.

---

### 3. `.editorconfig`

#### À quoi ça sert ?
Uniformise la mise en forme du code (espaces, tabulations, encodage) entre tous les développeurs, quel que soit leur éditeur de code (*VS Code, Vim, JetBrains*).

#### Extrait de code :
```ini
root = true

[*]
end_of_line = lf
charset = utf-8
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[Makefile]
indent_style = tab
```

#### Expliqué ligne par ligne :
* `root = true` : Arrête la recherche d'autres fichiers `.editorconfig` dans les dossiers parents.
* `[*]` : S'applique à tous les fichiers du projet.
* `end_of_line = lf` : Fins de lignes au format Linux (LF).
* `charset = utf-8` : Encodage universel des caractères.
* `insert_final_newline = true` : Ajoute automatiquement une ligne vide à la fin du fichier (exigé par les normes de code UNIX).
* `trim_trailing_whitespace = true` : Supprime les espaces inutiles en fin de ligne.
* `indent_style = space` / `indent_size = 2` : Utilise 2 espaces pour l'indentation de tous les fichiers.
* `[Makefile]` / `indent_style = tab` : **Règle capitale** — dans un Makefile, les indentations doivent obligatoirement être des tabulations (`Tab`), sinon Make plante avec une erreur de syntaxe !

---

### 4. `Makefile`

#### À quoi ça sert ?
Automatise et standardise les commandes courantes du projet via une interface simple (`make <commande>`).

#### Extrait de code :
```makefile
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

.PHONY: help lint secrets clean

help: ## Affiche cette aide auto-documentée
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "[36m%-15s[0m %s
", $$1, $$2}'

lint: ## Lance les vérifications linter
	@echo "Exécution des vérifications lint..."

secrets: ## Détecte la présence de secrets avec gitleaks
	gitleaks detect --source . --verbose

clean: ## Nettoie les fichiers temporaires
	rm -rf .terraform *.tfstate *.tfplan
```

#### Expliqué par section :
* `SHELL := /bin/bash` : Force Make à utiliser Bash au lieu de `/bin/sh` par défaut.
* `.SHELLFLAGS := -eu -o pipefail -c` : Mode **"strict"** de Bash :
  * `-e` : S'arrête dès qu'une commande échoue.
  * `-u` : Erreur si une variable non définie est utilisée.
  * `-o pipefail` : Échoue si n'importe quelle commande d'un pipe (`|`) échoue.
* `.PHONY: help lint secrets clean` : Déclare que ces noms sont des cibles virtuelles (commandes) et non des fichiers physiques sur le disque.
* `help:` : Une recette qui lit le Makefile, cherche les commentaires `##` et affiche une aide colorée dans le terminal.
* `secrets:` : Lance la commande `gitleaks detect --source . --verbose` pour scanner le dépôt entier à la recherche de secrets fuités.

---

### 5. `.pre-commit-config.yaml`

#### À quoi ça sert ?
Configure les gardes-fous automatisés (*Git Hooks*) qui s'exécutent localement sur la machine juste avant de valider un commit (`git commit`).

#### Extrait de code :
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: mixed-line-ending
        args: ['--fix=lf']
      - id: detect-private-key

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.24.0
    hooks:
      - id: gitleaks
```

#### Expliqué par hook :
* `trailing-whitespace` : Supprime les espaces inutiles en fin de ligne.
* `end-of-file-fixer` : S'assure que les fichiers se terminent par une ligne vide.
* `check-yaml` : Vérifie la syntaxe des fichiers YAML.
* `mixed-line-ending` (`args: ['--fix=lf']`) : Remplace automatiquement les fins de lignes CRLF par LF.
* `detect-private-key` : Bloque le commit si une clé RSA/SSH privée est détectée.
* `gitleaks` : Analyse le code modifié pour intercepter les clés API, jetons ou mots de passe (ex: *AWS Access Keys*).

---

## 🔒 Partie 2 : Les Notions Clés & Questions Kahoot

### 🔑 1. Pourquoi `--no-verify` est dangereux et quelle est la VRAIE sécurité ?
* **Problème :** Un développeur peut exécuter `git commit -m "..." --no-verify` pour sauter tous les tests *pre-commit* locaux.
* **Explication :** Les hooks *pre-commit* sont côté client (sur le PC du dev), donc contrôlés par l'utilisateur.
* **Seule vraie parade :** Les contrôles côté serveur dans un pipeline CI/CD (GitHub Actions, GitLab CI) couplés à une protection de branche (*interdire de pusher sur `main` sans validation de la CI*).

---

### 🧹 2. Comment purger un secret qui a été commité ?
Si un secret a été commité localement, faire un simple `git rm` ou supprimer la ligne ne suffit pas : le secret reste stocké dans l'historique de Git.

* **L'outil à utiliser :** `git-filter-repo` (ex: `git filter-repo --path <fichier> --invert-paths --force`).
* **Si le secret a déjà été poussé sur GitHub :**
  1. Révoquer / invalider le secret immédiatement côté fournisseur (ex: AWS, Google Cloud).
  2. Générer une nouvelle clé.
  3. Purger l'historique Git avec `git-filter-repo` et forcer le push (`git push --force`).

---

### 📌 3. L'incident `tj-actions/changed-files` & la mutabilité des tags Git
* **Qu'est-ce qu'un Tag Git ?** Un nom lisible (ex: `v4` ou `v1.2.0`) pointant vers un commit.
* **Le problème (Mutabilité) :** Un tag est mutable (modifiable). Un attaquant qui prend le contrôle d'un dépôt peut modifier le tag `v4` pour qu'il pointe vers un commit contenant du code malveillant.
* **La solution de sécurité :** Épingler les dépendances/actions par leur **SHA-1** (*Commit Hash*) qui est immuable (ex: `uses: actions/checkout@a81bbbf8298c0fa01a0280333d7890f89c02055b`).

---

### 🏛️ 4. Les 3 Éléments de Configuration au sens ITIL
Au sens **ITIL** (*Gouvernance IT*), un **Configuration Item (CI)** est tout composant géré pour délivrer un service fiable :
1. `.gitattributes` : Définit les règles environnementales de traitement des fichiers (LF/CRLF).
2. `Makefile` : Spécifie le moteur d'exécution et standardise l'interface des opérations.
3. `.pre-commit-config.yaml` : Formalise le cadre de qualité et de conformité de sécurité imposé au code.

---

### ✍️ 5. Signature des commits Git
* **Pourquoi signer ses commits ?** Pour prouver l'identité de l'auteur et garantir que le commit n'a pas été falsifié par une autre personne.
* **Technique moderne :** On peut utiliser sa clé SSH (`id_ed25519.pub`) configurée avec `gpg.format = ssh` pour obtenir le badge vert **Verified** sur GitHub.
