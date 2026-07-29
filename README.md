# TP1 IaC - Dépôt Sécurisé

## Prérequis
- WSL2 / Linux
- Git & SSH
- GNU Make
- pre-commit & gitleaks

## Démarrage rapide
Consulter l'aide du Makefile :
```bash
make help
```

---

## 🧪 Résultats des tests — Partie C & Partie D

### Partie C — Provoquer la fuite

#### Question 2 : Tentative de commit avec `git add -f config/app.env && git commit -m "chore: config"`
**Que se passe-t-il ?**
Le commit est **bloqué immédiatement** en local par le hook `Detect hardcoded secrets` de `pre-commit` (qui exécute Gitleaks) car une clé AWS a été détectée.

**Message d'erreur exact obtenu (Log) :**
```bash
Detect hardcoded secrets.........................................Failed
- hook id: gitleaks
- exit code: 1

      ○
     │╲
     │ ○
     ○ ░
     ░    gitleaks

Finding:     AWS_ACCESS_KEY_ID=REDACTED
Secret:      REDACTED
RuleID:      aws-access-token
Entropy:     4.084184
File:        config/app.env
Line:        1
Fingerprint: config/app.env:aws-access-token:1

11:14AM WRN leaks found: 1
```

#### Question 3 : Contournement du hook avec --no-verify
```text
Le commit passe avec succès. Cela démontre que les vérifications pre-commit sont exclusivement côté client. Une personne malveillante peut donc contourner cette sécurité à tout moment.
```

#### Question  4 : Lancement de make secrets
**Le secret est-il détecté ?**
```text
Oui, le secret est détecté.
Le secret a été censuré.

Finding:     AWS_ACCESS_KEY_ID=AKIA5Z67XXXXXXXXXXX
Secret:      AKIA5Z67XXXXXXXXXXX
RuleID:      aws-access-token
Entropy:     4.084184
File:        config/app.env
Line:        1
Commit:      5d22b9eaa2da06cfa640ec8e2974136cd3495fa1
Author:      poketomcraft-22
Email:       poketomcraft22@gmail.com
Date:        2026-07-29T09:14:42Z
Link:        [https://github.com/poketomcraft-22/terraform-v1-Tom-DULONG/blob/5d22b9eaa2da06cfa640ec8e2974136cd3495fa1/config/app.env#L1](https://github.com/poketomcraft-22/terraform-v1-Tom-DULONG/blob/5d22b9eaa2da06cfa640ec8e2974136cd3495fa1/config/app.env#L1)
```


### Partie D — Signature et protection

#### Question  4 : Message de refus du git push
```bash
To github.com:poketomcraft-22/terraform-v1-Tom-DULONG.git
 ! [remote rejected] main -> main (protected branch hook declined or changes must be made through a pull request)
error: failed to push some refs to 'github.com:poketomcraft-22/terraform-v1-Tom-DULONG.git'
```
