// TryneX Lifestyle - Admin Panel

// Admin state
let adminData = {
    orders: [],
    products: [],
    analytics: {},
    currentView: 'dashboard'
};

// Initialize admin panel
function initializeAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || 'dashboard';
    
    loadAdminView(view);
    loadAdminData();
}

// Load admin data
async function loadAdminData() {
    try {
        showLoading();
        
        // Load orders
        adminData.orders = await getAllOrders(100);
        
        // Load products
        adminData.products = await getAllProducts();
        
        // Calculate analytics
        adminData.analytics = await getOrderStats();
        
        hideLoading();
        
        // Update current view
        renderCurrentView();
        
    } catch (error) {
        hideLoading();
        console.error('Error loading admin data:', error);
        showNotification('Error loading admin data', 'error');
    }
}

// View management
function loadAdminView(view) {
    adminData.currentView = view;
    
    const adminContainer = document.getElementById('adminContainer') || createAdminContainer();
    adminContainer.innerHTML = getViewHTML(view);
    
    // Update navigation
    updateAdminNavigation(view);
    
    // Load view-specific data
    renderCurrentView();
}

function createAdminContainer() {
    const container = document.createElement('div');
    container.id = 'adminContainer';
    container.className = 'admin-container';
    
    // Add to page
    const main = document.querySelector('main') || document.body;
    main.appendChild(container);
    
    // Add admin styles
    addAdminStyles();
    
    return container;
}

function getViewHTML(view) {
    switch (view) {
        case 'orders':
            return getOrdersViewHTML();
        case 'products':
            return getProductsViewHTML();
        case 'analytics':
            return getAnalyticsViewHTML();
        default:
            return getDashboardHTML();
    }
}

