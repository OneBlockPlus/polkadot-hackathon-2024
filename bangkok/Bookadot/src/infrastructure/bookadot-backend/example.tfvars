# This file is used to set the variables

project_prefix     = "bookadot-backend"
environment        = "development"
aws_region         = "ap-southeast-1"
container_port     = 3000
host_port          = 3000
memory             = 512
cpu                = 256
domain             = ""
availability_zones = ["ap-southeast-1a", "ap-southeast-1b", "ap-southeast-1c"]
health_check_path  = "/health"

## Environment variables
app_port                   = 3000
app_host                   = "https://bookadot.thecosmicblock.com/api"
app_protocol               = "https"
database_postgres_host     = ""
database_postgres_username = "
database_postgres_password = ""
database_postgres_port     = 5432
database_postgres_name     = ""
