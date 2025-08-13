// Sistema de Seguimiento de Pedidos - Tienda3D
class TrackingManager {
  constructor() {
    this.orders = new Map();
    this.statusTranslations = {
      'draft': 'Borrador',
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'in-production': 'En Producción',
      'quality-check': 'Control de Calidad',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    
    this.statusColors = {
      'draft': '#94a3b8',
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'in-production': '#8b5cf6',
      'quality-check': '#06b6d4',
      'shipped': '#10b981',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    
    this.statusIcons = {
      'draft': 'fas fa-edit',
      'pending': 'fas fa-clock',
      'confirmed': 'fas fa-check-circle',
      'in-production': 'fas fa-cogs',
      'quality-check': 'fas fa-search',
      'shipped': 'fas fa-shipping-fast',
      'delivered': 'fas fa-check-double',
      'cancelled': 'fas fa-times-circle'
    };
    
    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.loadSampleOrders();
  }

  setupEventListeners() {
    const trackingForm = document.getElementById('tracking-form');
    if (trackingForm) {
      trackingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.searchOrder();
      });
    }

    const trackingCode = document.getElementById('tracking-code');
    if (trackingCode) {
      trackingCode.addEventListener('input', debounce(() => {
        const code = trackingCode.value.trim();
        if (code.length >= 3) {
          this.searchOrder(code);
        } else if (code.length === 0) {
          this.clearResults();
        }
      }, 500));
    }

    // Botón de búsqueda rápida
    const quickSearchBtn = document.getElementById('quick-search');
    if (quickSearchBtn) {
      quickSearchBtn.addEventListener('click', () => {
        this.searchOrder();
      });
    }
  }

