# Define the resources that will be created in the `tf-state` module.
# This is used for storing the Terraform state file and lock.


/*
  Purpose: Create an S3 bucket to store the Terraform state file.
  Readmore: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
*/
resource "aws_s3_bucket" "terraform_state" {
  bucket        = var.bucket_name
  force_destroy = true
}

/*
  Purpose: Enable versioning for the S3 bucket.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_versioning
*/
resource "aws_s3_bucket_versioning" "terraform_bucket_versioning" {
  bucket = aws_s3_bucket.terraform_state.bucket

  versioning_configuration {
    status = "Enabled"
  }
}


/*
  Because AWS S3 bucket encryption is automatically enabled by default, we don't need to explicitly enable it.
  Read more: https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html
*/


/*
  Purpose: Create a DynamoDB table to store the Terraform state lock.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table
*/
# resource "aws_dynamodb_table" "terraform_locks" {
#   name         = var.table_name
#   billing_mode = "PAY_PER_REQUEST"
#   hash_key     = "LockID"

#   attribute {
#     name = "LockID"
#     type = "S"
#   }

#   tags = {
#     Name        = "terraform-state-lock"
#     Environment = var.environment
#   }
# }
