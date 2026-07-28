variable "aws_default_region" {
}

variable "default_ubuntu_ami" {
  type    = string
}

variable "default_vpc_id" {
  type    = string
}

variable "default_public_subnet_id" {
  type    = string
}

variable "default_instance_type" {
  type    = string
}

resource "aws_key_pair" "tomdulong_keypair" {
  key_name   = "tomdulong_keypair"
  public_key = file("${path.module}/../tomdulong_keypair.pub")
}

variable "default_security_groups_id" {
  type    = string
}