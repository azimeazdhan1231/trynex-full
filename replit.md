# TryneX Lifestyle E-commerce Platform

## Overview

TryneX Lifestyle is a premium e-commerce platform for custom gifts and lifestyle products. It features a product catalog with 11+ categories, an interactive custom design studio, multi-channel checkout options (WhatsApp, email, and on-site ordering), and a comprehensive order management system. The platform is built as a static HTML website optimized for Netlify deployment with modern JavaScript functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Static HTML/CSS/JavaScript website
- **Design Pattern**: Multi-page application with shared components
- **Styling**: Custom CSS with CSS variables for theming
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Build Process**: Static files, no build step required

### Backend Architecture
- **Database**: Supabase (PostgreSQL-based)
- **Authentication**: Netlify Identity for admin access
- **API**: Supabase REST API for data operations
- **Serverless Functions**: Netlify Functions for email processing
- **Storage**: Local storage for cart management

### Key Components

1. **Navigation System**: Unified navbar across all pages with cart integration
2. **Product Catalog**: Dynamic product grid with filtering and search
3. **Custom Design Studio**: Interactive canvas-based customization tool
4. **Shopping Cart**: Client-side cart with persistent storage
5. **Order Management**: Real-time order tracking and admin panel
6. **Content Management**: Netlify CMS for admin content updates

## Data Flow

### Product Management
- Products stored in Supabase with categories, pricing, and variants
- Real-time product loading via Supabase REST API
- Search and filtering handled client-side for performance

### Order Processing
1. Customer adds items to cart (stored locally)
2. Checkout creates order record in Supabase
3. Order confirmation sent via Netlify Functions (email)
4. Admin receives order notification
5. Order status updated through admin panel

### Custom Design Workflow
1. Customer selects base product
2. Design studio loads with canvas interface
3. Customer adds text, images, and graphics
4. Design saved as order variant
5. Custom design included in order processing

## External Dependencies

### Core Services
- **Supabase**: Database and real-time subscriptions
- **Netlify**: Hosting, identity, and serverless functions
- **Font Awesome**: Icon library
- **Nodemailer**: Email processing (in functions)

### Development Tools
- **Environment Variables**: Configured via Netlify dashboard
- **Deployment**: Automatic via Git integration
- **Domain**: Custom domain supported

## Deployment Strategy

### Netlify Configuration
- **Build Command**: None (static files)
- **Publish Directory**: Root directory
- **Environment Variables**:
  - `SUPABASE_URL`: Database connection
  - `SUPABASE_ANON_KEY`: Public API key
  - `SMTP_USER`: Email service username
  - `SMTP_PASS`: Email service password

### Database Setup
- Supabase project with PostgreSQL
- Tables for products, orders, customers, and order_items
- Row Level Security for data protection
- Real-time subscriptions for order updates

### Security Considerations
- Admin access via Netlify Identity
- Supabase RLS policies for data access
- CORS configuration for API requests
- Environment variables for sensitive data

### Performance Optimizations
- Static file serving via CDN
- Client-side data caching
- Optimized image loading
- Minimized JavaScript bundles

The platform is designed for easy maintenance with clear separation of concerns, modern web standards, and scalable architecture that can grow with business needs.