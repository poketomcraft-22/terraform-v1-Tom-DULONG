variable "aws_region" {
  type        = string
  description = "AWS region where resources will be deployed"
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Name of the project and associated resources"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "The project name must contain only lowercase letters, numbers, and hyphens."
  }
}
