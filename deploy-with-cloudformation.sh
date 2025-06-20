#!/bin/bash

# Deploy using CloudFormation template
# This creates the complete S3 + CloudFront infrastructure

set -e

echo "🚀 Deploying Choovio IoT Dashboard with CloudFormation..."

STACK_NAME="choovio-iot-dashboard-stack"
REGION="us-east-1"

echo "📋 Deployment Configuration:"
echo "  Stack Name: $STACK_NAME"
echo "  Region: $REGION"
echo "  Template: cloudformation-s3-cloudfront.yaml"

# Build React app first
echo "📦 Building React application..."
cd custom-dashboard
npm run build
cd ..

# Deploy CloudFormation stack
echo "☁️ Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file cloudformation-s3-cloudfront.yaml \
    --stack-name $STACK_NAME \
    --region $REGION \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides \
        Environment=production

# Get stack outputs
echo "📊 Getting deployment details..."
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
    --output text)

CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontURL`].OutputValue' \
    --output text)

WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`BucketWebsiteURL`].OutputValue' \
    --output text)

echo "✅ CloudFormation stack deployed successfully!"

# Upload React build files
echo "📤 Uploading React build files..."
aws s3 sync custom-dashboard/build/ s3://$BUCKET_NAME/ \
    --delete \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "*.html"

# Upload HTML with no-cache
aws s3 cp custom-dashboard/build/index.html s3://$BUCKET_NAME/index.html \
    --cache-control "no-cache,no-store,must-revalidate"

# Create CloudFront invalidation
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

echo "🔄 Creating CloudFront invalidation..."
aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" > /dev/null

echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo ""
echo "📋 Access URLs:"
echo "  S3 Website: $WEBSITE_URL"
echo "  CloudFront: https://$CLOUDFRONT_URL"
echo ""
echo "📊 Infrastructure Details:"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  CloudFront ID: $DISTRIBUTION_ID"
echo "  Stack Name: $STACK_NAME"
echo ""
echo "⚡ CloudFront URL (recommended): https://$CLOUDFRONT_URL"
echo "🔒 HTTPS is enabled and CDN cached globally"
echo ""
echo "⏳ Note: CloudFront may take 10-15 minutes to fully propagate"

# Test S3 endpoint
echo "🧪 Testing deployment..."
sleep 5
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ S3 website is live and responding!"
else
    echo "⏳ S3 website is still propagating (HTTP $HTTP_CODE)"
fi

echo ""
echo "🎯 Your Choovio IoT Dashboard is now deployed to AWS!"