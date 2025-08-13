/**
 * Tienda3D - Aplicación Principal
 * Maneja la inicialización, navegación y estado global de la aplicación
 */

class Tienda3DApp {
    constructor() {
        this.currentSection = 'home';
        this.isLoading = true;
        this.init();
    }

    async init() {
        try {
            console.log('Iniciando Tienda3D...');
            
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
        } catch (error) {
            console.error('Error inicializando la aplicación:', error);
            this.hideLoadingScreen();
        }
    }

    async initializeApp() {
        try {
            // 1. Configurar navegación
            this.setupNavigation();
            
            // 2. Configurar manejadores de eventos
            this.setupEventHandlers();
            
            // 3. Cargar datos iniciales
            await this.loadInitialData();
            
            // 4. Ocultar pantalla de carga
            this.hideLoadingScreen();
            
            // 5. Mostrar sección inicial
            this.showSection('home');
            
            console.log('Tienda3D inicializada correctamente');
        } catch (error) {
            console.error('Error en initializeApp:', error);
            this.hideLoadingScreen();
            this.showError('Error al cargar la aplicación');
        }
    }

    setupNavigation() {
        // Enlaces de navegación
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Botones de navegación en el contenido
        const navigateButtons = document.querySelectorAll('[data-navigate]');
        navigateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const section = button.dataset.navigate;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Toggle móvil
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    setupEventHandlers() {
        // Cerrar menú móvil al hacer clic fuera
        document.addEventListener('click', (e) => {
            const navMenu = document.getElementById('nav-menu');
            const navToggle = document.getElementById('nav-toggle');
            
            if (navMenu && navToggle && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });

        // Manejar cambios de hash en URL
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.navigateToSection(hash);
            }
        });

        // Animaciones de contadores en la página de inicio
        this.setupCounterAnimations();
    }

    async loadInitialData() {
        try {
            // Simular carga de datos
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Inicializar módulos
            if (typeof MaterialsManager !== 'undefined') {
                window.materialsManager = new MaterialsManager();
                console.log('Sistema de materiales inicializado');
            }
            
            if (typeof CatalogManager !== 'undefined') {
                window.catalogManager = new CatalogManager();
                console.log('Catálogo inicializado');
            }
            
            if (typeof OrderManager !== 'undefined') {
                window.orderManager = new OrderManager();
                console.log('Sistema de pedidos inicializado');
            }
            
            if (typeof TrackingManager !== 'undefined') {
                window.trackingManager = new TrackingManager();
                console.log('Sistema de seguimiento inicializado');
            }
            
            if (typeof AdminManager !== 'undefined') {
                window.adminManager = new AdminManager();
                console.log('Panel de administración inicializado');
            }
            
        } catch (error) {
            console.warn('Error cargando datos iniciales:', error);
        }
    }

    navigateToSection(sectionId) {
        // Ocultar secciones actuales
        const currentSections = document.querySelectorAll('.section.active');
        currentSections.forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar nueva sección
        const newSection = document.getElementById(sectionId);
        if (newSection) {
            newSection.classList.add('active');
            this.currentSection = sectionId;

            // Actualizar navegación activa
            this.updateActiveNavigation(sectionId);

            // Actualizar URL
            window.history.pushState({}, '', `#${sectionId}`);

            // Cerrar menú móvil
            const navMenu = document.getElementById('nav-menu');
            const navToggle = document.getElementById('nav-toggle');
            if (navMenu && navToggle) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }

            // Scroll al top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    updateActiveNavigation(sectionId) {
        // Remover active de todos los enlaces
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));

        // Agregar active al enlace correspondiente
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    showSection(sectionId) {
        this.navigateToSection(sectionId);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                this.isLoading = false;
            }, 300);
        }
    }

    setupCounterAnimations() {
        const observerOptions = {
            threshold: 0.7,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            observer.observe(heroStats);
        }
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const increment = target / 100;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.ceil(current);
                }
            }, 20);
        });
    }

    showError(message) {
        // Crear toast de error
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(toast);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // Método público para navegación desde otros módulos
    navigate(sectionId) {
        this.navigateToSection(sectionId);
    }

    // Método público para obtener la sección actual
    getCurrentSection() {
        return this.currentSection;
    }

    // Método público para verificar si está cargando
    getLoadingState() {
        return this.isLoading;
    }
}

// Inicializar aplicación cuando se carga la página
window.addEventListener('load', () => {
    window.tienda3DApp = new Tienda3DApp();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tienda3DApp;
}
