// TryneX Lifestyle - Advanced Design Customizer

// Canvas and design state
let designCanvas;
let canvasContext;
let designLayers = [];
let activeLayer = null;
let canvasScale = 1;
let selectedProduct = null;
let isDragging = false;
let dragStart = { x: 0, y: 0 };

// Design tools state
let currentTool = 'select';
let designHistory = [];
let historyIndex = -1;

// Initialize customizer
function initializeCanvas() {
    designCanvas = document.getElementById('designCanvas');
    if (!designCanvas) return;
    
    canvasContext = designCanvas.getContext('2d');
    
    // Set canvas size
    designCanvas.width = 800;
    designCanvas.height = 600;
    
    // Initialize event listeners
    initializeCanvasEvents();
    initializeToolEvents();
    
    console.log('Design canvas initialized');
}

function initializeCanvasEvents() {
    if (!designCanvas) return;
    
    // Mouse events
    designCanvas.addEventListener('mousedown', handleMouseDown);
    designCanvas.addEventListener('mousemove', handleMouseMove);
    designCanvas.addEventListener('mouseup', handleMouseUp);
    designCanvas.addEventListener('wheel', handleWheel);
    
    // Touch events for mobile
    designCanvas.addEventListener('touchstart', handleTouchStart);
    designCanvas.addEventListener('touchmove', handleTouchMove);
    designCanvas.addEventListener('touchend', handleTouchEnd);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyDown);
}

function initializeToolEvents() {
    // File upload
    const designFile = document.getElementById('designFile');
    if (designFile) {
        designFile.addEventListener('change', handleFileUpload);
    }
    
    // Design property controls
    const sizeSlider = document.getElementById('designSize');
    const rotationSlider = document.getElementById('designRotation');
    const opacitySlider = document.getElementById('designOpacity');
    
    if (sizeSlider) {
        sizeSlider.addEventListener('input', function() {
            updateLayerProperty('scale', this.value / 100);
            document.getElementById('sizeValue').textContent = this.value + '%';
        });
    }
    
    if (rotationSlider) {
        rotationSlider.addEventListener('input', function() {
            updateLayerProperty('rotation', this.value);
            document.getElementById('rotationValue').textContent = this.value + '°';
        });
    }
    
    if (opacitySlider) {
        opacitySlider.addEventListener('input', function() {
            updateLayerProperty('opacity', this.value / 100);
            document.getElementById('opacityValue').textContent = this.value + '%';
        });
    }
}

// Product selection
async function loadCustomizableProducts() {
    const container = document.getElementById('customizableProducts');
    if (!container) return;
    
    try {
        showLoading();
        
        const products = await getAllProducts();
        const customizableProducts = products.filter(p => p.customizable);
        
        hideLoading();
        
        if (customizableProducts.length === 0) {
            container.innerHTML = '<p>No customizable products available</p>';
            return;
        }
        
        const productsHTML = customizableProducts.map(product => `
            <div class="customizable-product" onclick="selectProduct('${product.id}')">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <h4>${product.title}</h4>
                <div class="price">৳${product.price}</div>
            </div>
        `).join('');
        
        container.innerHTML = productsHTML;
        
    } catch (error) {
        hideLoading();
        console.error('Error loading customizable products:', error);
        container.innerHTML = '<p>Error loading products</p>';
    }
}

async function selectProduct(productId) {
    try {
        const product = await getProductById(productId);
        if (!product) {
            showNotification('Product not found', 'error');
            return;
        }
        
        selectedProduct = product;
        
        // Update UI
        document.querySelectorAll('.customizable-product').forEach(el => {
            el.classList.remove('selected');
        });
        event.target.closest('.customizable-product').classList.add('selected');
        
        // Load product mockup
        const mockupImage = document.getElementById('selectedProductMockup');
        if (mockupImage) {
            mockupImage.src = product.image;
            mockupImage.onload = function() {
                resizeCanvasToFitMockup();
            };
        }
        
        // Clear existing design
        clearCanvas();
        
        showNotification(`Selected: ${product.title}`, 'success');
        
    } catch (error) {
        console.error('Error selecting product:', error);
        showNotification('Error selecting product', 'error');
    }
}

// File upload and image handling
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        createImageLayer(e.target.result);
    };
    reader.readAsDataURL(file);
}

function createImageLayer(imageSrc) {
    const img = new Image();
    img.onload = function() {
        const layer = {
            id: generateLayerId(),
            type: 'image',
            image: img,
            x: designCanvas.width / 2 - img.width / 4,
            y: designCanvas.height / 2 - img.height / 4,
            width: img.width / 2,
            height: img.height / 2,
            scale: 1,
            rotation: 0,
            opacity: 1,
            visible: true
        };
        
        addLayer(layer);
        redrawCanvas();
        saveToHistory();
        
        showNotification('Image added to design', 'success');
    };
    img.src = imageSrc;
}

