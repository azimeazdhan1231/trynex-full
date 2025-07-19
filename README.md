# TryneX Lifestyle E-commerce Platform

Premium e-commerce platform for custom gifts and lifestyle products with integrated order management and custom design studio.

## Features

- **Product Catalog**: 11+ categories with 39+ specialized items
- **Custom Design Studio**: Interactive canvas for personalized products
- **Multi-channel Checkout**: WhatsApp, email, and on-site ordering
- **Order Management**: Real-time tracking and admin dashboard
- **Mobile Responsive**: Optimized for all devices

## Deployment

Static HTML site with Netlify Functions, optimized for Netlify deployment.

### Deploy to Netlify

1. Fork this repository to your GitHub
2. Connect repository to Netlify
3. Build settings (auto-detected):
   - Build command: `npm install`
   - Publish directory: `.`
4. Set environment variables in Netlify dashboard:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SMTP_USER` - Email address for order notifications
   - `SMTP_PASS` - Email app password (Gmail App Password)
5. Deploy - will complete successfully

### Dependencies Included
- Node.js 20.x runtime
- nodemailer for email functionality
- All dependencies properly configured

### Local Development

Open `index.html` in your browser or use a local server:

```bash
python -m http.server 8000
```

## Contact

- Website: [trynex-lifestyle.netlify.app](https://trynex-lifestyle.netlify.app)
- WhatsApp: +8801747292277
- Email: trynexlifestyle@gmail.com

## License

MIT License