  async loadSampleOrders() {
    try {
      // Cargar pedidos desde Firebase
      const ordersSnapshot = await get(child(dbRef, 'orders'));
      if (ordersSnapshot.exists()) {
        const ordersData = ordersSnapshot.val();
        Object.entries(ordersData).forEach(([id, data]) => {
          this.orders.set(id, { id, ...data });
        });
      }

      // Si no hay pedidos, crear algunos de ejemplo
      if (this.orders.size === 0) {
        this.createSampleOrders();
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      this.createSampleOrders();
    }
  }

  createSampleOrders() {
    const sampleOrders = [
      {
        id: 'ORDER-123ABC',
        customerInfo: {
          name: 'Juan Pérez',
          email: 'juan@email.com',
          phone: '+34 666 123 456'
        },
        specifications: {
          serviceType: 'printing-pla',
          quantity: 2,
          materialType: 'pla'
        },
        pricing: {
          total: 45.50
        },
        status: 'in-production',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Pedido recibido',
            description: 'Tu pedido ha sido recibido y está siendo revisado por nuestro equipo.'
          },
          {
            status: 'confirmed',
            timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Pedido confirmado',
            description: 'Los archivos han sido validados y el pedido ha sido confirmado.'
          },
          {
            status: 'in-production',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'En producción',
            description: 'Las piezas están siendo impresas en nuestra impresora 3D.'
          }
        ]
      },
      {
        id: 'ORDER-456DEF',
        customerInfo: {
          name: 'María García',
          email: 'maria@email.com',
          phone: '+34 677 987 654'
        },
        specifications: {
          serviceType: 'design-basic',
          quantity: 1
        },
        pricing: {
          total: 90.00
        },
        status: 'delivered',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Pedido recibido',
            description: 'Solicitud de diseño 3D recibida.'
          },
          {
            status: 'confirmed',
            timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Proyecto confirmado',
            description: 'Los requisitos del diseño han sido confirmados.'
          },
          {
            status: 'in-production',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Diseño en proceso',
            description: 'Nuestro equipo está trabajando en el diseño 3D.'
          },
          {
            status: 'quality-check',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Revisión de calidad',
            description: 'El diseño está siendo revisado antes de la entrega.'
          },
          {
            status: 'shipped',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Archivos enviados',
            description: 'Los archivos finales han sido enviados por email.'
          },
          {
            status: 'delivered',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Proyecto completado',
            description: 'El cliente ha confirmado la recepción de los archivos.'
          }
        ]
      }
    ];

    sampleOrders.forEach(order => {
      this.orders.set(order.id, order);
    });
  }

  searchOrder(searchCode = null) {
    const trackingCode = searchCode || document.getElementById('tracking-code')?.value.trim();
    
    if (!trackingCode) {
      showToast('Por favor, introduce un código de seguimiento', 'warning');
      return;
    }

    // Buscar pedido exacto o parcial
    let foundOrder = this.orders.get(trackingCode);
    
    if (!foundOrder) {
      // Búsqueda parcial
      const partialMatches = Array.from(this.orders.values()).filter(order => 
        order.id.toLowerCase().includes(trackingCode.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(trackingCode.toLowerCase())
      );
      
      if (partialMatches.length === 1) {
        foundOrder = partialMatches[0];
      } else if (partialMatches.length > 1) {
        this.showMultipleResults(partialMatches, trackingCode);
        return;
      }
    }

    if (foundOrder) {
      this.displayOrderDetails(foundOrder);
    } else {
      this.showNotFound(trackingCode);
    }
  }

  displayOrderDetails(order) {
    const resultsContainer = document.getElementById('tracking-results');
    if (!resultsContainer) return;

    const progress = this.calculateProgress(order.status);
    
    resultsContainer.innerHTML = `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3>Pedido encontrado</h3>
            <span class="order-code">${order.id}</span>
          </div>
          <div class="order-status" style="background-color: ${this.statusColors[order.status]}">
            <i class="${this.statusIcons[order.status]}"></i>
            ${this.statusTranslations[order.status]}
          </div>
        </div>

        <div class="order-details">
          <div class="detail-section">
            <h4><i class="fas fa-user"></i> Información del cliente</h4>
            <p><strong>Nombre:</strong> ${order.customerInfo.name}</p>
            <p><strong>Email:</strong> ${order.customerInfo.email}</p>
            <p><strong>Teléfono:</strong> ${order.customerInfo.phone || 'No especificado'}</p>
          </div>

          <div class="detail-section">
            <h4><i class="fas fa-box"></i> Detalles del pedido</h4>
            <p><strong>Servicio:</strong> ${this.getServiceName(order.specifications.serviceType)}</p>
            <p><strong>Cantidad:</strong> ${order.specifications.quantity}</p>
            <p><strong>Total:</strong> €${order.pricing.total.toFixed(2)}</p>
          </div>

          <div class="detail-section">
            <h4><i class="fas fa-calendar"></i> Fechas importantes</h4>
            <p><strong>Pedido realizado:</strong> ${this.formatDate(order.createdAt)}</p>
            <p><strong>Entrega estimada:</strong> ${this.formatDate(order.estimatedDelivery)}</p>
          </div>
        </div>

        <div class="progress-section">
          <h4><i class="fas fa-tasks"></i> Progreso del pedido</h4>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-info">
            <span>${progress}% completado</span>
            <span>${this.getTimeRemaining(order.estimatedDelivery)}</span>
          </div>
        </div>

        ${this.renderTimeline(order.timeline)}
        
        <div class="order-actions">
          <button class="btn btn-primary" onclick="trackingManager.downloadInvoice('${order.id}')">
            <i class="fas fa-download"></i>
            Descargar Factura
          </button>
          <button class="btn btn-outline" onclick="trackingManager.contactSupport('${order.id}')">
            <i class="fas fa-headset"></i>
            Contactar Soporte
          </button>
          ${order.status === 'shipped' ? `
            <button class="btn btn-success" onclick="trackingManager.confirmDelivery('${order.id}')">
              <i class="fas fa-check"></i>
              Confirmar Recepción
            </button>
          ` : ''}
        </div>
      </div>
    `;

    resultsContainer.classList.remove('hidden');
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }

  renderTimeline(timeline) {
    if (!timeline || timeline.length === 0) {
      return `
        <div class="timeline-section">
          <h4><i class="fas fa-history"></i> Historial del pedido</h4>
          <p>No hay información de seguimiento disponible.</p>
        </div>
      `;
    }

    return `
      <div class="timeline-section">
        <h4><i class="fas fa-history"></i> Historial del pedido</h4>
        <div class="timeline">
          ${timeline.map((event, index) => `
            <div class="timeline-item">
              <div class="timeline-marker" style="background-color: ${this.statusColors[event.status]}">
                <i class="${this.statusIcons[event.status]}"></i>
              </div>
              <div class="timeline-content">
                <div class="timeline-title">${event.title}</div>
                <div class="timeline-date">${this.formatDateTime(event.timestamp)}</div>
                <div class="timeline-description">${event.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  showMultipleResults(orders, searchTerm) {
    const resultsContainer = document.getElementById('tracking-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="search-results">
        <h3>Se encontraron ${orders.length} pedidos para "${searchTerm}"</h3>
        <div class="results-list">
          ${orders.map(order => `
            <div class="result-item" onclick="trackingManager.displayOrderDetails(trackingManager.orders.get('${order.id}'))">
              <div class="result-info">
                <strong>${order.id}</strong>
                <span>${order.customerInfo.name}</span>
                <span>${this.formatDate(order.createdAt)}</span>
              </div>
              <div class="result-status" style="background-color: ${this.statusColors[order.status]}">
                ${this.statusTranslations[order.status]}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    resultsContainer.classList.remove('hidden');
  }

  showNotFound(searchTerm) {
    const resultsContainer = document.getElementById('tracking-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
      <div class="not-found">
        <div class="not-found-icon">
          <i class="fas fa-search"></i>
        </div>
        <h3>No se encontró el pedido</h3>
        <p>No se encontró ningún pedido con el código "${searchTerm}"</p>
        <div class="not-found-help">
          <h4>¿Necesitas ayuda?</h4>
          <ul>
            <li>Verifica que el código de seguimiento sea correcto</li>
            <li>El código debe tener el formato ORDER-XXXXXX</li>
            <li>Si acabas de realizar el pedido, puede tardar unos minutos en aparecer</li>
          </ul>
          <button class="btn btn-primary" onclick="trackingManager.contactSupport()">
            <i class="fas fa-headset"></i>
            Contactar Soporte
          </button>
        </div>
      </div>
    `;

    resultsContainer.classList.remove('hidden');
  }

  clearResults() {
    const resultsContainer = document.getElementById('tracking-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.add('hidden');
    }
  }

  calculateProgress(status) {
    const statusProgress = {
      'draft': 5,
      'pending': 15,
      'confirmed': 30,
      'in-production': 60,
      'quality-check': 80,
      'shipped': 90,
      'delivered': 100,
      'cancelled': 0
    };
    
    return statusProgress[status] || 0;
  }

  getServiceName(serviceId) {
    const serviceNames = {
      'printing-pla': 'Impresión 3D PLA',
      'printing-abs': 'Impresión 3D ABS',
      'printing-petg': 'Impresión 3D PETG',
      'design-basic': 'Diseño 3D Básico',
      'design-advanced': 'Diseño 3D Avanzado',
      'postprocessing': 'Post-procesamiento'
    };
    
    return serviceNames[serviceId] || serviceId;
  }

  getTimeRemaining(estimatedDelivery) {
    if (!estimatedDelivery) return 'Tiempo no disponible';
    
    const now = new Date();
    const delivery = new Date(estimatedDelivery);
    const diffTime = delivery - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Entrega vencida';
    } else if (diffDays === 0) {
      return 'Entrega hoy';
    } else if (diffDays === 1) {
      return 'Entrega mañana';
    } else {
      return `${diffDays} días restantes`;
    }
  }

  formatDate(dateString) {
    if (!dateString) return 'No disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString) {
    if (!dateString) return 'No disponible';
    
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async downloadInvoice(orderId) {
    try {
      showToast('Generando factura...', 'info');
      
      // Simular generación de factura
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const order = this.orders.get(orderId);
      if (!order) {
        showToast('Pedido no encontrado', 'error');
        return;
      }

      // En producción, aquí generarías un PDF real
      const invoiceData = this.generateInvoiceData(order);
      const blob = new Blob([invoiceData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura-${orderId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Factura descargada correctamente', 'success');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast('Error al descargar la factura', 'error');
    }
  }

  generateInvoiceData(order) {
    return `
TIENDA3D - FACTURA
==================

Código de Pedido: ${order.id}
Fecha: ${this.formatDate(order.createdAt)}

Cliente:
--------
${order.customerInfo.name}
${order.customerInfo.email}
${order.customerInfo.phone || 'N/A'}

Servicios:
----------
${this.getServiceName(order.specifications.serviceType)}
Cantidad: ${order.specifications.quantity}

Total: €${order.pricing.total.toFixed(2)}

Estado: ${this.statusTranslations[order.status]}
Entrega estimada: ${this.formatDate(order.estimatedDelivery)}

¡Gracias por confiar en Tienda3D!
    `.trim();
  }

  contactSupport(orderId = null) {
    const modal = createModal({
      title: 'Contactar Soporte',
      size: 'medium',
      content: `
        <div class="support-contact">
          <div class="contact-info">
            <h4><i class="fas fa-headset"></i> ¿Necesitas ayuda?</h4>
            <p>Nuestro equipo de soporte está aquí para ayudarte.</p>
            ${orderId ? `<p><strong>Código de pedido:</strong> ${orderId}</p>` : ''}
          </div>
          
          <div class="contact-methods">
            <div class="contact-method">
              <i class="fas fa-envelope"></i>
              <div>
                <strong>Email</strong>
                <p>soporte@tienda3d.com</p>
                <p>Respuesta en 24 horas</p>
              </div>
            </div>
            
            <div class="contact-method">
              <i class="fas fa-phone"></i>
              <div>
                <strong>Teléfono</strong>
                <p>+34 900 123 456</p>
                <p>Lunes a Viernes, 9:00-18:00</p>
              </div>
            </div>
            
            <div class="contact-method">
              <i class="fab fa-whatsapp"></i>
              <div>
                <strong>WhatsApp</strong>
                <p>+34 600 123 456</p>
                <p>Respuesta inmediata</p>
              </div>
            </div>
          </div>
          
          <div class="quick-actions">
            <button class="btn btn-primary" onclick="window.open('mailto:soporte@tienda3d.com?subject=Consulta pedido ${orderId || ''}')">
              <i class="fas fa-envelope"></i>
              Enviar Email
            </button>
            <button class="btn btn-success" onclick="window.open('https://wa.me/34600123456?text=Hola, necesito ayuda con mi pedido ${orderId || ''}')">
              <i class="fab fa-whatsapp"></i>
              Abrir WhatsApp
            </button>
          </div>
        </div>
      `,
      showFooter: false
    });
  }

  confirmDelivery(orderId) {
    const modal = createModal({
      title: 'Confirmar Recepción',
      size: 'medium',
      content: `
        <div class="confirm-delivery">
          <div class="confirm-header">
            <i class="fas fa-check-circle"></i>
            <h3>¿Has recibido tu pedido?</h3>
          </div>
          
          <p>Por favor confirma que has recibido el pedido <strong>${orderId}</strong> en perfectas condiciones.</p>
          
          <div class="delivery-rating">
            <h4>¿Cómo valoras el servicio?</h4>
            <div class="rating-stars">
              <span class="star" data-rating="1">⭐</span>
              <span class="star" data-rating="2">⭐</span>
              <span class="star" data-rating="3">⭐</span>
              <span class="star" data-rating="4">⭐</span>
              <span class="star" data-rating="5">⭐</span>
            </div>
          </div>
          
          <div class="delivery-comments">
            <label for="delivery-comment">Comentarios (opcional):</label>
            <textarea id="delivery-comment" placeholder="Comparte tu experiencia con nosotros..."></textarea>
          </div>
          
          <div class="confirm-actions">
            <button class="btn btn-success" onclick="trackingManager.processDeliveryConfirmation('${orderId}')">
              <i class="fas fa-check"></i>
              Confirmar Recepción
            </button>
            <button class="btn btn-secondary" onclick="closeModal()">
              Cancelar
            </button>
          </div>
        </div>
      `,
      showFooter: false
    });

    // Añadir funcionalidad a las estrellas
    modal.querySelectorAll('.star').forEach((star, index) => {
      star.addEventListener('click', () => {
        modal.querySelectorAll('.star').forEach((s, i) => {
          s.classList.toggle('selected', i <= index);
        });
      });
    });
  }

  async processDeliveryConfirmation(orderId) {
    try {
      const order = this.orders.get(orderId);
      if (!order) return;

      // Actualizar estado del pedido
      order.status = 'delivered';
      order.timeline.push({
        status: 'delivered',
        timestamp: new Date().toISOString(),
        title: 'Entrega confirmada',
        description: 'El cliente ha confirmado la recepción del pedido.'
      });

      // Guardar en Firebase (simulado)
      await update(child(dbRef, `orders/${orderId}`), {
        status: order.status,
        timeline: order.timeline
      });

      closeModal();
      showToast('¡Gracias por confirmar la recepción!', 'success');
      
      // Actualizar la vista
      this.displayOrderDetails(order);
    } catch (error) {
      console.error('Error confirming delivery:', error);
      showToast('Error al confirmar la recepción', 'error');
    }
  }

  // Método para admin: actualizar estado del pedido
  async updateOrderStatus(orderId, newStatus, description = '') {
    try {
      const order = this.orders.get(orderId);
      if (!order) return false;

      order.status = newStatus;
      order.timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        title: this.statusTranslations[newStatus],
        description: description || `Estado actualizado a ${this.statusTranslations[newStatus]}.`
      });

      await update(child(dbRef, `orders/${orderId}`), {
        status: order.status,
        timeline: order.timeline
      });

      showToast(`Pedido ${orderId} actualizado a ${this.statusTranslations[newStatus]}`, 'success');
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Error al actualizar el estado del pedido', 'error');
      return false;
    }
  }
}

// Inicializar el gestor de seguimiento
let trackingManager;
document.addEventListener('DOMContentLoaded', () => {
  trackingManager = new TrackingManager();
});
