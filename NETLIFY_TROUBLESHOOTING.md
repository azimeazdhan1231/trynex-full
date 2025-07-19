# 🔧 Netlify Deployment Troubleshooting Guide

## Common Deployment Errors and Solutions

### 1. "Package or file is missing" Error

**Problem**: Netlify can't find dependencies or files referenced in your configuration.

**Solutions**:

#### A. Missing Dependencies
```bash
# Check if package.json includes all required packages
npm install
npm audit fix

# Ensure these are in package.json dependencies:
# - nodemailer (for email functions)
# - @netlify/plugin-sitemap (in devDependencies)
```

#### B. File Path Issues
- Ensure `netlify.toml` publish directory matches your file structure
- Check that `netlify/functions/sendEmail.js` exists
- Verify `index.html` is in the root directory

### 2. Build Command Failures

**Problem**: Build process fails during deployment.

**Solutions**:
```bash
# Test build locally first
npm run build

# Check build.sh permissions
chmod +x build.sh

# Verify Node.js version compatibility
# Netlify uses Node 18 by default
```

### 3. Environment Variables Not Set

**Problem**: Functions fail because environment variables are missing.

**Required Environment Variables**:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
NODE_ENV=production
SITE_URL=https://your-site.netlify.app
```

**How to Set in Netlify**:
1. Go to Site Settings → Build & Deploy → Environment Variables
2. Add each variable from the list above
3. Redeploy your site

### 4. Netlify Functions Errors

**Problem**: API endpoints return 500 errors.

**Solutions**:

#### A. Check Function Logs
- Go to Netlify Dashboard → Functions → View Logs
- Look for specific error messages

#### B. Common Function Issues
```javascript
// Ensure proper error handling
exports.handler = async (event, context) => {
    try {
        // Your function code
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
```

### 5. Plugin Errors

**Problem**: `@netlify/plugin-sitemap` fails to load.

**Solutions**:
```bash
# Install plugin as devDependency
npm install --save-dev @netlify/plugin-sitemap

# Check netlify.toml plugin configuration
[[plugins]]
  package = "@netlify/plugin-sitemap"
```

### 6. CORS Issues

**Problem**: Frontend can't connect to Netlify Functions.

**Solution**: Ensure functions return proper CORS headers:
```javascript
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};
```

### 7. Gmail SMTP Issues

**Problem**: Email sending fails.

**Solutions**:

#### A. Enable App Passwords
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate password for "Mail"
4. Use this password in `SMTP_PASS`

#### B. Check Gmail Settings
- Less secure app access may need to be enabled
- Use smtp.gmail.com on port 587
- Ensure 2FA is enabled for app passwords

### 8. Database Connection Issues

**Problem**: Supabase queries fail.

**Solutions**:
- Verify Supabase URL and API key
- Check Row Level Security (RLS) policies
- Ensure tables exist and have proper permissions

### 9. Asset Loading Issues

**Problem**: Images, CSS, or JS files don't load.

**Solutions**:
- Check file paths are relative, not absolute
- Verify assets directory structure
- Check netlify.toml headers configuration

### 10. Deployment Best Practices

#### A. Pre-deployment Checklist
- [ ] All files committed to Git
- [ ] Environment variables set in Netlify
- [ ] Dependencies listed in package.json
- [ ] Build script tested locally
- [ ] Functions tested individually

#### B. Monitoring After Deployment
- Check Netlify Function logs regularly
- Monitor site performance
- Test all major features after deployment
- Set up uptime monitoring

## Quick Fixes

### Reset Deployment
```bash
# Clear Netlify cache and redeploy
netlify build --clear-cache
netlify deploy --prod
```

### Local Testing
```bash
# Test Netlify Functions locally
netlify dev

# Test static site
npm run dev
```

### Debug Mode
Add to netlify.toml for more verbose logging:
```toml
[build.environment]
  DEBUG = "*"
  NODE_ENV = "production"
```

## Getting Help

If problems persist:
1. Check Netlify Status page
2. Review deploy logs in full
3. Test components individually
4. Contact Netlify support with specific error messages