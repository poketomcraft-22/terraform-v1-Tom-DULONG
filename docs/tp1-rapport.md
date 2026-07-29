# Rapport TP1 - Gestion des configurations & IaC

**URL du dépôt :** `git@github.com:poketomcraft-22/terraform-v1-Tom-DULONG.git`

---

### 1. Pourquoi `--no-verify` fonctionne-t-il, et quelle est la seule parade réellement efficace ?
`--no-verify` fonctionne car les hooks Git (comme pre-commit) s'exécutent exclusivement en local sur le poste du développeur (client-side). Le client Git permet donc à l'utilisateur de passer outre ces vérifications à tout moment.

**La seule parade réellement efficace** est la mise en place de contrôles automatisés côté serveur (Server-side / CI/CD pipeline). Les mêmes scans (Gitleaks, linters) doivent impérativement être exécutés dans le pipeline CI/CD avant toute fusion (Pull Request), couplés à une règle de protection de branche rendant le succès de la CI obligatoire pour le merge.

### 2. Le secret que vous avez purgé était-il, à un moment, présent sur le serveur distant ? Qu'auriez-vous dû faire en premier s'il avait été réel ?
Non, car la tentative de commit initial a été bloquée localement par `pre-commit`, et nous n'avons effectué aucun `git push` vers le serveur distant pendant que le secret était présent dans l'historique local.

Si le secret avait été réel et poussé sur un serveur distant :
1. **Action n°1 immédiate :** Révoker / Invalider le secret immédiatement auprès de l'émetteur (console Cloud/AWS, IAM, etc.) pour neutraliser tout risque d'exploitation.
2. **Action n°2 :** Générer une nouvelle clé d'accès et auditer les logs d'accès pour vérifier si le secret compromis a été exploité entre-temps.
3. **Action n°3 :** Purger l'historique Git (avec `git filter-repo`) et forcer le push pour assainir le dépôt.

### 3. En quoi la mutabilité des tags Git explique-t-elle l'incident tj-actions/changed-files ?
Un tag Git est une simple référence pointeur qui reste mutable par nature. Contrairement à un hash SHA (qui est l'empreinte exacte et immuable d'un commit), un tag peut être réassigné à tout moment vers un autre commit (ex: via `git tag -f`).

Dans l'incident `tj-actions/changed-files`, le compte du mainteneur a été compromis et les tags de version (ex: `v4`) ont été déplacés pour pointer vers un commit malveillant. Les workflows GitHub Actions s'appuyant sur ces tags ont donc exécuté le code compromis. Pour se prémunir de cela, il convient d'épingler les actions GitHub par leur **hash SHA immuable (40 caractères)** plutôt que par un nom de tag.

### 4. Citez trois éléments du dépôt qui relèvent de la gestion de configuration au sens ITIL du terme.
Au sens ITIL (Gouvernance et Service Management), un élément de configuration (CI) est un composant qui doit être géré et contrôlé pour délivrer un service de manière fiable et répétable :
1. **`.gitattributes`** : Définit la politique de normalisation de l'environnement (gestion obligatoire des fins de ligne LF/CRLF sur tous les OS)[cite: 2].
2. **`Makefile`** : Spécifie le moteur d'exécution (SHELL, flags) et standardise l'interface des opérations d'ingénierie (lint, secrets, clean)[cite: 2].
3. **`.pre-commit-config.yaml`** : Formalise le référentiel d'outils de qualité et de sécurité exigé pour garantir la conformité du code source[cite: 1, 2].
