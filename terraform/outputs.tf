output "ecr_repository_url" {
  value       = aws_ecr_repository.app.repository_url
  description = "URL of the created ECR registry"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "Name of the ECS cluster"
}

output "ec2_public_ip" {
  value       = aws_instance.web.public_ip
  description = "Public IP address of the EC2 instance"
}
