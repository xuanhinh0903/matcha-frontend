variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "apk_bucket_name" {
  description = "Name of the S3 bucket for APK storage and distribution"
  type        = string
  default     = "matcha-app-distribution"
}