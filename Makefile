SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help


.PHONY: help init fmt validate plan apply destroy ansible-run clean

help: ## Affiche l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

fmt: ## Formate le code Terraform de manière récursive
	terraform -chdir=terraform fmt -recursive

validate: fmt ## Valide la configuration Terraform
	terraform -chdir=terraform init -backend=false
	terraform -chdir=terraform validate

plan: validate ## Génère et affiche le plan d'exécution Terraform
	terraform -chdir=terraform plan

apply: ## Applique les changements Terraform
	terraform -chdir=terraform apply -auto-approve

ansible-run: ## Exécute le playbook Ansible
	ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

destroy: ## Détruit les ressources créées par Terraform
	terraform -chdir=terraform destroy -auto-approve

clean: ## Nettoie les fichiers temporaires
	rm -rf terraform/.terraform terraform/.terraform.lock.hcl
