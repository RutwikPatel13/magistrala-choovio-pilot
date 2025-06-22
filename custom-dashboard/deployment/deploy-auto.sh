#!/bin/bash

# Automated S3 Deployment Script for Choovio LoRaWAN Dashboard

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Generate unique bucket name
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
S3_BUCKET_NAME="choovio-lorawan-dashboard-${TIMESTAMP}"
AWS_REGION="us-east-1"

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Choovio LoRaWAN Dashboard S3 Deployment    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials found${NC}"

# Get AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"
echo "Region: $AWS_REGION"
echo "Bucket Name: $S3_BUCKET_NAME"
echo ""

# Build check
if [ ! -d "build" ]; then
    echo -e "${YELLOW}Build directory not found. Building project...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
fi

# Create S3 bucket
echo -e "${YELLOW}Creating S3 bucket...${NC}"
aws s3api create-bucket --bucket "$S3_BUCKET_NAME" --region "$AWS_REGION"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create bucket${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Bucket created successfully${NC}"

# Enable static website hosting
echo -e "${YELLOW}Configuring static website hosting...${NC}"
aws s3 website "s3://$S3_BUCKET_NAME" --index-document index.html --error-document index.html

# Remove block public access
echo -e "${YELLOW}Setting public access...${NC}"
aws s3api put-public-access-block --bucket "$S3_BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Set bucket policy
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

# Upload files
echo -e "${YELLOW}Uploading files to S3...${NC}"
aws s3 sync build/ "s3://$S3_BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload special files
aws s3 cp build/index.html "s3://$S3_BUCKET_NAME/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

aws s3 cp build/manifest.json "s3://$S3_BUCKET_NAME/manifest.json" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "application/manifest+json"

# Get URL
WEBSITE_URL="http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        🎉 Deployment Successful! 🎉          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Details:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "S3 Bucket: $S3_BUCKET_NAME"
echo "Region: $AWS_REGION"
echo ""
echo -e "${GREEN}🌐 Your dashboard is live at:${NC}"
echo -e "${BLUE}$WEBSITE_URL${NC}"
echo ""
echo "Note: It may take 1-2 minutes for DNS to propagate."

# Save deployment info
mkdir -p deployment
cat > deployment/last-deployment.json << EOF
{
  "bucket": "$S3_BUCKET_NAME",
  "region": "$AWS_REGION",
  "url": "$WEBSITE_URL",
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "account_id": "$ACCOUNT_ID"
}
EOF

echo ""
echo -e "${YELLOW}Deployment info saved to deployment/last-deployment.json${NC}"