# TryneX Lifestyle E-commerce Platform

## Overview

TryneX Lifestyle is a premium e-commerce platform specializing in custom gifts and lifestyle products. The platform features an advanced custom design studio, comprehensive product catalog, multi-channel checkout system, and complete order management capabilities. Built with modern web technologies and designed for scalability and user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla HTML5, CSS3, and JavaScript (ES6+)
- **Design Pattern**: Component-based modular architecture with separate JavaScript modules
- **Styling**: CSS custom properties (CSS variables) with a comprehensive design system
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **State Management**: LocalStorage for cart persistence and session management

### Backend Architecture
- **Hosting Platform**: Netlify for static hosting and serverless functions
- **Database**: Supabase (PostgreSQL) for order management and product data
- **Serverless Functions**: Netlify Functions for email processing and order handling
- **File Storage**: Supabase Storage for custom design uploads and product images

### Content Management
- **CMS**: Netlify CMS for static content and dynamic product management
- **Admin Panel**: Custom-built admin interface with authentication
- **Product Management**: Dynamic catalog with 11+ categories and 39+ specialized items

## Key Components

### 1. Product Catalog System
- **Product Display**: Grid-based responsive layout with filtering and search
- **Category Management**: 11 main categories with specialized custom items
- **Product Variants**: Size, color, material options with dynamic pricing
- **Inventory Management**: Stock tracking and availability status

### 2. Custom Design Studio
- **Canvas Editor**: Interactive design canvas with drag, resize, and rotate functionality
- **File Upload**: Support for JPG/PNG files up to 5MB with real-time preview
- **Layer Management**: Full control over design layers with visibility toggles
- **Product Mockups**: Real-time preview on actual product images
- **Design Storage**: Supabase integration for saving custom designs

### 3. Shopping Cart System
- **Persistent Cart**: LocalStorage-based cart with cross-session persistence
- **Cart Management**: Add, remove, update quantities with variant support
- **Price Calculation**: Dynamic pricing with variant considerations
- **Notes System**: Customer notes for special instructions

### 4. Multi-Channel Checkout
- **WhatsApp Integration**: Direct ordering via WhatsApp (01747292277) with bKash payment requirement
- **Email Orders**: Automated email processing via Netlify Functions and Nodemailer
- **On-site Checkout**: Complete order form with customer details and payment information
- **Order ID Generation**: Format TXR-YYYYMMDD-XXX for tracking

### 5. Order Management System
- **Order Tracking**: Real-time status updates (Pending → Processing → Shipped → Delivered)
- **Customer Portal**: Order lookup with email verification
- **Admin Dashboard**: Complete order management with bulk operations
- **Status Management**: Order status updates with timestamp tracking

### 6. Search and Navigation
- **Live Search**: Real-time search with auto-suggestions and fuzzy matching
- **Advanced Filtering**: Category, price range, and availability filters
- **Breadcrumb Navigation**: Context-aware navigation for better UX
- **Mobile Menu**: Responsive navigation with hamburger menu

## Data Flow

### Order Processing Flow
1. **Cart Addition**: Products added to LocalStorage cart with variants
2. **Checkout Selection**: Customer chooses WhatsApp, Email, or On-site method
3. **Order Creation**: Order data sent to Supabase database via API
4. **Notification**: Email confirmation sent via Netlify Functions
5. **Tracking**: Order ID generated for customer tracking

### Custom Design Flow
1. **Product Selection**: Customer selects customizable product
2. **Design Creation**: Interactive canvas for design creation
3. **File Upload**: Images uploaded to Supabase Storage
4. **Design Save**: Design data saved to custom_orders table
5. **Order Integration**: Custom design linked to main order

### Admin Management Flow
1. **Authentication**: Admin access via footer click sequence + password
2. **Dashboard Access**: Real-time order and analytics dashboard
3. **Order Management**: Status updates, customer communication
4. **Product Management**: Inventory updates via Netlify CMS

## External Dependencies

### Third-Party Services
- **Supabase**: PostgreSQL database and file storage
- **Netlify**: Static hosting and serverless functions
- **Gmail SMTP**: Email delivery for order confirmations
- **WhatsApp Business**: Direct customer communication
- **bKash**: Payment processing for WhatsApp orders

### JavaScript Libraries
- **Font Awesome**: Icon library for UI elements
- **Nodemailer**: Server-side email functionality
- **Native Fetch API**: HTTP requests to Supabase

### Development Dependencies
- **Netlify CMS**: Content management interface
- **CSS Custom Properties**: Design system variables
- **ES6 Modules**: Modular JavaScript architecture

## Deployment Strategy

### Production Environment
- **Primary Hosting**: Netlify with custom domain
- **Database**: Supabase production instance
- **CDN**: Netlify's global CDN for static assets
- **SSL**: Automatic HTTPS via Netlify

### Environment Configuration
- **Environment Variables**: Supabase URL, API keys, SMTP credentials
- **Build Process**: Static site generation with asset optimization
- **Performance**: Image optimization and lazy loading
- **SEO**: Meta tags, structured data, and sitemap

### Security Considerations
- **API Security**: Supabase Row Level Security (RLS) policies
- **Admin Authentication**: Protected admin routes with password
- **Data Validation**: Client and server-side input validation
- **CORS Configuration**: Proper cross-origin request handling

### Monitoring and Analytics
- **Order Tracking**: Real-time order status monitoring
- **Performance Metrics**: Page load times and user interactions
- **Error Handling**: Comprehensive error logging and user feedback
- **Customer Support**: Integrated WhatsApp and email support channels

## Recent Changes

### Netlify Deployment Fixes (2025-01-19)
- **Package.json Updates**: Fixed missing dependencies and added proper build scripts
- **Environment Configuration**: Created .env.example and .nvmrc for deployment compatibility  
- **Build Process**: Added comprehensive build.sh script with validation checks
- **Plugin Configuration**: Fixed @netlify/plugin-sitemap configuration in netlify.toml
- **Error Prevention**: Added .gitignore and troubleshooting documentation
- **Node.js Compatibility**: Set Node.js version to 18 for Netlify compatibility
- **Dependency Management**: Updated nodemailer to stable version 6.9.8

### Files Added/Modified
- `package.json`: Added missing dependencies and proper build configuration
- `netlify.toml`: Fixed build command and plugin settings
- `.env.example`: Environment variable template for deployment
- `.nvmrc`: Node.js version specification
- `build.sh`: Comprehensive build validation script
- `.gitignore`: Proper exclusion of sensitive and temporary files
- `NETLIFY_TROUBLESHOOTING.md`: Complete deployment troubleshooting guide