// Sistema de Gestión de Pedidos - Tienda3D
class OrderManager {
  constructor() {
    this.currentOrder = {
      id: null,
      customerInfo: {},
      services: [],
      files: [],
      specifications: {},
      pricing: {
        subtotal: 0,
        shipping: 0,
        taxes: 0,
        total: 0
      },
      status: 'draft',
      createdAt: null,
      estimatedDelivery: null
    };
    
    this.shippingRates = {
      standard: { price: 5, days: 5 },
      express: { price: 15, days: 2 },
      overnight: { price: 25, days: 1 }
    };
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.loadSelectedService();
    this.updatePricing();
    this.setupFileUpload();
  }

  setupEventListeners() {
    // Formulario principal
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
      orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitOrder();
      });
    }

    // Campos que afectan al precio
    const priceFields = [
      'service-type', 'material-type', 'quantity', 
      'rush-order', 'shipping-method'
    ];
    
    priceFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('change', () => {
          this.updatePricing();
        });
      }
    });

    // Campo de cantidad con validación
    const quantityField = document.getElementById('quantity');
    if (quantityField) {
      quantityField.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value < 1) e.target.value = 1;
        if (value > 100) e.target.value = 100;
        this.updatePricing();
      });
    }

    // Botones de acción
    const calculateBtn = document.getElementById('calculate-price');
    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => {
        this.updatePricing();
        showToast('Precio actualizado', 'success');
      });
    }

    const saveOrderBtn = document.getElementById('save-order');
    if (saveOrderBtn) {
      saveOrderBtn.addEventListener('click', () => {
        this.saveDraftOrder();
      });
    }
  }

  loadSelectedService() {
    const selectedService = sessionStorage.getItem('selectedService');
    if (selectedService) {
      try {
        const service = JSON.parse(selectedService);
        this.populateServiceFields(service);
        sessionStorage.removeItem('selectedService');
      } catch (error) {
        console.error('Error loading selected service:', error);
      }
    }
  }

  populateServiceFields(service) {
    // Llenar campos del formulario con el servicio seleccionado
    const serviceTypeField = document.getElementById('service-type');
    if (serviceTypeField) {
      // Crear opción si no existe
      const existingOption = Array.from(serviceTypeField.options)
        .find(option => option.value === service.id);
      
      if (!existingOption) {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = service.name;
        serviceTypeField.appendChild(option);
      }
      
      serviceTypeField.value = service.id;
    }

    // Mostrar información del servicio seleccionado
    const serviceInfo = document.getElementById('selected-service-info');
    if (serviceInfo) {
      serviceInfo.innerHTML = `
        <div class="service-preview">
          <div class="service-icon">${service.icon || '🖨️'}</div>
          <div class="service-details">
            <h4>${service.name}</h4>
            <p>${service.description}</p>
            <span class="price-badge">€${service.price} ${service.unit}</span>
          </div>
        </div>
      `;
    }

    // Actualizar materiales si es servicio de impresión
    if (service.materials) {
      const materialField = document.getElementById('material-type');
      if (materialField) {
        materialField.innerHTML = `
          <option value="">Selecciona material</option>
          ${service.materials.map(material => 
            `<option value="${material.toLowerCase()}">${material}</option>`
          ).join('')}
        `;
      }
    }

    this.updatePricing();
  }

  updatePricing() {
    const serviceType = document.getElementById('service-type')?.value;
    const quantity = parseInt(document.getElementById('quantity')?.value || 1);
    const rushOrder = document.getElementById('rush-order')?.checked;
    const shippingMethod = document.getElementById('shipping-method')?.value || 'standard';

    let subtotal = 0;

    // Calcular precio base del servicio
    if (serviceType) {
      const basePrice = this.getServicePrice(serviceType);
      subtotal = basePrice * quantity;
    }

    // Aplicar recargo por pedido urgente
    if (rushOrder) {
      subtotal *= 1.5;
    }

    // Calcular envío
    const shipping = this.shippingRates[shippingMethod]?.price || 0;

    // Calcular impuestos (21% IVA)
    const taxes = subtotal * 0.21;

    // Total
    const total = subtotal + shipping + taxes;

    // Actualizar pricing object
    this.currentOrder.pricing = {
      subtotal: subtotal,
      shipping: shipping,
      taxes: taxes,
      total: total
    };

    // Actualizar UI
    this.renderPricingBreakdown();
  }

  getServicePrice(serviceId) {
    // Precios base por servicio
    const servicePrices = {
      'printing-pla': 15,
      'printing-abs': 20,
      'printing-petg': 25,
      'design-basic': 30,
      'design-advanced': 50,
      'postprocessing': 25
    };

    return servicePrices[serviceId] || 20;
  }

  renderPricingBreakdown() {
    const container = document.getElementById('cost-breakdown');
    if (!container) return;

    const { subtotal, shipping, taxes, total } = this.currentOrder.pricing;

    container.innerHTML = `
      <div class="cost-item">
        <span class="cost-label">
          <i class="fas fa-calculator"></i>
          Subtotal
        </span>
        <span class="cost-value">€${subtotal.toFixed(2)}</span>
      </div>
      
      <div class="cost-item">
        <span class="cost-label">
          <i class="fas fa-shipping-fast"></i>
          Envío
        </span>
        <span class="cost-value">€${shipping.toFixed(2)}</span>
      </div>
      
      <div class="cost-item">
        <span class="cost-label">
          <i class="fas fa-receipt"></i>
          IVA (21%)
        </span>
        <span class="cost-value">€${taxes.toFixed(2)}</span>
      </div>
      
      <div class="cost-total">
        <span class="cost-label">
          <i class="fas fa-euro-sign"></i>
          <strong>Total</strong>
        </span>
        <span class="cost-value total">€${total.toFixed(2)}</span>
      </div>
    `;

    // Actualizar tiempo de entrega estimado
    this.updateEstimatedDelivery();
  }

  updateEstimatedDelivery() {
    const shippingMethod = document.getElementById('shipping-method')?.value || 'standard';
    const rushOrder = document.getElementById('rush-order')?.checked;
    
    let productionDays = rushOrder ? 1 : 3;
    let shippingDays = this.shippingRates[shippingMethod]?.days || 5;
    
    const totalDays = productionDays + shippingDays;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + totalDays);

    const deliveryInfo = document.getElementById('delivery-estimate');
    if (deliveryInfo) {
      deliveryInfo.innerHTML = `
        <div class="delivery-info">
          <i class="fas fa-truck"></i>
          <div>
            <strong>Entrega estimada:</strong>
            <span>${deliveryDate.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <small>(${totalDays} días laborables)</small>
          </div>
        </div>
      `;
    }

    this.currentOrder.estimatedDelivery = deliveryDate.toISOString();
  }

  setupFileUpload() {
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');

    if (!fileUploadArea || !fileInput) return;

    // Eventos de drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadArea.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      this.handleFiles(files);
    });

    // Click para abrir selector
    fileUploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // Cambio en input file
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handleFiles(files);
    });
  }

  handleFiles(files) {
    const allowedTypes = ['.stl', '.obj', '.3mf', '.ply', '.dxf', '.dwg', '.step', '.pdf', '.jpg', '.png'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    files.forEach(file => {
      // Validar tipo de archivo
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        showToast(`Tipo de archivo no permitido: ${file.name}`, 'error');
        return;
      }

      // Validar tamaño
      if (file.size > maxSize) {
        showToast(`Archivo demasiado grande: ${file.name}`, 'error');
        return;
      }

      // Añadir archivo a la lista
      this.addFileToOrder(file);
    });
  }

  addFileToOrder(file) {
    const fileData = {
      id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file // En producción, subirías esto a Firebase Storage
    };

    this.currentOrder.files.push(fileData);
    this.renderFileList();
  }

  renderFileList() {
    const container = document.getElementById('file-list');
    if (!container) return;

    if (this.currentOrder.files.length === 0) {
      container.innerHTML = '';
      return;
    }

    container.innerHTML = `
      <div class="files-header">
        <h4><i class="fas fa-paperclip"></i> Archivos adjuntos (${this.currentOrder.files.length})</h4>
      </div>
      <div class="files-list">
        ${this.currentOrder.files.map(file => `
          <div class="file-item" data-file-id="${file.id}">
            <div class="file-info">
              <i class="fas fa-file"></i>
              <div>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
              </div>
            </div>
            <button class="btn-remove" onclick="orderManager.removeFile('${file.id}')" type="button">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  removeFile(fileId) {
    this.currentOrder.files = this.currentOrder.files.filter(f => f.id !== fileId);
    this.renderFileList();
    showToast('Archivo eliminado', 'info');
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async saveDraftOrder() {
    try {
      this.collectFormData();
      this.currentOrder.status = 'draft';
      this.currentOrder.id = this.currentOrder.id || 'draft-' + Date.now();
      
      // Guardar en localStorage como borrador
      localStorage.setItem('draftOrder', JSON.stringify(this.currentOrder));
      
      showToast('Borrador guardado correctamente', 'success');
    } catch (error) {
      console.error('Error saving draft:', error);
      showToast('Error al guardar el borrador', 'error');
    }
  }

  async submitOrder() {
    try {
      if (!this.validateOrder()) {
        return;
      }

      this.collectFormData();
      
      // Generar ID único para el pedido
      this.currentOrder.id = 'ORDER-' + Date.now().toString(36).toUpperCase();
      this.currentOrder.status = 'pending';
      this.currentOrder.createdAt = new Date().toISOString();

      // Mostrar modal de confirmación
      const confirmed = await this.showOrderConfirmation();
      if (!confirmed) return;

      // Simular procesamiento
      showToast('Procesando pedido...', 'info');
      
      // En producción, aquí subirías archivos a Firebase Storage
      // y guardarías el pedido en Firestore
      await this.saveOrderToDatabase();

      // Limpiar borrador
      localStorage.removeItem('draftOrder');
      
      // Mostrar éxito y redirigir
      showToast('¡Pedido enviado correctamente!', 'success');
      
      setTimeout(() => {
        // Cambiar a la sección de seguimiento
        const trackingLink = document.querySelector('[data-section="tracking"]');
        if (trackingLink) {
          trackingLink.click();
          // Pre-llenar el código de seguimiento
          setTimeout(() => {
            const trackingInput = document.getElementById('tracking-code');
            if (trackingInput) {
              trackingInput.value = this.currentOrder.id;
            }
          }, 500);
        }
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      showToast('Error al enviar el pedido', 'error');
    }
  }

  collectFormData() {
    // Información del cliente
    this.currentOrder.customerInfo = {
      name: document.getElementById('customer-name')?.value || '',
      email: document.getElementById('customer-email')?.value || '',
      phone: document.getElementById('customer-phone')?.value || '',
      company: document.getElementById('customer-company')?.value || '',
      address: document.getElementById('customer-address')?.value || '',
      city: document.getElementById('customer-city')?.value || '',
      postalCode: document.getElementById('customer-postal')?.value || '',
      country: document.getElementById('customer-country')?.value || 'España'
    };

    // Especificaciones del servicio
    this.currentOrder.specifications = {
      serviceType: document.getElementById('service-type')?.value || '',
      materialType: document.getElementById('material-type')?.value || '',
      quantity: parseInt(document.getElementById('quantity')?.value || 1),
      color: document.getElementById('color-preference')?.value || '',
      quality: document.getElementById('quality-level')?.value || 'standard',
      infill: document.getElementById('infill-density')?.value || '20',
      supports: document.getElementById('support-structures')?.checked || false,
      rushOrder: document.getElementById('rush-order')?.checked || false,
      shippingMethod: document.getElementById('shipping-method')?.value || 'standard',
      specialInstructions: document.getElementById('special-instructions')?.value || ''
    };
  }

  validateOrder() {
    const errors = [];

    // Validar información del cliente
    const requiredFields = [
      { id: 'customer-name', name: 'Nombre' },
      { id: 'customer-email', name: 'Email' },
      { id: 'customer-phone', name: 'Teléfono' },
      { id: 'customer-address', name: 'Dirección' },
      { id: 'customer-city', name: 'Ciudad' },
      { id: 'customer-postal', name: 'Código Postal' }
    ];

    requiredFields.forEach(field => {
      const element = document.getElementById(field.id);
      if (!element?.value?.trim()) {
        errors.push(`${field.name} es obligatorio`);
      }
    });

    // Validar email
    const email = document.getElementById('customer-email')?.value;
    if (email && !isValidEmail(email)) {
      errors.push('Email no válido');
    }

    // Validar especificaciones
    if (!document.getElementById('service-type')?.value) {
      errors.push('Debes seleccionar un tipo de servicio');
    }

    // Validar archivos para servicios que los requieren
    const serviceType = document.getElementById('service-type')?.value;
    if (serviceType?.includes('printing') && this.currentOrder.files.length === 0) {
      errors.push('Debes adjuntar al menos un archivo 3D para servicios de impresión');
    }

    if (errors.length > 0) {
      showToast(errors[0], 'error');
      return false;
    }

    return true;
  }

  async showOrderConfirmation() {
    return new Promise(resolve => {
      const modal = createModal({
        title: 'Confirmar Pedido',
        size: 'large',
        content: `
          <div class="order-confirmation">
            <div class="confirmation-header">
              <i class="fas fa-check-circle"></i>
              <h3>¿Confirmar este pedido?</h3>
            </div>
            
            <div class="order-summary">
              <h4>Resumen del pedido</h4>
              <div class="summary-section">
                <strong>Cliente:</strong>
                <p>${this.currentOrder.customerInfo.name}</p>
                <p>${this.currentOrder.customerInfo.email}</p>
              </div>
              
              <div class="summary-section">
                <strong>Servicio:</strong>
                <p>${document.getElementById('service-type')?.selectedOptions[0]?.text || 'No seleccionado'}</p>
                <p>Cantidad: ${this.currentOrder.specifications.quantity}</p>
              </div>
              
              <div class="summary-section">
                <strong>Archivos:</strong>
                <p>${this.currentOrder.files.length} archivo(s) adjunto(s)</p>
              </div>
              
              <div class="summary-section">
                <strong>Total:</strong>
                <p class="total-price">€${this.currentOrder.pricing.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div class="confirmation-actions">
              <button class="btn btn-success" onclick="this.closest('.modal-backdrop').dispatchEvent(new CustomEvent('confirm'))">
                <i class="fas fa-check"></i>
                Confirmar Pedido
              </button>
              <button class="btn btn-secondary" onclick="closeModal()">
                <i class="fas fa-times"></i>
                Cancelar
              </button>
            </div>
          </div>
        `,
        showFooter: false
      });

      modal.addEventListener('confirm', () => {
        closeModal();
        resolve(true);
      });
    });
  }

  async saveOrderToDatabase() {
    try {
      // En producción, aquí guardarías en Firebase
      const orderData = {
        ...this.currentOrder,
        files: this.currentOrder.files.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type
          // En producción, aquí tendrías la URL del archivo en Storage
        }))
      };

      await update(child(dbRef, `orders/${this.currentOrder.id}`), orderData);
      
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error saving order to database:', error);
      throw error;
    }
  }

  // Cargar borrador si existe
  loadDraft() {
    const draft = localStorage.getItem('draftOrder');
    if (draft) {
      try {
        this.currentOrder = JSON.parse(draft);
        this.populateFormFromOrder();
        showToast('Borrador cargado', 'info');
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('draftOrder');
      }
    }
  }

  populateFormFromOrder() {
    // Llenar información del cliente
    Object.entries(this.currentOrder.customerInfo).forEach(([key, value]) => {
      const field = document.getElementById(`customer-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      if (field) field.value = value;
    });

    // Llenar especificaciones
    Object.entries(this.currentOrder.specifications).forEach(([key, value]) => {
      const fieldId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const field = document.getElementById(fieldId);
      
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value;
        } else {
          field.value = value;
        }
      }
    });

    // Mostrar archivos
    this.renderFileList();
    this.updatePricing();
  }
}

// Inicializar el gestor de pedidos
let orderManager;
document.addEventListener('DOMContentLoaded', () => {
  orderManager = new OrderManager();
  
  // Cargar borrador si existe
  orderManager.loadDraft();
});
