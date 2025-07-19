// TryneX Lifestyle - Main JavaScript File

// Global variables
let currentSlide = 0;
let footerClickCount = 0;
let isAdmin = false;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize components
    initializeNavigation();
    initializeHeroCarousel();
    initializeSearch();
    initializeScrollEffects();
    initializeAnimations();
    initializeProductHandlers();
    updateCartCount();
    
    // Load initial data
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadPopularProducts();
    }
    
    console.log('TryneX Lifestyle initialized successfully');
}

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            if (menuToggle) {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
    
    // Active navigation link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Hero carousel functionality
function initializeHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    // Auto-advance slides
    setInterval(nextSlide, 5000);
    
    // Navigation event listeners
    const nextBtn = document.querySelector('.hero-nav.next');
    const prevBtn = document.querySelector('.hero-nav.prev');
    
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Make functions globally available
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;
    window.currentSlide = function(index) {
        showSlide(index - 1);
    };
}

// Search functionality
function initializeSearch() {
    const searchBtn = document.querySelector('.search-btn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (!searchBtn || !searchOverlay) return;
    
    let searchTimeout;
    
    function showSearch() {
        searchOverlay.classList.add('active');
        searchInput.focus();
    }
    
    function hideSearch() {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchSuggestions.innerHTML = '';
    }
    
    searchBtn.addEventListener('click', showSearch);
    
    // Close search overlay
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            hideSearch();
        }
    });
    
    // Search input handler
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) {
                searchSuggestions.innerHTML = '';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        
        // Handle Enter key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
    
    // Make functions globally available
    window.toggleSearch = function() {
        if (searchOverlay.classList.contains('active')) {
            hideSearch();
        } else {
            showSearch();
        }
    };
}

async function performSearch(query) {
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    try {
        showLoading();
        
        // Search products using Supabase
        const products = await searchProducts(query);
        
        hideLoading();
        
        if (products.length === 0) {
            searchSuggestions.innerHTML = `
                <div class="search-suggestion">
                    <div class="suggestion-details">
                        <h4>No products found</h4>
                        <p>Try different keywords</p>
                    </div>
                </div>
            `;
            return;
        }
        
        const suggestionsHTML = products.slice(0, 5).map(product => `
            <div class="search-suggestion" onclick="goToProduct('${product.id}')">
                <div class="suggestion-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="suggestion-details">
                    <h4>${product.title}</h4>
                    <p>৳${product.price}</p>
                </div>
            </div>
        `).join('');
        
        searchSuggestions.innerHTML = suggestionsHTML;
        
    } catch (error) {
        hideLoading();
        console.error('Search error:', error);
        searchSuggestions.innerHTML = `
            <div class="search-suggestion">
                <div class="suggestion-details">
                    <h4>Search Error</h4>
                    <p>Please try again</p>
                </div>
            </div>
        `;
    }
}

function goToProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Scroll effects
function initializeScrollEffects() {
    // Parallax effect for hero backgrounds
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-bg');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    
    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.category-card, .feature-item, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Animation utilities
function initializeAnimations() {
    // Hover effects for cards
    document.querySelectorAll('.category-card, .product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Product handlers
function initializeProductHandlers() {
    // Category card clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            if (category) {
                window.location.href = `products.html?category=${category}`;
            }
        });
    });
}

// Load popular products for homepage
async function loadPopularProducts() {
    const container = document.getElementById('popularProducts');
    if (!container) return;
    
    try {
        showLoading();
        
        const products = await getFeaturedProducts(8);
        
        hideLoading();
        
        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">No products available</p>';
            return;
        }
        
        const productsHTML = products.map(product => `
            <div class="product-card" onclick="goToProduct('${product.id}')">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                    ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">
                        ৳${product.price}
                        ${product.original_price ? `<span class="original-price">৳${product.original_price}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="quick-view-btn" onclick="event.stopPropagation(); quickViewProduct('${product.id}')">
                            Quick View
                        </button>
                        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = productsHTML;
        
    } catch (error) {
        hideLoading();
        console.error('Error loading popular products:', error);
        container.innerHTML = '<p class="text-center">Error loading products</p>';
    }
}

