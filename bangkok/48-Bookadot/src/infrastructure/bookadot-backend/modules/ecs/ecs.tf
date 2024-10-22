# Define the module for ECS.
# This is used for creating the ECS cluster and the ECS service.

/*
  /*
  Purpose: Create an ECS cluster.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_cluster
*/
resource "aws_ecs_cluster" "ecs_cluster" {
  name = var.ecs_cluster_name
}

/*
  Purpose: Use the default VPC and subnets for the ECS cluster.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/default_vpc
*/
resource "aws_default_vpc" "default_vpc" {}

/*
  Purpose: Use the default subnets_a for the ECS cluster.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/default_subnet
*/
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = var.availability_zones[0]
}
resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = var.availability_zones[1]
}
resource "aws_default_subnet" "default_subnet_c" {
  availability_zone = var.availability_zones[2]
}

/*
  Purpose: Create a task definition for the ECS service.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_definition
*/
resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                = var.ecs_task_definition_family
  container_definitions = <<TASK_DEFINITION
  [
    {
      "name": "${var.ecs_task_definition_name}",
      "image": "${var.ecr_repo_url}",
      "essential": true,
      "portMappings": [
        {
          "containerPort": ${var.container_port},
          "hostPort": ${var.host_port}
        }
      ],
      "memory": ${var.memory},
      "cpu": ${var.cpu},
      "logConfiguration": {
				"logDriver": "awslogs",
        "options": {
					"awslogs-group": "${var.logs_group}",
					"awslogs-region": "${var.region}",
					"awslogs-stream-prefix": "[${var.ecs_cluster_name}] "
				}
			},
      "environment": [
          { "name": "ENV", "value": "${var.enviroment}" },
          { "name": "APP_NAME", "value": "${var.app_name}" },
          { "name": "APP_PORT", "value": "${var.app_port}" },
          { "name": "APP_SERVER_METHOD", "value": "${var.app_protocol}" },
          { "name": "APP_SERVER_HOST", "value": "${var.app_host}" },
          { "name": "DATABASE_POSTGRES_USERNAME", "value": "${var.database_postgres_username}" },
          { "name": "DATABASE_POSTGRES_PASSWORD", "value": "${var.database_postgres_password}" },
          { "name": "DATABASE_POSTGRES_HOST", "value": "${var.database_postgres_host}" },
          { "name": "DATABASE_POSTGRES_PORT", "value": "${var.database_postgres_port}" },
          { "name": "DATABASE_POSTGRES_NAME", "value": "${var.database_postgres_name}" }
      ]
    }
  ]
  TASK_DEFINITION

  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = var.memory
  cpu                      = var.cpu
  execution_role_arn       = var.ecs_task_execution_role_arn
}


/*
  Purpose: Create a Application Load Balancer for the ECS service.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb
*/
resource "aws_lb" "application_load_balancer" {
  name               = var.application_load_balancer_name
  load_balancer_type = "application"
  subnets = [
    "${aws_default_subnet.default_subnet_a.id}",
    "${aws_default_subnet.default_subnet_b.id}",
    "${aws_default_subnet.default_subnet_c.id}"
  ]
  security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
}

/*
  Purpose: Create a security group for the Application Load Balancer.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group
*/
resource "aws_security_group" "load_balancer_security_group" {
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

/*
  Purpose: Create a target group for the Application Load Balancer.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group
*/
resource "aws_lb_target_group" "target_group" {
  name        = var.target_group_name
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default_vpc.id
  health_check {
    path = var.health_check_path
  }
}

/*
  Purpose: Create a listener for the Application Load Balancer.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener
*/
resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.application_load_balancer.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }
}

/*
  Purpose: Create a service for the ECS cluster.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service
*/
resource "aws_ecs_service" "ecs_service" {
  name            = var.ecs_service_name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn
    container_name   = aws_ecs_task_definition.ecs_task_definition.family
    container_port   = var.container_port
  }

  network_configuration {
    subnets          = ["${aws_default_subnet.default_subnet_a.id}", "${aws_default_subnet.default_subnet_b.id}", "${aws_default_subnet.default_subnet_c.id}"]
    assign_public_ip = true
    security_groups  = ["${aws_security_group.service_security_group.id}"]
  }
}

/*
  Purpose: Create a security group for the ECS service.
  Read more: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group
*/
resource "aws_security_group" "service_security_group" {
  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = ["${aws_security_group.load_balancer_security_group.id}"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
