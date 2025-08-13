// Gestor de Catálogo - Tienda3D
class CatalogManager {
  constructor() {
    this.services = [];
    this.materials = [];
    this.currentFilters = {
      service: 'all',
      material: 'all',
      priceRange: 'all'
    };
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.renderCatalog();
      this.setupFilters();
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing catalog:', error);
      showToast('Error al cargar el catálogo', 'error');
    }
  }

  async loadData() {
    try {
      // Cargar servicios desde Firebase
      const servicesSnapshot = await get(child(dbRef, 'services'));
      if (servicesSnapshot.exists()) {
        this.services = Object.entries(servicesSnapshot.val()).map(([id, data]) => ({
          id,
          ...data
        }));
      } else {
        // Datos por defecto si no hay en Firebase
        this.services = this.getDefaultServices();
        await this.saveServicesToFirebase();
      }

      // Cargar materiales desde Firebase
      const materialsSnapshot = await get(child(dbRef, 'materials'));
      if (materialsSnapshot.exists()) {
        this.materials = Object.entries(materialsSnapshot.val()).map(([id, data]) => ({
          id,
          ...data
        }));
      }
    } catch (error) {
      console.error('Error loading catalog data:', error);
      // Usar datos por defecto en caso de error
      this.services = this.getDefaultServices();
      this.materials = [];
    }
  }

  getDefaultServices() {
    return [
      {
        id: 'printing-pla',
        name: 'Impresión 3D PLA',
        description: 'Impresión básica en filamento PLA, ideal para prototipos y objetos decorativos. Material biodegradable y fácil de imprimir.',
        price: 15,
        unit: 'por hora',
        category: 'printing',
        materials: ['PLA'],
        maxSize: '200x200x200mm',
        precision: '±0.2mm',
        leadTime: '2-3 días',
        icon: '🖨️',
        features: [
          'Alta calidad de superficie',
          'Colores variados disponibles',
          'Ecológico y biodegradable',
          'Ideal para principiantes'
        ]
      },
      {
        id: 'printing-abs',
        name: 'Impresión 3D ABS',
        description: 'Impresión profesional en ABS para piezas resistentes. Material duradero con buena resistencia al calor.',
        price: 20,
        unit: 'por hora',
        category: 'printing',
        materials: ['ABS'],
        maxSize: '200x200x200mm',
        precision: '±0.1mm',
        leadTime: '3-4 días',
        icon: '🔧',
        features: [
          'Alta resistencia mecánica',
          'Resistente al calor hasta 80°C',
          'Soldable y mecanizable',
          'Ideal para piezas funcionales'
        ]
      },
      {
        id: 'printing-petg',
        name: 'Impresión 3D PETG',
        description: 'Impresión en PETG, combinando la facilidad del PLA con la resistencia del ABS. Transparencia opcional.',
        price: 25,
        unit: 'por hora',
        category: 'printing',
        materials: ['PETG'],
        maxSize: '200x200x200mm',
        precision: '±0.15mm',
        leadTime: '3-5 días',
        icon: '💎',
        features: [
          'Transparencia cristalina',
          'Resistencia química',
          'Fácil de imprimir',
          'Apto para contacto alimentario'
        ]
      },
      {
        id: 'design-basic',
        name: 'Diseño 3D Básico',
        description: 'Servicio de diseño 3D para objetos simples. Incluye modelado básico y archivos STL listos para imprimir.',
        price: 30,
        unit: 'por hora',
        category: 'design',
        deliverables: ['Archivo STL', 'Renders 3D', 'Planos técnicos'],
        complexity: 'Básico',
        leadTime: '5-7 días',
        icon: '🎨',
        features: [
          'Modelado 3D profesional',
          'Renders fotorealistas',
          'Optimización para impresión',
          'Revisiones incluidas'
        ]
      },
      {
        id: 'design-advanced',
        name: 'Diseño 3D Avanzado',
        description: 'Diseño complejo con análisis estructural. Para piezas mecánicas y proyectos de ingeniería.',
        price: 50,
        unit: 'por hora',
        category: 'design',
        deliverables: ['Archivos CAD', 'STL optimizados', 'Análisis FEA', 'Documentación técnica'],
        complexity: 'Avanzado',
        leadTime: '7-14 días',
        icon: '⚙️',
        features: [
          'Análisis por elementos finitos',
          'Simulación de esfuerzos',
          'Optimización topológica',
          'Documentación completa'
        ]
      },
      {
        id: 'postprocessing',
        name: 'Post-Procesamiento',
        description: 'Acabado profesional de piezas impresas: lijado, pintado, ensamblaje y tratamientos superficiales.',
        price: 25,
        unit: 'por pieza',
        category: 'finishing',
        treatments: ['Lijado', 'Pintado', 'Acetona (ABS)', 'Ensamblaje'],
        quality: 'Profesional',
        leadTime: '2-4 días',
        icon: '✨',
        features: [
          'Acabado profesional',
          'Múltiples técnicas disponibles',
          'Pintura personalizada',
          'Ensamblaje de componentes'
        ]
      }
    ];
  }

  async saveServicesToFirebase() {
    try {
      const servicesData = {};
      this.services.forEach(service => {
        servicesData[service.id] = { ...service };
        delete servicesData[service.id].id;
      });
      await update(dbRef, { services: servicesData });
    } catch (error) {
      console.error('Error saving services to Firebase:', error);
    }
  }

  renderCatalog() {
    const catalogContainer = document.getElementById('services-grid');
    if (!catalogContainer) return;

    const filteredServices = this.filterServices();
    
    if (filteredServices.length === 0) {
      catalogContainer.innerHTML = `
        <div class="loading-placeholder">
          <i class="fas fa-search"></i>
          <h3>No se encontraron servicios</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      `;
      return;
    }

    catalogContainer.innerHTML = filteredServices.map(service => `
      <div class="service-card" data-service-id="${service.id}">
        <div class="service-image">
          <span style="font-size: 4rem;">${service.icon || '🖨️'}</span>
        </div>
        <div class="service-content">
          <h3 class="service-title">${service.name}</h3>
          <p class="service-description">${service.description}</p>
          <div class="service-price">
            <span class="price-value">€${service.price}</span>
            <span class="price-unit">${service.unit}</span>
          </div>
          
          ${service.features ? `
            <div class="service-features">
              <h4>Características:</h4>
              <ul class="property-list">
                ${service.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div class="service-details">
            ${service.maxSize ? `<small><i class="fas fa-cube"></i> Tamaño máx: ${service.maxSize}</small>` : ''}
            ${service.precision ? `<small><i class="fas fa-bullseye"></i> Precisión: ${service.precision}</small>` : ''}
            ${service.leadTime ? `<small><i class="fas fa-clock"></i> Tiempo: ${service.leadTime}</small>` : ''}
          </div>
          
          <div class="service-actions">
            <button class="btn btn-primary" onclick="catalogManager.selectService('${service.id}')">
              <i class="fas fa-plus"></i>
              Solicitar Servicio
            </button>
            <button class="btn btn-outline" onclick="catalogManager.viewServiceDetails('${service.id}')">
              <i class="fas fa-info-circle"></i>
              Más Detalles
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Animar la aparición de las cards
    const cards = catalogContainer.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  filterServices() {
    return this.services.filter(service => {
      const matchesService = this.currentFilters.service === 'all' || 
                            service.category === this.currentFilters.service;
      
      const matchesMaterial = this.currentFilters.material === 'all' || 
                             (service.materials && service.materials.includes(this.currentFilters.material));
      
      const matchesPrice = this.filterByPrice(service.price);
      
      return matchesService && matchesMaterial && matchesPrice;
    });
  }

  filterByPrice(price) {
    switch (this.currentFilters.priceRange) {
      case 'low': return price <= 20;
      case 'medium': return price > 20 && price <= 40;
      case 'high': return price > 40;
      default: return true;
    }
  }

  setupFilters() {
    const serviceFilter = document.getElementById('service-filter');
    const materialFilter = document.getElementById('material-filter');
    const priceFilter = document.getElementById('price-filter');

    if (serviceFilter) {
      serviceFilter.innerHTML = `
        <option value="all">Todos los servicios</option>
        <option value="printing">Impresión 3D</option>
        <option value="design">Diseño 3D</option>
        <option value="finishing">Post-procesamiento</option>
      `;
    }

    if (materialFilter && this.materials.length > 0) {
      materialFilter.innerHTML = `
        <option value="all">Todos los materiales</option>
        ${this.materials.map(material => 
          `<option value="${material.id}">${material.name}</option>`
        ).join('')}
      `;
    }

    if (priceFilter) {
      priceFilter.innerHTML = `
        <option value="all">Todos los precios</option>
        <option value="low">€0 - €20</option>
        <option value="medium">€21 - €40</option>
        <option value="high">€41+</option>
      `;
    }
  }

  setupEventListeners() {
    const serviceFilter = document.getElementById('service-filter');
    const materialFilter = document.getElementById('material-filter');
    const priceFilter = document.getElementById('price-filter');

    [serviceFilter, materialFilter, priceFilter].forEach(filter => {
      if (filter) {
        filter.addEventListener('change', () => {
          this.updateFilters();
          this.renderCatalog();
        });
      }
    });

    // Búsqueda en tiempo real
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => {
        this.searchServices(searchInput.value);
      }, 300));
    }
  }

  updateFilters() {
    const serviceFilter = document.getElementById('service-filter');
    const materialFilter = document.getElementById('material-filter');
    const priceFilter = document.getElementById('price-filter');

    this.currentFilters = {
      service: serviceFilter?.value || 'all',
      material: materialFilter?.value || 'all',
      priceRange: priceFilter?.value || 'all'
    };
  }

  searchServices(query) {
    if (!query.trim()) {
      this.renderCatalog();
      return;
    }

    const searchTerms = query.toLowerCase().split(' ');
    const catalogContainer = document.getElementById('services-grid');
    
    const filteredServices = this.filterServices().filter(service => {
      const searchText = `${service.name} ${service.description} ${service.category}`.toLowerCase();
      return searchTerms.every(term => searchText.includes(term));
    });

    if (filteredServices.length === 0) {
      catalogContainer.innerHTML = `
        <div class="loading-placeholder">
          <i class="fas fa-search"></i>
          <h3>No se encontraron resultados</h3>
          <p>No hay servicios que coincidan con "${query}"</p>
        </div>
      `;
      return;
    }

    // Renderizar servicios filtrados (similar al método renderCatalog pero con los filtrados)
    this.renderFilteredServices(filteredServices);
  }

  renderFilteredServices(services) {
    const catalogContainer = document.getElementById('services-grid');
    // Usar la misma lógica de renderizado que renderCatalog
    catalogContainer.innerHTML = services.map(service => `
      <div class="service-card" data-service-id="${service.id}">
        <div class="service-image">
          <span style="font-size: 4rem;">${service.icon || '🖨️'}</span>
        </div>
        <div class="service-content">
          <h3 class="service-title">${service.name}</h3>
          <p class="service-description">${service.description}</p>
          <div class="service-price">
            <span class="price-value">€${service.price}</span>
            <span class="price-unit">${service.unit}</span>
          </div>
          <div class="service-actions">
            <button class="btn btn-primary" onclick="catalogManager.selectService('${service.id}')">
              <i class="fas fa-plus"></i>
              Solicitar Servicio
            </button>
            <button class="btn btn-outline" onclick="catalogManager.viewServiceDetails('${service.id}')">
              <i class="fas fa-info-circle"></i>
              Más Detalles
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  selectService(serviceId) {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) {
      showToast('Servicio no encontrado', 'error');
      return;
    }

    // Guardar servicio seleccionado y cambiar a la sección de pedidos
    sessionStorage.setItem('selectedService', JSON.stringify(service));
    showToast(`${service.name} añadido a tu solicitud`, 'success');
    
    // Cambiar a la sección de pedidos
    setTimeout(() => {
      const orderLink = document.querySelector('[data-section="order"]');
      if (orderLink) {
        orderLink.click();
      }
    }, 1000);
  }

  viewServiceDetails(serviceId) {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) {
      showToast('Servicio no encontrado', 'error');
      return;
    }

    const modal = createModal({
      title: service.name,
      size: 'large',
      content: `
        <div class="service-details-modal">
          <div class="service-header">
            <div class="service-icon">${service.icon || '🖨️'}</div>
            <div class="service-info">
              <h2>${service.name}</h2>
              <p class="service-category">${this.getCategoryName(service.category)}</p>
              <div class="service-price">
                <span class="price-value">€${service.price}</span>
                <span class="price-unit">${service.unit}</span>
              </div>
            </div>
          </div>
          
          <div class="service-description">
            <h3><i class="fas fa-info-circle"></i> Descripción</h3>
            <p>${service.description}</p>
          </div>

          ${service.features ? `
            <div class="service-features">
              <h3><i class="fas fa-star"></i> Características</h3>
              <ul class="property-list">
                ${service.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="service-specs">
            <h3><i class="fas fa-cogs"></i> Especificaciones Técnicas</h3>
            <div class="specs-grid">
              ${service.maxSize ? `
                <div class="spec-item">
                  <i class="fas fa-cube"></i>
                  <strong>Tamaño máximo:</strong>
                  <span>${service.maxSize}</span>
                </div>
              ` : ''}
              ${service.precision ? `
                <div class="spec-item">
                  <i class="fas fa-bullseye"></i>
                  <strong>Precisión:</strong>
                  <span>${service.precision}</span>
                </div>
              ` : ''}
              ${service.leadTime ? `
                <div class="spec-item">
                  <i class="fas fa-clock"></i>
                  <strong>Tiempo de entrega:</strong>
                  <span>${service.leadTime}</span>
                </div>
              ` : ''}
              ${service.materials ? `
                <div class="spec-item">
                  <i class="fas fa-layer-group"></i>
                  <strong>Materiales:</strong>
                  <span>${service.materials.join(', ')}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-primary" onclick="catalogManager.selectService('${service.id}'); closeModal();">
              <i class="fas fa-plus"></i>
              Solicitar este Servicio
            </button>
            <button class="btn btn-secondary" onclick="closeModal();">
              Cerrar
            </button>
          </div>
        </div>
      `,
      showFooter: false
    });
  }

  getCategoryName(category) {
    const categories = {
      'printing': 'Impresión 3D',
      'design': 'Diseño 3D',
      'finishing': 'Post-procesamiento'
    };
    return categories[category] || category;
  }

  // Método para actualizar servicios desde el panel de admin
  async updateService(serviceId, serviceData) {
    try {
      const serviceIndex = this.services.findIndex(s => s.id === serviceId);
      if (serviceIndex !== -1) {
        this.services[serviceIndex] = { ...this.services[serviceIndex], ...serviceData };
        await update(child(dbRef, `services/${serviceId}`), serviceData);
        this.renderCatalog();
        showToast('Servicio actualizado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      showToast('Error al actualizar el servicio', 'error');
    }
  }

  // Método para añadir nuevo servicio desde el panel de admin
  async addService(serviceData) {
    try {
      const serviceId = 'service-' + Date.now();
      const newService = { id: serviceId, ...serviceData };
      
      this.services.push(newService);
      await update(child(dbRef, `services/${serviceId}`), serviceData);
      this.renderCatalog();
      showToast('Servicio añadido correctamente', 'success');
    } catch (error) {
      console.error('Error adding service:', error);
      showToast('Error al añadir el servicio', 'error');
    }
  }

  // Método para eliminar servicio desde el panel de admin
  async deleteService(serviceId) {
    try {
      this.services = this.services.filter(s => s.id !== serviceId);
      await update(child(dbRef, `services/${serviceId}`), null);
      this.renderCatalog();
      showToast('Servicio eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error deleting service:', error);
      showToast('Error al eliminar el servicio', 'error');
    }
  }
}

// Inicializar el gestor de catálogo cuando el DOM esté listo
let catalogManager;
document.addEventListener('DOMContentLoaded', () => {
  catalogManager = new CatalogManager();
});
