// TryneX Lifestyle - Shopping Cart Management

// Cart storage key
const CART_STORAGE_KEY = 'trynex_cart';

// Initialize cart
let cart = loadCartFromStorage();

// Cart management functions
function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        return [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Add item to cart
async function addToCart(productId, quantity = 1, variants = {}, notes = '') {
    try {
        showLoading();
        
        const product = await getProductById(productId);
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }
        
        // Check if item with same variants already exists
        const existingItemIndex = cart.findIndex(item => 
            item.productId === productId && 
            JSON.stringify(item.variants) === JSON.stringify(variants)
        );
        
        if (existingItemIndex > -1) {
            // Update quantity of existing item
            cart[existingItemIndex].quantity += quantity;
            cart[existingItemIndex].notes = notes || cart[existingItemIndex].notes;
        } else {
            // Add new item to cart
            const cartItem = {
                id: generateCartItemId(),
                productId: productId,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: quantity,
                variants: variants,
                notes: notes,
                addedAt: new Date().toISOString()
            };
            
            cart.push(cartItem);
        }
        
        saveCartToStorage();
        showNotification('Item added to cart', 'success');
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error('Error adding to cart:', error);
        showNotification('Error adding item to cart', 'error');
    }
}

// Add custom design to cart
function addCustomDesignToCart(productData, designData, quantity = 1) {
    try {
        const cartItem = {
            id: generateCartItemId(),
            productId: productData.id,
            title: productData.title + ' (Custom Design)',
            price: productData.price + 50, // Add design fee
            image: designData.previewUrl || productData.image,
            quantity: quantity,
            variants: {},
            notes: 'Custom design included',
            isCustom: true,
            designData: designData,
            addedAt: new Date().toISOString()
        };
        
        cart.push(cartItem);
        saveCartToStorage();
        showNotification('Custom design added to cart', 'success');
        
    } catch (error) {
        console.error('Error adding custom design to cart:', error);
        showNotification('Error adding custom design to cart', 'error');
    }
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCartToStorage();
    showNotification('Item removed from cart', 'success');
}

// Update cart item quantity
function updateCartItemQuantity(itemId, quantity) {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            cart[itemIndex].quantity = quantity;
            saveCartToStorage();
        }
    }
}

// Clear entire cart
function clearCart() {
    cart = [];
    saveCartToStorage();
    showNotification('Cart cleared', 'success');
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Cart display functions
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        const isActive = cartModal.classList.contains('active');
        if (isActive) {
            cartModal.classList.remove('active');
        } else {
            updateCartDisplay();
            cartModal.classList.add('active');
        }
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Start shopping to add items to your cart</p>
                <a href="products.html" class="btn btn-primary">Browse Products</a>
            </div>
        `;
        cartTotal.textContent = '0';
        return;
    }
    
    const cartHTML = cart.map(item => `
        <div class="cart-item" data-item-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                ${Object.keys(item.variants).length > 0 ? `
                    <div class="cart-item-variant">
                        ${Object.entries(item.variants).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </div>
                ` : ''}
                ${item.notes ? `<div class="cart-item-notes">${item.notes}</div>` : ''}
                <div class="cart-item-price">৳${item.price}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <input type="number" class="cart-item-qty" value="${item.quantity}" 
                           onchange="updateCartItemQuantity('${item.id}', parseInt(this.value))" min="1">
                    <button class="qty-btn" onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    cartItems.innerHTML = cartHTML;
    cartTotal.textContent = getCartTotal().toFixed(0);
}

// Checkout functions
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        document.getElementById('cartModal').classList.remove('active');
        checkoutModal.classList.add('active');
    }
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.remove('active');
    }
}

async function selectCheckoutMethod(method) {
    try {
        showLoading();
        
        const orderData = {
            items: cart,
            total: getCartTotal(),
            method: method,
            customerInfo: await getCustomerInfo(method),
            notes: ''
        };
        
        switch (method) {
            case 'whatsapp':
                await processWhatsAppOrder(orderData);
                break;
            case 'email':
                await processEmailOrder(orderData);
                break;
            case 'onsite':
                await processOnsiteOrder(orderData);
                break;
            default:
                throw new Error('Invalid checkout method');
        }
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error('Checkout error:', error);
        showNotification('Checkout failed. Please try again.', 'error');
    }
}

async function getCustomerInfo(method) {
    return new Promise((resolve) => {
        let customerInfo = {};
        
        if (method === 'whatsapp') {
            const phone = prompt('Enter your phone number:');
            const name = prompt('Enter your name:');
            customerInfo = { phone, name, method: 'whatsapp' };
        } else if (method === 'email') {
            const email = prompt('Enter your email address:');
            const name = prompt('Enter your name:');
            const phone = prompt('Enter your phone number:');
            customerInfo = { email, name, phone, method: 'email' };
        } else {
            // On-site checkout form
            showOnsiteCheckoutForm().then(info => {
                customerInfo = { ...info, method: 'onsite' };
                resolve(customerInfo);
            });
            return;
        }
        
        resolve(customerInfo);
    });
}

