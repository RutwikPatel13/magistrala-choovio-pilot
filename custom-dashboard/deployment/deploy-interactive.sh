#!/bin/bash

# Interactive S3 Deployment Script for Choovio LoRaWAN Dashboard

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Choovio LoRaWAN Dashboard S3 Deployment    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed.${NC}"
    echo ""
    echo "To install AWS CLI:"
    echo "- Mac: brew install awscli"
    echo "- Linux: sudo apt-get install awscli"
    echo "- Or visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo ""
    echo "Please run: aws configure"
    echo "You'll need:"
    echo "- AWS Access Key ID"
    echo "- AWS Secret Access Key"
    echo "- Default region (e.g., us-east-1)"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials found${NC}"
echo ""

# Get AWS account info
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CURRENT_REGION=$(aws configure get region)

echo "AWS Account ID: $ACCOUNT_ID"
echo "Default Region: $CURRENT_REGION"
echo ""

# Ask for S3 bucket name
echo -e "${YELLOW}Enter S3 bucket name for deployment:${NC}"
echo "(Must be globally unique, lowercase, no spaces)"
read -p "Bucket name: " S3_BUCKET_NAME

if [ -z "$S3_BUCKET_NAME" ]; then
    echo -e "${RED}❌ Bucket name cannot be empty${NC}"
    exit 1
fi

# Validate bucket name
if [[ ! "$S3_BUCKET_NAME" =~ ^[a-z0-9][a-z0-9\-]*[a-z0-9]$ ]]; then
    echo -e "${RED}❌ Invalid bucket name. Use only lowercase letters, numbers, and hyphens.${NC}"
    exit 1
fi

# Ask for region
echo ""
echo -e "${YELLOW}Enter AWS region (press Enter for $CURRENT_REGION):${NC}"
read -p "Region: " AWS_REGION
AWS_REGION=${AWS_REGION:-$CURRENT_REGION}

# Ask about CloudFront
echo ""
echo -e "${YELLOW}Do you want to use CloudFront CDN? (y/n)${NC}"
read -p "Use CloudFront: " USE_CLOUDFRONT

# Build the project
echo ""
echo -e "${YELLOW}Building the project...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Create or check S3 bucket
echo ""
echo -e "${YELLOW}Setting up S3 bucket...${NC}"
if aws s3api head-bucket --bucket "$S3_BUCKET_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ Using existing bucket: $S3_BUCKET_NAME${NC}"
else
    echo "Creating new bucket: $S3_BUCKET_NAME"
    if [ "$AWS_REGION" == "us-east-1" ]; then
        aws s3api create-bucket --bucket "$S3_BUCKET_NAME" --region "$AWS_REGION"
    else
        aws s3api create-bucket --bucket "$S3_BUCKET_NAME" --region "$AWS_REGION" \
            --create-bucket-configuration LocationConstraint="$AWS_REGION"
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create bucket. It may already exist or the name is taken.${NC}"
        exit 1
    fi
fi

# Enable static website hosting
echo -e "${YELLOW}Configuring static website hosting...${NC}"
aws s3 website "s3://$S3_BUCKET_NAME" --index-document index.html --error-document index.html

# Set bucket policy
echo -e "${YELLOW}Setting public access policy...${NC}"
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

# Remove block public access (required for public websites)
aws s3api put-public-access-block --bucket "$S3_BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

aws s3api put-bucket-policy --bucket "$S3_BUCKET_NAME" --policy file:///tmp/bucket-policy.json
rm /tmp/bucket-policy.json

# Upload files
echo ""
echo -e "${YELLOW}Uploading files to S3...${NC}"
aws s3 sync build/ "s3://$S3_BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload special files with no-cache
aws s3 cp build/index.html "s3://$S3_BUCKET_NAME/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

aws s3 cp build/manifest.json "s3://$S3_BUCKET_NAME/manifest.json" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "application/manifest+json"

# Setup CloudFront if requested
CLOUDFRONT_URL=""
if [[ "$USE_CLOUDFRONT" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Creating CloudFront distribution...${NC}"
    
    DISTRIBUTION_CONFIG=$(cat <<EOF
{
    "CallerReference": "choovio-dashboard-$(date +%s)",
    "Comment": "Choovio LoRaWAN Dashboard",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$S3_BUCKET_NAME",
                "DomainName": "$S3_BUCKET_NAME.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$S3_BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000
    },
    "Enabled": true
}
EOF
)
    
    # Create distribution
    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config "$DISTRIBUTION_CONFIG" \
        --query 'Distribution.Id' \
        --output text)
    
    if [ ! -z "$DISTRIBUTION_ID" ]; then
        CLOUDFRONT_URL=$(aws cloudfront get-distribution \
            --id "$DISTRIBUTION_ID" \
            --query 'Distribution.DomainName' \
            --output text)
        echo -e "${GREEN}✅ CloudFront distribution created${NC}"
    fi
fi

# Get URLs
WEBSITE_URL="http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

# Success message
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        🎉 Deployment Successful! 🎉          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Details:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "S3 Bucket: $S3_BUCKET_NAME"
echo "Region: $AWS_REGION"
echo "S3 Website URL: $WEBSITE_URL"

if [ ! -z "$CLOUDFRONT_URL" ]; then
    echo "CloudFront URL: https://$CLOUDFRONT_URL"
    echo ""
    echo -e "${YELLOW}Note: CloudFront distribution may take 15-20 minutes to deploy globally.${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Your Choovio LoRaWAN Dashboard is live!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save deployment info
echo ""
echo -e "${YELLOW}Saving deployment information...${NC}"
cat > deployment/deployment-info.json << EOF
{
  "bucket": "$S3_BUCKET_NAME",
  "region": "$AWS_REGION",
  "s3_url": "$WEBSITE_URL",
  "cloudfront_url": "$CLOUDFRONT_URL",
  "cloudfront_id": "$DISTRIBUTION_ID",
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "account_id": "$ACCOUNT_ID"
}
EOF

echo -e "${GREEN}✅ Deployment info saved to deployment/deployment-info.json${NC}"