// Quick view functionality
async function quickViewProduct(productId) {
    try {
        showLoading();
        
        const product = await getProductById(productId);
        
        hideLoading();
        
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }
        
        // Update quick view modal content
        const modal = document.getElementById('quickViewModal');
        if (modal) {
            document.getElementById('quickViewImage').src = product.image;
            document.getElementById('quickViewTitle').textContent = product.title;
            document.getElementById('quickViewPrice').textContent = `৳${product.price}`;
            document.getElementById('quickViewDescription').textContent = product.description || '';
            
            // Show variants if available
            const variantsContainer = document.getElementById('quickViewVariants');
            if (product.variants && product.variants.length > 0) {
                const variantsHTML = product.variants.map(variant => `
                    <div class="variant-group">
                        <label>${variant.type}:</label>
                        <div class="variant-options">
                            ${variant.options.map(option => `
                                <span class="variant-option" onclick="selectVariant(this)">${option}</span>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                variantsContainer.innerHTML = variantsHTML;
            } else {
                variantsContainer.innerHTML = '';
            }
            
            modal.style.display = 'flex';
            
            // Store current product for quick view actions
            window.currentQuickViewProduct = product;
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error loading product for quick view:', error);
        showNotification('Error loading product details', 'error');
    }
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function viewFullProduct() {
    if (window.currentQuickViewProduct) {
        window.location.href = `product.html?id=${window.currentQuickViewProduct.id}`;
    }
}

function addToCartFromQuickView() {
    if (window.currentQuickViewProduct) {
        addToCart(window.currentQuickViewProduct.id);
        closeQuickView();
    }
}

// Variant selection
function selectVariant(element) {
    const siblings = element.parentElement.children;
    Array.from(siblings).forEach(sibling => {
        sibling.classList.remove('selected');
    });
    element.classList.add('selected');
}

// Admin functionality
function footerIconClick() {
    footerClickCount++;
    
    if (footerClickCount === 5) {
        const password = prompt('Enter admin password:');
        if (password === 'trynex2024') {
            isAdmin = true;
            showNotification('Admin access granted', 'success');
            loadAdminInterface();
        } else {
            showNotification('Incorrect password', 'error');
            footerClickCount = 0;
        }
    }
    
    // Reset counter after 10 seconds
    setTimeout(() => {
        if (footerClickCount > 0) {
            footerClickCount = 0;
        }
    }, 10000);
}

function loadAdminInterface() {
    if (!isAdmin) return;
    
    // Add admin panel to page
    const adminPanel = document.createElement('div');
    adminPanel.id = 'adminPanel';
    adminPanel.innerHTML = `
        <div class="admin-panel">
            <div class="admin-header">
                <h3>Admin Panel</h3>
                <button onclick="closeAdminPanel()">×</button>
            </div>
            <div class="admin-content">
                <div class="admin-section">
                    <h4>Quick Actions</h4>
                    <button class="admin-btn" onclick="viewOrders()">View Orders</button>
                    <button class="admin-btn" onclick="viewProducts()">Manage Products</button>
                    <button class="admin-btn" onclick="viewAnalytics()">Analytics</button>
                </div>
                <div class="admin-section">
                    <h4>System Status</h4>
                    <div class="status-item">
                        <span>Database:</span>
                        <span class="status-online">Online</span>
                    </div>
                    <div class="status-item">
                        <span>Storage:</span>
                        <span class="status-online">Online</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(adminPanel);
    
    // Add admin styles
    const adminStyles = `
        <style>
        .admin-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-large);
            z-index: 3000;
            width: 400px;
            max-height: 80vh;
            overflow-y: auto;
        }
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }
        .admin-header h3 {
            margin: 0;
            color: var(--primary-color);
        }
        .admin-header button {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
        }
        .admin-content {
            padding: 1.5rem;
        }
        .admin-section {
            margin-bottom: 2rem;
        }
        .admin-section h4 {
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        .admin-btn {
            display: block;
            width: 100%;
            background: var(--primary-color);
            color: var(--background-color);
            border: none;
            padding: 0.8rem 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            margin-bottom: 0.5rem;
            font-weight: 600;
            transition: var(--transition-fast);
        }
        .admin-btn:hover {
            background: var(--primary-dark);
        }
        .status-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border-color);
        }
        .status-online {
            color: var(--success-color);
            font-weight: 600;
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', adminStyles);
}

function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    if (panel) {
        panel.remove();
    }
}

function viewOrders() {
    window.location.href = 'admin.html?view=orders';
}

function viewProducts() {
    window.location.href = 'admin.html?view=products';
}

function viewAnalytics() {
    window.location.href = 'admin.html?view=analytics';
}

// Utility functions
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('active');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('active');
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="notification-icon ${iconMap[type]}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Make functions globally available
window.footerIconClick = footerIconClick;
window.quickViewProduct = quickViewProduct;
window.closeQuickView = closeQuickView;
window.viewFullProduct = viewFullProduct;
window.addToCartFromQuickView = addToCartFromQuickView;
window.selectVariant = selectVariant;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showNotification = showNotification;
window.goToProduct = goToProduct;

console.log('TryneX Main JavaScript loaded successfully');
