/**
 * CACHO6 - Sistema de Administración de Productos 3D
 * Gestión completa de productos STL/STEP con visualización 3D
 */

class ProductManager {
    constructor() {
        this.products = new Map();
        this.currentViewer = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            // Cargar Three.js si no está disponible
            await loadThreeJS();
            
            // Cargar productos existentes
            await this.loadProducts();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('ProductManager initialized successfully');
        } catch (error) {
            console.error('Error initializing ProductManager:', error);
        }
    }

    async loadProducts() {
        try {
            if (!firebase.apps.length) return;
            
            const database = firebase.database();
            const snapshot = await database.ref('products').once('value');
            const products = snapshot.val() || {};
            
            this.products.clear();
            Object.entries(products).forEach(([id, product]) => {
                this.products.set(id, product);
            });
            
            this.renderProductsList();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    setupEventListeners() {
        // Botón para abrir modal de agregar producto
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => this.showAddProductModal());
        }

        // Form de agregar producto
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => this.handleAddProduct(e));
        }

        // File input para modelo 3D
        const modelFileInput = document.getElementById('model-file-input');
        if (modelFileInput) {
            modelFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Botones del viewer 3D
        this.setupViewerControls();
    }

    setupViewerControls() {
        const controls = {
            'toggle-wireframe': () => this.currentViewer?.setWireframe(!this.currentViewer.options.enableWireframe),
            'toggle-rotation': () => this.currentViewer?.toggleAutoRotate(),
            'reset-camera': () => this.currentViewer?.adjustCamera(),
            'export-screenshot': () => this.currentViewer?.exportScreenshot(),
            'change-color': (e) => {
                const color = e.target.value.replace('#', '0x');
                this.currentViewer?.setModelColor(parseInt(color, 16));
            }
        };

        Object.entries(controls).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'change-color') {
                    element.addEventListener('input', handler);
                } else {
                    element.addEventListener('click', handler);
                }
            }
        });
    }

    showAddProductModal() {
        const modal = this.createProductModal();
        document.body.appendChild(modal);
        
        // Mostrar modal
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    createProductModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content product-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-cube"></i> Agregar Producto 3D</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="add-product-form" class="product-form">
                    <div class="form-grid">
                        <div class="form-section">
                            <h3><i class="fas fa-info-circle"></i> Información Básica</h3>
                            
                            <div class="form-group">
                                <label class="form-label" for="product-name">Nombre del Producto *</label>
                                <input class="form-control" type="text" id="product-name" required>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="product-description">Descripción</label>
                                <textarea class="form-control" id="product-description" rows="3"></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="product-category">Categoría</label>
                                <select class="form-select" id="product-category">
                                    <option value="decorativo">Decorativo</option>
                                    <option value="funcional">Funcional</option>
                                    <option value="prototipo">Prototipo</option>
                                    <option value="juguete">Juguete</option>
                                    <option value="herramienta">Herramienta</option>
                                    <option value="arte">Arte</option>
                                    <option value="otros">Otros</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="product-tags">Tags (separados por comas)</label>
                                <input class="form-control" type="text" id="product-tags" placeholder="miniatura, detallado, fácil">
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3><i class="fas fa-cog"></i> Especificaciones Técnicas</h3>
                            
                            <div class="form-group">
                                <label class="form-label" for="print-time">Tiempo de Impresión (horas)</label>
                                <input class="form-control" type="number" id="print-time" step="0.1" min="0.1">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="material-usage">Uso de Material (gramos)</label>
                                <input class="form-control" type="number" id="material-usage" step="0.1" min="1">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="difficulty">Dificultad de Impresión</label>
                                <select class="form-select" id="difficulty">
                                    <option value="facil">Fácil</option>
                                    <option value="medio">Medio</option>
                                    <option value="dificil">Difícil</option>
                                    <option value="experto">Experto</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label" for="supports-required">¿Requiere Soportes?</label>
                                <select class="form-select" id="supports-required">
                                    <option value="no">No</option>
                                    <option value="si">Sí</option>
                                    <option value="opcional">Opcional</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3><i class="fas fa-upload"></i> Archivo 3D</h3>
                        
                        <div class="file-upload-container">
                            <div class="file-upload-area" id="model-upload-area">
                                <i class="fas fa-cube upload-icon"></i>
                                <div class="upload-text">
                                    <h4>Selecciona tu archivo STL</h4>
                                    <p>Arrastra aquí tu archivo o <button type="button" class="btn-link" onclick="document.getElementById('model-file-input').click()">selecciona uno</button></p>
                                    <small>Formato soportado: STL | Máximo 50MB</small>
                                </div>
                                <input type="file" id="model-file-input" accept=".stl" hidden>
                            </div>
                            
                            <div id="file-info" class="file-info hidden">
                                <div class="file-details">
                                    <i class="fas fa-file-archive"></i>
                                    <div class="file-meta">
                                        <span class="file-name">archivo.stl</span>
                                        <span class="file-size">2.5 MB</span>
                                    </div>
                                    <button type="button" class="btn-icon" onclick="this.closest('.file-info').classList.add('hidden')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3><i class="fas fa-eye"></i> Vista Previa 3D</h3>
                        <div class="viewer-container">
                            <div id="product-viewer-3d" class="model-viewer-3d"></div>
                            <div class="viewer-controls">
                                <button type="button" id="toggle-wireframe" class="btn btn-sm">
                                    <i class="fas fa-project-diagram"></i> Wireframe
                                </button>
                                <button type="button" id="toggle-rotation" class="btn btn-sm">
                                    <i class="fas fa-sync-alt"></i> Auto-rotar
                                </button>
                                <button type="button" id="reset-camera" class="btn btn-sm">
                                    <i class="fas fa-camera"></i> Resetear
                                </button>
                                <input type="color" id="change-color" value="#00ff88" title="Color del modelo">
                                <button type="button" id="export-screenshot" class="btn btn-sm">
                                    <i class="fas fa-camera"></i> Captura
                                </button>
                            </div>
                            <div id="model-info" class="model-info hidden">
                                <!-- La información del modelo se llena dinámicamente -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary" disabled id="submit-product">
                            <i class="fas fa-save"></i> Guardar Producto
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Setup drag & drop
        this.setupDragDrop(modal.querySelector('#model-upload-area'));
        
        return modal;
    }

    setupDragDrop(uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-active');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-active');
            });
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect({ target: { files } });
            }
        });
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.stl')) {
            alert('Por favor selecciona un archivo STL válido.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB
            alert('El archivo es demasiado grande. Máximo 50MB.');
            return;
        }

        try {
            // Mostrar información del archivo
            this.showFileInfo(file);
            
            // Inicializar viewer 3D si no existe
            if (!this.currentViewer) {
                this.currentViewer = new ThreeDViewer('product-viewer-3d', {
                    backgroundColor: 0x1a1a1a,
                    enableControls: true,
                    showAxes: true
                });
            }

            // Cargar modelo en el viewer
            await this.currentViewer.loadSTLFile(file);
            
            // Mostrar información del modelo
            this.showModelInfo();
            
            // Habilitar botón de submit
            const submitBtn = document.getElementById('submit-product');
            if (submitBtn) {
                submitBtn.disabled = false;
            }

        } catch (error) {
            console.error('Error loading 3D model:', error);
            alert('Error al cargar el modelo 3D: ' + error.message);
        }
    }

    showFileInfo(file) {
        const fileInfo = document.getElementById('file-info');
        const fileName = fileInfo.querySelector('.file-name');
        const fileSize = fileInfo.querySelector('.file-size');
        
        if (fileName && fileSize) {
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);
            fileInfo.classList.remove('hidden');
        }
    }

    showModelInfo() {
        if (!this.currentViewer) return;
        
        const info = this.currentViewer.getModelInfo();
        if (!info) return;
        
        const modelInfo = document.getElementById('model-info');
        modelInfo.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">Vértices:</span>
                    <span class="value">${info.vertices.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="label">Caras:</span>
                    <span class="value">${Math.floor(info.faces).toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="label">Dimensiones:</span>
                    <span class="value">${info.dimensions.width} × ${info.dimensions.height} × ${info.dimensions.depth}</span>
                </div>
                <div class="info-item">
                    <span class="label">Volumen est.:</span>
                    <span class="value">${info.volume} unidades³</span>
                </div>
            </div>
        `;
        modelInfo.classList.remove('hidden');
    }

    async handleAddProduct(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const productData = this.extractFormData(formData);
        
        try {
            // Validar datos requeridos
            if (!productData.name || !this.currentViewer?.currentModel) {
                alert('Por favor completa los campos requeridos y carga un modelo 3D.');
                return;
            }

            // Mostrar loading
            const submitBtn = document.getElementById('submit-product');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;

            // Subir archivo a Firebase Storage
            const fileUrl = await this.uploadModelFile();
            
            // Generar thumbnail del modelo
            const thumbnailUrl = await this.generateThumbnail();
            
            // Agregar URLs y metadatos
            productData.modelUrl = fileUrl;
            productData.thumbnailUrl = thumbnailUrl;
            productData.createdAt = Date.now();
            productData.id = this.generateProductId();

            // Guardar en base de datos
            await this.saveProduct(productData);
            
            // Actualizar lista de productos
            this.products.set(productData.id, productData);
            this.renderProductsList();
            
            // Cerrar modal
            event.target.closest('.modal-overlay').remove();
            
            // Mostrar notificación de éxito
            this.showNotification('Producto agregado exitosamente', 'success');

        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto: ' + error.message);
        } finally {
            // Restaurar botón
            const submitBtn = document.getElementById('submit-product');
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }

    extractFormData(formData) {
        return {
            name: document.getElementById('product-name')?.value,
            description: document.getElementById('product-description')?.value,
            category: document.getElementById('product-category')?.value,
            tags: document.getElementById('product-tags')?.value.split(',').map(tag => tag.trim()).filter(tag => tag),
            printTime: parseFloat(document.getElementById('print-time')?.value) || null,
            materialUsage: parseFloat(document.getElementById('material-usage')?.value) || null,
            difficulty: document.getElementById('difficulty')?.value,
            supportsRequired: document.getElementById('supports-required')?.value,
            modelInfo: this.currentViewer?.getModelInfo()
        };
    }

    async uploadModelFile() {
        // Simulación de upload - en producción usar Firebase Storage
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`/models/${Date.now()}.stl`);
            }, 1000);
        });
    }

    async generateThumbnail() {
        if (!this.currentViewer) return null;
        
        // Generar screenshot del modelo
        const canvas = this.currentViewer.renderer.domElement;
        return canvas.toDataURL('image/png');
    }

    async saveProduct(productData) {
        try {
            if (firebase.apps.length) {
                const database = firebase.database();
                await database.ref(`products/${productData.id}`).set(productData);
            } else {
                // Simulación para desarrollo
                console.log('Product saved (simulation):', productData);
            }
        } catch (error) {
            throw new Error('Error al guardar en la base de datos: ' + error.message);
        }
    }

    renderProductsList() {
        const container = document.getElementById('products-list');
        if (!container) return;

        if (this.products.size === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cube"></i>
                    <h3>No hay productos</h3>
                    <p>Comienza agregando tu primer producto 3D</p>
                    <button class="btn btn-primary" onclick="productManager.showAddProductModal()">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                </div>
            `;
            return;
        }

        const productsHTML = Array.from(this.products.values())
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(product => this.createProductCard(product))
            .join('');

        container.innerHTML = productsHTML;
    }

    createProductCard(product) {
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-thumbnail">
                    ${product.thumbnailUrl ? 
                        `<img src="${product.thumbnailUrl}" alt="${product.name}" loading="lazy">` :
                        '<div class="thumbnail-placeholder"><i class="fas fa-cube"></i></div>'
                    }
                    <div class="product-overlay">
                        <button class="btn btn-sm" onclick="productManager.viewProduct('${product.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm" onclick="productManager.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="productManager.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description || 'Sin descripción'}</p>
                    <div class="product-meta">
                        <span class="category">${product.category}</span>
                        <span class="difficulty difficulty-${product.difficulty}">${product.difficulty}</span>
                    </div>
                    <div class="product-specs">
                        ${product.printTime ? `<span><i class="fas fa-clock"></i> ${product.printTime}h</span>` : ''}
                        ${product.materialUsage ? `<span><i class="fas fa-weight"></i> ${product.materialUsage}g</span>` : ''}
                    </div>
                    <div class="product-tags">
                        ${product.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Métodos de utilidad
    generateProductId() {
        return 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Implementar sistema de notificaciones
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    // Métodos para gestión de productos existentes
    viewProduct(productId) {
        const product = this.products.get(productId);
        if (product) {
            // Mostrar modal de vista de producto
            console.log('Viewing product:', product);
        }
    }

    editProduct(productId) {
        const product = this.products.get(productId);
        if (product) {
            // Mostrar modal de edición
            console.log('Editing product:', product);
        }
    }

    async deleteProduct(productId) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                // Eliminar de la base de datos
                if (firebase.apps.length) {
                    const database = firebase.database();
                    await database.ref(`products/${productId}`).remove();
                }
                
                // Eliminar de la memoria local
                this.products.delete(productId);
                this.renderProductsList();
                
                this.showNotification('Producto eliminado exitosamente', 'success');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error al eliminar el producto');
            }
        }
    }
}

// Instancia global
let productManager;

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
});
