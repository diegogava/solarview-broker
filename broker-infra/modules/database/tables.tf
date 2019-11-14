resource "aws_dynamodb_table" "history_dynamodb_table" {
  name            = "${var.history_dynamodb_table}"
  hash_key        = "serial"
  range_key       = "date"
  read_capacity   = 1
  write_capacity  = 1
  attribute {
    name = "serial"
    type = "S"
  }
  attribute {
    name = "date"
    type = "S"
  }
}

resource "aws_dynamodb_table" "association_dynamodb_table" {
  name            = "${var.association_dynamodb_table}"
  hash_key        = "serial"
  read_capacity   = 1
  write_capacity  = 1
  attribute {
    name = "serial"
    type = "S"
  }
}