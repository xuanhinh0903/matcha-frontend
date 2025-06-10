output "apk_bucket_name" {
  description = "Name of the S3 bucket for APK storage"
  value       = aws_s3_bucket.apk_bucket.id
}

output "website_endpoint" {
  description = "Website endpoint for the APK distribution site"
  value       = aws_s3_bucket_website_configuration.apk_website.website_endpoint
}

output "website_url" {
  description = "Public URL for the APK distribution site"
  value       = "http://${aws_s3_bucket_website_configuration.apk_website.website_endpoint}"
}