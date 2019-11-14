provider "aws" {
  region      = "${var.aws_region}"
  access_key  = "${var.aws_access_key}"
  secret_key  = "${var.aws_secret_key}"
  version     = "~> 2.0"
}

module "database" {
  source = "./modules/database"
  history_dynamodb_table = "history"
  association_dynamodb_table = "associate"
}