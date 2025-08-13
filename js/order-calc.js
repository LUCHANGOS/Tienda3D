/**
 * Calculadora de Pedidos Simplificada - Tienda3D
 */
class OrderManager {
    constructor() {
        this.materials = {
            PLA: { cost: 25, colors: ['Blanco', 'Negro', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Transparente'] },
            ABS: { cost: 30, colors: ['Blanco', 'Negro', 'Rojo', 'Azul', 'Verde'] },
            PETG: { cost: 35, colors: ['Transparente', 'Blanco', 'Negro', 'Azul'] },
            TPU: { cost: 50, colors: ['Negro', 'Transparente', 'Rojo'] },
            Resina: { cost: 80, colors: ['Gris', 'Transparente', 'Negro', 'Blanco'] }
        };

        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            this.setupMaterialSelect();
            this.setupCalculator();
            this.setupFileUpload();
            this.initialized = true;
            console.log('OrderManager inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando OrderManager:', error);
        }
    }

    setupMaterialSelect() {
        const materialSelect = document.getElementById('material_select');
        if (materialSelect) {
            // Limpiar opciones existentes excepto la primera
            while (materialSelect.children.length > 1) {
                materialSelect.removeChild(materialSelect.lastChild);
            }

            // Agregar opciones de materiales
            Object.keys(this.materials).forEach(material => {
                const option = document.createElement('option');
                option.value = material;
                option.textContent = `${material} - $${this.materials[material].cost}/kg`;
                materialSelect.appendChild(option);
            });

            // Event listener para cambio de material
            materialSelect.addEventListener('change', (e) => {
                this.updateColorOptions(e.target.value);
                this.calculateCost();
            });
        }
    }

    updateColorOptions(materialType) {
        const colorSelect = document.getElementById('color_select');
        if (!colorSelect || !materialType) return;

        colorSelect.disabled = false;
        colorSelect.innerHTML = '<option value="">Seleccionar color...</option>';

        if (this.materials[materialType]) {
            this.materials[materialType].colors.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                colorSelect.appendChild(option);
            });
        }
    }

    setupCalculator() {
        // Botón de calcular costo
        const calculateBtn = document.getElementById('calculate-cost');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculateCost();
            });
        }

        // Campos que afectan el cálculo
        const calcFields = [
            'estimated_weight',
            'estimated_time',
            'layer_height',
            'infill',
            'finish_select'
        ];

        calcFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', () => {
                    this.calculateCost();
                });
            }
        });
    }

    calculateCost() {
        const material = document.getElementById('material_select')?.value;
        const weight = parseFloat(document.getElementById('estimated_weight')?.value) || 0;
        const time = parseFloat(document.getElementById('estimated_time')?.value) || 0;
        const finish = document.getElementById('finish_select')?.value || 'basico';

        if (!material || !weight) {
            this.resetCostDisplay();
            return;
        }

        // Costo de material
        const materialCost = (this.materials[material].cost * weight) / 1000; // Convertir gramos a kg

        // Costo de energía (estimado)
        const energyCost = time * 150; // CLP por hora

        // Costo de mantenimiento
        const maintenanceCost = time * 100; // CLP por hora

        // Costo de postproceso
        const postProcessCosts = {
            basico: 0,
            lijado: 2500,
            pintura: 5000,
            uv: 3000
        };
        const postProcessCost = postProcessCosts[finish] || 0;

        // Costo logístico fijo
        const logisticsCost = 2500;

        // Actualizar UI
        this.updateCostDisplay({
            material: materialCost,
            energy: energyCost,
            maintenance: maintenanceCost,
            postprocess: postProcessCost,
            logistics: logisticsCost
        });
    }

    updateCostDisplay(costs) {
        const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

        // Actualizar elementos del DOM
        document.getElementById('cost-material').textContent = `$${costs.material.toFixed(0)}`;
        document.getElementById('cost-energy').textContent = `$${costs.energy.toFixed(0)}`;
        document.getElementById('cost-maintenance').textContent = `$${costs.maintenance.toFixed(0)}`;
        document.getElementById('cost-postprocess').textContent = `$${costs.postprocess.toFixed(0)}`;
        document.getElementById('cost-logistics').textContent = `$${costs.logistics.toFixed(0)}`;
        document.getElementById('cost-total').textContent = `$${total.toFixed(0)}`;

        // Habilitar botón de envío si hay costo calculado
        const submitBtn = document.querySelector('#order-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = total <= 0;
        }
    }

    resetCostDisplay() {
        const costElements = [
            'cost-material',
            'cost-energy', 
            'cost-maintenance',
            'cost-postprocess',
            'cost-logistics',
            'cost-total'
        ];

        costElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '$0';
            }
        });

        const submitBtn = document.querySelector('#order-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }

    setupFileUpload() {
        const fileUpload = document.getElementById('file-upload');
        const fileInput = document.getElementById('file-input');
        const btnLink = fileUpload?.querySelector('.btn-link');

        if (btnLink) {
            btnLink.addEventListener('click', (e) => {
                e.preventDefault();
                fileInput?.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }

        // Drag and drop
        if (fileUpload) {
            fileUpload.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUpload.classList.add('dragover');
            });

            fileUpload.addEventListener('dragleave', () => {
                fileUpload.classList.remove('dragover');
            });

            fileUpload.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUpload.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFileUpload(file);
                }
            });
        }
    }

    handleFileUpload(file) {
        const filePreview = document.getElementById('file-preview');
        const allowedTypes = ['.stl', '.obj', '.3mf'];
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(fileExt)) {
            this.showToast('Tipo de archivo no permitido. Use STL, OBJ o 3MF', 'error');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB
            this.showToast('Archivo demasiado grande. Máximo 50MB', 'error');
            return;
        }

        // Mostrar preview del archivo
        if (filePreview) {
            filePreview.classList.remove('hidden');
            filePreview.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-code"></i>
                    <div>
                        <strong>${file.name}</strong>
                        <span>${this.formatFileSize(file.size)}</span>
                    </div>
                    <button type="button" onclick="this.parentElement.parentElement.classList.add('hidden')" class="btn-remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Estimar peso basado en el tamaño del archivo (muy aproximado)
            const estimatedWeight = Math.max(10, file.size / 10000); // Estimación muy básica
            const weightInput = document.getElementById('estimated_weight');
            if (weightInput && !weightInput.value) {
                weightInput.value = estimatedWeight.toFixed(0);
            }

            this.showToast('Archivo cargado correctamente', 'success');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}

// Inicializar cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.orderManager === 'undefined') {
        window.orderManager = new OrderManager();
    }
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrderManager;
}
