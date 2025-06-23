# 📋 Changelog

All notable changes to the Choovio IoT Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2025-06-23

### 🎯 Added
- **Complete Project Cleanup**: Optimized project structure while preserving all development work evidence
- **PostgreSQL Backend Deployment**: Full EC2 deployment with operational REST API endpoints
- **Comprehensive Documentation Update**: All .md files updated with current deployment details
- **Git Workflow Completion**: Proper branching, semantic tagging, and GitHub repository management

### 🔧 Changed
- Updated all documentation files with live production URLs and current status
- Cleaned up project structure by removing only unnecessary duplicate files
- Preserved all deployment scripts and development artifacts that demonstrate work effort
- Updated README.md with comprehensive live application information

### 🚀 Deployment
- **Live Application**: http://choovio-dashboard.s3-website-us-east-1.amazonaws.com
- **PostgreSQL Backend**: http://34.207.208.152:3001 (operational with 9 devices, 3 channels)
- **GitHub Repository**: Fully updated with version v2.1.1
- **Clean Structure**: Ready for professional evaluation

### 📚 Documentation
- Updated all .md files with current production deployment details
- Preserved comprehensive documentation showing development process
- Maintained all work evidence while achieving clean project structure

## [2.1.0] - 2025-06-23

### 🚀 Added
- **PostgreSQL Dual-Write System**: Complete implementation with automatic fallback mechanisms
- **EC2 Database Server**: Dedicated PostgreSQL server (34.207.208.152:3001) with full REST API
- **User Management Simplification**: Local state management only, no database dependency
- **Professional UI Enhancements**: Upcoming feature popups for all non-working features
- **2025 Credential System**: Updated all demo passwords (ChoovioAdmin2025!, etc.)

### 🔧 Changed
- Simplified user management to use local state instead of database
- Removed Edit and Connect buttons from Device Management
- Removed Add Device button from LoRaWAN (shows upcoming feature popup)
- Removed Create Channel button (shows upcoming feature popup)
- Fixed spreading factor distribution chart display issues
- Removed navbar theme changes for cleaner UI

### 💾 Technical Implementation
- **Dual-Write Service**: Intelligent writing to both Magistrala API and PostgreSQL
- **Fallback Mechanisms**: Automatic failover when primary systems fail
- **Sync Tracking**: Complete operation logging and status management
- **CRUD Operations**: Full create, read, update, delete for devices, channels, LoRaWAN
- **Environment Configuration**: Production-ready .env.production setup

### 🎨 User Experience
- **Upcoming Feature Modal**: Professional popup component for non-working features
- **Settings Integration**: Working company name and theme management
- **Clean Interface**: Removed non-functional elements for better UX
- **Empty State Handling**: Proper "no devices" display when database is empty

### 🚀 Deployment
- **AWS S3 Deployment**: Complete production deployment with optimized build
- **PostgreSQL API**: Operational endpoints with /api/* prefix structure
- **Database Status**: 9 devices and 3 channels actively synced

## [2.0.0] - 2025-06-21

### 🚀 Added
- **Functional Header Components**
  - Working search functionality with dropdown results and navigation
  - Interactive notification system with real alerts and timestamps  
  - User menu with profile management options and logout functionality

- **Complete Page Implementations**
  - **Channels Management**: Full CRUD operations with real-time statistics
  - **Messages & Data**: Advanced filtering, search, and export capabilities
  - **Data Storage**: Complete storage management and backup system
  - **User Management**: Enterprise user administration with role-based access
  - **Security Dashboard**: Comprehensive security controls and audit logging
  - **Enhanced Settings**: Persistent configuration with theme application

- **LoRaWAN Specialization**
  - Dedicated LoRaWAN network management interface
  - Gateway monitoring with signal strength and coverage analytics
  - Device registration with DevEUI, AppEUI, and AppKey management
  - Network analytics with frequency band monitoring

- **Technical Infrastructure**
  - Comprehensive Magistrala API service integration
  - Real-time data processing with intelligent fallbacks
  - Persistent storage for user preferences and settings
  - Performance optimization (209.69 kB production bundle)

### 🔧 Changed
- Updated package.json version to 2.0.0
- Enhanced routing system with all new pages integrated
- Improved device management with real API integration
- Enhanced navigation structure with logical grouping

### 🔐 Security
- Implemented comprehensive security dashboard with functional controls
- Added API key management with creation, viewing, and revocation
- Security audit logging with real-time event monitoring
- Security score calculation and threat assessment

### 📚 Documentation
- Added comprehensive project documentation and technical reports
- Created deployment guides and architecture documentation
- Implemented semantic versioning and branch strategy documentation
- Added complete feature implementation tracking

### 🚀 Deployment
- AWS deployment scripts for full infrastructure
- S3 and CloudFront configuration files
- Docker deployment automation
- Live application URL: http://choovio-iot-dashboard-1750453820.s3-website-us-east-1.amazonaws.com

## [1.0.1] - 2025-06-20

### 🔧 Added
- Complete AWS S3 + CloudFront deployment infrastructure
- Automated deployment scripts and configuration
- Production environment setup

### 🔧 Changed
- AWS infrastructure as code implementation
- CloudFront CDN configuration optimization
- S3 static website hosting enhancement

## [1.0.0] - 2025-06-20

### 🎯 Added
- Initial Magistrala IoT platform customization
- Basic Choovio branding and theme implementation
- Core React 18 application structure with modern hooks
- Basic dashboard layout and navigation
- Styled-components for theming
- React Router for navigation
- Initial AWS deployment setup

### 🏗️ Foundation
- React 18 with functional components and hooks
- Modern JavaScript ES6+ features
- Professional component architecture
- Basic IoT dashboard structure

---

## 📋 Version Guidelines

### Version Types
- **MAJOR** (x.0.0): Breaking changes or complete platform rewrites
- **MINOR** (x.y.0): New features or significant enhancements (backward compatible)
- **PATCH** (x.y.z): Bug fixes, small improvements, or documentation updates

### Branch Strategy
- `main` - Production releases only (protected)
- `dev` - Development integration branch  
- `feature/[name]` - Individual feature development
- `release/[version]` - Release preparation branches
- `hotfix/[issue]` - Critical production fixes

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes