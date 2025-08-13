/**
 * Gestor de Materiales Didácticos - Tienda3D
 * Maneja la información educativa sobre materiales de impresión 3D
 */

class MaterialsManager {
    constructor() {
        this.materials = [];
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            this.loadMaterialsData();
            this.renderMaterials();
            this.initialized = true;
            console.log('MaterialsManager inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando MaterialsManager:', error);
        }
    }

    loadMaterialsData() {
        this.materials = [
            {
                id: 'pla',
                name: 'PLA',
                fullName: 'Ácido Poliláctico',
                category: 'Termoplástico',
                difficulty: 'Fácil',
                color: '#4CAF50',
                icon: 'fas fa-leaf',
                description: 'Material biodegradable ideal para principiantes. Fácil de imprimir con excelente calidad de superficie.',
                properties: {
                    temperature: {
                        printing: '190-220°C',
                        bed: '50-70°C',
                        glass: '60-65°C'
                    },
                    mechanical: {
                        tensile: '50 MPa',
                        flexural: '80 MPa',
                        impact: '2.5 kJ/m²'
                    },
                    physical: {
                        density: '1.24 g/cm³',
                        shrinkage: '0.3-0.5%',
                        hardness: '83 Shore D'
                    }
                },
                advantages: [
                    'Biodegradable y ecológico',
                    'Muy fácil de imprimir',
                    'Excelente calidad superficial',
                    'Amplia gama de colores',
                    'Bajo warping',
                    'Sin olores tóxicos'
                ],
                limitations: [
                    'Baja resistencia al calor (60°C)',
                    'Frágil bajo impacto',
                    'Se degrada con UV prolongada',
                    'No apto para piezas mecánicas exigentes'
                ],
                applications: [
                    'Prototipos y maquetas',
                    'Objetos decorativos',
                    'Juguetes y figuras',
                    'Contenedores no críticos',
                    'Arte y escultura',
                    'Educación y aprendizaje'
                ],
                tips: [
                    'Usar cama caliente entre 50-70°C',
                    'Velocidad moderada (40-60 mm/s)',
                    'Torre de enfriamiento recomendada',
                    'Almacenar en lugar seco'
                ],
                cost: 25,
                availability: 'Alta'
            },
            {
                id: 'abs',
                name: 'ABS',
                fullName: 'Acrilonitrilo Butadieno Estireno',
                category: 'Termoplástico',
                difficulty: 'Intermedio',
                color: '#FF9800',
                icon: 'fas fa-tools',
                description: 'Material resistente y duradero, ideal para piezas funcionales que requieren resistencia mecánica y térmica.',
                properties: {
                    temperature: {
                        printing: '220-260°C',
                        bed: '80-110°C',
                        glass: '105-110°C'
                    },
                    mechanical: {
                        tensile: '40 MPa',
                        flexural: '70 MPa',
                        impact: '15 kJ/m²'
                    },
                    physical: {
                        density: '1.04 g/cm³',
                        shrinkage: '0.7-0.8%',
                        hardness: '109 Shore D'
                    }
                },
                advantages: [
                    'Alta resistencia al impacto',
                    'Buena resistencia térmica (80-100°C)',
                    'Soldable y mecanizable',
                    'Resistente a químicos',
                    'Reciclable',
                    'Flexible y duradero'
                ],
                limitations: [
                    'Requiere cama caliente obligatoria',
                    'Propenso al warping',
                    'Genera vapores durante impresión',
                    'Más difícil de imprimir que PLA',
                    'Adhesión entre capas crítica'
                ],
                applications: [
                    'Piezas mecánicas',
                    'Carcasas electrónicas',
                    'Herramientas y utillaje',
                    'Componentes automotrices',
                    'Juguetes resistentes (LEGO)',
                    'Prototipos funcionales'
                ],
                tips: [
                    'Impresora cerrada recomendada',
                    'Usar acetona para post-procesado',
                    'Velocidad lenta (30-40 mm/s)',
                    'Buen sistema de extracción',
                    'Cama muy bien nivelada'
                ],
                cost: 30,
                availability: 'Alta'
            },
            {
                id: 'petg',
                name: 'PETG',
                fullName: 'Polietileno Tereftalato Glicol',
                category: 'Termoplástico',
                difficulty: 'Fácil-Intermedio',
                color: '#2196F3',
                icon: 'fas fa-gem',
                description: 'Combina lo mejor del PLA y ABS. Transparente, resistente químicamente y fácil de imprimir.',
                properties: {
                    temperature: {
                        printing: '220-250°C',
                        bed: '70-80°C',
                        glass: '75-80°C'
                    },
                    mechanical: {
                        tensile: '50 MPa',
                        flexural: '70 MPa',
                        impact: '8 kJ/m²'
                    },
                    physical: {
                        density: '1.27 g/cm³',
                        shrinkage: '0.2%',
                        hardness: '85 Shore D'
                    }
                },
                advantages: [
                    'Transparencia cristalina',
                    'Excelente resistencia química',
                    'Apto para contacto alimentario',
                    'Fácil de imprimir',
                    'Sin warping significativo',
                    'Reciclable'
                ],
                limitations: [
                    'Más caro que PLA/ABS',
                    'Puede ser pegajoso durante impresión',
                    'Sensible a retracción excesiva',
                    'Rayado superficial visible'
                ],
                applications: [
                    'Contenedores alimentarios',
                    'Prototipos transparentes',
                    'Piezas químicamente resistentes',
                    'Componentes médicos',
                    'Pantallas protectoras',
                    'Botellas y recipientes'
                ],
                tips: [
                    'Retracción mínima (1-2mm)',
                    'Velocidad moderada (45-55 mm/s)',
                    'Enfriamiento gradual',
                    'Superficie de impresión limpia'
                ],
                cost: 35,
                availability: 'Media'
            },
            {
                id: 'tpu',
                name: 'TPU',
                fullName: 'Poliuretano Termoplástico',
                category: 'Elastómero',
                difficulty: 'Difícil',
                color: '#E91E63',
                icon: 'fas fa-hand-paper',
                description: 'Material flexible y elástico, ideal para piezas que requieren flexibilidad y absorción de impactos.',
                properties: {
                    temperature: {
                        printing: '210-230°C',
                        bed: '40-60°C',
                        glass: '50-60°C'
                    },
                    mechanical: {
                        tensile: '35 MPa',
                        elongation: '580%',
                        hardness: '95 Shore A'
                    },
                    physical: {
                        density: '1.2 g/cm³',
                        shrinkage: '1.5%',
                        flexibility: 'Alta'
                    }
                },
                advantages: [
                    'Altamente flexible y elástico',
                    'Excelente absorción de impactos',
                    'Resistente a la abrasión',
                    'Químicamente resistente',
                    'Buena adhesión entre capas'
                ],
                limitations: [
                    'Muy difícil de imprimir',
                    'Requiere extrusor directo',
                    'Velocidad de impresión muy lenta',
                    'Soporte problemático',
                    'Retracción compleja'
                ],
                applications: [
                    'Fundas y carcasas flexibles',
                    'Juntas y sellos',
                    'Amortiguadores',
                    'Calzado deportivo',
                    'Piezas de desgaste',
                    'Juguetes flexibles'
                ],
                tips: [
                    'Extrusor directo obligatorio',
                    'Velocidad muy lenta (15-25 mm/s)',
                    'Retracción mínima o nula',
                    'Temperatura constante'
                ],
                cost: 50,
                availability: 'Media'
            },
            {
                id: 'resina',
                name: 'Resina',
                fullName: 'Resina Fotopolimérica',
                category: 'Fotopolímero',
                difficulty: 'Intermedio',
                color: '#9C27B0',
                icon: 'fas fa-microscope',
                description: 'Material para impresión SLA/LCD con altísima precisión. Ideal para detalles finos y miniaturas.',
                properties: {
                    temperature: {
                        printing: 'Temperatura ambiente',
                        curing: 'UV 385-405nm',
                        postcuring: '60-80°C'
                    },
                    mechanical: {
                        tensile: '65 MPa',
                        flexural: '125 MPa',
                        impact: '2.4 kJ/m²'
                    },
                    physical: {
                        density: '1.1-1.3 g/cm³',
                        shrinkage: '2-5%',
                        resolution: '0.01-0.05mm'
                    }
                },
                advantages: [
                    'Altísima precisión y detalle',
                    'Superficie lisa y uniforme',
                    'Ideal para miniaturas',
                    'Variedad de propiedades',
                    'Colores translúcidos disponibles',
                    'Post-procesado versátil'
                ],
                limitations: [
                    'Tóxica antes del curado',
                    'Requiere post-procesado obligatorio',
                    'Frágil comparado con filamentos',
                    'Más cara por volumen',
                    'Requiere ventilación',
                    'Vida útil limitada'
                ],
                applications: [
                    'Miniaturas y figuras',
                    'Joyería y bisutería',
                    'Piezas dentales',
                    'Prototipos de alta precisión',
                    'Modelos arquitectónicos',
                    'Arte y escultura detallada'
                ],
                tips: [
                    'Usar siempre guantes',
                    'Post-curado UV obligatorio',
                    'Limpieza con IPA al 99%',
                    'Ventilación adecuada',
                    'Almacenar en oscuridad'
                ],
                cost: 80,
                availability: 'Media'
            }
        ];
    }

    renderMaterials() {
        const materialsContainer = document.getElementById('materials-container');
        if (!materialsContainer) {
            console.warn('Contenedor de materiales no encontrado');
            return;
        }

        materialsContainer.innerHTML = `
            <div class="materials-grid">
                ${this.materials.map(material => this.renderMaterialCard(material)).join('')}
            </div>
        `;

        // Agregar event listeners para los cards
        this.setupEventListeners();
    }

    renderMaterialCard(material) {
        const difficultyColor = {
            'Fácil': '#4CAF50',
            'Fácil-Intermedio': '#FF9800', 
            'Intermedio': '#FF9800',
            'Difícil': '#F44336'
        };

        return `
            <div class="material-card" data-material-id="${material.id}">
                <div class="material-header" style="background: ${material.color}">
                    <div class="material-icon">
                        <i class="${material.icon}"></i>
                    </div>
                    <div class="material-info">
                        <h3>${material.name}</h3>
                        <p class="material-full-name">${material.fullName}</p>
                        <span class="difficulty-badge" style="background: ${difficultyColor[material.difficulty]}">
                            ${material.difficulty}
                        </span>
                    </div>
                </div>
                
                <div class="material-body">
                    <p class="material-description">${material.description}</p>
                    
                    <div class="material-quick-stats">
                        <div class="stat">
                            <i class="fas fa-thermometer-half"></i>
                            <span>Impresión: ${material.properties.temperature.printing}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-dollar-sign"></i>
                            <span>$${material.cost}/kg</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-chart-bar"></i>
                            <span>${material.availability} disponibilidad</span>
                        </div>
                    </div>
                    
                    <div class="material-highlights">
                        <h4><i class="fas fa-plus-circle text-green"></i> Ventajas</h4>
                        <ul class="advantages-list">
                            ${material.advantages.slice(0, 3).map(adv => `<li>${adv}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="material-actions">
                    <button class="btn btn-primary btn-sm" onclick="materialsManager.showMaterialDetails('${material.id}')">
                        <i class="fas fa-info-circle"></i>
                        Ver Detalles
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="materialsManager.selectMaterialForOrder('${material.id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Usar en Pedido
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Los event listeners se manejan directamente en el HTML con onclick
        // para evitar problemas de timing con el DOM
    }

    showMaterialDetails(materialId) {
        const material = this.materials.find(m => m.id === materialId);
        if (!material) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content material-details-modal">
                <div class="modal-header" style="background: ${material.color}">
                    <h2><i class="${material.icon}"></i> ${material.name} - ${material.fullName}</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="material-details-grid">
                        <div class="details-section">
                            <h3><i class="fas fa-thermometer-half"></i> Temperaturas</h3>
                            <div class="properties-grid">
                                <div class="property">
                                    <strong>Extrusor:</strong> ${material.properties.temperature.printing}
                                </div>
                                <div class="property">
                                    <strong>Cama:</strong> ${material.properties.temperature.bed}
                                </div>
                                ${material.properties.temperature.glass ? 
                                    `<div class="property"><strong>Transición vítrea:</strong> ${material.properties.temperature.glass}</div>` 
                                    : ''}
                            </div>
                        </div>
                        
                        <div class="details-section">
                            <h3><i class="fas fa-cogs"></i> Propiedades Mecánicas</h3>
                            <div class="properties-grid">
                                ${Object.entries(material.properties.mechanical).map(([key, value]) => 
                                    `<div class="property"><strong>${this.getPropertyName(key)}:</strong> ${value}</div>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="details-section">
                            <h3><i class="fas fa-plus-circle text-green"></i> Ventajas</h3>
                            <ul class="detailed-list">
                                ${material.advantages.map(adv => `<li>${adv}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="details-section">
                            <h3><i class="fas fa-exclamation-triangle text-orange"></i> Limitaciones</h3>
                            <ul class="detailed-list">
                                ${material.limitations.map(lim => `<li>${lim}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="details-section full-width">
                            <h3><i class="fas fa-lightbulb"></i> Aplicaciones Típicas</h3>
                            <div class="applications-grid">
                                ${material.applications.map(app => `<span class="application-tag">${app}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="details-section full-width">
                            <h3><i class="fas fa-tips"></i> Consejos de Impresión</h3>
                            <ul class="tips-list">
                                ${material.tips.map(tip => `<li><i class="fas fa-arrow-right"></i> ${tip}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                        Cerrar
                    </button>
                    <button class="btn btn-primary" onclick="materialsManager.selectMaterialForOrder('${material.id}')">
                        <i class="fas fa-shopping-cart"></i>
                        Usar en Pedido
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    selectMaterialForOrder(materialId) {
        // Navegar a la sección de pedidos y pre-seleccionar el material
        if (window.tienda3DApp) {
            window.tienda3DApp.navigate('order');
            
            // Esperar a que se cargue la sección y luego seleccionar el material
            setTimeout(() => {
                const materialSelect = document.getElementById('material_select');
                if (materialSelect) {
                    // Buscar la opción que corresponde al material
                    for (let option of materialSelect.options) {
                        if (option.value.toLowerCase().includes(materialId)) {
                            option.selected = true;
                            // Disparar evento change para actualizar colores
                            materialSelect.dispatchEvent(new Event('change'));
                            break;
                        }
                    }
                }
            }, 500);
        }

        // Cerrar modal si está abierto
        const modal = document.querySelector('.modal.active');
        if (modal) {
            modal.remove();
        }

        // Mostrar toast
        this.showToast(`Material ${this.materials.find(m => m.id === materialId)?.name} seleccionado para pedido`, 'success');
    }

    getPropertyName(key) {
        const names = {
            tensile: 'Tracción',
            flexural: 'Flexión', 
            impact: 'Impacto',
            density: 'Densidad',
            shrinkage: 'Contracción',
            hardness: 'Dureza',
            elongation: 'Elongación',
            flexibility: 'Flexibilidad'
        };
        return names[key] || key;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 4000);
    }

    // Método público para obtener información de un material
    getMaterial(materialId) {
        return this.materials.find(m => m.id === materialId);
    }

    // Método público para obtener todos los materiales
    getAllMaterials() {
        return this.materials;
    }
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.materialsManager = new MaterialsManager();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaterialsManager;
}
