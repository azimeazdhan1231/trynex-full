// TryneX Lifestyle - Supabase Integration

// Supabase configuration
const SUPABASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '0.0.0.0' 
    ? 'https://wifsqonbnfmwtqvupqbk.supabase.co'  // Development
    : 'https://your-project-id.supabase.co';       // Production - Update this

const SUPABASE_ANON_KEY = window.location.hostname === 'localhost' || window.location.hostname === '0.0.0.0'
    ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZnNxb25ibmZtd3RxdnVwcWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODAyNjMsImV4cCI6MjA2NzE1NjI2M30.A7o3vhEaNZb9lmViHA_KQrwzKJTBWpsD6KbHqkkput0'  // Development
    : 'your-production-anon-key-here';  // Production - Update this

// Database connection using native fetch (no external dependencies)
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    async request(endpoint, options = {}) {
        // Check if Supabase is properly configured
        if (!this.initialized || this.url.includes('your-project') || this.key.includes('your-anon-key')) {
            console.warn('Supabase not configured, using mock data');
            return this.getMockData(endpoint);
        }

        try {
            const url = `${this.url}/rest/v1/${endpoint}`;
            const config = {
                headers: this.headers,
                ...options
            };

            try {
                const response = await fetch(url, config);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Supabase error ${response.status}:`, errorText);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Supabase request error:', error);
                return this.getMockData(endpoint);
            }
        }
        catch (error) {
            console.error('Supabase request error:', error);
            throw error;
        }
    }

    // Storage operations
    async uploadFile(bucket, path, file) {
        const uploadUrl = `${this.url}/storage/v1/object/${bucket}/${path}`;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.key}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    getPublicUrl(bucket, path) {
        return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
    }
}

// Initialize Supabase client
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database initialization
async function initializeDatabase() {
    try {
        // Create orders table if it doesn't exist
        await supabase.request('orders', {
            method: 'POST',
            body: JSON.stringify({
                // This will fail if table doesn't exist, which is expected
                order_id: 'test'
            })
        });
    } catch (error) {
        // Table doesn't exist, create schema
        console.log('Initializing database schema...');
        await createDatabaseSchema();
    }
}

async function createDatabaseSchema() {
    // Note: In a real scenario, these would be created via Supabase dashboard
    // This is a fallback for development
    console.log('Database schema should be created via Supabase dashboard');
}

// Product operations
async function getAllProducts() {
    try {
        const products = await supabase.request('products?select=*');
        return products || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return getMockProducts(); // Fallback to mock data for development
    }
}

async function getProductById(id) {
    try {
        const products = await supabase.request(`products?id=eq.${id}&select=*`);
        return products && products.length > 0 ? products[0] : null;
    } catch (error) {
        console.error('Error fetching product:', error);
        return getMockProductById(id);
    }
}

async function getProductsByCategory(category) {
    try {
        const products = await supabase.request(`products?category=eq.${category}&select=*`);
        return products || [];
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return getMockProducts().filter(p => p.category === category);
    }
}

async function getFeaturedProducts(limit = 8) {
    try {
        const products = await supabase.request(`products?featured=eq.true&limit=${limit}&select=*`);
        return products || [];
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return getMockProducts().slice(0, limit);
    }
}

async function searchProducts(query) {
    try {
        const products = await supabase.request(`products?or=(title.ilike.%25${query}%25,description.ilike.%25${query}%25)&select=*`);
        return products || [];
    } catch (error) {
        console.error('Error searching products:', error);
        return getMockProducts().filter(p => 
            p.title.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Order operations
async function createOrder(orderData) {
    try {
        const order = {
            order_id: generateOrderId(),
            items: JSON.stringify(orderData.items),
            customer_info: JSON.stringify(orderData.customerInfo),
            total: orderData.total,
            method: orderData.method,
            status: 'pending',
            notes: orderData.notes || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const result = await supabase.request('orders', {
            method: 'POST',
            body: JSON.stringify(order)
        });

        return result && result.length > 0 ? result[0] : order;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

async function updateOrderStatus(orderId, status, notes = '') {
    try {
        const updateData = {
            status: status,
            updated_at: new Date().toISOString()
        };

        if (notes) {
            updateData.notes = notes;
        }

        const result = await supabase.request(`orders?order_id=eq.${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify(updateData)
        });

        return result;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

async function getOrderById(orderId) {
    try {
        const orders = await supabase.request(`orders?order_id=eq.${orderId}&select=*`);
        return orders && orders.length > 0 ? orders[0] : null;
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
}

async function searchOrder(orderId, email = '') {
    try {
        let query = `orders?order_id=eq.${orderId}`;

        if (email) {
            query += `&customer_info->>email=eq.${email}`;
        }

        const orders = await supabase.request(`${query}&select=*`);
        return orders && orders.length > 0 ? orders[0] : null;
    } catch (error) {
        console.error('Error searching order:', error);
        return null;
    }
}

async function getAllOrders(limit = 50, offset = 0) {
    try {
        const orders = await supabase.request(`orders?limit=${limit}&offset=${offset}&order=created_at.desc&select=*`);
        return orders || [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

// Custom design operations
async function saveCustomDesign(designData) {
    try {
        const customOrder = {
            design_id: generateDesignId(),
            product_id: designData.productId,
            design_data: JSON.stringify(designData.designData),
            preview_url: designData.previewUrl,
            customer_info: JSON.stringify(designData.customerInfo),
            status: 'pending',
            created_at: new Date().toISOString()
        };

        const result = await supabase.request('custom_orders', {
            method: 'POST',
            body: JSON.stringify(customOrder)
        });

        return result && result.length > 0 ? result[0] : customOrder;
    } catch (error) {
        console.error('Error saving custom design:', error);
        throw error;
    }
}

async function uploadDesignFile(file, designId) {
    try {
        const fileName = `designs/${designId}-${Date.now()}-${file.name}`;
        await supabase.uploadFile('custom-designs', fileName, file);
        return supabase.getPublicUrl('custom-designs', fileName);
    } catch (error) {
        console.error('Error uploading design file:', error);
        throw error;
    }
}

// Utility functions
function generateOrderId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 999) + 1;

    return `TXR-${year}${month}${day}-${String(random).padStart(3, '0')}`;
}

function generateDesignId() {
    return `DESIGN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Mock data for development (fallback when database is not accessible)
function getMockProducts() {
    return [
        {
            id: '1',
            title: 'Custom Coffee Mug',
            title_bn: 'কাস্টম কফি মগ',
            price: 350,
            original_price: 450,
            category: 'mugs',
            image: 'https://pixabay.com/get/g89495b1b7844695918d3ae8c371b5754a86ea6b37d7eeb7b7cb634473131fa6d72efb877a2c02e74fef7428027dd3f7be940134cd543419178a37986f34de68d_1280.jpg',
            description: 'High-quality ceramic mug perfect for custom designs',
            variants: [
                { type: 'size', options: ['Small (8oz)', 'Medium (11oz)', 'Large (15oz)'] },
                { type: 'color', options: ['White', 'Black', 'Blue', 'Red'] }
            ],
            tags: ['mug', 'coffee', 'custom', 'ceramic'],
            customizable: true,
            featured: true,
            stock_status: 'in_stock'
        },
        {
            id: '2',
            title: 'Custom T-Shirt',
            title_bn: 'কাস্টম টি-শার্ট',
            price: 650,
            original_price: 750,
            category: 't-shirts',
            image: 'https://pixabay.com/get/g07df2518ca0be60971038c3de02c832ef39a22fb93f7b7cb634473131fa6d72efb877a2c02e74fef7428027dd3f7be940134cd543419178a37986f34de68d_1280.jpg',
            description: '100% cotton t-shirt with premium printing quality',
            variants: [
                { type: 'size', options: ['S', 'M', 'L', 'XL', 'XXL'] },
                { type: 'color', options: ['White', 'Black', 'Navy', 'Red', 'Grey'] }
            ],
            tags: ['t-shirt', 'cotton', 'custom', 'apparel'],
            customizable: true,
            featured: true,
            stock_status: 'in_stock'
        },
        {
            id: '3',
            title: 'Water Bottle',
            title_bn: 'পানির বোতল',
            price: 450,
            category: 'bottles',
            image: 'https://pixabay.com/get/g6360f5d97a9162ac56340d985d4934bafc5f569e24168782761d3c954b1395bb780a0e4771ac9385e4d155182d7ccf825c0a447e75622581a4fc75bc8d6dca40_1280.jpg',
            description: 'Stainless steel water bottle with custom engraving',
            variants: [
                { type: 'size', options: ['500ml', '750ml', '1L'] },
                { type: 'color', options: ['Silver', 'Black', 'Blue', 'Green'] }
            ],
            tags: ['bottle', 'steel', 'water', 'custom'],
            customizable: true,
            featured: false,
            stock_status: 'in_stock'
        },
        {
            id: '4',
            title: 'Custom Keychain',
            title_bn: 'কাস্টম চাবির রিং',
            price: 120,
            category: 'keychains',
            image: 'https://pixabay.com/get/g73874b41b8b5d73bfa852f1b19a98f408adbd1adeaef50d04de0f2c53e2a665fc45a07fc9d63789d6cc7813e1ac91ed5bb5ad9f870160a2096ebbccb2b6589ec_1280.jpg',
            description: 'Metal keychain with laser engraving',
            variants: [
                { type: 'material', options: ['Metal', 'Acrylic', 'Wood'] },
                { type: 'shape', options: ['Circle', 'Square', 'Heart', 'Star'] }
            ],
            tags: ['keychain', 'metal', 'engraving', 'small'],
            customizable: true,
            featured: true,
            stock_status: 'in_stock'
        },
        {
            id: '5',
            title: 'Photo Frame',
            title_bn: 'ছবির ফ্রেম',
            price: 300,
            category: 'gifts',
            image: 'https://pixabay.com/get/ga3ec04b79133b8fda4b730e989ccd03a229d3599bbf53773c6e7ed04e719da827889c4d4dd5452f1d91ec3c242273c0b6036b59688f2a1739bd768d62e917ecb_1280.jpg',
            description: 'Wooden photo frame with custom engraving',
            variants: [
                { type: 'size', options: ['4x6', '5x7', '8x10'] },
                { type: 'material', options: ['Wood', 'Metal', 'Acrylic'] }
            ],
            tags: ['frame', 'photo', 'wood', 'gift'],
            customizable: true,
            featured: false,
            stock_status: 'in_stock'
        },
        {
            id: '6',
            title: 'Phone Case',
            title_bn: 'ফোন কেস',
            price: 250,
            category: 'tech',
            image: 'https://pixabay.com/get/ga666885beda6ce57e8861294f473e06240b9f40ff051f6c0dfa2e6cb488fa82df4968ae6cc0b7433c0c7426b32695dbcd8e30d9e342d63bb4eae6f4fad852143_1280.jpg',
            description: 'Durable phone case with custom printing',
            variants: [
                { type: 'model', options: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'Samsung S21', 'Samsung S22'] },
                { type: 'material', options: ['Silicone', 'Hard Plastic', 'Leather'] }
            ],
            tags: ['phone', 'case', 'protection', 'tech'],
            customizable: true,
            featured: true,
            stock_status: 'in_stock'
        },
        {
            id: '7',
            title: 'Canvas Bag',
            title_bn: 'ক্যানভাস ব্যাগ',
            price: 400,
            category: 'bags',
            image: 'https://pixabay.com/get/g621a210f82bce681cee235c957a22ab3f8bd77abf561419c6a7a1024ff8af25f5ad5ba8fe3468f9a6ba67085170a63206fe4d90f942414d01c29b5b199fb49cd_1280.jpg',
            description: 'Eco-friendly canvas tote bag with custom printing',
            variants: [
                { type: 'size', options: ['Small', 'Medium', 'Large'] },
                { type: 'color', options: ['Natural', 'Black', 'Navy', 'Red'] }
            ],
            tags: ['bag', 'canvas', 'tote', 'eco'],
            customizable: true,
            featured: false,
            stock_status: 'in_stock'
        },
        {
            id: '8',
            title: 'Custom Notebook',
            title_bn: 'কাস্টম নোটবুক',
            price: 280,
            category: 'stationery',
            image: 'https://pixabay.com/get/g91b5d866afb5a0a0cf481ec6be8231d30337efa5bf02acfff00192f37f1d876c75878e03a220cba3a31361e2276b76584ab7be69d16196e7948e7c85feea89f9_1280.jpg',
            description: 'Premium notebook with custom cover design',
            variants: [
                { type: 'size', options: ['A5', 'A4', 'Pocket'] },
                { type: 'pages', options: ['100 pages', '200 pages', '300 pages'] }
            ],
            tags: ['notebook', 'stationery', 'custom', 'paper'],
            customizable: true,
            featured: true,
            stock_status: 'in_stock'
        }
    ];
}

function getMockProductById(id) {
    const products = getMockProducts();
    return products.find(p => p.id === id) || null;
}

// Analytics functions
async function getOrderStats() {
    try {
        const orders = await getAllOrders(1000); // Get recent orders for stats

        const stats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            processingOrders: orders.filter(o => o.status === 'processing').length,
            shippedOrders: orders.filter(o => o.status === 'shipped').length,
            deliveredOrders: orders.filter(o => o.status === 'delivered').length,
            totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
        };

        return stats;
    } catch (error) {
        console.error('Error getting order stats:', error);
        return {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            totalRevenue: 0
        };
    }
}

// Initialize database on load
document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase().catch(console.error);
});

// Export functions for global use
window.supabase = supabase;
window.getAllProducts = getAllProducts;
window.getProductById = getProductById;
window.getProductsByCategory = getProductsByCategory;
window.getFeaturedProducts = getFeaturedProducts;
window.searchProducts = searchProducts;
window.createOrder = createOrder;
window.updateOrderStatus = updateOrderStatus;
window.getOrderById = getOrderById;
window.searchOrder = searchOrder;
window.getAllOrders = getAllOrders;
window.saveCustomDesign = saveCustomDesign;
window.uploadDesignFile = uploadDesignFile;
window.generateOrderId = generateOrderId;
window.getOrderStats = getOrderStats;

console.log('TryneX Supabase integration loaded successfully');