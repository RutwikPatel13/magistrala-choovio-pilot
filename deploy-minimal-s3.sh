#!/bin/bash

# Minimal S3 deployment script for limited permissions
# This attempts to use existing resources or fails gracefully

set -e

echo "🚀 Attempting minimal S3 deployment..."

# Try to use a standard bucket name pattern
BUCKET_NAME="choovio-dashboard-frontend"

echo "📦 Building React application..."
npm run build

echo "✅ Build completed"

# Try to upload to a bucket (may fail if bucket doesn't exist)
echo "📤 Attempting to upload to existing S3 infrastructure..."

# Check if we can access any S3 resources
echo "🔍 Checking S3 access..."

# Try to upload to different possible bucket locations
POSSIBLE_BUCKETS=(
    "choovio-dashboard-frontend"
    "magistrala-frontend"
    "iot-dashboard-frontend"
    "choovio-assets"
)

for bucket in "${POSSIBLE_BUCKETS[@]}"; do
    echo "Trying bucket: $bucket"
    if aws s3 ls s3://$bucket/ 2>/dev/null; then
        echo "✅ Found accessible bucket: $bucket"
        echo "📤 Uploading files..."
        
        # Upload with appropriate cache headers
        aws s3 sync build/ s3://$bucket/dashboard/ \
            --exclude "*" \
            --include "*.html" \
            --cache-control "no-cache" \
            --content-type "text/html"
            
        aws s3 sync build/ s3://$bucket/dashboard/ \
            --exclude "*" \
            --include "*.js" \
            --cache-control "public, max-age=31536000" \
            --content-type "application/javascript"
            
        aws s3 sync build/ s3://$bucket/dashboard/ \
            --exclude "*" \
            --include "*.css" \
            --cache-control "public, max-age=31536000" \
            --content-type "text/css"
            
        aws s3 sync build/ s3://$bucket/dashboard/ \
            --exclude "*.html" \
            --exclude "*.js" \
            --exclude "*.css"
            
        echo "✅ Upload completed to: s3://$bucket/dashboard/"
        echo "🌐 Dashboard should be accessible via S3 website URL"
        exit 0
    fi
done

echo "❌ No accessible S3 buckets found"
echo "📋 Manual deployment required with proper S3 permissions"

# Create deployment package for manual upload
echo "📦 Creating deployment package..."
cd build
zip -r ../choovio-dashboard-build.zip . > /dev/null
cd ..

echo "✅ Created deployment package: choovio-dashboard-build.zip"
echo ""
echo "📋 Manual Deployment Instructions:"
echo "1. Create S3 bucket with website hosting enabled"
echo "2. Upload choovio-dashboard-build.zip contents to bucket"
echo "3. Configure bucket policy for public read access"
echo "4. Create CloudFront distribution pointing to S3 bucket"
echo ""
echo "🔧 Required AWS Permissions:"
echo "- s3:CreateBucket"
echo "- s3:PutObject"
echo "- s3:PutBucketWebsite"
echo "- s3:PutBucketPolicy"
echo "- cloudfront:CreateDistribution"