variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "tp2-docker-ecs"
  description = "Nom du projet et des ressources associées"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Le nom du projet ne doit contenir que des lettres minuscules, chiffres et tirets."
  }
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Nom de l'environnement (dev, test, prod)"

  validation {
    condition     = can(regex("^(dev|test|prod)$", var.environment))
    error_message = "L'environnement doit être 'dev', 'test' ou 'prod'."
  }
}