// Text layer creation
function addText() {
    const textInput = document.getElementById('textInput');
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const textColor = document.getElementById('textColor');
    
    if (!textInput || !textInput.value.trim()) {
        showNotification('Please enter text', 'warning');
        return;
    }
    
    const layer = {
        id: generateLayerId(),
        type: 'text',
        text: textInput.value,
        x: designCanvas.width / 2,
        y: designCanvas.height / 2,
        fontFamily: fontFamily.value,
        fontSize: parseInt(fontSize.value),
        color: textColor.value,
        scale: 1,
        rotation: 0,
        opacity: 1,
        visible: true
    };
    
    addLayer(layer);
    redrawCanvas();
    saveToHistory();
    
    // Clear input
    textInput.value = '';
    
    showNotification('Text added to design', 'success');
}

// Layer management
function addLayer(layer) {
    designLayers.push(layer);
    activeLayer = layer;
    updateLayersList();
    updatePropertyControls();
}

function removeLayer(layerId) {
    const index = designLayers.findIndex(l => l.id === layerId);
    if (index > -1) {
        designLayers.splice(index, 1);
        if (activeLayer && activeLayer.id === layerId) {
            activeLayer = designLayers.length > 0 ? designLayers[designLayers.length - 1] : null;
        }
        updateLayersList();
        redrawCanvas();
        saveToHistory();
    }
}

function selectLayer(layerId) {
    activeLayer = designLayers.find(l => l.id === layerId);
    updateLayersList();
    updatePropertyControls();
}

