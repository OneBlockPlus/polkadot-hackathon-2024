# Define the module for IAM.

/*
  Purpose: Create a IAM role for the ECS task execution.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
*/
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = var.ecs_task_execution_role_name
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

/*
  Purpose: Attach the Amazon ECS task execution IAM policy to the IAM role.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
*/
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}