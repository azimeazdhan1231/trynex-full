// TryneX Lifestyle - Products Page Functionality

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// Initialize products page
async function loadProducts() {
    try {
        showLoading();
        
        // Load all products
        allProducts = await getAllProducts();
        filteredProducts = [...allProducts];
        
        hideLoading();
        
        if (allProducts.length === 0) {
            document.getElementById('productsGrid').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-box-open"></i>
                    </div>
                    <h3>No Products Available</h3>
                    <p>Check back soon for new products!</p>
                </div>
            `;
            document.getElementById('productsCount').textContent = '0';
            return;
        }
        
        renderProducts();
        updateProductCount();
        
    } catch (error) {
        hideLoading();
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error Loading Products</h3>
                <p>Please refresh the page to try again.</p>
                <button class="btn btn-primary" onclick="loadProducts()">Retry</button>
            </div>
        `;
    }
}

// Render products in grid
function renderProducts() {
    const container = document.getElementById('productsGrid');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search terms.</p>
            </div>
        `;
        return;
    }
    
    const productsHTML = productsToShow.map(product => `
        <div class="product-card" onclick="goToProduct('${product.id}')">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                ${product.sale ? '<div class="product-badge sale">Sale</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-category">${product.category}</p>
                <div class="product-price">
                    ৳${product.price}
                    ${product.original_price ? `<span class="original-price">৳${product.original_price}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="quick-view-btn" onclick="event.stopPropagation(); quickViewProduct('${product.id}')">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = productsHTML;
    
    // Update pagination
    renderPagination();
}

// Initialize filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    const sortFilter = document.getElementById('sortFilter');
    const priceMinValue = document.getElementById('priceMinValue');
    const priceMaxValue = document.getElementById('priceMaxValue');
    
    // Price range updates
    if (priceMin && priceMax) {
        priceMin.addEventListener('input', function() {
            const min = parseInt(this.value);
            const max = parseInt(priceMax.value);
            
            if (min >= max) {
                this.value = max - 100;
            }
            
            priceMinValue.textContent = this.value;
            filterProducts();
        });
        
        priceMax.addEventListener('input', function() {
            const min = parseInt(priceMin.value);
            const max = parseInt(this.value);
            
            if (max <= min) {
                this.value = min + 100;
            }
            
            priceMaxValue.textContent = this.value;
            filterProducts();
        });
    }
    
    // Filter changes
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', filterProducts);
    }
    
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            const grid = document.getElementById('productsGrid');
            
            if (view === 'list') {
                grid.classList.add('list-view');
            } else {
                grid.classList.remove('list-view');
            }
        });
    });
}

// Filter products
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const minPrice = parseInt(document.getElementById('priceMin').value);
    const maxPrice = parseInt(document.getElementById('priceMax').value);
    const sortBy = document.getElementById('sortFilter').value;
    
    // Apply filters
    filteredProducts = allProducts.filter(product => {
        const matchesCategory = !category || product.category === category;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        
        return matchesCategory && matchesPrice;
    });
    
    // Apply sorting
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            break;
        case 'popular':
            filteredProducts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            break;
        case 'featured':
        default:
            filteredProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return 0;
            });
            break;
    }
    
    // Reset to first page
    currentPage = 1;
    
    renderProducts();
    updateProductCount();
}

// Reset filters
function resetFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceMin').value = '100';
    document.getElementById('priceMax').value = '5000';
    document.getElementById('priceMinValue').textContent = '100';
    document.getElementById('priceMaxValue').textContent = '5000';
    document.getElementById('sortFilter').value = 'featured';
    
    filterProducts();
}

// Update product count
function updateProductCount() {
    const count = filteredProducts.length;
    document.getElementById('productsCount').textContent = count;
}

// Pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination-buttons">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i> Previous
        </button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `<button class="pagination-btn" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Go to page
function goToPage(page) {
    currentPage = page;
    renderProducts();
    
    // Scroll to top of products section
    document.querySelector('.products-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Search functionality for products page
function searchProductsOnPage(query) {
    if (!query || query.trim() === '') {
        filteredProducts = [...allProducts];
    } else {
        const searchTerm = query.toLowerCase();
        filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderProducts();
    updateProductCount();
}

// Handle URL parameters
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
        document.getElementById('categoryFilter').value = category;
    }
    
    if (search) {
        searchProductsOnPage(search);
        return;
    }
    
    if (category) {
        filterProducts();
    }
}

// Make functions globally available
window.loadProducts = loadProducts;
window.initializeFilters = initializeFilters;
window.filterProducts = filterProducts;
window.resetFilters = resetFilters;
window.goToPage = goToPage;
window.searchProductsOnPage = searchProductsOnPage;
window.handleURLParameters = handleURLParameters;

console.log('TryneX Products functionality loaded successfully');