#!/bin/bash

# Upload React build files to S3 for deployment
# This solves the EC2 userdata size limit issue

set -e

BUCKET_NAME="magistrala-react-assets-$(date +%s)"
REGION="us-east-1"

echo "Creating S3 bucket for React assets..."

# Create S3 bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Enable public read access for static assets
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy "{
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

# Upload React build files
echo "Uploading React build files to S3..."
cd /Users/rutwik/choovio/magistrala/custom-dashboard

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
sed -i.bak "s/magistrala-react-assets/$BUCKET_NAME/g" deploy-react-proper.sh

echo "Deployment script updated with S3 bucket name"