# Purpose: Define the variables that will be used in the terraform code

variable "aws_region" {
  description = "The AWS region"
}

variable "project_prefix" {
  description = "The prefix to use for all resources"
  type        = string
}

variable "environment" {
  description = "The environment to deploy to"
  type        = string
}

variable "host_port" {
  description = "host port"
  type        = number
}

variable "container_port" {
  description = "Container Port"
  type        = number
}

variable "memory" {
  description = "memory"
  type        = number
}
variable "cpu" {
  description = "cpu"
  type        = number
}

variable "availability_zones" {
  description = "us-east-1 AZs"
  type        = list(string)
}

variable "domain" {
  description = "domain"
  type        = string
}

variable "health_check_path" {
  description = "Health Check Path"
  type        = string
}

variable "app_port" {
  description = "Port"
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
