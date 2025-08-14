// ===== CACHO6 - APLICACIÓN PRINCIPAL SIMPLIFICADA =====

// Variables globales
let currentSection = 'home';
let isInitialized = false;

// ===== INICIALIZACIÓN PRINCIPAL =====
function initializeApp() {
    if (isInitialized) return;
    
    console.log('🚀 Inicializando CACHO6...');
    
    try {
        // Configurar navegación
        setupNavigation();
        
        // Configurar footer links
        setupFooterLinks();
        
        // Mostrar sección home por defecto
        showSection('home');
        
        // Configurar eventos globales
        setupGlobalEvents();
        
        // Cargar datos demo inmediatamente
        loadAllDemoData();
        
        isInitialized = true;
        console.log('✅ CACHO6 inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
    }
}

// ===== NAVEGACIÓN SIMPLIFICADA =====
function setupNavigation() {
    // Navegación principal
    document.querySelectorAll('.nav-link, a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionName = href.substring(1);
                showSection(sectionName);
            }
        });
    });
    
    // Botones con data-navigate
    document.querySelectorAll('[data-navigate]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const section = button.dataset.navigate;
            if (section) showSection(section);
        });
    });
    
    console.log('✅ Navegación configurada');
}

function showSection(sectionName) {
    console.log(`📍 Mostrando sección: ${sectionName}`);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección solicitada
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // Actualizar navegación activa
        updateActiveNav(sectionName);
        
        // Scroll al top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Cargar datos específicos de la sección
        loadSectionData(sectionName);
        
    } else {
        console.warn(`⚠️ Sección no encontrada: ${sectionName}`);
    }
}

