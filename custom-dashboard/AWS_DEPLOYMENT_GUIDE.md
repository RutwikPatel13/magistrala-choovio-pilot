# AWS Deployment Guide - Magistrala IoT Dashboard

## Current Status
✅ **Build Complete**: Application successfully built (334.75 kB gzipped)  
⚠️ **AWS Credentials**: Expired - manual refresh required  
📦 **Build Location**: `/custom-dashboard/build/` directory  

## Deployment Options

### Option 1: Refresh AWS Credentials & Deploy (Recommended)

#### Step 1: Refresh AWS Credentials
```bash
# Method 1: Using AWS CLI configure
aws configure
# Enter your Access Key ID, Secret Access Key, and region (us-east-1)

# Method 2: Update credentials file directly
nano ~/.aws/credentials
# Add/update:
# [default]
# aws_access_key_id = YOUR_ACCESS_KEY
# aws_secret_access_key = YOUR_SECRET_KEY

# Method 3: Using environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

#### Step 2: Deploy to S3
```bash
cd /Users/rutwik/choovio/magistrala-pilot-clean/aws-deployment/scripts
./upload-react-to-s3.sh
```

**Expected Result**: 
- Files uploaded to S3 bucket: `choovio-iot-dashboard-1750453820`
- Website URL: `http://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com/`

### Option 2: Manual S3 Upload

#### Step 1: Create/Access S3 Bucket
1. Go to AWS Console → S3
2. Use existing bucket: `choovio-iot-dashboard-1750453820` or create new one
3. Enable Static Website Hosting:
   - Index document: `index.html`
   - Error document: `index.html` (for React Router)

#### Step 2: Upload Build Files
1. Navigate to `/Users/rutwik/choovio/magistrala-pilot-clean/custom-dashboard/build/`
2. Select all files and folders
3. Upload to S3 bucket root
4. Set public read permissions

#### Step 3: Configure Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::choovio-iot-dashboard-1750453820/*"
    }
  ]
}
```

### Option 3: Alternative Hosting Services

#### Netlify (Free)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy from build directory
cd /Users/rutwik/choovio/magistrala-pilot-clean/custom-dashboard
netlify deploy --prod --dir=build
```

#### Vercel (Free)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /Users/rutwik/choovio/magistrala-pilot-clean/custom-dashboard
vercel --prod
```

#### GitHub Pages
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to GitHub Actions
4. Use automated deployment workflow

## Build Information

### Build Summary
- **Build Size**: 334.75 kB gzipped
- **Build Time**: ~45 seconds
- **Status**: ✅ Successful (0 errors, warnings only)
- **Location**: `/custom-dashboard/build/`

### Build Contents
```
build/
├── index.html
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   ├── js/
│   │   ├── main.[hash].js
│   │   └── [chunk].[hash].js
│   └── media/
└── [other assets]
```

### Environment Configuration

The application supports multiple Magistrala endpoint configurations:

#### Production Environment (.env.production)
```env
REACT_APP_MAGISTRALA_BASE_URL=https://your-magistrala-instance.com
REACT_APP_MAGISTRALA_USERS_PORT=9002
REACT_APP_MAGISTRALA_THINGS_PORT=9000
REACT_APP_MAGISTRALA_CHANNELS_PORT=9005
REACT_APP_MAGISTRALA_HTTP_PORT=8008
REACT_APP_MAGISTRALA_WS_PORT=8186
```

#### Development/Demo Mode
- Falls back to demo credentials when API calls fail
- Supports localhost Magistrala instances
- Graceful error handling with user-friendly messages

## Post-Deployment Steps

### 1. Verify Deployment
- Visit deployed URL
- Test login functionality
- Verify API connectivity
- Check responsive design on mobile

### 2. Configure Production Magistrala
Update environment variables for your production Magistrala instance:
- API endpoints
- Authentication settings  
- Protocol configurations

### 3. SSL Certificate (if using S3)
For custom domain with HTTPS:
1. Set up CloudFront distribution
2. Configure SSL certificate via ACM
3. Update DNS records

### 4. Monitoring & Analytics
- Set up CloudWatch for S3 access logs
- Configure Google Analytics (if needed)
- Monitor application performance

## Troubleshooting

### Common Issues

**AWS Credentials Error**
```bash
# Check current credentials
aws sts get-caller-identity

# If expired, refresh as shown in Step 1 above
```

**Build Errors**
```bash
# Clean and rebuild
cd /Users/rutwik/choovio/magistrala-pilot-clean/custom-dashboard
rm -rf build node_modules
npm install
npm run build
```

**Deployment Permission Issues**
- Ensure IAM user has S3 full access
- Check bucket policies and ACLs
- Verify region configuration

**Application Not Loading**
- Check browser console for errors
- Verify S3 bucket website configuration
- Ensure index.html is set as index document

## Security Considerations

### Production Checklist
- [ ] Use HTTPS (CloudFront + ACM)
- [ ] Implement proper CORS policies
- [ ] Configure security headers
- [ ] Use IAM roles instead of access keys when possible
- [ ] Enable S3 access logging
- [ ] Set up proper backup strategies

### Environment Variables Security
- Never commit real credentials to Git
- Use secure parameter stores for sensitive data
- Rotate access keys regularly
- Implement least-privilege IAM policies

## Next Steps After Deployment

1. **Test Complete Functionality**
   - Login with real Magistrala credentials
   - Device management operations
   - Real-time messaging
   - All UI components

2. **Performance Optimization**
   - Enable gzip compression
   - Configure caching headers
   - Optimize bundle size

3. **Monitoring Setup**
   - Application metrics
   - Error tracking
   - User analytics

4. **Documentation Updates**
   - Update API documentation
   - Create user guides
   - Document deployment process

---

**Quick Deploy Command** (after credential refresh):
```bash
cd /Users/rutwik/choovio/magistrala-pilot-clean/aws-deployment/scripts && ./upload-react-to-s3.sh
```

**Support**: All files ready for deployment in `/custom-dashboard/build/` directory.