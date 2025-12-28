variable "filename" {
  description = "The name of the file to create"
  type        = string
  default     = "hello.txt"
}

variable "content" {
  description = "The text content to write into the file"
  type        = string
}