function showOnsiteCheckoutForm() {
    return new Promise((resolve) => {
        const formHTML = `
            <div class="onsite-checkout-form">
                <h3>Checkout Information</h3>
                <form id="onsiteForm">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" name="email">
                    </div>
                    <div class="form-group">
                        <label>Delivery Address *</label>
                        <textarea name="address" required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Additional Notes</label>
                        <textarea name="notes"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" onclick="closeOnsiteForm()">Cancel</button>
                        <button type="submit">Place Order</button>
                    </div>
                </form>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.id = 'onsiteCheckoutModal';
        modal.className = 'checkout-modal active';
        modal.innerHTML = `<div class="checkout-content">${formHTML}</div>`;
        
        document.body.appendChild(modal);
        
        document.getElementById('onsiteForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const customerInfo = Object.fromEntries(formData);
            document.body.removeChild(modal);
            resolve(customerInfo);
        });
        
        window.closeOnsiteForm = function() {
            document.body.removeChild(modal);
            resolve({});
        };
    });
}

async function processWhatsAppOrder(orderData) {
    try {
        // Create order in database
        const order = await createOrder(orderData);
        
        // Generate WhatsApp message
        const message = generateWhatsAppMessage(order);
        const whatsappUrl = `https://wa.me/8801747292277?text=${encodeURIComponent(message)}`;
        
        // Clear cart and show success
        clearCart();
        closeCheckout();
        
        showNotification('Redirecting to WhatsApp...', 'success');
        
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1000);
        
    } catch (error) {
        console.error('WhatsApp order error:', error);
        throw error;
    }
}

async function processEmailOrder(orderData) {
    try {
        // Create order in database
        const order = await createOrder(orderData);
        
        // Send email via Netlify function
        const response = await fetch('/.netlify/functions/sendEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: 'trynexlifestyle@gmail.com',
                subject: `New Order: ${order.order_id}`,
                orderData: order
            })
        });
        
        if (!response.ok) {
            throw new Error('Email sending failed');
        }
        
        // Clear cart and show success
        clearCart();
        closeCheckout();
        
        showOrderConfirmation(order);
        
    } catch (error) {
        console.error('Email order error:', error);
        throw error;
    }
}

async function processOnsiteOrder(orderData) {
    try {
        // Create order in database
        const order = await createOrder(orderData);
        
        // Clear cart and show success
        clearCart();
        closeCheckout();
        
        showOrderConfirmation(order);
        
    } catch (error) {
        console.error('Onsite order error:', error);
        throw error;
    }
}

function generateWhatsAppMessage(order) {
    const items = JSON.parse(order.items);
    
    let message = `🛍️ *TryneX Lifestyle Order*\n\n`;
    message += `📋 Order ID: ${order.order_id}\n`;
    message += `📅 Date: ${new Date(order.created_at).toLocaleDateString()}\n\n`;
    
    message += `🛒 *Items:*\n`;
    items.forEach((item, index) => {
        message += `${index + 1}. ${item.title}\n`;
        message += `   Price: ৳${item.price} x ${item.quantity}\n`;
        if (Object.keys(item.variants).length > 0) {
            message += `   Options: ${Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}\n`;
        }
        if (item.notes) {
            message += `   Notes: ${item.notes}\n`;
        }
        message += `\n`;
    });
    
    message += `💰 *Total: ৳${order.total}*\n\n`;
    message += `📞 Customer: ${order.customer_info ? JSON.parse(order.customer_info).name : 'Not provided'}\n`;
    message += `💳 Payment: 100৳ bKash required for confirmation\n\n`;
    message += `Please confirm this order. Thank you! 🙏`;
    
    return message;
}

function showOrderConfirmation(order) {
    const modal = document.createElement('div');
    modal.className = 'order-confirmation-modal';
    modal.innerHTML = `
        <div class="order-confirmation-content">
            <div class="confirmation-header">
                <i class="fas fa-check-circle"></i>
                <h2>Order Confirmed!</h2>
            </div>
            <div class="confirmation-body">
                <p>Your order has been successfully placed.</p>
                <div class="order-details">
                    <p><strong>Order ID:</strong> ${order.order_id}</p>
                    <p><strong>Total:</strong> ৳${order.total}</p>
                    <p><strong>Status:</strong> Pending</p>
                </div>
                <p>We will contact you shortly to confirm your order.</p>
            </div>
            <div class="confirmation-actions">
                <button class="btn btn-primary" onclick="closeOrderConfirmation()">Continue Shopping</button>
                <a href="track-order.html?id=${order.order_id}" class="btn btn-secondary">Track Order</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    const styles = `
        <style>
        .order-confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
        }
        .order-confirmation-content {
            background: var(--surface-color);
            border-radius: var(--border-radius-large);
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
            border: 1px solid var(--border-color);
        }
        .confirmation-header i {
            font-size: 4rem;
            color: var(--success-color);
            margin-bottom: 1rem;
        }
        .confirmation-header h2 {
            color: var(--success-color);
            margin-bottom: 1rem;
        }
        .order-details {
            background: var(--background-color);
            padding: 1rem;
            border-radius: var(--border-radius);
            margin: 1rem 0;
            border: 1px solid var(--border-color);
        }
        .confirmation-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
    
    window.closeOrderConfirmation = function() {
        document.body.removeChild(modal);
        window.location.href = 'products.html';
    };
}

// Utility functions
function generateCartItemId() {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Product quantity controls for product pages
function increaseQuantity() {
    const qtyInput = document.getElementById('productQuantity');
    if (qtyInput) {
        qtyInput.value = parseInt(qtyInput.value) + 1;
    }
}

function decreaseQuantity() {
    const qtyInput = document.getElementById('productQuantity');
    if (qtyInput && parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
    }
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Add event listeners for cart button
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
    }
});

// Make functions globally available
window.cart = cart;
window.addToCart = addToCart;
window.addCustomDesignToCart = addCustomDesignToCart;
window.removeFromCart = removeFromCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.toggleCart = toggleCart;
window.updateCartDisplay = updateCartDisplay;
window.proceedToCheckout = proceedToCheckout;
window.closeCheckout = closeCheckout;
window.selectCheckoutMethod = selectCheckoutMethod;
window.updateCartCount = updateCartCount;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;

console.log('TryneX Cart system loaded successfully');
