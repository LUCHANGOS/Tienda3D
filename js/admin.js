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
      case 'products':
        content.innerHTML = this.renderProductsManagement();
        this.setupProductsEventListeners();
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

  renderProductsManagement() {
    return `
      <div class="admin-tab-content">
        <div class="tab-header">
          <h3><i class="fas fa-store"></i> Gestión de Catálogo y Procesos</h3>
          <div class="header-actions">
            <button class="btn btn-primary" id="add-catalog-product">
              <i class="fas fa-plus"></i>
              Agregar al Catálogo
            </button>
            <button class="btn btn-success" id="add-material">
              <i class="fas fa-flask"></i>
              Agregar Material
            </button>
          </div>
        </div>

        <div class="products-tabs">
          <button class="subtab-btn active" data-subtab="catalog">Catálogo Público</button>
          <button class="subtab-btn" data-subtab="materials">Materiales</button>
          <button class="subtab-btn" data-subtab="process-tracker">Seguimiento de Procesos</button>
        </div>

        <div id="catalog-tab" class="subtab-content active">
          <div class="section-header">
            <h4><i class="fas fa-shopping-bag"></i> Productos del Catálogo</h4>
            <p>Gestiona los productos que aparecen en el catálogo público</p>
          </div>
          
          <div class="products-filters">
            <div class="filter-group">
              <input type="text" id="catalog-search" placeholder="Buscar en catálogo..." class="form-control">
            </div>
            <div class="filter-group">
              <select id="catalog-category-filter" class="form-select">
                <option value="">Todas las categorías</option>
                <option value="decorativo">Decorativo</option>
                <option value="funcional">Funcional</option>
                <option value="educativo">Educativo</option>
                <option value="juguete">Juguete</option>
                <option value="herramienta">Herramienta</option>
                <option value="arte">Arte</option>
                <option value="prototipo">Prototipo</option>
              </select>
            </div>
            <div class="filter-group">
              <select id="catalog-status-filter" class="form-select">
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="draft">Borrador</option>
              </select>
            </div>
          </div>
          
          <div id="catalog-list" class="products-grid">
            <!-- Productos del catálogo se cargan aquí -->
          </div>
        </div>

        <div id="materials-tab" class="subtab-content">
          <div class="section-header">
            <h4><i class="fas fa-atom"></i> Gestión de Materiales</h4>
            <p>Administra los materiales disponibles para impresión</p>
          </div>
          
          <div class="materials-filters">
            <div class="filter-group">
              <input type="text" id="materials-search" placeholder="Buscar materiales..." class="form-control">
            </div>
            <div class="filter-group">
              <select id="materials-type-filter" class="form-select">
                <option value="">Todos los tipos</option>
                <option value="FDM">FDM/FFF</option>
                <option value="SLA">SLA/Resina</option>
                <option value="SLS">SLS</option>
              </select>
            </div>
            <div class="filter-group">
              <select id="materials-availability-filter" class="form-select">
                <option value="">Disponibilidad</option>
                <option value="available">Disponible</option>
                <option value="low-stock">Stock Bajo</option>
                <option value="out-of-stock">Agotado</option>
              </select>
            </div>
          </div>
          
          <div id="materials-list" class="materials-grid">
            <!-- Lista de materiales se carga aquí -->
          </div>
        </div>

        <div id="process-tracker-tab" class="subtab-content">
          <div class="section-header">
            <h4><i class="fas fa-route"></i> Seguimiento de Procesos</h4>
            <p>Busca y monitorea el estado de productos en proceso</p>
          </div>
          
          <div class="tracker-search">
            <div class="search-container">
              <div class="search-inputs">
                <input type="text" id="process-search" placeholder="Buscar por código, cliente o producto..." class="form-control">
                <select id="process-status-filter" class="form-select">
                  <option value="">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="designing">En Diseño</option>
                  <option value="slicing">Procesando</option>
                  <option value="printing">Imprimiendo</option>
                  <option value="post-processing">Post-procesado</option>
                  <option value="quality-check">Control de Calidad</option>
                  <option value="packaging">Empaquetado</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <button class="btn btn-primary" id="search-process-btn">
                  <i class="fas fa-search"></i>
                  Buscar
                </button>
              </div>
            </div>
          </div>
          
          <div id="process-results" class="process-results">
            <div class="no-results">
              <i class="fas fa-search-plus"></i>
              <p>Usa el buscador para encontrar productos en proceso</p>
            </div>
          </div>
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

  setupProductsEventListeners() {
    // Setup subtabs
    const subtabBtns = document.querySelectorAll('.subtab-btn');
    subtabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subtab = e.target.dataset.subtab;
        this.switchProductsSubtab(subtab);
      });
    });

    // Setup main action buttons
    const addCatalogBtn = document.getElementById('add-catalog-product');
    if (addCatalogBtn) {
      addCatalogBtn.addEventListener('click', () => this.showAddCatalogProductModal());
    }

    const addMaterialBtn = document.getElementById('add-material');
    if (addMaterialBtn) {
      addMaterialBtn.addEventListener('click', () => this.showAddMaterialModal());
    }

    // Setup search functionality
    const processSearchBtn = document.getElementById('search-process-btn');
    if (processSearchBtn) {
      processSearchBtn.addEventListener('click', () => this.searchProcesses());
    }

    const processSearchInput = document.getElementById('process-search');
    if (processSearchInput) {
      processSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.searchProcesses();
        }
      });
    }

    // Load initial data
    this.loadCatalogProducts();
    this.loadMaterialsData();
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

  // Métodos para las nuevas funcionalidades
  switchProductsSubtab(subtab) {
    // Actualizar botones de subtabs
    document.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-subtab="${subtab}"]`)?.classList.add('active');

    // Mostrar/ocultar contenido
    document.querySelectorAll('.subtab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${subtab}-tab`)?.classList.add('active');

    // Cargar datos según la subtab
    switch(subtab) {
      case 'catalog':
        this.loadCatalogProducts();
        break;
      case 'materials':
        this.loadMaterialsData();
        break;
      case 'process-tracker':
        this.clearProcessResults();
        break;
    }
  }

  async showAddCatalogProductModal() {
    const modal = createModal({
      title: 'Agregar Producto al Catálogo',
      size: 'large',
      content: `
        <form id="add-catalog-form" enctype="multipart/form-data">
          <div class="form-grid">
            <div class="form-group">
              <label for="product-name">Nombre del Producto *</label>
              <input type="text" id="product-name" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="product-category">Categoría *</label>
              <select id="product-category" class="form-select" required>
                <option value="">Seleccionar categoría</option>
                <option value="decorativo">Decorativo</option>
                <option value="funcional">Funcional</option>
                <option value="educativo">Educativo</option>
                <option value="juguete">Juguete</option>
                <option value="herramienta">Herramienta</option>
                <option value="arte">Arte</option>
                <option value="prototipo">Prototipo</option>
              </select>
            </div>
            <div class="form-group">
              <label for="product-difficulty">Dificultad de Impresión</label>
              <select id="product-difficulty" class="form-select">
                <option value="facil">Fácil</option>
                <option value="medio" selected>Medio</option>
                <option value="dificil">Difícil</option>
                <option value="experto">Experto</option>
              </select>
            </div>
            <div class="form-group">
              <label for="product-price">Precio Base (€)</label>
              <input type="number" id="product-price" class="form-control" step="0.01" min="0">
            </div>
          </div>
          <div class="form-group">
            <label for="product-description">Descripción *</label>
            <textarea id="product-description" class="form-control" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="product-stl-file">Archivo STL</label>
            <input type="file" id="product-stl-file" class="form-control" accept=".stl">
            <small>Archivo STL para previsualización 3D (opcional)</small>
          </div>
          <div class="form-group">
            <label for="product-image">Imagen del Producto</label>
            <input type="file" id="product-image" class="form-control" accept="image/*">
            <small>Imagen para mostrar en el catálogo (opcional)</small>
          </div>
          <div class="form-group">
            <label for="product-tags">Etiquetas</label>
            <input type="text" id="product-tags" class="form-control" placeholder="etiqueta1, etiqueta2, etiqueta3">
            <small>Separadas por comas</small>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="product-active" checked>
              Activo en el catálogo
            </label>
          </div>
        </form>
      `,
      actions: [
        {
          text: 'Agregar al Catálogo',
          class: 'btn-primary',
          action: () => this.saveCatalogProduct()
        },
        {
          text: 'Cancelar',
          class: 'btn-secondary',
          action: () => closeModal()
        }
      ]
    });
  }

  async showAddMaterialModal() {
    const modal = createModal({
      title: 'Agregar Nuevo Material',
      size: 'large',
      content: `
        <form id="add-material-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="material-name">Nombre del Material *</label>
              <input type="text" id="material-name" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="material-type">Tipo de Tecnología *</label>
              <select id="material-type" class="form-select" required>
                <option value="">Seleccionar tipo</option>
                <option value="FDM">FDM/FFF (Filamento)</option>
                <option value="SLA">SLA (Resina)</option>
                <option value="SLS">SLS (Polvo)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="material-price">Precio por Gramo (€) *</label>
              <input type="number" id="material-price" class="form-control" step="0.001" min="0" required>
            </div>
            <div class="form-group">
              <label for="material-density">Densidad (g/cm³)</label>
              <input type="number" id="material-density" class="form-control" step="0.01" min="0">
            </div>
          </div>
          <div class="form-group">
            <label for="material-description">Descripción *</label>
            <textarea id="material-description" class="form-control" rows="3" required></textarea>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="material-temp-nozzle">Temp. Boquilla (°C)</label>
              <input type="number" id="material-temp-nozzle" class="form-control" min="0">
            </div>
            <div class="form-group">
              <label for="material-temp-bed">Temp. Cama (°C)</label>
              <input type="number" id="material-temp-bed" class="form-control" min="0">
            </div>
            <div class="form-group">
              <label for="material-stock">Stock Disponible</label>
              <select id="material-stock" class="form-select">
                <option value="available">Disponible</option>
                <option value="low-stock">Stock Bajo</option>
                <option value="out-of-stock">Agotado</option>
              </select>
            </div>
            <div class="form-group">
              <label for="material-color">Colores Disponibles</label>
              <input type="text" id="material-color" class="form-control" placeholder="Blanco, Negro, Rojo, Azul">
              <small>Separados por comas</small>
            </div>
          </div>
          <div class="form-group">
            <label for="material-properties">Propiedades Especiales</label>
            <textarea id="material-properties" class="form-control" rows="2" placeholder="Resistencia térmica, flexibilidad, biodegradable..."></textarea>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="material-active" checked>
              Material activo para pedidos
            </label>
          </div>
        </form>
      `,
      actions: [
        {
          text: 'Agregar Material',
          class: 'btn-success',
          action: () => this.saveMaterial()
        },
        {
          text: 'Cancelar',
          class: 'btn-secondary',
          action: () => closeModal()
        }
      ]
    });
  }

  async saveCatalogProduct() {
    const form = document.getElementById('add-catalog-form');
    if (!form.checkValidity()) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const productData = {
      id: 'prod_' + Date.now(),
      name: document.getElementById('product-name').value,
      category: document.getElementById('product-category').value,
      difficulty: document.getElementById('product-difficulty').value,
      price: parseFloat(document.getElementById('product-price').value) || 0,
      description: document.getElementById('product-description').value,
      tags: document.getElementById('product-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
      active: document.getElementById('product-active').checked,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      showToast('Guardando producto...', 'info');
      
      // Guardar en Firebase
      await set(child(dbRef, `catalog/${productData.id}`), productData);
      
      showToast('Producto agregado al catálogo correctamente', 'success');
      closeModal();
      this.loadCatalogProducts();
    } catch (error) {
      console.error('Error saving catalog product:', error);
      showToast('Error al guardar el producto', 'error');
    }
  }

  async saveMaterial() {
    const form = document.getElementById('add-material-form');
    if (!form.checkValidity()) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const materialData = {
      id: 'mat_' + Date.now(),
      name: document.getElementById('material-name').value,
      type: document.getElementById('material-type').value,
      pricePerGram: parseFloat(document.getElementById('material-price').value),
      density: parseFloat(document.getElementById('material-density').value) || null,
      description: document.getElementById('material-description').value,
      temperatures: {
        nozzle: parseInt(document.getElementById('material-temp-nozzle').value) || null,
        bed: parseInt(document.getElementById('material-temp-bed').value) || null
      },
      stock: document.getElementById('material-stock').value,
      colors: document.getElementById('material-color').value.split(',').map(color => color.trim()).filter(color => color),
      properties: document.getElementById('material-properties').value,
      active: document.getElementById('material-active').checked,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      showToast('Guardando material...', 'info');
      
      // Guardar en Firebase
      await set(child(dbRef, `materials/${materialData.id}`), materialData);
      
      // Actualizar lista local
      this.materials.set(materialData.id, materialData);
      
      showToast('Material agregado correctamente', 'success');
      closeModal();
      this.loadMaterialsData();
    } catch (error) {
      console.error('Error saving material:', error);
      showToast('Error al guardar el material', 'error');
    }
  }

  async searchProcesses() {
    const searchTerm = document.getElementById('process-search')?.value.trim();
    const statusFilter = document.getElementById('process-status-filter')?.value;
    
    if (!searchTerm) {
      showToast('Ingresa un término de búsqueda', 'warning');
      return;
    }

    try {
      showToast('Buscando...', 'info');
      
      const results = this.filterOrdersBySearch(searchTerm, statusFilter);
      this.displayProcessResults(results, searchTerm);
    } catch (error) {
      console.error('Error searching processes:', error);
      showToast('Error en la búsqueda', 'error');
    }
  }

  filterOrdersBySearch(searchTerm, statusFilter) {
    const term = searchTerm.toLowerCase();
    const results = [];
    
    this.orders.forEach(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(term) ||
        order.customerInfo?.name?.toLowerCase().includes(term) ||
        order.customerInfo?.email?.toLowerCase().includes(term) ||
        order.specifications?.description?.toLowerCase().includes(term);
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      if (matchesSearch && matchesStatus) {
        results.push(order);
      }
    });
    
    return results.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }

  displayProcessResults(results, searchTerm) {
    const container = document.getElementById('process-results');
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search-minus"></i>
          <p>No se encontraron resultados para "${searchTerm}"</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="search-results-header">
        <h5>Resultados de búsqueda (${results.length})</h5>
        <p>Buscando: "${searchTerm}"</p>
      </div>
      <div class="process-timeline">
        ${results.map(order => this.renderProcessItem(order)).join('')}
      </div>
    `;
  }

  renderProcessItem(order) {
    const progress = this.getOrderProgress(order.status);
    const statusClass = this.getStatusClass(order.status);
    const statusText = this.getStatusText(order.status);
    
    return `
      <div class="process-item" onclick="adminPanel.viewOrderDetails('${order.id}')">
        <div class="process-header">
          <div class="process-id">
            <code>${order.id}</code>
            <span class="process-date">${this.formatDate(order.createdAt)}</span>
          </div>
          <div class="process-status ${statusClass}">
            ${statusText}
          </div>
        </div>
        <div class="process-info">
          <div class="process-customer">
            <i class="fas fa-user"></i>
            <span>${order.customerInfo?.name || 'Cliente'}</span>
            <small>${order.customerInfo?.email || ''}</small>
          </div>
          <div class="process-product">
            <i class="fas fa-cube"></i>
            <span>${order.specifications?.serviceType || 'Servicio personalizado'}</span>
          </div>
          <div class="process-price">
            <i class="fas fa-euro-sign"></i>
            <span>€${order.pricing?.total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        <div class="process-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <small>Progreso: ${progress}%</small>
        </div>
      </div>
    `;
  }

  getOrderProgress(status) {
    const progressMap = {
      'pending': 10,
      'confirmed': 20,
      'designing': 30,
      'slicing': 40,
      'printing': 60,
      'post-processing': 75,
      'quality-check': 85,
      'packaging': 90,
      'shipped': 95,
      'delivered': 100,
      'cancelled': 0
    };
    return progressMap[status] || 0;
  }

  getStatusClass(status) {
    const statusClasses = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'designing': 'status-in-progress',
      'slicing': 'status-in-progress',
      'printing': 'status-in-progress',
      'post-processing': 'status-in-progress',
      'quality-check': 'status-review',
      'packaging': 'status-ready',
      'shipped': 'status-shipped',
      'delivered': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-unknown';
  }

  clearProcessResults() {
    const container = document.getElementById('process-results');
    if (container) {
      container.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search-plus"></i>
          <p>Usa el buscador para encontrar productos en proceso</p>
        </div>
      `;
    }
  }

  async loadCatalogProducts() {
    try {
      const container = document.getElementById('catalog-list');
      if (!container) return;
      
      container.innerHTML = '<p>Cargando productos del catálogo...</p>';
      
      // Simular carga de datos (en producción usarías Firebase)
      setTimeout(() => {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-store"></i>
            <h4>Catálogo Vacío</h4>
            <p>Aún no hay productos en el catálogo. Agrega el primer producto usando el botón "Agregar al Catálogo".</p>
          </div>
        `;
      }, 500);
    } catch (error) {
      console.error('Error loading catalog products:', error);
    }
  }

  async loadMaterialsData() {
    try {
      const container = document.getElementById('materials-list');
      if (!container) return;
      
      container.innerHTML = '<p>Cargando materiales...</p>';
      
      // Mostrar materiales existentes
      const materialsArray = Array.from(this.materials.values());
      
      if (materialsArray.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-flask"></i>
            <h4>No hay materiales registrados</h4>
            <p>Agrega materiales para que aparezcan como opciones en los pedidos.</p>
          </div>
        `;
      } else {
        container.innerHTML = materialsArray.map(material => `
          <div class="material-card">
            <div class="material-header">
              <h4>${material.name}</h4>
              <span class="material-type ${material.type}">${material.type}</span>
            </div>
            <div class="material-details">
              <p>${material.description}</p>
              <div class="material-props">
                <span><strong>Precio:</strong> €${material.pricePerGram}/g</span>
                ${material.density ? `<span><strong>Densidad:</strong> ${material.density} g/cm³</span>` : ''}
                <span class="stock-status ${material.stock}">${this.getStockText(material.stock)}</span>
              </div>
              ${material.colors?.length ? `<div class="material-colors">Colores: ${material.colors.join(', ')}</div>` : ''}
            </div>
            <div class="material-actions">
              <button class="btn btn-sm btn-outline" onclick="adminPanel.editMaterial('${material.id}')">
                <i class="fas fa-edit"></i>
                Editar
              </button>
              <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteMaterial('${material.id}')">
                <i class="fas fa-trash"></i>
                Eliminar
              </button>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Error loading materials data:', error);
    }
  }

  getStockText(stock) {
    const stockMap = {
      'available': 'Disponible',
      'low-stock': 'Stock Bajo',
      'out-of-stock': 'Agotado'
    };
    return stockMap[stock] || stock;
  }
}

// Inicializar el panel de administración globalmente para que esté disponible
let adminPanel;

// Función para inicializar el admin panel cuando sea necesario
function initializeAdminPanel() {
  if (!adminPanel && document.getElementById('admin')) {
    adminPanel = new AdminPanel();
  }
  return adminPanel;
}

// Hacer AdminPanel disponible globalmente
window.AdminPanel = AdminPanel;
window.initializeAdminPanel = initializeAdminPanel;