function updateLayersList() {
    const layersList = document.getElementById('layersList');
    if (!layersList) return;
    
    if (designLayers.length === 0) {
        layersList.innerHTML = '<p>No layers</p>';
        return;
    }
    
    const layersHTML = designLayers.map((layer, index) => `
        <div class="layer-item ${activeLayer && activeLayer.id === layer.id ? 'active' : ''}" 
             onclick="selectLayer('${layer.id}')">
            <span>${layer.type === 'text' ? layer.text : 'Image'} ${index + 1}</span>
            <div class="layer-controls">
                <button class="layer-btn" onclick="toggleLayerVisibility('${layer.id}')" title="Toggle visibility">
                    <i class="fas fa-eye${layer.visible ? '' : '-slash'}"></i>
                </button>
                <button class="layer-btn" onclick="duplicateLayer('${layer.id}')" title="Duplicate">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="layer-btn" onclick="removeLayer('${layer.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    layersList.innerHTML = layersHTML;
}

function toggleLayerVisibility(layerId) {
    const layer = designLayers.find(l => l.id === layerId);
    if (layer) {
        layer.visible = !layer.visible;
        updateLayersList();
        redrawCanvas();
    }
}

function duplicateLayer(layerId) {
    const layer = designLayers.find(l => l.id === layerId);
    if (layer) {
        const duplicate = {
            ...layer,
            id: generateLayerId(),
            x: layer.x + 20,
            y: layer.y + 20
        };
        addLayer(duplicate);
        redrawCanvas();
        saveToHistory();
    }
}

// Property updates
function updateLayerProperty(property, value) {
    if (!activeLayer) return;
    
    activeLayer[property] = value;
    redrawCanvas();
    saveToHistory();
}

function updatePropertyControls() {
    if (!activeLayer) return;
    
    const sizeSlider = document.getElementById('designSize');
    const rotationSlider = document.getElementById('designRotation');
    const opacitySlider = document.getElementById('designOpacity');
    
    if (sizeSlider) {
        sizeSlider.value = (activeLayer.scale || 1) * 100;
        document.getElementById('sizeValue').textContent = sizeSlider.value + '%';
    }
    
    if (rotationSlider) {
        rotationSlider.value = activeLayer.rotation || 0;
        document.getElementById('rotationValue').textContent = rotationSlider.value + '°';
    }
    
    if (opacitySlider) {
        opacitySlider.value = (activeLayer.opacity || 1) * 100;
        document.getElementById('opacityValue').textContent = opacitySlider.value + '%';
    }
}

// Canvas drawing
function redrawCanvas() {
    if (!canvasContext) return;
    
    // Clear canvas
    canvasContext.clearRect(0, 0, designCanvas.width, designCanvas.height);
    
    // Draw layers
    designLayers.forEach(layer => {
        if (!layer.visible) return;
        
        canvasContext.save();
        
        // Apply transformations
        canvasContext.globalAlpha = layer.opacity || 1;
        canvasContext.translate(layer.x, layer.y);
        canvasContext.rotate((layer.rotation || 0) * Math.PI / 180);
        canvasContext.scale(layer.scale || 1, layer.scale || 1);
        
        if (layer.type === 'image') {
            canvasContext.drawImage(
                layer.image,
                -layer.width / 2,
                -layer.height / 2,
                layer.width,
                layer.height
            );
        } else if (layer.type === 'text') {
            canvasContext.font = `${layer.fontSize}px ${layer.fontFamily}`;
            canvasContext.fillStyle = layer.color;
            canvasContext.textAlign = 'center';
            canvasContext.textBaseline = 'middle';
            canvasContext.fillText(layer.text, 0, 0);
        }
        
        canvasContext.restore();
        
        // Draw selection outline for active layer
        if (activeLayer && activeLayer.id === layer.id) {
            drawSelectionOutline(layer);
        }
    });
}

function drawSelectionOutline(layer) {
    canvasContext.save();
    canvasContext.strokeStyle = '#FFD700';
    canvasContext.lineWidth = 2;
    canvasContext.setLineDash([5, 5]);
    
    const bounds = getLayerBounds(layer);
    canvasContext.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
    canvasContext.restore();
}

function getLayerBounds(layer) {
    if (layer.type === 'image') {
        const scale = layer.scale || 1;
        return {
            x: layer.x - (layer.width * scale) / 2,
            y: layer.y - (layer.height * scale) / 2,
            width: layer.width * scale,
            height: layer.height * scale
        };
    } else if (layer.type === 'text') {
        canvasContext.font = `${layer.fontSize}px ${layer.fontFamily}`;
        const metrics = canvasContext.measureText(layer.text);
        const scale = layer.scale || 1;
        return {
            x: layer.x - (metrics.width * scale) / 2,
            y: layer.y - (layer.fontSize * scale) / 2,
            width: metrics.width * scale,
            height: layer.fontSize * scale
        };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
}

// Mouse and touch event handlers
function handleMouseDown(event) {
    const rect = designCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find clicked layer
    const clickedLayer = findLayerAtPoint(x, y);
    if (clickedLayer) {
        activeLayer = clickedLayer;
        updateLayersList();
        updatePropertyControls();
        
        isDragging = true;
        dragStart = { x: x - activeLayer.x, y: y - activeLayer.y };
    }
}

function handleMouseMove(event) {
    if (!isDragging || !activeLayer) return;
    
    const rect = designCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    activeLayer.x = x - dragStart.x;
    activeLayer.y = y - dragStart.y;
    
    redrawCanvas();
}

function handleMouseUp(event) {
    if (isDragging) {
        isDragging = false;
        saveToHistory();
    }
}

function handleWheel(event) {
    event.preventDefault();
    
    if (event.ctrlKey) {
        // Zoom canvas
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        canvasScale *= delta;
        designCanvas.style.transform = `scale(${canvasScale})`;
    }
}

function handleTouchStart(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    if (event.touches.length === 1) {
        const touch = event.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
}

function handleTouchEnd(event) {
    event.preventDefault();
    handleMouseUp(event);
}

function handleKeyDown(event) {
    if (event.key === 'Delete' && activeLayer) {
        removeLayer(activeLayer.id);
    } else if (event.ctrlKey && event.key === 'z') {
        undo();
    } else if (event.ctrlKey && event.key === 'y') {
        redo();
    }
}

// Utility functions
function findLayerAtPoint(x, y) {
    // Check layers in reverse order (top to bottom)
    for (let i = designLayers.length - 1; i >= 0; i--) {
        const layer = designLayers[i];
        if (!layer.visible) continue;
        
        const bounds = getLayerBounds(layer);
        if (x >= bounds.x && x <= bounds.x + bounds.width &&
            y >= bounds.y && y <= bounds.y + bounds.height) {
            return layer;
        }
    }
    return null;
}

function generateLayerId() {
    return 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function resizeCanvasToFitMockup() {
    const mockup = document.getElementById('selectedProductMockup');
    if (!mockup || !designCanvas) return;
    
    const mockupRect = mockup.getBoundingClientRect();
    const containerRect = mockup.parentElement.getBoundingClientRect();
    
    // Adjust canvas size to match mockup
    designCanvas.style.width = mockupRect.width + 'px';
    designCanvas.style.height = mockupRect.height + 'px';
}

// Design alignment functions
function alignDesign(position) {
    if (!activeLayer) {
        showNotification('Please select a layer first', 'warning');
        return;
    }
    
    const canvasWidth = designCanvas.width;
    const canvasHeight = designCanvas.height;
    
    switch (position) {
        case 'top-left':
            activeLayer.x = 50;
            activeLayer.y = 50;
            break;
        case 'top-center':
            activeLayer.x = canvasWidth / 2;
            activeLayer.y = 50;
            break;
        case 'top-right':
            activeLayer.x = canvasWidth - 50;
            activeLayer.y = 50;
            break;
        case 'middle-left':
            activeLayer.x = 50;
            activeLayer.y = canvasHeight / 2;
            break;
        case 'center':
            activeLayer.x = canvasWidth / 2;
            activeLayer.y = canvasHeight / 2;
            break;
        case 'middle-right':
            activeLayer.x = canvasWidth - 50;
            activeLayer.y = canvasHeight / 2;
            break;
        case 'bottom-left':
            activeLayer.x = 50;
            activeLayer.y = canvasHeight - 50;
            break;
        case 'bottom-center':
            activeLayer.x = canvasWidth / 2;
            activeLayer.y = canvasHeight - 50;
            break;
        case 'bottom-right':
            activeLayer.x = canvasWidth - 50;
            activeLayer.y = canvasHeight - 50;
            break;
    }
    
    redrawCanvas();
    saveToHistory();
}

// Canvas controls
function zoomIn() {
    canvasScale *= 1.2;
    designCanvas.style.transform = `scale(${canvasScale})`;
}

function zoomOut() {
    canvasScale *= 0.8;
    designCanvas.style.transform = `scale(${canvasScale})`;
}

function resetView() {
    canvasScale = 1;
    designCanvas.style.transform = 'scale(1)';
}

function clearCanvas() {
    designLayers = [];
    activeLayer = null;
    updateLayersList();
    redrawCanvas();
    saveToHistory();
}

// History management
function saveToHistory() {
    const state = JSON.stringify({
        layers: designLayers.map(layer => ({
            ...layer,
            image: layer.image ? layer.image.src : null
        }))
    });
    
    // Remove future history if we're not at the end
    designHistory = designHistory.slice(0, historyIndex + 1);
    designHistory.push(state);
    historyIndex++;
    
    // Limit history size
    if (designHistory.length > 50) {
        designHistory.shift();
        historyIndex--;
    }
}

function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreFromHistory();
    }
}

function redo() {
    if (historyIndex < designHistory.length - 1) {
        historyIndex++;
        restoreFromHistory();
    }
}

function restoreFromHistory() {
    if (historyIndex < 0 || historyIndex >= designHistory.length) return;
    
    const state = JSON.parse(designHistory[historyIndex]);
    designLayers = [];
    
    state.layers.forEach(layerData => {
        if (layerData.type === 'image' && layerData.image) {
            const img = new Image();
            img.onload = function() {
                const layer = {
                    ...layerData,
                    image: img
                };
                designLayers.push(layer);
                redrawCanvas();
            };
            img.src = layerData.image;
        } else {
            designLayers.push(layerData);
        }
    });
    
    activeLayer = designLayers.length > 0 ? designLayers[designLayers.length - 1] : null;
    updateLayersList();
    updatePropertyControls();
    redrawCanvas();
}

// Save and export functions
async function saveDesign() {
    if (!selectedProduct) {
        showNotification('Please select a product first', 'warning');
        return;
    }
    
    if (designLayers.length === 0) {
        showNotification('Please add some design elements first', 'warning');
        return;
    }
    
    try {
        showLoading();
        
        // Generate preview image
        const previewDataUrl = designCanvas.toDataURL('image/png');
        
        // Prepare design data
        const designData = {
            productId: selectedProduct.id,
            designData: {
                layers: designLayers.map(layer => ({
                    ...layer,
                    image: layer.image ? layer.image.src : null
                })),
                canvasSize: {
                    width: designCanvas.width,
                    height: designCanvas.height
                }
            },
            previewUrl: previewDataUrl,
            customerInfo: {
                // This would be filled from a form
                name: 'Guest User',
                email: '',
                phone: ''
            }
        };
        
        // Save to Supabase
        const result = await saveCustomDesign(designData);
        
        hideLoading();
        showNotification('Design saved successfully!', 'success');
        
        return result;
        
    } catch (error) {
        hideLoading();
        console.error('Error saving design:', error);
        showNotification('Error saving design', 'error');
    }
}

// Add to cart with custom design
function addToCartCustom() {
    if (!selectedProduct) {
        showNotification('Please select a product first', 'warning');
        return;
    }
    
    if (designLayers.length === 0) {
        showNotification('Please add some design elements first', 'warning');
        return;
    }
    
    // Show order summary modal
    showCustomOrderSummary();
}

function showCustomOrderSummary() {
    const modal = document.getElementById('orderSummaryModal');
    if (!modal) return;
    
    // Update modal content
    const previewImg = document.getElementById('summaryPreview');
    const productTitle = document.getElementById('summaryProduct');
    const basePrice = document.getElementById('basePrice');
    const totalPrice = document.getElementById('totalCustomPrice');
    
    if (previewImg) {
        previewImg.src = designCanvas.toDataURL('image/png');
    }
    
    if (productTitle) {
        productTitle.textContent = selectedProduct.title + ' (Custom Design)';
    }
    
    if (basePrice) {
        basePrice.textContent = `৳${selectedProduct.price}`;
    }
    
    if (totalPrice) {
        const total = selectedProduct.price + 50; // Add design fee
        totalPrice.textContent = `৳${total}`;
    }
    
    modal.style.display = 'flex';
}

function closeOrderSummary() {
    const modal = document.getElementById('orderSummaryModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function increaseCustomQuantity() {
    const qtyInput = document.getElementById('customQuantity');
    if (qtyInput) {
        qtyInput.value = parseInt(qtyInput.value) + 1;
        updateCustomTotal();
    }
}

function decreaseCustomQuantity() {
    const qtyInput = document.getElementById('customQuantity');
    if (qtyInput && parseInt(qtyInput.value) > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
        updateCustomTotal();
    }
}

function updateCustomTotal() {
    const qtyInput = document.getElementById('customQuantity');
    const totalPrice = document.getElementById('totalCustomPrice');
    
    if (qtyInput && totalPrice && selectedProduct) {
        const quantity = parseInt(qtyInput.value);
        const unitPrice = selectedProduct.price + 50; // Add design fee
        const total = unitPrice * quantity;
        totalPrice.textContent = `৳${total}`;
    }
}

function confirmCustomOrder() {
    if (!selectedProduct) return;
    
    const qtyInput = document.getElementById('customQuantity');
    const instructionsInput = document.getElementById('customInstructions');
    
    const quantity = parseInt(qtyInput.value) || 1;
    const instructions = instructionsInput.value || '';
    
    // Prepare design data
    const designData = {
        previewUrl: designCanvas.toDataURL('image/png'),
        layers: designLayers,
        instructions: instructions
    };
    
    // Add to cart
    addCustomDesignToCart(selectedProduct, designData, quantity);
    
    // Close modal
    closeOrderSummary();
}

// Template gallery
function loadTemplateGallery() {
    // This would load design templates from the database
    // For now, we'll create a placeholder
    const gallery = document.getElementById('templateGallery');
    if (!gallery) return;
    
    gallery.innerHTML = `
        <div class="template-item">
            <img src="https://via.placeholder.com/200x150?text=Logo+Template" alt="Logo Template">
            <div class="template-info">
                <h4>Logo Template</h4>
                <p>Professional logo design</p>
            </div>
        </div>
        <div class="template-item">
            <img src="https://via.placeholder.com/200x150?text=Quote+Template" alt="Quote Template">
            <div class="template-info">
                <h4>Quote Template</h4>
                <p>Inspirational quotes</p>
            </div>
        </div>
        <div class="template-item">
            <img src="https://via.placeholder.com/200x150?text=Pattern+Template" alt="Pattern Template">
            <div class="template-info">
                <h4>Pattern Template</h4>
                <p>Decorative patterns</p>
            </div>
        </div>
    `;
}

function showGalleryCategory(category) {
    // Update active tab
    document.querySelectorAll('.gallery-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter templates (placeholder implementation)
    console.log('Showing templates for category:', category);
}

// Make functions globally available
window.initializeCanvas = initializeCanvas;
window.loadCustomizableProducts = loadCustomizableProducts;
window.selectProduct = selectProduct;
window.addText = addText;
window.alignDesign = alignDesign;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetView = resetView;
window.clearCanvas = clearCanvas;
window.saveDesign = saveDesign;
window.addToCartCustom = addToCartCustom;
window.closeOrderSummary = closeOrderSummary;
window.increaseCustomQuantity = increaseCustomQuantity;
window.decreaseCustomQuantity = decreaseCustomQuantity;
window.confirmCustomOrder = confirmCustomOrder;
window.loadTemplateGallery = loadTemplateGallery;
window.showGalleryCategory = showGalleryCategory;
window.selectLayer = selectLayer;
window.removeLayer = removeLayer;
window.toggleLayerVisibility = toggleLayerVisibility;
window.duplicateLayer = duplicateLayer;

console.log('TryneX Customizer loaded successfully');
