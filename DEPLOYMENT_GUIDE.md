# 🚀 TryneX Lifestyle - Complete Deployment Guide

This comprehensive guide will walk you through deploying the TryneX Lifestyle e-commerce platform from start to finish, including all necessary service configurations and optimizations.

## 📋 Prerequisites

Before starting the deployment process, ensure you have:

- **Git** installed on your local machine
- **Node.js 16+** for local development and testing
- **Modern web browser** for testing
- **Text editor/IDE** (VS Code recommended)

### Required Accounts
- [GitHub](https://github.com) - For code repository
- [Netlify](https://netlify.com) - For hosting and functions
- [Supabase](https://supabase.com) - For database and storage
- [Gmail](https://gmail.com) - For SMTP email services

## 🏗️ Phase 1: Repository Setup

### 1.1 Create GitHub Repository

1. **Create New Repository**
   ```bash
   # On GitHub, create a new repository named 'trynex-lifestyle'
   # Initialize with README (optional, we'll overwrite it)
   ```

2. **Clone and Setup Local Repository**
   ```bash
   git clone https://github.com/your-username/trynex-lifestyle.git
   cd trynex-lifestyle
   
   # Copy all project files to this directory
   # Ensure the directory structure matches the provided layout
   ```

3. **Initial Commit**
   ```bash
   git add .
   git commit -m "Initial commit: TryneX Lifestyle e-commerce platform"
   git push origin main
   ```

### 1.2 Environment Configuration

Create a `.env.local` file for local development:
```env
# Supabase Configuration
SUPABASE_URL=https://wifsqonbnfmwtqvupqbk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnNxb25ibmZtd3RxdnVwcWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODAyNjMsImV4cCI6MjA2NzE1NjI2M30.A7o3vhEaNZb9lmViHA_KQrwzKJTBWpsD6KbHqkkput0

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=trynexlifestyle@gmail.com
SMTP_PASS=your_gmail_app_password

# Site Configuration
SITE_URL=http://localhost:8888
NODE_ENV=development
