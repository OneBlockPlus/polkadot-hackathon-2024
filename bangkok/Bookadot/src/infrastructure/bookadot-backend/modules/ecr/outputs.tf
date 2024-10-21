# Define the output values that will be returned when the `ecr` module is called.

output "repository_url" {
  value = aws_ecr_repository.ecr_repo.repository_url
}