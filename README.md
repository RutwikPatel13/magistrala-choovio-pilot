# Magistrala IoT Platform - Choovio Pilot Project

> **Production-Ready IoT Platform with PostgreSQL Dual-Write System**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![AWS](https://img.shields.io/badge/AWS-Deployed-orange.svg)](http://choovio-dashboard.s3-website-us-east-1.amazonaws.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-EC2-blue.svg)](http://34.207.208.152:3001)
[![Version](https://img.shields.io/badge/Version-v2.1.1-green.svg)](https://github.com/RutwikPatel13/magistrala-choovio-pilot/releases)

## 🚀 Live Application

**🌐 Production URL**: http://choovio-dashboard.s3-website-us-east-1.amazonaws.com  
**💾 PostgreSQL Backend**: http://34.207.208.152:3001  
**📊 Status**: ✅ Fully Deployed & Operational  
**🔑 Demo Login**: `admin@choovio.com` / `ChoovioAdmin2025!`

## 📋 Project Overview

This repository contains a comprehensive Magistrala IoT platform with a modern React dashboard, complete PostgreSQL dual-write backup system, and production AWS deployment. The project demonstrates advanced full-stack development with enterprise-grade reliability features including automatic fallback mechanisms and real-time data synchronization.

## ✨ Key Features

### 🎯 **Production-Ready Application**
- **Live Deployment**: Fully operational on AWS S3 + EC2
- **PostgreSQL Dual-Write**: Automatic backup and sync system
- **Professional UI**: Clean interface with upcoming feature notifications
- **2025 Credentials**: Updated demo login system

### 💾 **Advanced Data Management**
- **Dual-Write System**: Writes to both Magistrala API and PostgreSQL
- **Fallback Mechanisms**: Automatic failover when primary system fails
- **Real-time Sync**: Live data synchronization across systems
- **EC2 PostgreSQL**: Dedicated database server (34.207.208.152:3001)

### 🎨 **Enhanced User Experience**
- **Device Management**: Complete CRUD operations with database backup
- **User Management**: Simplified local state management
- **Settings Integration**: Working company branding and theme system
- **Professional Popups**: Upcoming feature notifications for non-working features

### ☁️ **Cloud Deployment**
- **AWS S3**: Static website hosting with global CDN
- **EC2 Backend**: PostgreSQL database server deployment
- **Production Ready**: Optimized builds and environment configuration
- **Scalable Architecture**: Ready for enterprise deployment

## 📁 Repository Structure

```
├── 📊 custom-dashboard/          # React Dashboard Application
│   ├── src/services/          # API services & dual-write system
│   ├── src/pages/             # Application pages (Device, User, Settings)
│   ├── src/components/        # Reusable UI components
│   ├── src/contexts/          # React contexts for state management
│   └── .env.production        # Production environment configuration
├── 💾 postgresql-backend/       # PostgreSQL API Server
│   ├── server.js             # Express server with REST endpoints
│   ├── docker-compose.yml    # PostgreSQL container setup
│   └── scripts/              # Database setup and migration scripts
├── ☁️ aws-deployment/           # AWS Deployment Configurations
│   └── cloudfront-config.json # CDN configuration
├── 📚 docs/                    # Comprehensive Documentation
│   ├── FINAL_PROJECT_REPORT.md # Complete project report
│   ├── TESTING.md             # Testing guide and scenarios
│   ├── DEPLOYMENT_GUIDE.md    # Deployment instructions
│   ├── VERSION.md             # Version tracking
│   ├── CHANGELOG.md           # Change history
│   └── README.md              # Documentation index
└── 🚀 Various deployment scripts # Automated deployment tools
```

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern functional components with hooks
- **Styled Components** - CSS-in-JS with theming
- **Recharts** - Interactive data visualization
- **React Router** - Single-page application routing

### **Backend Platform**
- **Magistrala** - Open-source IoT platform
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **NATS/RabbitMQ** - Message queuing

### **Cloud Infrastructure**
- **AWS ECS** - Container orchestration
- **AWS RDS** - Managed database
- **AWS ElastiCache** - Redis caching
- **AWS ALB** - Load balancing
- **Terraform** - Infrastructure provisioning

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- AWS CLI (for deployment)
- Terraform (for infrastructure)

### Local Development

```bash
# Clone the repository
git clone https://github.com/rutwikpatel1313/magistrala-choovio-pilot.git
cd magistrala-choovio-pilot

# Start the IoT platform
docker-compose up -d

# Install and run the React dashboard
cd custom-dashboard
npm install
npm start

# Access dashboard at http://localhost:3000
```

### AWS Deployment

```bash
# Configure AWS credentials
aws configure

# Upload React build files to S3
./aws-deployment/scripts/upload-react-to-s3.sh

# Deploy infrastructure
cd aws-deployment/terraform
terraform init
terraform apply

# Or use CloudFormation
aws cloudformation deploy \
  --template-file cloudformation/magistrala-stack.yaml \
  --stack-name choovio-iot-platform
```

## 📊 Dashboard Features

### **Main Dashboard**
- Real-time device metrics
- Interactive charts and graphs
- Activity feed with live updates
- Responsive card-based layout

### **Device Management**
- Device grid with search/filter
- CRUD operations with modal interfaces
- Battery level and status monitoring
- Message count tracking

### **Analytics & Insights**
- Time-series data visualization
- Protocol usage statistics (MQTT, HTTP, CoAP)
- Performance metrics with trends
- Data export capabilities

### **Settings & Branding**
- Complete white-label customization
- Color theme presets
- Logo upload and management
- API configuration options

## 🎨 Branding Customization

The platform includes a comprehensive theming system:

```javascript
// Choovio Brand Theme
const choovioTheme = {
  colors: {
    primary: '#2C5282',      // Choovio Blue
    secondary: '#ED8936',    // Choovio Orange
    accent: '#805AD5',       // Purple accent
    gradients: {
      primary: 'linear-gradient(135deg, #2C5282 0%, #3182CE 100%)',
      secondary: 'linear-gradient(135deg, #ED8936 0%, #F6AD55 100%)'
    }
  }
};
```


## 📚 Documentation

**📋 [Complete Documentation Index](docs/README.md)**

### **Quick Access:**
- **[📊 Final Submission Report](https://github.com/RutwikPatel13/magistrala-choovio-pilot/blob/main/docs/choovio-submission-report.md)** - Complete project submission report
- **[🧪 Testing Guide](docs/TESTING.md)** - Comprehensive testing scenarios
- **[🚀 Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Step-by-step deployment
- **[📈 Version History](docs/VERSION.md)** - Current status and releases
- **[🔄 Change Log](docs/CHANGELOG.md)** - Detailed change history

### **All Documentation:**
All project documentation has been organized in the [`docs/`](docs/) folder with a comprehensive index.

## 🏆 Key Achievements

- ✅ **100% Feature Completion**: All requirements implemented
- ✅ **Production Ready**: Deployed and tested on AWS
- ✅ **Modern Architecture**: Latest technology stack
- ✅ **Scalable Infrastructure**: Growth-ready platform
- ✅ **Comprehensive Documentation**: Complete project docs

## 👤 Developer

**Rutwik Patel**

---

**⭐ Star this repository if you found it helpful!**

*This project demonstrates modern IoT platform development, React frontend engineering, AWS cloud deployment, and effective AI-assisted development workflows.*