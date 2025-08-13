// Gestor de Temas para Tienda3D
// Maneja el tema claro/oscuro con preferencias del usuario

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    this.storageKey = 'tienda3d-theme';
    
    this.init();
  }
  
  init() {
    // Cargar tema guardado o detectar preferencia del sistema
    this.loadTheme();
    
    // Escuchar cambios en la preferencia del sistema
    this.prefersDarkScheme.addListener((e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    // Configurar toggle button cuando el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupToggleButton();
      });
    } else {
      this.setupToggleButton();
    }
  }
  
  loadTheme() {
    // Prioridad: localStorage > preferencia sistema > light por defecto
    const savedTheme = localStorage.getItem(this.storageKey);
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = this.prefersDarkScheme.matches ? 'dark' : 'light';
    }
    
    this.applyTheme(this.currentTheme);
  }
  
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Tema inválido:', theme);
      return;
    }
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.updateToggleButton();
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Actualizar meta theme-color para navegadores móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
    } else {
      // Crear meta theme-color si no existe
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
      document.head.appendChild(meta);
    }
    
    // Disparar evento personalizado para otros componentes
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme }
    }));
  }
  
  saveTheme(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn('No se pudo guardar el tema:', error);
    }
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  setupToggleButton() {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;
    
    // Configurar evento click
    toggleButton.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // Actualizar icono inicial
    this.updateToggleButton();
  }
  
  updateToggleButton() {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;
    
    const icon = toggleButton.querySelector('i');
    if (!icon) return;
    
    // Actualizar icono según el tema
    icon.className = this.currentTheme === 'light' 
      ? 'fas fa-moon' 
      : 'fas fa-sun';
    
    // Actualizar tooltip
    toggleButton.title = this.currentTheme === 'light' 
      ? 'Cambiar a tema oscuro' 
      : 'Cambiar a tema claro';
  }
  
  // Método público para obtener el tema actual
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  // Método público para verificar si es tema oscuro
  isDark() {
    return this.currentTheme === 'dark';
  }
  
  // Método para resetear al tema del sistema
  resetToSystemTheme() {
    localStorage.removeItem(this.storageKey);
    const systemTheme = this.prefersDarkScheme.matches ? 'dark' : 'light';
    this.setTheme(systemTheme);
  }
}

// Inicializar el gestor de temas inmediatamente para evitar flash
const themeManager = new ThemeManager();

// Exportar para uso global
window.themeManager = themeManager;
