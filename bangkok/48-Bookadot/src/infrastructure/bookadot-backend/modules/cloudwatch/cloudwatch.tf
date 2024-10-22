# Define the module for CloudWatch.

/*
  Purpose: Create a CloudWatch log group.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group
*/
resource "aws_cloudwatch_log_group" "logs_group" {
  name = var.logs_group
}