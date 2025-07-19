// TryneX Lifestyle - Email Order Processing Function

const nodemailer = require('nodemailer');

// Email configuration
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'trynexlifestyle@gmail.com',
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
    }
};

// Create transporter
let transporter;

function createTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransporter(SMTP_CONFIG);
    }
    return transporter;
}

// Main handler function
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
        // Parse request body
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

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid email format' })
            };
        }

        // Generate email content
        const emailContent = generateEmailContent(orderData);

        // Create email transporter
        const mailTransporter = createTransporter();

        // Verify SMTP connection
        await mailTransporter.verify();

        // Prepare email options
        const mailOptions = {
            from: {
                name: 'TryneX Lifestyle',
                address: SMTP_CONFIG.auth.user
            },
            to: to,
            subject: subject,
            html: emailContent.html,
            text: emailContent.text,
            attachments: []
        };

        // Send customer copy if customer email is provided
        const customerInfo = orderData.customer_info ? JSON.parse(orderData.customer_info) : {};
        const customerEmail = customerInfo.email;

        // Send main email
        const mainEmailResult = await mailTransporter.sendMail(mailOptions);

        // Send customer confirmation if email provided
        let customerEmailResult = null;
        if (customerEmail && emailRegex.test(customerEmail)) {
            const customerMailOptions = {
                from: {
                    name: 'TryneX Lifestyle',
                    address: SMTP_CONFIG.auth.user
                },
                to: customerEmail,
                subject: `Order Confirmation - ${orderData.order_id}`,
                html: generateCustomerEmailContent(orderData).html,
                text: generateCustomerEmailContent(orderData).text
            };

            try {
                customerEmailResult = await mailTransporter.sendMail(customerMailOptions);
            } catch (customerEmailError) {
                console.error('Failed to send customer email:', customerEmailError);
                // Don't fail the main request if customer email fails
            }
        }

        // Log successful email
        console.log('Email sent successfully:', {
            orderId: orderData.order_id,
            to: to,
            customerEmail: customerEmail,
            messageId: mainEmailResult.messageId,
            customerMessageId: customerEmailResult?.messageId
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: 'Order email sent successfully',
                orderId: orderData.order_id,
                emailsSent: {
                    admin: true,
                    customer: !!customerEmailResult
                }
            })
        };

    } catch (error) {
        console.error('Email sending error:', error);

        // Return appropriate error response
        let errorMessage = 'Failed to send email';
        let statusCode = 500;

        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Please check SMTP credentials.';
            statusCode = 401;
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Failed to connect to email server. Please try again later.';
            statusCode = 503;
        } else if (error.name === 'SyntaxError') {
            errorMessage = 'Invalid request data format';
            statusCode = 400;
        }

        return {
            statusCode,
            headers,
            body: JSON.stringify({ 
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            })
        };
    }
};

