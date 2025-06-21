#!/bin/bash

# Upload React build files to S3 for deployment
# This solves the EC2 userdata size limit issue

set -e

BUCKET_NAME="magistrala-react-assets-$(date +%s)"
REGION="us-east-1"

echo "Creating S3 bucket for React assets..."

# Create S3 bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Note: Skipping public bucket policy due to AWS account restrictions
# The files will be accessible through EC2 deployment instead
echo "Bucket created successfully. Files will be private and accessed via EC2."

# Upload React build files
echo "Uploading React build files to S3..."
cd /Users/rutwik/choovio/magistrala-pilot-clean/custom-dashboard

# Build the React app if not already built
if [ ! -d "build" ]; then
    echo "Building React app..."
    npm run build
fi

# Upload files with proper content types
aws s3 sync build/ s3://$BUCKET_NAME/ \
    --exclude "*" \
    --include "*.html" \
    --content-type "text/html" \
    --cache-control "no-cache"

aws s3 sync build/ s3://$BUCKET_NAME/ \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript" \
    --cache-control "public, max-age=31536000"

aws s3 sync build/ s3://$BUCKET_NAME/ \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css" \
    --cache-control "public, max-age=31536000"

aws s3 sync build/ s3://$BUCKET_NAME/ \
    --exclude "*.html" \
    --exclude "*.js" \
    --exclude "*.css"

echo "✅ React files uploaded successfully!"
echo "S3 Bucket: $BUCKET_NAME"
echo "Update your deployment script to use: s3://$BUCKET_NAME"

# Update the deployment script with bucket name
cd ../scripts
sed -i.bak "s/magistrala-react-assets/$BUCKET_NAME/g" deploy-react-proper.sh

echo "Deployment script updated with S3 bucket name: $BUCKET_NAME"