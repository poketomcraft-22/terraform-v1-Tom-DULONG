SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

.PHONY: help init fmt validate plan apply destroy ansible-run clean deploy

help: ## Affiche l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

init: ## Initialise Terraform et télécharge les providers
	terraform -chdir=terraform init

fmt: ## Formate le code Terraform de manière récursive
	terraform -chdir=terraform fmt -recursive

validate: fmt ## Valide la configuration Terraform
	terraform -chdir=terraform init
	terraform -chdir=terraform validate

plan: validate ## Génère et affiche le plan d'exécution Terraform
	terraform -chdir=terraform plan

apply: init ## Applique les changements Terraform (avec init préalable)
	terraform -chdir=terraform apply -auto-approve

ansible-run: ## Exécute le playbook Ansible
	ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

destroy: init ## Détruit les ressources créées par Terraform
	terraform -chdir=terraform destroy -auto-approve

clean: ## Nettoie les fichiers temporaires
	rm -rf terraform/.terraform terraform/.terraform.lock.hcl

deploy: apply
	@echo "Waiting for SSH to be ready on the EC2 instance..."
	sleep 15
	@$(MAKE) ansible-run
	@echo "Deployment successfully completed!"
