// TryneX Lifestyle - Simplified Email Function for Netlify
exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // For now, return success - email can be set up later
        const requestData = JSON.parse(event.body);
        const { to, subject, orderData } = requestData;

        // Validate required fields
        if (!to || !subject || !orderData) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing required fields: to, subject, orderData' 
                })
            };
        }

        // Log the order (for debugging)
        console.log('Order received:', {
            orderId: orderData.order_id,
            to: to,
            total: orderData.total,
            timestamp: new Date().toISOString()
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: 'Order received successfully - email notification pending setup',
                orderId: orderData.order_id,
                note: 'Email will be sent once SMTP credentials are configured'
            })
        };

    } catch (error) {
        console.error('Email function error:', error);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to process order',
                details: error.message
            })
        };
    }
};