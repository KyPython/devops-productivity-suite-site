# TODO: Replace this with actual cloud resources (e.g., AWS S3, EC2) once credentials are set up.
resource "local_file" "foo" {
  content  = var.content
  filename = "${path.module}/${var.filename}"
}