function updateActiveNav(sectionName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`a[href="#${sectionName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function loadSectionData(sectionName) {
    switch(sectionName) {
        case 'catalog':
            loadDemoServices();
            break;
        case 'materials':
            loadDemoMaterials();
            break;
        case 'admin':
            setupBasicAdminPanel();
            break;
    }
}

// ===== DATOS DEMO COMPLETOS =====
function loadAllDemoData() {
    loadDemoServices();
    loadDemoMaterials();
    setupBasicAdminPanel();
    console.log('📦 Todos los datos demo cargados');
}

function loadDemoServices() {
    const servicesGrid = document.getElementById('services-grid');
    if (!servicesGrid) return;
    
    const services = [
        {
            name: 'Impresión PLA Básica',
            price: 25,
            description: 'Perfecto para prototipos y piezas decorativas. Material biodegradable y fácil de imprimir.',
            material: 'PLA',
            technology: 'FDM',
            features: ['Biodegradable', 'Fácil impresión', 'Múltiples colores']
        },
        {
            name: 'Impresión ABS Ingeniería',
            price: 35,
            description: 'Resistente al calor y impactos. Ideal para piezas funcionales y herramientas.',
            material: 'ABS',
            technology: 'FDM',
            features: ['Resistente al calor', 'Alta durabilidad', 'Mecanizable']
        },
        {
            name: 'Impresión PETG Química',
            price: 45,
            description: 'Excelente resistencia química y transparencia. Para aplicaciones médicas y alimentarias.',
            material: 'PETG',
            technology: 'FDM',
            features: ['Transparente', 'Apto alimentario', 'Resistente químicos']
        },
        {
            name: 'TPU Flexible',
            price: 55,
            description: 'Material elastomérico para juntas, carcasas flexibles y productos wearables.',
            material: 'TPU',
            technology: 'FDM',
            features: ['Altamente flexible', 'Resistente desgaste', 'Amortiguación']
        },
        {
            name: 'Resina Alta Precisión',
            price: 65,
            description: 'Máxima precisión y detalles finos. Ideal para joyería, miniaturas y prototipos detallados.',
            material: 'Resina',
            technology: 'SLA',
            features: ['Máxima precisión', 'Detalles finos', 'Acabado liso']
        }
    ];
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card">
            <h3>${service.name}</h3>
            <div class="service-price">$${service.price} USD</div>
            <div class="service-description">${service.description}</div>
            <div class="service-features">
                ${service.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
            </div>
            <div class="service-meta">
                <span class="service-material">${service.material}</span>
                <span class="service-tech">${service.technology}</span>
            </div>
            <div class="service-actions">
                <button class="btn btn-primary">Solicitar Cotización</button>
                <button class="btn btn-outline">Ver Detalles</button>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Servicios cargados');
}

function loadDemoMaterials() {
    const materialsContainer = document.getElementById('materials-container');
    if (!materialsContainer) return;
    
    const materials = [
        {
            name: 'PLA',
            fullName: 'Ácido Poliláctico',
            type: 'Termoplástico biodegradable',
            description: 'Material ideal para principiantes. Biodegradable, fácil de imprimir y con buena calidad superficial.',
            printTemp: '190-220°C',
            bedTemp: '50-70°C',
            density: '1.24 g/cm³',
            advantages: ['Biodegradable y eco-friendly', 'Fácil de imprimir', 'Buena calidad superficial'],
            applications: ['Prototipos conceptuales', 'Objetos decorativos', 'Juguetes educativos'],
            colors: ['Blanco', 'Negro', 'Rojo', 'Azul', 'Verde']
        },
        {
            name: 'ABS',
            fullName: 'Acrilonitrilo Butadieno Estireno',
            type: 'Termoplástico resistente',
            description: 'Material de ingeniería con excelente resistencia mecánica y térmica.',
            printTemp: '220-250°C',
            bedTemp: '80-110°C',
            density: '1.04 g/cm³',
            advantages: ['Alta resistencia al impacto', 'Resistente al calor', 'Mecanizable post-impresión'],
            applications: ['Carcasas electrónicas', 'Herramientas y moldes', 'Piezas automotrices'],
            colors: ['Negro', 'Blanco', 'Gris']
        },
        {
            name: 'PETG',
            fullName: 'Polietileno Tereftalato Glicol',
            type: 'Termoplástico químicamente resistente',
            description: 'Combina la facilidad del PLA con la resistencia del ABS. Transparente y apto para contacto alimentario.',
            printTemp: '220-250°C',
            bedTemp: '70-90°C',
            density: '1.27 g/cm³',
            advantages: ['Transparente', 'Resistencia química', 'Apto para alimentos (FDA)'],
            applications: ['Contenedores alimentarios', 'Dispositivos médicos', 'Paneles transparentes'],
            colors: ['Transparente', 'Blanco', 'Negro']
        },
        {
            name: 'Resina',
            fullName: 'Resina Fotopolimérica',
            type: 'Resina líquida fotocurable',
            description: 'Material para impresión SLA/DLP con máxima precisión y acabado superficial excepcional.',
            printTemp: 'N/A',
            bedTemp: 'N/A',
            density: '1.15 g/cm³',
            advantages: ['Máxima precisión', 'Acabado superficial liso', 'Detalles extremadamente finos'],
            applications: ['Joyería y accesorios', 'Miniaturas detalladas', 'Prototipos de precisión'],
            colors: ['Gris', 'Negro', 'Transparente']
        }
    ];
    
    materialsContainer.innerHTML = materials.map(material => `
        <div class="material-card">
            <div class="material-header">
                <h3>${material.name}</h3>
                <h4>${material.fullName}</h4>
                <p>${material.type}</p>
            </div>
            <div class="material-body">
                <p class="material-description">${material.description}</p>
                
                <div class="material-properties">
                    <div class="property-item">
                        <div class="property-value">${material.printTemp}</div>
                        <div class="property-label">Temp. Extrusión</div>
                    </div>
                    <div class="property-item">
                        <div class="property-value">${material.bedTemp}</div>
                        <div class="property-label">Temp. Cama</div>
                    </div>
                    <div class="property-item">
                        <div class="property-value">${material.density}</div>
                        <div class="property-label">Densidad</div>
                    </div>
                </div>
                
                <div class="material-section">
                    <h5>Ventajas:</h5>
                    <ul>
                        ${material.advantages.map(adv => `<li>${adv}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="material-section">
                    <h5>Aplicaciones:</h5>
                    <ul>
                        ${material.applications.map(app => `<li>${app}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="material-colors">
                    <h5>Colores disponibles:</h5>
                    <div class="color-tags">
                        ${material.colors.map(color => `<span class="color-tag">${color}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Materiales cargados');
}

function setupBasicAdminPanel() {
    const adminTabs = document.querySelectorAll('.tab-button');
    const adminContent = document.getElementById('admin-content');
    
    if (!adminContent) return;
    
    adminTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            adminTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            const tabType = e.currentTarget.dataset.tab;
            showAdminTabContent(tabType);
        });
    });
    
    // Mostrar dashboard por defecto
    showAdminTabContent('dashboard');
    console.log('✅ Panel admin configurado');
}

function showAdminTabContent(tabType) {
    const adminContent = document.getElementById('admin-content');
    if (!adminContent) return;
    
    const content = {
        dashboard: `
            <div class="admin-dashboard">
                <h3><i class="fas fa-chart-line"></i> Dashboard Principal</h3>
                <div class="admin-stats">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                        <div class="stat-info">
                            <div class="stat-number">127</div>
                            <div class="stat-label">Pedidos Totales</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-cog"></i></div>
                        <div class="stat-info">
                            <div class="stat-number">5</div>
                            <div class="stat-label">Servicios Activos</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-flask"></i></div>
                        <div class="stat-info">
                            <div class="stat-number">4</div>
                            <div class="stat-label">Materiales</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-print"></i></div>
                        <div class="stat-info">
                            <div class="stat-number">3</div>
                            <div class="stat-label">Impresoras</div>
                        </div>
                    </div>
                </div>
                <div class="recent-activity">
                    <h4>Actividad Reciente</h4>
                    <div class="activity-list">
                        <div class="activity-item">
                            <i class="fas fa-plus-circle"></i>
                            <span>Nuevo pedido #IMP3D-001 recibido</span>
                            <small>Hace 2 horas</small>
                        </div>
                        <div class="activity-item">
                            <i class="fas fa-check-circle"></i>
                            <span>Pedido #IMP3D-002 completado</span>
                            <small>Hace 4 horas</small>
                        </div>
                        <div class="activity-item">
                            <i class="fas fa-user-plus"></i>
                            <span>Nuevo usuario registrado</span>
                            <small>Hace 6 horas</small>
                        </div>
                    </div>
                </div>
            </div>
        `,
        orders: `
            <div class="admin-orders">
                <h3><i class="fas fa-list-alt"></i> Gestión de Pedidos</h3>
                <div class="orders-summary">
                    <div class="order-status-card pending">
                        <div class="status-count">8</div>
                        <div class="status-label">Pendientes</div>
                    </div>
                    <div class="order-status-card processing">
                        <div class="status-count">15</div>
                        <div class="status-label">En Proceso</div>
                    </div>
                    <div class="order-status-card completed">
                        <div class="status-count">104</div>
                        <div class="status-label">Completados</div>
                    </div>
                </div>
                <div class="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Material</th>
                                <th>Estado</th>
                                <th>Total</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#IMP3D-001</td>
                                <td>Juan Pérez</td>
                                <td>PLA</td>
                                <td><span class="status pending">Pendiente</span></td>
                                <td>$45.00</td>
                                <td><button class="btn btn-sm">Ver</button></td>
                            </tr>
                            <tr>
                                <td>#IMP3D-002</td>
                                <td>María López</td>
                                <td>ABS</td>
                                <td><span class="status processing">En Proceso</span></td>
                                <td>$67.50</td>
                                <td><button class="btn btn-sm">Ver</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `,
        materials: createAdminTabContent('Materiales', 'flask', 'Gestión de materiales disponibles para impresión 3D.'),
        products: createAdminTabContent('Productos 3D', 'cube', 'Catálogo de productos y modelos 3D disponibles.'),
        printers: createAdminTabContent('Impresoras', 'print', 'Estado y configuración de impresoras 3D.'),
        config: createAdminTabContent('Configuración', 'cog', 'Configuración general del sistema y preferencias.')
    };
    
    adminContent.innerHTML = content[tabType] || content.dashboard;
}

function createAdminTabContent(title, icon, description) {
    return `
        <div class="admin-section">
            <h3><i class="fas fa-${icon}"></i> ${title}</h3>
            <p>${description}</p>
            <div class="admin-placeholder">
                <i class="fas fa-${icon} fa-3x"></i>
                <h4>Funcionalidad en Desarrollo</h4>
                <p>Esta sección estará disponible en futuras actualizaciones.</p>
                <button class="btn btn-primary">Notificarme cuando esté listo</button>
            </div>
        </div>
    `;
}

// ===== EVENTOS GLOBALES =====
function setupGlobalEvents() {
    // Contadores animados
    setTimeout(animateCounters, 1000);
    
    // Filtros de catálogo
    setupCatalogFilters();
    
    console.log('✅ Eventos globales configurados');
}

function animateCounters() {
    document.querySelectorAll('[data-count]').forEach(counter => {
        const target = parseInt(counter.dataset.count);
        let current = 0;
        const increment = Math.ceil(target / 50);
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.min(current, target);
                setTimeout(updateCounter, 50);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

function setupCatalogFilters() {
    const filterSelects = document.querySelectorAll('.filter-select');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', applyFilters);
    });
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
}

function applyFilters() {
    const materialFilter = document.getElementById('filter-material')?.value || '';
    const technologyFilter = document.getElementById('filter-technology')?.value || '';
    const finishFilter = document.getElementById('filter-finish')?.value || '';
    
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const materialMatch = !materialFilter || card.querySelector('.service-material')?.textContent.includes(materialFilter);
        const technologyMatch = !technologyFilter || card.querySelector('.service-tech')?.textContent.includes(technologyFilter);
        
        if (materialMatch && technologyMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log('🔍 Filtros aplicados');
}

function clearFilters() {
    document.querySelectorAll('.filter-select').forEach(select => {
        select.value = '';
    });
    
    document.querySelectorAll('.service-card').forEach(card => {
        card.style.display = 'block';
    });
    
    console.log('🧹 Filtros limpiados');
}

// ===== FOOTER LINKS =====
function setupFooterLinks() {
    document.querySelectorAll('.footer a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.getAttribute('href').substring(1);
            showSection(section);
        });
    });
}

// ===== FUNCIONES PÚBLICAS =====
window.showSection = showSection;
window.showAdminSection = function() {
    showSection('admin');
};

// ===== INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
