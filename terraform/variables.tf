variable "aws_region" {
  type        = string
  description = "AWS region where resources will be deployed"
}

variable "project_name" {
  type        = string
  description = "Name of the project and associated resources"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "The project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "environment" {
  type        = string
  description = "Deployment environment (dev, test, prod)"

  validation {
    condition     = can(regex("^(dev|test|prod)$", var.environment))
    error_message = "The environment must be 'dev', 'test', or 'prod'."
  }
}
