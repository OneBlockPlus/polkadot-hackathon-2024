# Define the variables that will be used in the `tf-state` module

variable "bucket_name" {
  description = "The name of the S3 bucket. Must be globally unique."
  type        = string
}

variable "table_name" {
  description = "The name of the DynamoDB table. Must be globally unique."
  type        = string
}

variable "environment" {
  description = "The environment in which the resources are created."
  type        = string
}
