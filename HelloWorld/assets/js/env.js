
// Environment configuration
window.ENV = {
    // Supabase Configuration
    SUPABASE_URL: 'https://wifsqonbnfmwtqvupqbk.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnNxb25ibmZtd3RxdnVwcWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyODEzNTgsImV4cCI6MjA1Mjg1NzM1OH0.9nqe8JOGSe4IvDBHBFi_5rNW2JX8EJx5_bAh3yCcrOg',
    
    // Site Configuration
    SITE_URL: window.location.origin,
    
    // Email Configuration (for Netlify Functions)
    ADMIN_EMAIL: 'trynexlifestyle@gmail.com',
    
    // Development mode
    IS_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname.includes('replit'),
    
    // API endpoints
    API_BASE: window.location.origin
};

// For production environment variable override
if (typeof window !== 'undefined' && !window.ENV.IS_DEVELOPMENT) {
    // Check for environment variables injected by build process
    if (typeof process !== 'undefined' && process.env) {
        window.ENV.SUPABASE_URL = process.env.SUPABASE_URL || window.ENV.SUPABASE_URL;
        window.ENV.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY;
    }
}

console.log('Environment configuration loaded');
