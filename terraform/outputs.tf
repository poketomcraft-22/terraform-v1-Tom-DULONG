output "ecr_repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "URL du registre ECR créé"
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}