#!/bin/bash

# Choovio LoRaWAN Dashboard - S3 Deployment Script
# This script deploys the React build to AWS S3

# Configuration
S3_BUCKET_NAME="choovio-lorawan-dashboard"
AWS_REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID=""  # Add if using CloudFront

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Choovio LoRaWAN Dashboard - S3 Deployment${NC}"
echo "==========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    echo "Install guide: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html"
    exit 1
fi

# Check if build directory exists
if [ ! -d "build" ]; then
    echo -e "${RED}❌ Build directory not found. Running build...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed. Please fix errors and try again.${NC}"
        exit 1
    fi
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials found${NC}"

# Create S3 bucket if it doesn't exist
echo -e "${YELLOW}Checking S3 bucket...${NC}"
if aws s3api head-bucket --bucket "$S3_BUCKET_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ S3 bucket exists${NC}"
else
    echo -e "${YELLOW}Creating S3 bucket: $S3_BUCKET_NAME${NC}"
    aws s3api create-bucket --bucket "$S3_BUCKET_NAME" --region "$AWS_REGION"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create S3 bucket${NC}"
        exit 1
    fi
fi

# Enable static website hosting
echo -e "${YELLOW}Configuring bucket for static website hosting...${NC}"
aws s3 website "s3://$S3_BUCKET_NAME" --index-document index.html --error-document index.html

# Set bucket policy for public access
echo -e "${YELLOW}Setting bucket policy...${NC}"
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$S3_BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket "$S3_BUCKET_NAME" --policy file:///tmp/bucket-policy.json
rm /tmp/bucket-policy.json

# Sync build files to S3
echo -e "${YELLOW}Uploading files to S3...${NC}"
aws s3 sync build/ "s3://$S3_BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload index.html and service-worker.js with no-cache
aws s3 cp build/index.html "s3://$S3_BUCKET_NAME/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

aws s3 cp build/manifest.json "s3://$S3_BUCKET_NAME/manifest.json" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "application/manifest+json"

if [ -f build/service-worker.js ]; then
    aws s3 cp build/service-worker.js "s3://$S3_BUCKET_NAME/service-worker.js" \
        --cache-control "no-cache, no-store, must-revalidate" \
        --content-type "application/javascript"
fi

# Invalidate CloudFront cache if distribution ID is provided
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}Invalidating CloudFront cache...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --paths "/*"
fi

# Get the website URL
WEBSITE_URL="http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "==========================================="
echo -e "Website URL: ${GREEN}$WEBSITE_URL${NC}"
echo -e "S3 Bucket: ${GREEN}$S3_BUCKET_NAME${NC}"
echo -e "Region: ${GREEN}$AWS_REGION${NC}"
echo ""
echo "Note: It may take a few minutes for the DNS to propagate."
echo "If using CloudFront, use your CloudFront URL instead."