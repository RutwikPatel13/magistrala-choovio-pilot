#!/bin/bash

# Quick deployment script for Choovio LoRaWAN Dashboard

# Configuration
S3_BUCKET_NAME="choovio-lorawan-dashboard-$(date +%s)"
AWS_REGION="us-east-1"

echo "🚀 Deploying Choovio LoRaWAN Dashboard to S3"
echo "Bucket: $S3_BUCKET_NAME"
echo "Region: $AWS_REGION"
echo ""

# Run the deployment
./deployment/deploy-interactive.sh