// Generate email content for admin
function generateEmailContent(orderData) {
    const customerInfo = orderData.customer_info ? JSON.parse(orderData.customer_info) : {};
    const items = orderData.items ? JSON.parse(orderData.items) : [];
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Order - ${orderData.order_id}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #FFD700, #B8860B);
                    color: #000;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                }
                .content {
                    padding: 30px;
                }
                .order-info {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border-left: 4px solid #FFD700;
                }
                .section {
                    margin-bottom: 30px;
                }
                .section h2 {
                    color: #333;
                    border-bottom: 2px solid #FFD700;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                .item {
                    display: flex;
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                    align-items: center;
                }
                .item:last-child {
                    border-bottom: none;
                }
                .item-details {
                    flex: 1;
                }
                .item-title {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                }
                .item-meta {
                    color: #666;
                    font-size: 14px;
                }
                .total {
                    background: #FFD700;
                    color: #000;
                    padding: 15px 20px;
                    border-radius: 6px;
                    text-align: center;
                    font-size: 20px;
                    font-weight: 700;
                    margin: 20px 0;
                }
                .customer-info p {
                    margin: 8px 0;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                .customer-info p:last-child {
                    border-bottom: none;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    border-top: 1px solid #eee;
                }
                .urgent {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                }
                .urgent strong {
                    color: #856404;
                }
                @media only screen and (max-width: 600px) {
                    .container {
                        margin: 0;
                        border-radius: 0;
                    }
                    .content {
                        padding: 20px;
                    }
                    .header {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛍️ New Order Received</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">TryneX Lifestyle</p>
                </div>
                
                <div class="content">
                    <div class="order-info">
                        <h3 style="margin: 0 0 10px 0; color: #333;">Order Details</h3>
                        <p><strong>Order ID:</strong> ${orderData.order_id}</p>
                        <p><strong>Date:</strong> ${new Date(orderData.created_at).toLocaleString()}</p>
                        <p><strong>Payment Method:</strong> ${orderData.method || 'Not specified'}</p>
                        <p><strong>Status:</strong> <span style="background: #ffc107; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">PENDING</span></p>
                    </div>

                    ${orderData.method === 'whatsapp' ? `
                    <div class="urgent">
                        <strong>⚠️ WhatsApp Order - Action Required:</strong><br>
                        Customer expects confirmation via WhatsApp. Please contact them to confirm 100৳ bKash payment.
                    </div>
                    ` : ''}
                    
                    <div class="section">
                        <h2>👤 Customer Information</h2>
                        <div class="customer-info">
                            <p><strong>Name:</strong> ${customerInfo.name || 'Not provided'}</p>
                            <p><strong>Phone:</strong> ${customerInfo.phone || 'Not provided'}</p>
                            <p><strong>Email:</strong> ${customerInfo.email || 'Not provided'}</p>
                            ${customerInfo.address ? `<p><strong>Address:</strong> ${customerInfo.address}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>🛒 Order Items</h2>
                        ${items.map(item => `
                            <div class="item">
                                <div class="item-details">
                                    <div class="item-title">${item.title}</div>
                                    <div class="item-meta">
                                        Quantity: ${item.quantity} × ৳${item.price} = ৳${item.quantity * item.price}
                                    </div>
                                    ${Object.keys(item.variants || {}).length > 0 ? `
                                        <div class="item-meta">
                                            Options: ${Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </div>
                                    ` : ''}
                                    ${item.notes ? `
                                        <div class="item-meta">
                                            Notes: ${item.notes}
                                        </div>
                                    ` : ''}
                                    ${item.isCustom ? `
                                        <div class="item-meta" style="color: #007bff; font-weight: 600;">
                                            🎨 Custom Design Included
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="total">
                        Total Amount: ৳${orderData.total}
                    </div>
                    
                    ${orderData.notes ? `
                    <div class="section">
                        <h2>📝 Additional Notes</h2>
                        <p style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff;">
                            ${orderData.notes}
                        </p>
                    </div>
                    ` : ''}
                    
                    <div class="section">
                        <h2>🚀 Next Steps</h2>
                        <ol style="padding-left: 20px;">
                            <li>Confirm order details and availability</li>
                            ${orderData.method === 'whatsapp' ? '<li>Contact customer via WhatsApp for bKash payment confirmation</li>' : ''}
                            <li>Update order status to "Processing" when confirmed</li>
                            <li>Begin production/preparation</li>
                            <li>Update status to "Shipped" when dispatched</li>
                            <li>Mark as "Delivered" upon completion</li>
                        </ol>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This email was automatically generated by TryneX Lifestyle order system.</p>
                    <p>Please do not reply to this email.</p>
                    <p style="margin-top: 15px;">
                        <strong>TryneX Lifestyle</strong><br>
                        📞 01747292277 | 📧 trynexlifestyle@gmail.com
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
TryneX Lifestyle - New Order Received

Order ID: ${orderData.order_id}
Date: ${new Date(orderData.created_at).toLocaleString()}
Payment Method: ${orderData.method || 'Not specified'}
Status: PENDING

Customer Information:
- Name: ${customerInfo.name || 'Not provided'}
- Phone: ${customerInfo.phone || 'Not provided'}
- Email: ${customerInfo.email || 'Not provided'}
${customerInfo.address ? `- Address: ${customerInfo.address}` : ''}

Order Items:
${items.map(item => `
- ${item.title}
  Quantity: ${item.quantity} × ৳${item.price} = ৳${item.quantity * item.price}
  ${Object.keys(item.variants || {}).length > 0 ? `Options: ${Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}
  ${item.notes ? `Notes: ${item.notes}` : ''}
  ${item.isCustom ? 'Custom Design Included' : ''}
`).join('')}

Total Amount: ৳${orderData.total}

${orderData.notes ? `Additional Notes: ${orderData.notes}` : ''}

${orderData.method === 'whatsapp' ? `
IMPORTANT: This is a WhatsApp order. Please contact the customer to confirm 100৳ bKash payment.
` : ''}

Next Steps:
1. Confirm order details and availability
${orderData.method === 'whatsapp' ? '2. Contact customer via WhatsApp for bKash payment confirmation' : ''}
3. Update order status to "Processing" when confirmed
4. Begin production/preparation
5. Update status to "Shipped" when dispatched
6. Mark as "Delivered" upon completion

---
TryneX Lifestyle
Phone: 01747292277
Email: trynexlifestyle@gmail.com
    `;

    return { html, text };
}

// Generate customer confirmation email
function generateCustomerEmailContent(orderData) {
    const customerInfo = orderData.customer_info ? JSON.parse(orderData.customer_info) : {};
    const items = orderData.items ? JSON.parse(orderData.items) : [];
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation - ${orderData.order_id}</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #FFD700, #B8860B);
                    color: #000;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                }
                .content {
                    padding: 30px;
                }
                .success-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 20px;
                    border-radius: 6px;
                    border: 1px solid #c3e6cb;
                    margin-bottom: 20px;
                    text-align: center;
                }
                .order-info {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    border-left: 4px solid #FFD700;
                }
                .section {
                    margin-bottom: 30px;
                }
                .section h2 {
                    color: #333;
                    border-bottom: 2px solid #FFD700;
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                .item {
                    display: flex;
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                    align-items: center;
                }
                .item:last-child {
                    border-bottom: none;
                }
                .item-details {
                    flex: 1;
                }
                .item-title {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                }
                .item-meta {
                    color: #666;
                    font-size: 14px;
                }
                .total {
                    background: #FFD700;
                    color: #000;
                    padding: 15px 20px;
                    border-radius: 6px;
                    text-align: center;
                    font-size: 20px;
                    font-weight: 700;
                    margin: 20px 0;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    border-top: 1px solid #eee;
                }
                .cta-button {
                    display: inline-block;
                    background: #FFD700;
                    color: #000;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 10px 5px;
                }
                .tracking-info {
                    background: #e7f3ff;
                    border: 1px solid #b6e2ff;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                }
                @media only screen and (max-width: 600px) {
                    .container {
                        margin: 0;
                        border-radius: 0;
                    }
                    .content {
                        padding: 20px;
                    }
                    .header {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Order Confirmed!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px;">TryneX Lifestyle</p>
                </div>
                
                <div class="content">
                    <div class="success-message">
                        <h3 style="margin: 0 0 10px 0;">Thank you for your order!</h3>
                        <p style="margin: 0;">We've received your order and will process it shortly.</p>
                    </div>

                    <div class="order-info">
                        <h3 style="margin: 0 0 10px 0; color: #333;">Order Summary</h3>
                        <p><strong>Order ID:</strong> ${orderData.order_id}</p>
                        <p><strong>Order Date:</strong> ${new Date(orderData.created_at).toLocaleString()}</p>
                        <p><strong>Status:</strong> <span style="background: #ffc107; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">PENDING</span></p>
                    </div>

                    <div class="tracking-info">
                        <strong>📱 Track Your Order:</strong><br>
                        You can track your order status anytime using your Order ID on our website.
                        <br><br>
                        <a href="${process.env.SITE_URL || 'https://trynex-lifestyle.netlify.app'}/track-order.html?id=${orderData.order_id}" class="cta-button">
                            Track Order
                        </a>
                    </div>
                    
                    <div class="section">
                        <h2>🛒 Your Order</h2>
                        ${items.map(item => `
                            <div class="item">
                                <div class="item-details">
                                    <div class="item-title">${item.title}</div>
                                    <div class="item-meta">
                                        Quantity: ${item.quantity} × ৳${item.price} = ৳${item.quantity * item.price}
                                    </div>
                                    ${Object.keys(item.variants || {}).length > 0 ? `
                                        <div class="item-meta">
                                            Options: ${Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </div>
                                    ` : ''}
                                    ${item.notes ? `
                                        <div class="item-meta">
                                            Special Instructions: ${item.notes}
                                        </div>
                                    ` : ''}
                                    ${item.isCustom ? `
                                        <div class="item-meta" style="color: #007bff; font-weight: 600;">
                                            🎨 Custom Design Included
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="total">
                        Total Amount: ৳${orderData.total}
                    </div>
                    
                    <div class="section">
                        <h2>📋 What Happens Next?</h2>
                        <ol style="padding-left: 20px;">
                            <li><strong>Order Confirmation:</strong> We'll review your order details</li>
                            ${orderData.method === 'whatsapp' ? '<li><strong>Payment Confirmation:</strong> We\'ll contact you via WhatsApp for 100৳ bKash confirmation</li>' : ''}
                            <li><strong>Production:</strong> Your items will be prepared with care</li>
                            <li><strong>Quality Check:</strong> Every product is inspected before shipping</li>
                            <li><strong>Delivery:</strong> Your order will be delivered to your address</li>
                        </ol>
                    </div>

                    ${orderData.method === 'whatsapp' ? `
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <strong>💰 Payment Information:</strong><br>
                        As this is a WhatsApp order, we'll contact you shortly to confirm your 100৳ bKash payment. 
                        Please keep your bKash account ready.
                    </div>
                    ` : ''}
                    
                    <div class="section">
                        <h2>📞 Need Help?</h2>
                        <p>If you have any questions about your order, feel free to contact us:</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://wa.me/8801747292277" class="cta-button">
                                💬 WhatsApp Us
                            </a>
                            <a href="mailto:trynexlifestyle@gmail.com" class="cta-button">
                                📧 Email Us
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <p><strong>Thank you for choosing TryneX Lifestyle!</strong></p>
                    <p>We appreciate your business and look forward to serving you.</p>
                    <p style="margin-top: 15px;">
                        <strong>TryneX Lifestyle</strong><br>
                        📞 01747292277 | 📧 trynexlifestyle@gmail.com<br>
                        📍 Dhaka, Bangladesh
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
TryneX Lifestyle - Order Confirmation

Thank you for your order!

Order ID: ${orderData.order_id}
Order Date: ${new Date(orderData.created_at).toLocaleString()}
Status: PENDING

Your Order:
${items.map(item => `
- ${item.title}
  Quantity: ${item.quantity} × ৳${item.price} = ৳${item.quantity * item.price}
  ${Object.keys(item.variants || {}).length > 0 ? `Options: ${Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}
  ${item.notes ? `Special Instructions: ${item.notes}` : ''}
  ${item.isCustom ? 'Custom Design Included' : ''}
`).join('')}

Total Amount: ৳${orderData.total}

What Happens Next?
1. Order Confirmation: We'll review your order details
${orderData.method === 'whatsapp' ? '2. Payment Confirmation: We\'ll contact you via WhatsApp for 100৳ bKash confirmation' : ''}
3. Production: Your items will be prepared with care
4. Quality Check: Every product is inspected before shipping
5. Delivery: Your order will be delivered to your address

${orderData.method === 'whatsapp' ? `
Payment Information:
As this is a WhatsApp order, we'll contact you shortly to confirm your 100৳ bKash payment. Please keep your bKash account ready.
` : ''}

Track Your Order:
Visit our website and use Order ID: ${orderData.order_id}
${process.env.SITE_URL || 'https://trynex-lifestyle.netlify.app'}/track-order.html?id=${orderData.order_id}

Need Help?
WhatsApp: +8801747292277
Email: trynexlifestyle@gmail.com

Thank you for choosing TryneX Lifestyle!

---
TryneX Lifestyle
Phone: 01747292277
Email: trynexlifestyle@gmail.com
Address: Dhaka, Bangladesh
    `;

    return { html, text };
}
