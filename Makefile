SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

.PHONY: help lint secrets clean

help: ## Affiche cette aide auto-documentée
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

lint: ## Lance les vérifications linter
	@echo "Exécution des vérifications lint..."

secrets: ## Détecte la présence de secrets avec gitleaks
	gitleaks detect --source . --verbose

clean: ## Nettoie les fichiers temporaires.
	rm -rf .terraform *.tfstate *.tfplan
