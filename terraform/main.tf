provider "aws" {
  region = var.aws_default_region
}

resource "aws_instance" "tomdulong_webserver" {
  subnet_id                   = var.default_public_subnet_id
  ami                         = var.default_ubuntu_ami
  key_name                    = aws_key_pair.tomdulong_keypair.key_name
  instance_type               = var.default_instance_type
  vpc_security_group_ids      = [var.default_security_groups_id]
  associate_public_ip_address = true
  tags = {
    Name = "TOM_DULONG"
  }
}