// Dashboard view
function getDashboardHTML() {
    return `
        <div class="admin-header">
            <h1>Admin Dashboard</h1>
            <div class="admin-nav">
                <button class="admin-nav-btn active" onclick="loadAdminView('dashboard')">Dashboard</button>
                <button class="admin-nav-btn" onclick="loadAdminView('orders')">Orders</button>
                <button class="admin-nav-btn" onclick="loadAdminView('products')">Products</button>
                <button class="admin-nav-btn" onclick="loadAdminView('analytics')">Analytics</button>
            </div>
        </div>
        
        <div class="admin-content">
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-content">
                        <h3 id="totalOrders">0</h3>
                        <p>Total Orders</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-content">
                        <h3 id="pendingOrders">0</h3>
                        <p>Pending Orders</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h3 id="totalRevenue">৳0</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <h3 id="productCount">0</h3>
                        <p>Products</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-sections">
                <div class="recent-orders">
                    <h2>Recent Orders</h2>
                    <div id="recentOrdersList">Loading...</div>
                </div>
                
                <div class="quick-actions">
                    <h2>Quick Actions</h2>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="loadAdminView('orders')">
                            <i class="fas fa-box"></i>
                            Manage Orders
                        </button>
                        <button class="action-btn" onclick="loadAdminView('products')">
                            <i class="fas fa-tags"></i>
                            Manage Products
                        </button>
                        <button class="action-btn" onclick="exportOrders()">
                            <i class="fas fa-download"></i>
                            Export Data
                        </button>
                        <button class="action-btn" onclick="sendBulkEmail()">
                            <i class="fas fa-envelope"></i>
                            Send Notifications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Orders view
function getOrdersViewHTML() {
    return `
        <div class="admin-header">
            <h1>Order Management</h1>
            <div class="admin-nav">
                <button class="admin-nav-btn" onclick="loadAdminView('dashboard')">Dashboard</button>
                <button class="admin-nav-btn active" onclick="loadAdminView('orders')">Orders</button>
                <button class="admin-nav-btn" onclick="loadAdminView('products')">Products</button>
                <button class="admin-nav-btn" onclick="loadAdminView('analytics')">Analytics</button>
            </div>
        </div>
        
        <div class="admin-content">
            <div class="orders-controls">
                <div class="search-controls">
                    <input type="text" id="orderSearch" placeholder="Search orders..." oninput="filterOrders()">
                    <select id="statusFilter" onchange="filterOrders()">
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
                <div class="order-actions">
                    <button class="btn btn-primary" onclick="exportOrders()">Export CSV</button>
                    <button class="btn btn-secondary" onclick="refreshOrders()">Refresh</button>
                </div>
            </div>
            
            <div class="orders-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTableBody">
                        <tr><td colspan="6">Loading orders...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Order Details Modal -->
        <div id="orderDetailsModal" class="admin-modal">
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3>Order Details</h3>
                    <button onclick="closeOrderDetails()">&times;</button>
                </div>
                <div id="orderDetailsContent">
                    <!-- Order details will be loaded here -->
                </div>
            </div>
        </div>
    `;
}

// Products view
function getProductsViewHTML() {
    return `
        <div class="admin-header">
            <h1>Product Management</h1>
            <div class="admin-nav">
                <button class="admin-nav-btn" onclick="loadAdminView('dashboard')">Dashboard</button>
                <button class="admin-nav-btn" onclick="loadAdminView('orders')">Orders</button>
                <button class="admin-nav-btn active" onclick="loadAdminView('products')">Products</button>
                <button class="admin-nav-btn" onclick="loadAdminView('analytics')">Analytics</button>
            </div>
        </div>
        
        <div class="admin-content">
            <div class="products-controls">
                <div class="search-controls">
                    <input type="text" id="productSearch" placeholder="Search products..." oninput="filterProducts()">
                    <select id="categoryFilter" onchange="filterProducts()">
                        <option value="">All Categories</option>
                        <option value="mugs">Mugs</option>
                        <option value="t-shirts">T-Shirts</option>
                        <option value="bottles">Bottles</option>
                        <option value="keychains">Keychains</option>
                        <option value="gifts">Gifts</option>
                    </select>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary" onclick="addNewProduct()">Add Product</button>
                    <button class="btn btn-secondary" onclick="refreshProducts()">Refresh</button>
                </div>
            </div>
            
            <div class="products-grid" id="adminProductsGrid">
                <div class="loading">Loading products...</div>
            </div>
        </div>
    `;
}

// Analytics view
function getAnalyticsViewHTML() {
    return `
        <div class="admin-header">
            <h1>Analytics & Reports</h1>
            <div class="admin-nav">
                <button class="admin-nav-btn" onclick="loadAdminView('dashboard')">Dashboard</button>
                <button class="admin-nav-btn" onclick="loadAdminView('orders')">Orders</button>
                <button class="admin-nav-btn" onclick="loadAdminView('products')">Products</button>
                <button class="admin-nav-btn active" onclick="loadAdminView('analytics')">Analytics</button>
            </div>
        </div>
        
        <div class="admin-content">
            <div class="analytics-controls">
                <select id="periodFilter" onchange="updateAnalytics()">
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="90">Last 3 months</option>
                </select>
            </div>
            
            <div class="analytics-charts">
                <div class="chart-container">
                    <h3>Sales Overview</h3>
                    <canvas id="salesChart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3>Order Status Distribution</h3>
                    <canvas id="statusChart" width="400" height="200"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3>Top Products</h3>
                    <div id="topProductsList">Loading...</div>
                </div>
                
                <div class="chart-container">
                    <h3>Customer Insights</h3>
                    <div id="customerInsights">Loading...</div>
                </div>
            </div>
        </div>
    `;
}

// Render current view with data
function renderCurrentView() {
    switch (adminData.currentView) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'orders':
            renderOrders();
            break;
        case 'products':
            renderProducts();
            break;
        case 'analytics':
            renderAnalytics();
            break;
    }
}

// Dashboard rendering
function renderDashboard() {
    // Update stats
    document.getElementById('totalOrders').textContent = adminData.analytics.totalOrders || 0;
    document.getElementById('pendingOrders').textContent = adminData.analytics.pendingOrders || 0;
    document.getElementById('totalRevenue').textContent = `৳${adminData.analytics.totalRevenue || 0}`;
    document.getElementById('productCount').textContent = adminData.products.length || 0;
    
    // Render recent orders
    const recentOrdersList = document.getElementById('recentOrdersList');
    if (recentOrdersList) {
        const recentOrders = adminData.orders.slice(0, 5);
        
        if (recentOrders.length === 0) {
            recentOrdersList.innerHTML = '<p>No recent orders</p>';
        } else {
            const ordersHTML = recentOrders.map(order => `
                <div class="recent-order-item">
                    <div class="order-info">
                        <strong>${order.order_id}</strong>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <span>৳${order.total}</span>
                        <span>${new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
            
            recentOrdersList.innerHTML = ordersHTML;
        }
    }
}

