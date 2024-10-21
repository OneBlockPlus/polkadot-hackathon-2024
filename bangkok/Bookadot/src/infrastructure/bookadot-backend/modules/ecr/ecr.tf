# Define the resources that will be created in the `ecr` module.
# This is used for creating an ECR repository.

/*
  Purpose: Create an ECR repository.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/ecr_repository
*/
resource "aws_ecr_repository" "ecr_repo" {
  name = var.ecr_repo_name
}