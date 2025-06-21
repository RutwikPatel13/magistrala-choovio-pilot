#!/bin/bash

# Upload React build files to S3 for deployment
# This solves the EC2 userdata size limit issue

set -e

BUCKET_NAME="choovio-iot-dashboard-1750453820"
REGION="us-east-1"

echo "Updating existing S3 bucket for React assets..."
echo "Using existing bucket: $BUCKET_NAME"

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

echo "✅ Updated existing React deployment successfully!"
echo "S3 Bucket: $BUCKET_NAME"
echo "Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com/"