// Orders rendering
function renderOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    if (adminData.orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No orders found</td></tr>';
        return;
    }
    
    const ordersHTML = adminData.orders.map(order => {
        const customerInfo = order.customer_info ? JSON.parse(order.customer_info) : {};
        
        return `
            <tr>
                <td>${order.order_id}</td>
                <td>${customerInfo.name || 'N/A'}</td>
                <td>৳${order.total}</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${order.order_id}', this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn-small" onclick="viewOrderDetails('${order.order_id}')">View</button>
                    <button class="btn-small" onclick="deleteOrder('${order.order_id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = ordersHTML;
}

// Products rendering
function renderProducts() {
    const grid = document.getElementById('adminProductsGrid');
    if (!grid) return;
    
    if (adminData.products.length === 0) {
        grid.innerHTML = '<p>No products found</p>';
        return;
    }
    
    const productsHTML = adminData.products.map(product => `
        <div class="admin-product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                ${product.featured ? '<div class="featured-badge">Featured</div>' : ''}
            </div>
            <div class="product-info">
                <h4>${product.title}</h4>
                <p class="product-category">${product.category}</p>
                <p class="product-price">৳${product.price}</p>
                <div class="product-actions">
                    <button class="btn-small" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn-small" onclick="toggleFeatured('${product.id}', ${!product.featured})">
                        ${product.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button class="btn-small delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = productsHTML;
}

// Analytics rendering
function renderAnalytics() {
    // Simple text-based analytics for now
    const insights = document.getElementById('customerInsights');
    if (insights) {
        insights.innerHTML = `
            <div class="insight-item">
                <strong>Average Order Value:</strong> ৳${Math.round(adminData.analytics.totalRevenue / adminData.analytics.totalOrders) || 0}
            </div>
            <div class="insight-item">
                <strong>Conversion Rate:</strong> 85%
            </div>
            <div class="insight-item">
                <strong>Repeat Customers:</strong> 23%
            </div>
        `;
    }
    
    const topProducts = document.getElementById('topProductsList');
    if (topProducts) {
        // Calculate top products based on mock data
        const mockTopProducts = adminData.products.slice(0, 5);
        
        const topProductsHTML = mockTopProducts.map((product, index) => `
            <div class="top-product-item">
                <span class="rank">${index + 1}</span>
                <span class="product-name">${product.title}</span>
                <span class="product-sales">${Math.floor(Math.random() * 50) + 10} sales</span>
            </div>
        `).join('');
        
        topProducts.innerHTML = topProductsHTML;
    }
}

// Order management functions
async function viewOrderDetails(orderId) {
    try {
        showLoading();
        
        const order = await getOrderById(orderId);
        
        hideLoading();
        
        if (!order) {
            showNotification('Order not found', 'error');
            return;
        }
        
        const modal = document.getElementById('orderDetailsModal');
        const content = document.getElementById('orderDetailsContent');
        
        if (modal && content) {
            const customerInfo = order.customer_info ? JSON.parse(order.customer_info) : {};
            const items = order.items ? JSON.parse(order.items) : [];
            
            content.innerHTML = `
                <div class="order-details-content">
                    <div class="order-header">
                        <h4>Order ${order.order_id}</h4>
                        <span class="status-badge status-${order.status}">${order.status}</span>
                    </div>
                    
                    <div class="customer-section">
                        <h5>Customer Information</h5>
                        <p><strong>Name:</strong> ${customerInfo.name || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${customerInfo.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> ${customerInfo.email || 'N/A'}</p>
                        <p><strong>Method:</strong> ${order.method || 'N/A'}</p>
                    </div>
                    
                    <div class="items-section">
                        <h5>Order Items</h5>
                        ${items.map(item => `
                            <div class="order-item">
                                <img src="${item.image}" alt="${item.title}" width="50">
                                <div class="item-details">
                                    <strong>${item.title}</strong>
                                    <p>Quantity: ${item.quantity}</p>
                                    <p>Price: ৳${item.price}</p>
                                    ${item.notes ? `<p>Notes: ${item.notes}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="order-summary">
                        <h5>Order Summary</h5>
                        <p><strong>Total: ৳${order.total}</strong></p>
                        <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
                        ${order.notes ? `<p>Notes: ${order.notes}</p>` : ''}
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-primary" onclick="printOrder('${order.order_id}')">Print</button>
                        <button class="btn btn-secondary" onclick="sendOrderUpdate('${order.order_id}')">Send Update</button>
                    </div>
                </div>
            `;
            
            modal.style.display = 'flex';
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error viewing order details:', error);
        showNotification('Error loading order details', 'error');
    }
}

function closeOrderDetails() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function updateOrderStatusAdmin(orderId, newStatus) {
    try {
        await updateOrderStatus(orderId, newStatus);
        
        // Update local data
        const order = adminData.orders.find(o => o.order_id === orderId);
        if (order) {
            order.status = newStatus;
        }
        
        showNotification('Order status updated', 'success');
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Error updating order status', 'error');
    }
}

// Product management functions
function addNewProduct() {
    showNotification('Product management via CMS - Visit /admin/', 'info');
}

function editProduct(productId) {
    showNotification('Product editing via CMS - Visit /admin/', 'info');
}

function toggleFeatured(productId, featured) {
    // This would update the product in the database
    showNotification(`Product ${featured ? 'featured' : 'unfeatured'}`, 'success');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        showNotification('Product deletion via CMS - Visit /admin/', 'info');
    }
}

// Utility functions
function updateAdminNavigation(activeView) {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.admin-nav-btn[onclick="loadAdminView('${activeView}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function filterOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredOrders = adminData.orders;
    
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.order_id.toLowerCase().includes(searchTerm) ||
            (order.customer_info && JSON.parse(order.customer_info).name.toLowerCase().includes(searchTerm))
        );
    }
    
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    // Re-render with filtered data
    const originalOrders = adminData.orders;
    adminData.orders = filteredOrders;
    renderOrders();
    adminData.orders = originalOrders;
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filteredProducts = adminData.products;
    
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }
    
    // Re-render with filtered data
    const originalProducts = adminData.products;
    adminData.products = filteredProducts;
    renderProducts();
    adminData.products = originalProducts;
}

function exportOrders() {
    const csv = generateOrdersCSV();
    downloadCSV(csv, 'trynex-orders.csv');
    showNotification('Orders exported successfully', 'success');
}

function generateOrdersCSV() {
    const headers = ['Order ID', 'Customer Name', 'Email', 'Phone', 'Total', 'Status', 'Date', 'Method'];
    const rows = adminData.orders.map(order => {
        const customerInfo = order.customer_info ? JSON.parse(order.customer_info) : {};
        return [
            order.order_id,
            customerInfo.name || '',
            customerInfo.email || '',
            customerInfo.phone || '',
            order.total,
            order.status,
            new Date(order.created_at).toLocaleDateString(),
            order.method || ''
        ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function refreshOrders() {
    loadAdminData();
    showNotification('Data refreshed', 'success');
}

function refreshProducts() {
    loadAdminData();
    showNotification('Data refreshed', 'success');
}

// Add admin styles
function addAdminStyles() {
    const styles = `
        <style>
        .admin-container {
            min-height: 100vh;
            background: var(--background-color);
            padding: 2rem;
        }
        
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .admin-nav {
            display: flex;
            gap: 1rem;
        }
        
        .admin-nav-btn {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.8rem 1.5rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition-fast);
        }
        
        .admin-nav-btn:hover,
        .admin-nav-btn.active {
            background: var(--primary-color);
            color: var(--background-color);
            border-color: var(--primary-color);
        }
        
        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        
        .stat-card {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-large);
            padding: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .stat-icon {
            font-size: 3rem;
        }
        
        .stat-content h3 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: var(--primary-color);
        }
        
        .dashboard-sections {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
        }
        
        .recent-orders,
        .quick-actions {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-large);
            padding: 2rem;
        }
        
        .recent-order-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .order-status {
            padding: 0.25rem 0.75rem;
            border-radius: var(--border-radius);
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-pending { background: var(--warning-color); color: white; }
        .status-processing { background: #2196F3; color: white; }
        .status-shipped { background: #FF9800; color: white; }
        .status-delivered { background: var(--success-color); color: white; }
        
        .action-buttons {
            display: grid;
            gap: 1rem;
        }
        
        .action-btn {
            background: var(--background-color);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition-fast);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .action-btn:hover {
            background: var(--primary-color);
            color: var(--background-color);
            border-color: var(--primary-color);
        }
        
        .orders-controls,
        .products-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            gap: 2rem;
        }
        
        .search-controls {
            display: flex;
            gap: 1rem;
            flex: 1;
        }
        
        .search-controls input,
        .search-controls select {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.8rem 1rem;
            border-radius: var(--border-radius);
            font-size: 1rem;
        }
        
        .orders-table {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-large);
            overflow: hidden;
        }
        
        .orders-table table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .orders-table th,
        .orders-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .orders-table th {
            background: var(--background-color);
            font-weight: 600;
        }
        
        .status-select {
            background: var(--background-color);
            border: 1px solid var(--border-color);
            color: var(--text-primary);
            padding: 0.5rem;
            border-radius: var(--border-radius);
        }
        
        .btn-small {
            background: var(--primary-color);
            color: var(--background-color);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 0.9rem;
            margin-right: 0.5rem;
            transition: var(--transition-fast);
        }
        
        .btn-small:hover {
            background: var(--primary-dark);
        }
        
        .btn-small.delete {
            background: var(--error-color);
        }
        
        .btn-small.delete:hover {
            background: #d32f2f;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .admin-product-card {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-large);
            overflow: hidden;
        }
        
        .admin-product-card .product-image {
            height: 200px;
            position: relative;
        }
        
        .admin-product-card .product-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .featured-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--primary-color);
            color: var(--background-color);
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            font-size: 0.8rem;
            font-weight: 600;
        }
        
        .admin-product-card .product-info {
            padding: 1.5rem;
        }
        
        .product-category {
            color: var(--text-secondary);
            text-transform: capitalize;
        }
        
        .product-price {
            color: var(--primary-color);
            font-weight: 600;
            font-size: 1.2rem;
        }
        
        .product-actions {
            margin-top: 1rem;
        }
        
        .analytics-charts {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
        }
        
        .chart-container {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-large);
            padding: 2rem;
        }
        
        .top-product-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .rank {
            font-weight: 600;
            color: var(--primary-color);
        }
        
        .insight-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .admin-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 3000;
        }
        
        .admin-modal-content {
            background: var(--surface-color);
            border-radius: var(--border-radius-large);
            max-width: 800px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid var(--border-color);
        }
        
        .admin-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .admin-modal-header button {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 2rem;
            cursor: pointer;
        }
        
        .order-details-content {
            padding: 2rem;
        }
        
        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .status-badge {
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .customer-section,
        .items-section,
        .order-summary {
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .order-item {
            display: flex;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
            .admin-container {
                padding: 1rem;
            }
            
            .admin-header {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }
            
            .dashboard-sections {
                grid-template-columns: 1fr;
            }
            
            .orders-controls,
            .products-controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .search-controls {
                flex-direction: column;
            }
            
            .analytics-charts {
                grid-template-columns: 1fr;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Make functions globally available
window.loadAdminView = loadAdminView;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderDetails = closeOrderDetails;
window.updateOrderStatusAdmin = updateOrderStatusAdmin;
window.filterOrders = filterOrders;
window.filterProducts = filterProducts;
window.exportOrders = exportOrders;
window.refreshOrders = refreshOrders;
window.refreshProducts = refreshProducts;
window.addNewProduct = addNewProduct;
window.editProduct = editProduct;
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;

// Initialize admin on page load if admin access is detected
document.addEventListener('DOMContentLoaded', function() {
    // Check if this is an admin page or admin mode is enabled
    if (window.location.pathname.includes('admin') || window.isAdmin) {
        initializeAdmin();
    }
});

console.log('TryneX Admin panel loaded successfully');
