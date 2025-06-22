#!/bin/bash

# S3 Deployment Script for Existing Bucket

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

# Check if bucket name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <existing-s3-bucket-name>${NC}"
    echo ""
    echo "Example:"
    echo "  $0 my-existing-bucket"
    echo ""
    echo "If you need to create a new bucket, please:"
    echo "1. Use AWS Console: https://s3.console.aws.amazon.com/"
    echo "2. Or ask your AWS admin to create a bucket"
    echo "3. Then run this script with the bucket name"
    exit 1
fi

S3_BUCKET_NAME="$1"
AWS_REGION="${2:-us-east-1}"

echo "Bucket: $S3_BUCKET_NAME"
echo "Region: $AWS_REGION"
echo ""

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials found${NC}"

# Build check
if [ ! -d "build" ]; then
    echo -e "${YELLOW}Build directory not found. Building project...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
fi

# Test bucket access
echo -e "${YELLOW}Testing bucket access...${NC}"
aws s3 ls "s3://$S3_BUCKET_NAME" --max-items 1 > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cannot access bucket: $S3_BUCKET_NAME${NC}"
    echo "Please ensure:"
    echo "1. The bucket exists"
    echo "2. You have permission to write to it"
    echo "3. The bucket name is correct"
    exit 1
fi

echo -e "${GREEN}✅ Bucket accessible${NC}"

# Upload files
echo -e "${YELLOW}Uploading files to S3...${NC}"

# Upload all files with cache
aws s3 sync build/ "s3://$S3_BUCKET_NAME" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload index.html without cache
aws s3 cp build/index.html "s3://$S3_BUCKET_NAME/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

# Upload manifest
if [ -f build/manifest.json ]; then
    aws s3 cp build/manifest.json "s3://$S3_BUCKET_NAME/manifest.json" \
        --cache-control "no-cache, no-store, must-revalidate" \
        --content-type "application/manifest+json"
fi

# Check if upload succeeded
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded successfully${NC}"
else
    echo -e "${RED}❌ Upload failed${NC}"
    exit 1
fi

# Try to get website URL
WEBSITE_URL="http://$S3_BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        🎉 Deployment Complete! 🎉            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 Deployment Details:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "S3 Bucket: $S3_BUCKET_NAME"
echo "Region: $AWS_REGION"
echo ""
echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
echo ""
echo "1. Enable Static Website Hosting (if not already enabled):"
echo "   - Go to: https://s3.console.aws.amazon.com/s3/buckets/$S3_BUCKET_NAME"
echo "   - Click 'Properties' tab"
echo "   - Scroll to 'Static website hosting'"
echo "   - Click 'Edit'"
echo "   - Enable it with index.html as both index and error document"
echo ""
echo "2. Set Bucket Policy for Public Access:"
echo "   - Click 'Permissions' tab"
echo "   - Edit 'Bucket policy'"
echo "   - Add this policy:"
echo ""
cat << EOF
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
echo ""
echo "3. Your site will be available at:"
echo "   $WEBSITE_URL"
echo ""
echo "Note: If the bucket is already configured for static hosting,"
echo "your dashboard should be live now!"

# Save deployment info
mkdir -p deployment
cat > deployment/last-deployment.json << EOF
{
  "bucket": "$S3_BUCKET_NAME",
  "region": "$AWS_REGION",
  "probable_url": "$WEBSITE_URL",
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "note": "Please ensure static website hosting is enabled"
}
EOF