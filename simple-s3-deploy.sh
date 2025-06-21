#!/bin/bash

# Simple S3 deployment without CloudFormation
# Requires basic S3 permissions only

set -e

echo "🚀 Deploying Choovio IoT Dashboard to S3..."

# Generate unique bucket name
TIMESTAMP=$(date +%s)
BUCKET_NAME="choovio-iot-dashboard-$TIMESTAMP"
REGION="us-east-1"

echo "📋 Deployment Configuration:"
echo "  Bucket Name: $BUCKET_NAME"
echo "  Region: $REGION"
echo "  Build Source: custom-dashboard/build/"

# Test AWS permissions
echo "🔐 Testing AWS permissions..."
aws sts get-caller-identity

# Try to create bucket
echo "📦 Creating S3 bucket..."
if aws s3api create-bucket --bucket $BUCKET_NAME --region $REGION; then
    echo "✅ S3 bucket created successfully!"
else
    echo "❌ Failed to create S3 bucket. Need s3:CreateBucket permission."
    exit 1
fi

# Enable static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public read
echo "🔓 Setting public read policy..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Upload React build files
echo "📤 Uploading React build files..."
cd custom-dashboard

# Upload static assets with long cache
aws s3 sync build/ s3://$BUCKET_NAME/ \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "*.html"

# Upload HTML with no cache
aws s3 cp build/index.html s3://$BUCKET_NAME/index.html \
    --cache-control "no-cache,no-store,must-revalidate"

cd ..

# Clean up temp files
rm -f bucket-policy.json

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo ""
echo "📋 Access URL:"
echo "  S3 Website: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo ""
echo "📊 Deployment Details:"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo "  Files Uploaded: $(aws s3 ls s3://$BUCKET_NAME --recursive | wc -l) files"
echo ""
echo "🧪 Testing deployment..."
sleep 3
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Website is live and responding!"
    echo "🌐 Visit: $WEBSITE_URL"
else
    echo "⏳ Website is still propagating (HTTP $HTTP_CODE)"
    echo "🌐 Try: $WEBSITE_URL (may take a few minutes)"
fi

echo ""
echo "🎯 Your Choovio IoT Dashboard is now deployed!"