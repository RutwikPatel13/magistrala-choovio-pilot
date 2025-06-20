#!/bin/bash

# Deploy Choovio React Frontend to S3 + CloudFront
# This script requires AWS admin permissions to create S3 buckets and CloudFront distributions

set -e

echo "🚀 Deploying Choovio IoT Dashboard to S3 + CloudFront..."

# Configuration
BUCKET_NAME="choovio-iot-dashboard-$(date +%s)"
REGION="us-east-1"
BUILD_DIR="./build"

echo "📋 Deployment Configuration:"
echo "  Bucket Name: $BUCKET_NAME"
echo "  Region: $REGION"
echo "  Build Directory: $BUILD_DIR"

# Step 1: Build the React application
echo "📦 Building React application..."
npm run build

echo "✅ Build completed. Build size: $(du -sh $BUILD_DIR | cut -f1)"

# Step 2: Create S3 bucket
echo "🪣 Creating S3 bucket..."
aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $REGION

# Step 3: Configure bucket for static website hosting
echo "🌐 Configuring S3 for static website hosting..."
aws s3api put-bucket-website \
    --bucket $BUCKET_NAME \
    --website-configuration '{
        "IndexDocument": {
            "Suffix": "index.html"
        },
        "ErrorDocument": {
            "Key": "index.html"
        }
    }'

# Step 4: Make bucket public for website hosting
echo "🔓 Setting bucket policy for public access..."
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy "{
        \"Version\": \"2012-10-17\",
        \"Statement\": [
            {
                \"Sid\": \"PublicReadGetObject\",
                \"Effect\": \"Allow\",
                \"Principal\": \"*\",
                \"Action\": \"s3:GetObject\",
                \"Resource\": \"arn:aws:s3:::$BUCKET_NAME/*\"
            }
        ]
    }"

# Step 5: Upload build files to S3
echo "📤 Uploading React build files to S3..."

# Upload HTML files with no-cache headers
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME/ \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --metadata-directive REPLACE

# Upload JavaScript files with long cache
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME/ \
    --exclude "*" \
    --include "*.js" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "application/javascript" \
    --metadata-directive REPLACE

# Upload CSS files with long cache
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME/ \
    --exclude "*" \
    --include "*.css" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "text/css" \
    --metadata-directive REPLACE

# Upload other static assets
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME/ \
    --exclude "*.html" \
    --exclude "*.js" \
    --exclude "*.css" \
    --cache-control "public, max-age=31536000"

# Step 6: Create CloudFront distribution
echo "☁️ Creating CloudFront distribution..."

DISTRIBUTION_CONFIG="{
    \"CallerReference\": \"choovio-iot-$(date +%s)\",
    \"Comment\": \"Choovio IoT Dashboard CDN\",
    \"DefaultCacheBehavior\": {
        \"TargetOriginId\": \"S3-$BUCKET_NAME\",
        \"ViewerProtocolPolicy\": \"redirect-to-https\",
        \"MinTTL\": 0,
        \"DefaultTTL\": 86400,
        \"MaxTTL\": 31536000,
        \"Compress\": true,
        \"ForwardedValues\": {
            \"QueryString\": false,
            \"Cookies\": {
                \"Forward\": \"none\"
            }
        },
        \"TrustedSigners\": {
            \"Enabled\": false,
            \"Quantity\": 0
        }
    },
    \"Origins\": {
        \"Quantity\": 1,
        \"Items\": [
            {
                \"Id\": \"S3-$BUCKET_NAME\",
                \"DomainName\": \"$BUCKET_NAME.s3.amazonaws.com\",
                \"S3OriginConfig\": {
                    \"OriginAccessIdentity\": \"\"
                }
            }
        ]
    },
    \"Enabled\": true,
    \"DefaultRootObject\": \"index.html\",
    \"CustomErrorResponses\": {
        \"Quantity\": 1,
        \"Items\": [
            {
                \"ErrorCode\": 404,
                \"ResponsePagePath\": \"/index.html\",
                \"ResponseCode\": \"200\",
                \"ErrorCachingMinTTL\": 300
            }
        ]
    },
    \"PriceClass\": \"PriceClass_100\"
}"

DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config "$DISTRIBUTION_CONFIG" \
    --query 'Distribution.Id' \
    --output text)

# Get CloudFront domain name
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id $DISTRIBUTION_ID \
    --query 'Distribution.DomainName' \
    --output text)

echo "✅ CloudFront distribution created!"
echo "Distribution ID: $DISTRIBUTION_ID"
echo "Domain: $CLOUDFRONT_DOMAIN"

# Step 7: Wait for distribution to deploy (optional)
echo "⏳ CloudFront distribution is deploying..."
echo "This can take 10-15 minutes to fully propagate globally."

# Output URLs
echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo ""
echo "📋 Access URLs:"
echo "  S3 Website: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "  CloudFront: https://$CLOUDFRONT_DOMAIN"
echo ""
echo "📊 Deployment Details:"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  CloudFront ID: $DISTRIBUTION_ID"
echo "  Region: $REGION"
echo "  Build Size: $(du -sh $BUILD_DIR | cut -f1)"
echo ""
echo "⚡ The CloudFront URL will be the fastest and most reliable."
echo "🔒 HTTPS is automatically enabled on CloudFront."

# Test S3 endpoint
echo "🧪 Testing S3 endpoint..."
sleep 5
S3_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com")
if [ "$S3_HTTP_CODE" = "200" ]; then
    echo "✅ S3 website is live and responding!"
else
    echo "⏳ S3 website is still propagating (HTTP $S3_HTTP_CODE)"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Wait 10-15 minutes for CloudFront to fully deploy"
echo "2. Test the CloudFront URL: https://$CLOUDFRONT_DOMAIN"
echo "3. Configure custom domain (optional)"
echo "4. Set up SSL certificate (optional)"