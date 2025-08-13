// Panel de Administración - Tienda3D
class AdminPanel {
  constructor() {
    this.currentTab = 'dashboard';
    this.orders = new Map();
    this.services = new Map();
    this.materials = new Map();
    this.stats = {
      totalOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0
    };
    this.init();
  }

  async init() {
    if (!this.checkAdminAccess()) {
      this.showAccessDenied();
      return;
    }

    await this.loadData();
    this.setupTabs();
    this.renderCurrentTab();
    this.setupEventListeners();
  }

  checkAdminAccess() {
    // En producción, aquí verificarías la autenticación del admin
    const adminCode = sessionStorage.getItem('adminCode');
    return adminCode === 'ADMIN123' || this.promptAdminCode();
  }

  promptAdminCode() {
    const code = prompt('Introduce el código de administrador:');
    if (code === 'ADMIN123') {
      sessionStorage.setItem('adminCode', code);
      return true;
    }
    return false;
  }

  showAccessDenied() {
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
      adminContent.innerHTML = `
        <div class="access-denied">
          <div class="denied-icon">
            <i class="fas fa-lock"></i>
          </div>
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <button class="btn btn-primary" onclick="location.reload()">
            Intentar de nuevo
          </button>
        </div>
      `;
    }
  }

  async loadData() {
    try {
      // Cargar datos desde Firebase o usar datos locales
      await Promise.all([
        this.loadOrders(),
        this.loadServices(),
        this.loadMaterials()
      ]);
      
      this.calculateStats();
    } catch (error) {
      console.error('Error loading admin data:', error);
      showToast('Error al cargar datos del administrador', 'error');
    }
  }

  async loadOrders() {
    try {
      // Si trackingManager está disponible, usar sus datos
      if (window.trackingManager && trackingManager.orders) {
        trackingManager.orders.forEach((order, id) => {
          this.orders.set(id, order);
        });
      }

      const ordersSnapshot = await get(child(dbRef, 'orders'));
      if (ordersSnapshot.exists()) {
        const ordersData = ordersSnapshot.val();
        Object.entries(ordersData).forEach(([id, data]) => {
          this.orders.set(id, { id, ...data });
        });
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  async loadServices() {
    try {
      if (window.catalogManager && catalogManager.services) {
        catalogManager.services.forEach(service => {
          this.services.set(service.id, service);
        });
      }

      const servicesSnapshot = await get(child(dbRef, 'services'));
      if (servicesSnapshot.exists()) {
        const servicesData = servicesSnapshot.val();
        Object.entries(servicesData).forEach(([id, data]) => {
          this.services.set(id, { id, ...data });
        });
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }

  async loadMaterials() {
    try {
      const materialsSnapshot = await get(child(dbRef, 'materials'));
      if (materialsSnapshot.exists()) {
        const materialsData = materialsSnapshot.val();
        Object.entries(materialsData).forEach(([id, data]) => {
          this.materials.set(id, { id, ...data });
        });
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    }
  }

  calculateStats() {
    this.stats = {
      totalOrders: this.orders.size,
      activeOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0
    };

    this.orders.forEach(order => {
      // Contar por estado
      switch (order.status) {
        case 'delivered':
          this.stats.completedOrders++;
          break;
        case 'pending':
        case 'confirmed':
          this.stats.pendingOrders++;
          break;
        case 'in-production':
        case 'quality-check':
        case 'shipped':
          this.stats.activeOrders++;
          break;
      }

      // Sumar ingresos
      if (order.pricing && order.pricing.total && order.status !== 'cancelled') {
        this.stats.totalRevenue += order.pricing.total;
      }
    });
  }

  setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tabId = e.target.dataset.tab;
        if (tabId) {
          this.switchTab(tabId);
        }
      });
    });
  }

  switchTab(tabId) {
    // Actualizar botones
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');

    this.currentTab = tabId;
    this.renderCurrentTab();
  }

  renderCurrentTab() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    switch (this.currentTab) {
      case 'dashboard':
        content.innerHTML = this.renderDashboard();
        break;
      case 'orders':
        content.innerHTML = this.renderOrdersManagement();
        this.setupOrdersEventListeners();
        break;
      case 'services':
        content.innerHTML = this.renderServicesManagement();
        this.setupServicesEventListeners();
        break;
      case 'materials':
        content.innerHTML = this.renderMaterialsManagement();
        break;
      case 'analytics':
        content.innerHTML = this.renderAnalytics();
        this.renderCharts();
        break;
      default:
        content.innerHTML = this.renderDashboard();
    }
  }

  renderDashboard() {
    return `
      <div class="dashboard">
        <div class="dashboard-header">
          <h2><i class="fas fa-tachometer-alt"></i> Panel de Control</h2>
          <p>Resumen general de la tienda</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stat-info">
              <h3>${this.stats.totalOrders}</h3>
              <p>Pedidos Totales</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info">
              <h3>${this.stats.pendingOrders}</h3>
              <p>Pendientes</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-cogs"></i>
            </div>
            <div class="stat-info">
              <h3>${this.stats.activeOrders}</h3>
              <p>En Producción</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-euro-sign"></i>
            </div>
            <div class="stat-info">
              <h3>€${this.stats.totalRevenue.toFixed(2)}</h3>
              <p>Ingresos Totales</p>
            </div>
          </div>
        </div>

        <div class="dashboard-sections">
          <div class="recent-orders">
            <h3><i class="fas fa-list"></i> Pedidos Recientes</h3>
            ${this.renderRecentOrders()}
          </div>

          <div class="quick-actions">
            <h3><i class="fas fa-bolt"></i> Acciones Rápidas</h3>
            <div class="actions-grid">
              <button class="btn btn-primary" onclick="adminPanel.switchTab('orders')">
                <i class="fas fa-plus"></i>
                Nuevo Pedido
              </button>
              <button class="btn btn-success" onclick="adminPanel.switchTab('services')">
                <i class="fas fa-tools"></i>
                Gestionar Servicios
              </button>
              <button class="btn btn-info" onclick="adminPanel.exportData()">
                <i class="fas fa-download"></i>
                Exportar Datos
              </button>
              <button class="btn btn-warning" onclick="adminPanel.showBackup()">
                <i class="fas fa-backup"></i>
                Backup
              </button>
            </div>
          </div>
        </div>

        <div class="system-status">
          <h3><i class="fas fa-server"></i> Estado del Sistema</h3>
          <div class="status-items">
            <div class="status-item">
              <span class="status-indicator online"></span>
              <span>Base de datos: Conectada</span>
            </div>
            <div class="status-item">
              <span class="status-indicator online"></span>
              <span>Almacenamiento: Operativo</span>
            </div>
            <div class="status-item">
              <span class="status-indicator online"></span>
              <span>Notificaciones: Activas</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRecentOrders() {
    const recentOrders = Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    if (recentOrders.length === 0) {
      return '<p>No hay pedidos recientes</p>';
    }

    return `
      <div class="orders-list">
        ${recentOrders.map(order => `
          <div class="order-item" onclick="adminPanel.viewOrderDetails('${order.id}')">
            <div class="order-info">
              <strong>${order.id}</strong>
              <span>${order.customerInfo?.name || 'Cliente'}</span>
              <small>${this.formatDate(order.createdAt)}</small>
            </div>
            <div class="order-status ${order.status}">
              ${this.getStatusText(order.status)}
            </div>
            <div class="order-amount">
              €${order.pricing?.total?.toFixed(2) || '0.00'}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderOrdersManagement() {
    const orders = Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return `
      <div class="orders-management">
        <div class="management-header">
          <h2><i class="fas fa-list-alt"></i> Gestión de Pedidos</h2>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="adminPanel.createNewOrder()">
              <i class="fas fa-plus"></i>
              Nuevo Pedido
            </button>
            <button class="btn btn-info" onclick="adminPanel.refreshOrders()">
              <i class="fas fa-sync"></i>
              Actualizar
            </button>
          </div>
        </div>

        <div class="orders-filters">
          <select id="status-filter" onchange="adminPanel.filterOrders()">
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmados</option>
            <option value="in-production">En Producción</option>
            <option value="quality-check">Control de Calidad</option>
            <option value="shipped">Enviados</option>
            <option value="delivered">Entregados</option>
            <option value="cancelled">Cancelados</option>
          </select>
          
          <input type="text" id="search-orders" placeholder="Buscar por ID o cliente..." 
                 oninput="adminPanel.searchOrders(this.value)">
        </div>

        <div class="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(order => `
                <tr>
                  <td><code>${order.id}</code></td>
                  <td>
                    <div>
                      <strong>${order.customerInfo?.name || 'N/A'}</strong>
                      <small>${order.customerInfo?.email || 'N/A'}</small>
                    </div>
                  </td>
                  <td>${this.getServiceName(order.specifications?.serviceType)}</td>
                  <td>
                    <select onchange="adminPanel.updateOrderStatus('${order.id}', this.value)">
                      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                      <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmado</option>
                      <option value="in-production" ${order.status === 'in-production' ? 'selected' : ''}>En Producción</option>
                      <option value="quality-check" ${order.status === 'quality-check' ? 'selected' : ''}>Control de Calidad</option>
                      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Enviado</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Entregado</option>
                      <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                  </td>
                  <td>€${order.pricing?.total?.toFixed(2) || '0.00'}</td>
                  <td>${this.formatDate(order.createdAt)}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-small btn-primary" onclick="adminPanel.viewOrderDetails('${order.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button class="btn-small btn-success" onclick="adminPanel.editOrder('${order.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn-small btn-danger" onclick="adminPanel.deleteOrder('${order.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderServicesManagement() {
    const services = Array.from(this.services.values());

    return `
      <div class="services-management">
        <div class="management-header">
          <h2><i class="fas fa-tools"></i> Gestión de Servicios</h2>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="adminPanel.createNewService()">
              <i class="fas fa-plus"></i>
              Nuevo Servicio
            </button>
          </div>
        </div>

        <div class="services-grid">
          ${services.map(service => `
            <div class="service-admin-card">
              <div class="service-header">
                <div class="service-icon">${service.icon || '🛠️'}</div>
                <div class="service-info">
                  <h3>${service.name}</h3>
                  <p class="service-category">${this.getCategoryName(service.category)}</p>
                </div>
                <div class="service-price">€${service.price}/${service.unit}</div>
              </div>
              
              <div class="service-description">
                <p>${service.description}</p>
              </div>

              <div class="service-actions">
                <button class="btn btn-outline" onclick="adminPanel.editService('${service.id}')">
                  <i class="fas fa-edit"></i>
                  Editar
                </button>
                <button class="btn btn-danger" onclick="adminPanel.deleteService('${service.id}')">
                  <i class="fas fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderMaterialsManagement() {
    const materials = Array.from(this.materials.values());

    return `
      <div class="materials-management">
        <div class="management-header">
          <h2><i class="fas fa-layer-group"></i> Gestión de Materiales</h2>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="adminPanel.createNewMaterial()">
              <i class="fas fa-plus"></i>
              Nuevo Material
            </button>
          </div>
        </div>

        <div class="materials-list">
          ${materials.length > 0 ? materials.map(material => `
            <div class="material-admin-item">
              <div class="material-info">
                <h3>${material.name}</h3>
                <p>${material.description}</p>
                <div class="material-properties">
                  <span class="property">Tipo: ${material.type}</span>
                  <span class="property">Precio: €${material.pricePerGram}/g</span>
                </div>
              </div>
              <div class="material-actions">
                <button class="btn btn-outline" onclick="adminPanel.editMaterial('${material.id}')">
                  <i class="fas fa-edit"></i>
                  Editar
                </button>
                <button class="btn btn-danger" onclick="adminPanel.deleteMaterial('${material.id}')">
                  <i class="fas fa-trash"></i>
                  Eliminar
                </button>
              </div>
            </div>
          `).join('') : '<p>No hay materiales registrados</p>'}
        </div>
      </div>
    `;
  }

  renderAnalytics() {
    return `
      <div class="analytics">
        <div class="management-header">
          <h2><i class="fas fa-chart-bar"></i> Análisis y Estadísticas</h2>
        </div>

        <div class="analytics-grid">
          <div class="chart-container">
            <h3>Pedidos por Estado</h3>
            <canvas id="ordersChart"></canvas>
          </div>
          
          <div class="chart-container">
            <h3>Ingresos Mensuales</h3>
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <div class="detailed-stats">
          <h3>Estadísticas Detalladas</h3>
          <div class="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Valor</th>
                  <th>Cambio</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pedidos este mes</td>
                  <td>${this.stats.totalOrders}</td>
                  <td><span class="positive">+12%</span></td>
                </tr>
                <tr>
                  <td>Ingresos promedio por pedido</td>
                  <td>€${(this.stats.totalRevenue / this.stats.totalOrders || 0).toFixed(2)}</td>
                  <td><span class="positive">+5%</span></td>
                </tr>
                <tr>
                  <td>Tasa de conversión</td>
                  <td>85%</td>
                  <td><span class="positive">+2%</span></td>
                </tr>
                <tr>
                  <td>Tiempo promedio de entrega</td>
                  <td>4.2 días</td>
                  <td><span class="negative">-0.5 días</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Event listeners específicos para cada sección
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="logout"]')) {
        this.logout();
      }
    });
  }

  setupOrdersEventListeners() {
    // Los event listeners ya están configurados inline en el HTML
  }

  setupServicesEventListeners() {
    // Los event listeners ya están configurados inline en el HTML
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      if (window.trackingManager) {
        await trackingManager.updateOrderStatus(orderId, newStatus);
        await this.loadOrders();
        this.calculateStats();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Error al actualizar el estado del pedido', 'error');
    }
  }

  viewOrderDetails(orderId) {
    const order = this.orders.get(orderId);
    if (!order) {
      showToast('Pedido no encontrado', 'error');
      return;
    }

    // Usar el modal del sistema de seguimiento si está disponible
    if (window.trackingManager) {
      trackingManager.displayOrderDetails(order);
    } else {
      // Modal básico de administración
      const modal = createModal({
        title: `Detalles del Pedido ${orderId}`,
        size: 'large',
        content: `
          <div class="order-details-admin">
            <pre>${JSON.stringify(order, null, 2)}</pre>
          </div>
        `
      });
    }
  }

  async deleteOrder(orderId) {
    const confirmed = await this.showConfirmDialog(
      'Eliminar Pedido',
      `¿Estás seguro de que deseas eliminar el pedido ${orderId}?`
    );

    if (confirmed) {
      try {
        await update(child(dbRef, `orders/${orderId}`), null);
        this.orders.delete(orderId);
        showToast('Pedido eliminado correctamente', 'success');
        this.renderCurrentTab();
        this.calculateStats();
      } catch (error) {
        console.error('Error deleting order:', error);
        showToast('Error al eliminar el pedido', 'error');
      }
    }
  }

  createNewService() {
    const modal = createModal({
      title: 'Nuevo Servicio',
      size: 'large',
      content: `
        <form id="new-service-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="service-name">Nombre del servicio</label>
              <input type="text" id="service-name" required>
            </div>
            
            <div class="form-group">
              <label for="service-category">Categoría</label>
              <select id="service-category" required>
                <option value="printing">Impresión 3D</option>
                <option value="design">Diseño 3D</option>
                <option value="finishing">Post-procesamiento</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="service-price">Precio</label>
              <input type="number" id="service-price" step="0.01" required>
            </div>
            
            <div class="form-group">
              <label for="service-unit">Unidad</label>
              <select id="service-unit" required>
                <option value="por hora">por hora</option>
                <option value="por pieza">por pieza</option>
                <option value="por proyecto">por proyecto</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="service-description">Descripción</label>
            <textarea id="service-description" rows="3" required></textarea>
          </div>
          
          <div class="form-group">
            <label for="service-icon">Icono (emoji)</label>
            <input type="text" id="service-icon" placeholder="🖨️">
          </div>
        </form>
      `,
      actions: [
        {
          text: 'Crear Servicio',
          class: 'btn-primary',
          action: () => this.saveNewService()
        },
        {
          text: 'Cancelar',
          class: 'btn-secondary',
          action: () => closeModal()
        }
      ]
    });
  }

  async saveNewService() {
    const form = document.getElementById('new-service-form');
    const formData = new FormData(form);
    
    const serviceData = {
      name: document.getElementById('service-name').value,
      category: document.getElementById('service-category').value,
      price: parseFloat(document.getElementById('service-price').value),
      unit: document.getElementById('service-unit').value,
      description: document.getElementById('service-description').value,
      icon: document.getElementById('service-icon').value || '🛠️'
    };

    try {
      if (window.catalogManager) {
        await catalogManager.addService(serviceData);
        await this.loadServices();
        this.renderCurrentTab();
        closeModal();
      }
    } catch (error) {
      console.error('Error creating service:', error);
      showToast('Error al crear el servicio', 'error');
    }
  }

  async exportData() {
    try {
      showToast('Generando exportación...', 'info');
      
      const exportData = {
        timestamp: new Date().toISOString(),
        orders: Array.from(this.orders.values()),
        services: Array.from(this.services.values()),
        materials: Array.from(this.materials.values()),
        stats: this.stats
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `tienda3d-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showToast('Datos exportados correctamente', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Error al exportar los datos', 'error');
    }
  }

  showBackup() {
    const modal = createModal({
      title: 'Gestión de Backup',
      size: 'medium',
      content: `
        <div class="backup-management">
          <h3>Opciones de Backup</h3>
          <div class="backup-options">
            <button class="btn btn-primary" onclick="adminPanel.exportData()">
              <i class="fas fa-download"></i>
              Exportar Datos
            </button>
            <button class="btn btn-warning" onclick="adminPanel.showImport()">
              <i class="fas fa-upload"></i>
              Importar Datos
            </button>
          </div>
          
          <div class="backup-info">
            <p><strong>Último backup:</strong> Nunca</p>
            <p><strong>Tamaño de datos:</strong> ${this.calculateDataSize()} KB</p>
            <p><strong>Elementos:</strong> ${this.orders.size} pedidos, ${this.services.size} servicios</p>
          </div>
        </div>
      `
    });
  }

  showImport() {
    closeModal();
    const modal = createModal({
      title: 'Importar Datos',
      size: 'medium',
      content: `
        <div class="import-data">
          <p>Selecciona un archivo de backup para importar:</p>
          <input type="file" id="import-file" accept=".json">
          <div class="import-warning">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Advertencia:</strong> Esto sobrescribirá todos los datos existentes.
          </div>
        </div>
      `,
      actions: [
        {
          text: 'Importar',
          class: 'btn-warning',
          action: () => this.processImport()
        },
        {
          text: 'Cancelar',
          class: 'btn-secondary',
          action: () => closeModal()
        }
      ]
    });
  }

  calculateDataSize() {
    const data = {
      orders: Array.from(this.orders.values()),
      services: Array.from(this.services.values()),
      materials: Array.from(this.materials.values())
    };
    return Math.round(JSON.stringify(data).length / 1024);
  }

  renderCharts() {
    // Simulación de gráficos (en producción usarías Chart.js)
    setTimeout(() => {
      this.drawOrdersChart();
      this.drawRevenueChart();
    }, 100);
  }

  drawOrdersChart() {
    const canvas = document.getElementById('ordersChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(20, 20, 100, 60);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(140, 40, 100, 40);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(260, 30, 100, 50);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px Arial';
    ctx.fillText('Pendientes', 20, 100);
    ctx.fillText('Completados', 140, 100);
    ctx.fillText('En proceso', 260, 100);
  }

  drawRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 80);
    ctx.lineTo(80, 60);
    ctx.lineTo(140, 40);
    ctx.lineTo(200, 20);
    ctx.lineTo(260, 30);
    ctx.lineTo(320, 10);
    ctx.stroke();
    
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px Arial';
    ctx.fillText('Ene Feb Mar Abr May Jun', 50, 100);
  }

  async showConfirmDialog(title, message) {
    return new Promise(resolve => {
      const modal = createModal({
        title: title,
        size: 'small',
        content: `
          <div class="confirm-dialog">
            <p>${message}</p>
          </div>
        `,
        actions: [
          {
            text: 'Confirmar',
            class: 'btn-danger',
            action: () => {
              closeModal();
              resolve(true);
            }
          },
          {
            text: 'Cancelar',
            class: 'btn-secondary',
            action: () => {
              closeModal();
              resolve(false);
            }
          }
        ]
      });
    });
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusText(status) {
    const statusMap = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'in-production': 'En Producción',
      'quality-check': 'Control de Calidad',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
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
    return serviceNames[serviceId] || serviceId || 'N/A';
  }

  getCategoryName(category) {
    const categories = {
      'printing': 'Impresión 3D',
      'design': 'Diseño 3D',
      'finishing': 'Post-procesamiento'
    };
    return categories[category] || category;
  }

  logout() {
    sessionStorage.removeItem('adminCode');
    showToast('Sesión cerrada correctamente', 'info');
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
}

// Inicializar el panel de administración solo cuando esté en la sección admin
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
  // Solo inicializar si estamos en la sección de admin
  if (document.getElementById('admin-section')) {
    adminPanel = new AdminPanel();
  }
});
