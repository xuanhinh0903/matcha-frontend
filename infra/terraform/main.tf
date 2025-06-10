provider "aws" {
  region = var.aws_region
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "matcha-terraform-toandev"
    key            = "frontend/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "matcha-terraform-toandev-locks"
  }
}

# S3 bucket for storing APK files
resource "aws_s3_bucket" "apk_bucket" {
  bucket = var.apk_bucket_name

  tags = {
    Name = "Matcha APK Storage"
  }
}

# S3 bucket ownership controls
resource "aws_s3_bucket_ownership_controls" "apk_bucket_ownership" {
  bucket = aws_s3_bucket.apk_bucket.id
  
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "apk_bucket_access" {
  bucket = aws_s3_bucket.apk_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket policy to allow public access to APK files
resource "aws_s3_bucket_policy" "apk_bucket_policy" {
  bucket = aws_s3_bucket.apk_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.apk_bucket.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.apk_bucket_access]
}

# Enable static website hosting on the S3 bucket
resource "aws_s3_bucket_website_configuration" "apk_website" {
  bucket = aws_s3_bucket.apk_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

# Upload default index.html file
resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.apk_bucket.id
  key          = "index.html"
  content_type = "text/html"
  content      = <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matcha App Download</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }
    .container {
      text-align: center;
      background-color: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      max-width: 500px;
    }
    h1 {
      color: #333;
    }
    .logo {
      width: 120px;
      margin-bottom: 1rem;
    }
    .download-btn {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 1rem;
      transition: background-color 0.3s;
    }
    .download-btn:hover {
      background-color: #45a049;
    }
    .version {
      color: #666;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="logo.png" alt="Matcha Logo" class="logo">
    <h1>Matcha App</h1>
    <p>Download the latest version of the Matcha App</p>
    <a href="matcha-app.apk" class="download-btn" download>Download APK</a>
    <p class="version">Latest version: 1.0.0</p>
  </div>
</body>
</html>
EOF
}

# Upload error.html file
resource "aws_s3_object" "error_html" {
  bucket       = aws_s3_bucket.apk_bucket.id
  key          = "error.html"
  content_type = "text/html"
  content      = <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error - Matcha App</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px;
    }
    h1 {
      color: #e74c3c;
    }
  </style>
</head>
<body>
  <h1>Oops! Something went wrong</h1>
  <p>We couldn't find what you were looking for.</p>
  <a href="/">Go back to home</a>
</body>
</html>
EOF
}