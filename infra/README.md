# Matcha Frontend Infrastructure

This directory contains the Terraform configuration for deploying the infrastructure needed for Matcha APK distribution on AWS.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) installed (v1.5+)
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured with appropriate credentials
- S3 bucket for Terraform state storage named `matcha-terraform-toandev-state`
- DynamoDB table for state locking named `matcha-terraform-toandev-locks`

## Resources Created

- S3 bucket configured for static website hosting
- Public access policy for APK download
- Basic HTML landing page for app distribution

## Setup and Deployment

### 1. Initialize Terraform State Storage

Before running the Terraform configuration, you need to create an S3 bucket and DynamoDB table for state management (if not already created for the backend):

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket --bucket matcha-terraform-toandev-state --region us-east-1

# Enable versioning on the bucket
aws s3api put-bucket-versioning --bucket matcha-terraform-toandev-state --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name matcha-terraform-toandev-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. Create a `terraform.tfvars` File

Create a file named `terraform.tfvars` in the terraform directory with your specific values:

```hcl
aws_region      = "us-east-1"
apk_bucket_name = "matcha-app-distribution" # Must be globally unique
```

### 3. Initialize and Apply Terraform Configuration

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 4. Configure GitHub Secrets

After applying the Terraform configuration, add the following secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: The AWS region where resources are deployed
- `APK_BUCKET_NAME`: The name of your created S3 bucket
- `EXPO_TOKEN`: Your Expo access token
- `EXPO_USERNAME`: Your Expo account username
- `EXPO_PASSWORD`: Your Expo account password

## Expo Build Configuration

Make sure your project has a proper `eas.json` file to configure the Android build:

```json
{
  "cli": {
    "version": ">= 0.60.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

## Updating Infrastructure

To update the infrastructure, make changes to the Terraform files and run:

```bash
terraform plan
terraform apply
```

## Accessing Your APK

After deployment, the APK will be available at:

```
http://<your-bucket-name>.s3-website-<region>.amazonaws.com/
```

For example:

```
http://matcha-app-distribution.s3-website-us-east-1.amazonaws.com/
```

## Cleaning Up

To remove all resources created by this configuration:

```bash
terraform destroy
```
