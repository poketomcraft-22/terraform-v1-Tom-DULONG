output "ecr_repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "URL du registre ECR créé"
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ec2_public_ip" {
  description = "Adresse IP publique de l'instance EC2"
  value       = aws_instance.web.public_ip
}
