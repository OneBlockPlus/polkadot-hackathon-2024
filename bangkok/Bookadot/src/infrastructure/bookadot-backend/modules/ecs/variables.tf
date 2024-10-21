# Define the variables that will be used in the `ecr` module

variable "ecs_cluster_name" {
  description = "The name of the ECS cluster."
  type        = string
}

variable "availability_zones" {
  description = "ap-southeast-1 AZs"
  type        = list(string)
}

variable "ecs_task_definition_family" {
  description = "ECS Task Family"
  type        = string
}

variable "ecr_repo_url" {
  description = "ECR Repo URL"
  type        = string
}

variable "container_port" {
  description = "Container Port"
  type        = number
}

variable "host_port" {
  description = "Host Port"
  type        = number
}

variable "ecs_task_definition_name" {
  description = "ECS Task Name"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "ECS Task Execution Role ARN"
  type        = string
}

variable "application_load_balancer_name" {
  description = "ALB Name"
  type        = string
}

variable "target_group_name" {
  description = "ALB Target Group Name"
  type        = string
}

variable "ecs_service_name" {
  description = "ECS Service Name"
  type        = string
}

variable "memory" {
  description = "memory"
  type        = number
}
variable "cpu" {
  description = "cpu"
  type        = number
}

variable "logs_group" {
  description = "CloudWatch Logs Group Name"
  type        = string
}

variable "region" {
  description = "AWS Region"
  type        = string
}

variable "health_check_path" {
  description = "Health Check Path"
  type        = string
}

variable "enviroment" {
  description = "Environment type"
  type        = string
}

variable "app_name" {
  description = "Name of the app"
  type        = string
}

variable "app_port" {
  description = "Port of the app"
  type        = number
}

variable "app_protocol" {
  description = "Protocol http or https"
  type        = string
}

variable "app_host" {
  description = "Host"
  type        = string
}

variable "database_postgres_username" {
  description = "Postgres username"
  type        = string
}

variable "database_postgres_password" {
  description = "Postgres password"
  type        = string
}

variable "database_postgres_host" {
  description = "Postgres host"
  type        = string
}

variable "database_postgres_port" {
  description = "Postgres port"
  type        = number
}

variable "database_postgres_name" {
  description = "Database name"
  type        = string
}
