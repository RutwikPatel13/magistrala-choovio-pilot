# Choovio IoT Dashboard - S3 + CloudFront Deployment Instructions

## 🎯 Deployment Summary

Your React dashboard has been **successfully built** and is ready for S3 + CloudFront deployment. The current AWS user has limited permissions, so manual deployment by an admin is required.

## 📦 What's Ready

### ✅ Built React Application
- **Main JS Bundle**: 187.31 kB (optimized & gzipped)
- **CSS Bundle**: 648 B (optimized & gzipped)  
- **Build Location**: `custom-dashboard/build/`
- **Deployment Package**: `custom-dashboard/choovio-dashboard-build.zip`

### ✅ Deployment Infrastructure
- **CloudFormation Template**: `cloudformation-s3-cloudfront.yaml`
- **Automated Scripts**: `deploy-with-cloudformation.sh`
- **Manual Instructions**: This document

---

## 🚀 Option 1: Automated CloudFormation Deployment

**Requirements**: AWS admin permissions for CloudFormation, S3, CloudFront

```bash
# Run this with proper AWS admin credentials
./deploy-with-cloudformation.sh
```

**What it creates:**
- S3 bucket with static website hosting
- CloudFront distribution with global CDN
- Proper caching policies for React assets
- HTTPS enabled by default
- Custom error pages for SPA routing

---

## 🛠️ Option 2: Manual AWS Console Deployment

### Step 1: Create S3 Bucket

1. **Go to AWS S3 Console**
2. **Create bucket**: `choovio-iot-dashboard-[timestamp]`
3. **Enable static website hosting**:
   - Index document: `index.html`
   - Error document: `index.html`
4. **Set bucket policy** for public read access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

### Step 2: Upload React Build Files

1. **Download**: `choovio-dashboard-build.zip`
2. **Extract and upload** all files to S3 bucket root
3. **Set cache headers**:
   - `index.html`: `Cache-Control: no-cache, no-store, must-revalidate`
   - `*.js`, `*.css`: `Cache-Control: public, max-age=31536000, immutable`

### Step 3: Create CloudFront Distribution

1. **Go to CloudFront Console**
2. **Create distribution** with these settings:
   - **Origin**: Your S3 bucket website endpoint
   - **Viewer Protocol**: Redirect HTTP to HTTPS
   - **Caching**: Optimized for SPA
   - **Custom Error Pages**: 404 → `/index.html` (200)
   - **Default Root Object**: `index.html`

---

## 🎯 Option 3: AWS CLI Commands

**Requirements**: AWS CLI with S3, CloudFront permissions

```bash
# 1. Create bucket
BUCKET_NAME="choovio-iot-dashboard-$(date +%s)"
aws s3api create-bucket --bucket $BUCKET_NAME --region us-east-1

# 2. Enable website hosting
aws s3api put-bucket-website \
    --bucket $BUCKET_NAME \
    --website-configuration file://website-config.json

# 3. Set bucket policy
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://bucket-policy.json

# 4. Upload files
aws s3 sync custom-dashboard/build/ s3://$BUCKET_NAME/ \
    --cache-control "public,max-age=31536000" \
    --exclude "*.html"

aws s3 cp custom-dashboard/build/index.html s3://$BUCKET_NAME/ \
    --cache-control "no-cache"

# 5. Create CloudFront distribution
aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json
```

---

## 📋 Expected Results

### 🌐 URLs After Deployment
- **S3 Website**: `http://BUCKET-NAME.s3-website-us-east-1.amazonaws.com`
- **CloudFront**: `https://RANDOM-ID.cloudfront.net`

### ✅ What Users Will See
- **Professional Choovio-branded dashboard**
- **Real-time IoT metrics and visualizations**
- **Responsive design for all devices**
- **Fast loading with CDN caching**
- **HTTPS security enabled**

### 🎨 Dashboard Features
- **Header**: Choovio branding with search and user profile
- **Navigation**: Sidebar with Dashboard, Devices, Analytics, Settings
- **Dashboard**: Real-time metrics cards with gradients
- **Device Management**: IoT device grid with status indicators
- **Analytics**: Interactive charts and data visualization
- **Settings**: White-label customization options

---

## 🔧 Required AWS Permissions

The deployment requires these AWS permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket",
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:PutBucketWebsite",
                "s3:PutBucketPolicy",
                "s3:GetObject"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateDistribution",
                "cloudfront:GetDistribution",
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudformation:CreateStack",
                "cloudformation:DescribeStacks",
                "cloudformation:UpdateStack"
            ],
            "Resource": "*"
        }
    ]
}
```

---

## 🎉 Deployment Verification

Once deployed, verify the dashboard works:

1. **Access the CloudFront URL**
2. **Check browser console** for no errors
3. **Test responsive design** on mobile
4. **Verify Choovio branding** is displayed
5. **Test navigation** between pages

### Expected Console Output
```
🚀 Choovio IoT Platform Dashboard Loaded Successfully!
✅ React: Available
✅ Branding: Choovio Theme Active  
✅ Features: Dashboard, Analytics, Device Management
```

---

## 📞 Support

If you encounter issues:

1. **Check browser console** for JavaScript errors
2. **Verify S3 bucket policy** allows public read
3. **Confirm CloudFront** is pointing to correct S3 origin
4. **Wait 10-15 minutes** for CloudFront propagation

---

## 📊 Current Status

✅ **React App**: Built and optimized  
✅ **Deployment Package**: Ready for upload  
✅ **CloudFormation Template**: Production-ready  
✅ **Scripts**: Automated deployment available  
❌ **Live Deployment**: Requires AWS admin permissions  

**Next Step**: Deploy using one of the methods above with proper AWS permissions.