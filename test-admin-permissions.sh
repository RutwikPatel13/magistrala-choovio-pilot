#!/bin/bash

echo "🔐 Testing Administrator Permissions..."
echo "User: $(aws sts get-caller-identity --query Arn --output text)"
echo ""

# Test S3 permissions
echo "📦 Testing S3 permissions..."
if aws s3 ls > /dev/null 2>&1; then
    echo "✅ S3 ListBuckets: OK"
else
    echo "❌ S3 ListBuckets: DENIED"
fi

# Test CloudFormation permissions  
echo "☁️ Testing CloudFormation permissions..."
if aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE > /dev/null 2>&1; then
    echo "✅ CloudFormation ListStacks: OK"
else
    echo "❌ CloudFormation ListStacks: DENIED"
fi

# Test IAM permissions
echo "👤 Testing IAM permissions..."
if aws iam get-user > /dev/null 2>&1; then
    echo "✅ IAM GetUser: OK"
else
    echo "❌ IAM GetUser: DENIED"
fi

echo ""
echo "🎯 Permission Status:"
if aws s3 ls > /dev/null 2>&1 && aws cloudformation list-stacks > /dev/null 2>&1; then
    echo "✅ READY FOR DEPLOYMENT"
    echo "Run: ./deploy-with-cloudformation.sh"
else
    echo "⏳ WAITING FOR PERMISSIONS"
    echo "Admin permissions may need 1-5 minutes to propagate"
    echo "Re-run this script to check status"
fi