# Choovio LoRaWAN Dashboard - S3 Deployment Guide

## Prerequisites

1. **AWS CLI installed**
   ```bash
   # Mac
   brew install awscli
   
   # Ubuntu/Debian
   sudo apt-get install awscli
   
   # Or download from: https://aws.amazon.com/cli/
   ```

2. **AWS Credentials configured**
   ```bash
   aws configure
   ```
   You'll need:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)

## Deployment Options

### Option 1: Interactive Deployment (Recommended)

Run the interactive deployment script:

```bash
./deployment/deploy-interactive.sh
```

This script will:
- Check your AWS setup
- Prompt for S3 bucket name
- Build the project
- Deploy to S3
- Optionally setup CloudFront CDN
- Provide you with the live URL

### Option 2: Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Edit deployment script**
   Edit `deployment/deploy-to-s3.sh` and update:
   - `S3_BUCKET_NAME` - Your unique bucket name
   - `AWS_REGION` - Your preferred region
   - `CLOUDFRONT_DISTRIBUTION_ID` - (Optional) If using CloudFront

3. **Run deployment**
   ```bash
   ./deployment/deploy-to-s3.sh
   ```

## Post-Deployment

### Accessing Your Dashboard

After deployment, your dashboard will be available at:
- **S3 Website URL**: `http://your-bucket-name.s3-website-region.amazonaws.com`
- **CloudFront URL**: `https://your-distribution.cloudfront.net` (if enabled)

### Updating the Dashboard

To update your deployed dashboard:
1. Make your changes
2. Run the deployment script again
3. If using CloudFront, the cache will be automatically invalidated

### Custom Domain (Optional)

To use a custom domain:
1. Create a Route 53 hosted zone for your domain
2. Update S3 bucket name to match domain
3. Configure Route 53 alias record to point to S3 or CloudFront
4. Update CloudFront with custom domain if using CDN

## Important Notes

- The dashboard is configured for **public access** (no authentication)
- All static assets are cached for performance
- index.html is not cached to ensure updates are immediate
- CloudFront provides HTTPS and global CDN if enabled

## Troubleshooting

### "Access Denied" error
- Ensure bucket policy is set correctly
- Check that public access is not blocked in S3 settings

### "Bucket already exists" error
- S3 bucket names must be globally unique
- Try a different bucket name

### Changes not appearing
- Clear browser cache
- If using CloudFront, wait for invalidation to complete (15-20 mins)

## Cost Estimates

- **S3 Storage**: ~$0.023 per GB per month
- **S3 Requests**: ~$0.0004 per 1,000 requests
- **CloudFront**: ~$0.085 per GB transfer (varies by region)
- **Typical monthly cost**: $1-5 for moderate traffic

## Support

For issues or questions:
- Check AWS S3 documentation: https://docs.aws.amazon.com/s3/
- Check CloudFront documentation: https://docs.aws.amazon.com/cloudfront/