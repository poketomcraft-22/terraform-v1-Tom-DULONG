# -============= REPRODUCTIBILITY AND HARDENING =========================================
SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
# ============ COLOR ANSI ==============================
INFO_COLOR := \033[36;1m
WARNING_COLOR := \033[33;1m
ERROR_COLOR := \033[31;1m
RESET_COLOR := \033[0m
# =================================================
GIT_DIR := scripts/git
ANSIBLE_DIR := ansible
TF_DIR := terraform
TF_CHG_DIR := terraform -chdir=$(TF_DIR)
# =================================================

.PHONY: help terraform ansible tf.init git.init ansible.play tf.fmt tf.build tf.destroy
.DEFAULT_GOAL := help

help: ## shows this help
	@grep -E "^[a-z0-9A-Z._-]+:.*?## .*$$" $(MAKEFILE_LIST) |\
	sort | awk 'BEGIN {FS=":.*?##"} {printf "$(INFO_COLOR)%-20s$(RESET_COLOR)%s\n", $$1, $$2}'

ansible: ## show ansible version
	@ansible --version

terraform: ## shows terraform version
	@terraform -v

tf.init:
	@$(TF_CHG_DIR) init

tf.fmt:
	@$(TF_CHG_DIR) fmt
	@echo -e "$(SUCCESS_COLOR)Formatting done$(NO_COLOR)"

tf.build: tf.fmt ## TEST
	@$(TF_CHG_DIR) plan
	@$(TF_CHG_DIR) apply --auto-approve
	@$(TF_CHG_DIR) output tomdulong_webserver_public_ip_address
	@echo -e "$(SUCCESS_COLOR)Instance created successfully$(NO_COLOR)"

tf.destroy: ## destroys terraform files
	@$(TF_CHG_DIR) destroy --auto-approve
	@echo -e "$(SUCCESS_COLOR) Instance destroyed successfully!$(NO_COLOR)"

git.init: ## initializes git
	@./$(GIT_DIR)/main.sh

ansible.play:
	@ansible-playbook $(ANSIBLE_DIR)/localhost/playbook.yml


