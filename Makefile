SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c

INFO_COLOR := \033[36;1m
RESET_COLOR := \033[0m

.PHONY: help
.DEFAULT_GOAL := help

help: ## Affiche cette aide
	@grep -E "^[a-z0-9A-Z._-]+:.*?## .*$$" $(MAKEFILE_LIST) | \
	sort | awk 'BEGIN {FS=":.*?##"} {printf "$(INFO_COLOR)%-15s$(RESET_COLOR)%s\n", $$1, $$2}'