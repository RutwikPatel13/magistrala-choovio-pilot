# 🚀 Choovio LoRaWAN Dashboard - S3 Deployment Guide

## Current Status

✅ **Frontend Built**: Production build ready (320KB gzipped)  
✅ **AWS CLI Configured**: Account 381492151141  
⚠️  **Limited Permissions**: Current AWS user cannot create S3 buckets  

## Deployment Options

### Option 1: Request S3 Bucket Creation (Recommended)

Ask your AWS administrator to:

1. **Create an S3 bucket** named: `choovio-lorawan-dashboard`
2. **Enable static website hosting** with:
   - Index document: `index.html`
   - Error document: `index.html`
3. **Add bucket policy** for public access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::choovio-lorawan-dashboard/*"
        }
    ]
}
```

4. **Grant your user** (`magistrala-deploy-user`) these permissions:
   - `s3:PutObject`
   - `s3:PutObjectAcl`
   - `s3:GetObject`
   - `s3:DeleteObject`
   - `s3:ListBucket`

### Option 2: Deploy to Existing Bucket

If you have an existing S3 bucket configured for static hosting:

```bash
./deployment/deploy-to-existing-bucket.sh YOUR-BUCKET-NAME
```

Example:
```bash
./deployment/deploy-to-existing-bucket.sh my-company-static-sites
```

### Option 3: Manual AWS Console Deployment

1. **Login to AWS Console**: https://console.aws.amazon.com/

2. **Create S3 Bucket**:
   - Go to S3 service
   - Click "Create bucket"
   - Name: `choovio-lorawan-dashboard-[unique-id]`
   - Region: US East (N. Virginia) us-east-1
   - Uncheck "Block all public access"
   - Create bucket

3. **Enable Static Website Hosting**:
   - Select your bucket
   - Go to Properties tab
   - Scroll to "Static website hosting"
   - Click Edit
   - Enable it
   - Index document: `index.html`
   - Error document: `index.html`
   - Save changes

4. **Add Bucket Policy**:
   - Go to Permissions tab
   - Click "Bucket Policy"
   - Add the public access policy (shown above)
   - Save

5. **Upload Files**:
   - Click "Upload"
   - Drag the entire contents of the `build/` folder
   - Upload

6. **Access Your Site**:
   - Find the website endpoint in Properties > Static website hosting
   - Format: `http://bucket-name.s3-website-region.amazonaws.com`

## Quick Deployment Commands

Once you have a bucket ready:

```bash
# Build the project
npm run build

# Deploy to your bucket
aws s3 sync build/ s3://YOUR-BUCKET-NAME --delete

# Update index.html without cache
aws s3 cp build/index.html s3://YOUR-BUCKET-NAME/index.html \
  --cache-control "no-cache, no-store, must-revalidate"
```

## What You Get

- **Public Dashboard**: No authentication required
- **Direct S3 URL**: `http://your-bucket.s3-website-us-east-1.amazonaws.com`
- **All Features Available**:
  - LoRaWAN Network Dashboard
  - Device Management
  - Channel Management
  - Real-time Messaging
  - Analytics
  - And more...

## Files Ready for Deployment

The `build/` directory contains:
- Optimized React application
- All static assets
- Service worker for offline capability
- Manifest for PWA support

## Need Help?

1. **S3 Permissions Issue**: Contact your AWS administrator
2. **Bucket Creation**: Use AWS Console or ask admin
3. **Deployment Script**: Use `deploy-to-existing-bucket.sh` with your bucket name

## Alternative Deployment Options

If S3 deployment is not possible:

1. **Netlify**: Drag & drop the `build` folder at https://app.netlify.com/drop
2. **Vercel**: Run `npx vercel` in the project directory
3. **GitHub Pages**: Push to a GitHub repo and enable Pages
4. **Any Static Host**: Upload the `build` folder contents

Your dashboard is production-ready and can be deployed to any static hosting service!