// Utilidades generales para Tienda3D
// Funciones reutilizables y helpers

/**
 * Debounce function para optimizar eventos
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

/**
 * Throttle function para scroll/resize events
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Validar email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validar archivo de impresión 3D
 */
function isValidPrintFile(file) {
  if (!file) return false;
  
  const allowedTypes = ['.stl', '.obj', '.3mf'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension) && file.size <= maxSize;
}

/**
 * Formatear tamaño de archivo
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Capitalizar primera letra
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generar ID único
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Crear elemento HTML desde string
 */
function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

/**
 * Mostrar/ocultar elemento con animación
 */
function toggleElement(element, show) {
  if (!element) return;
  
  if (show) {
    element.classList.remove('hidden');
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    requestAnimationFrame(() => {
      element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  } else {
    element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      element.classList.add('hidden');
    }, 300);
  }
}

/**
 * Sistema de notificaciones toast
 */
const Toast = {
  container: null,
  
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  
  show(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();
    
    const toastId = generateId();
    const iconMap = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    const toast = createElementFromHTML(`
      <div class="toast toast-${type}" id="toast-${toastId}">
        <div class="toast-content">
          <i class="${iconMap[type] || iconMap.info}"></i>
          <span>${message}</span>
        </div>
        <button class="toast-close" onclick="Toast.close('${toastId}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `);
    
    this.container.appendChild(toast);
    
    // Animación de entrada
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });
    
    // Auto-close
    if (duration > 0) {
      setTimeout(() => this.close(toastId), duration);
    }
    
    return toastId;
  },
  
  close(toastId) {
    const toast = document.getElementById(`toast-${toastId}`);
    if (toast) {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  },
  
  success(message, duration) { return this.show(message, 'success', duration); },
  error(message, duration) { return this.show(message, 'error', duration); },
  warning(message, duration) { return this.show(message, 'warning', duration); },
  info(message, duration) { return this.show(message, 'info', duration); }
};

/**
 * Sistema de modales
 */
const Modal = {
  container: null,
  
  init() {
    this.container = document.getElementById('modal-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'modal-container';
      this.container.className = 'modal-container';
      document.body.appendChild(this.container);
    }
  },
  
  show(content, options = {}) {
    if (!this.container) this.init();
    
    const {
      title = '',
      size = 'medium',
      closable = true,
      backdrop = true
    } = options;
    
    const modalId = generateId();
    
    const modal = createElementFromHTML(`
      <div class="modal-backdrop" id="modal-backdrop-${modalId}">
        <div class="modal modal-${size}" id="modal-${modalId}">
          ${title ? `
            <div class="modal-header">
              <h3>${title}</h3>
              ${closable ? `<button class="modal-close" onclick="Modal.close('${modalId}')">
                <i class="fas fa-times"></i>
              </button>` : ''}
            </div>
          ` : ''}
          <div class="modal-body">
            ${content}
          </div>
        </div>
      </div>
    `);
    
    // Cerrar con backdrop si está habilitado
    if (backdrop && closable) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close(modalId);
        }
      });
    }
    
    this.container.appendChild(modal);
    
    // Animación de entrada
    requestAnimationFrame(() => {
      modal.classList.add('modal-show');
    });
    
    return modalId;
  },
  
  close(modalId) {
    const modal = document.getElementById(`modal-backdrop-${modalId}`);
    if (modal) {
      modal.classList.remove('modal-show');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 300);
    }
  },
  
  confirm(message, title = '¿Estás seguro?') {
    return new Promise((resolve) => {
      const modalContent = `
        <div class="confirm-modal">
          <p>${message}</p>
          <div class="confirm-buttons">
            <button class="btn btn-secondary" onclick="confirmResolve(false)">Cancelar</button>
            <button class="btn btn-danger" onclick="confirmResolve(true)">Confirmar</button>
          </div>
        </div>
      `;
      
      // Función global temporal para resolver la promesa
      window.confirmResolve = (result) => {
        resolve(result);
        delete window.confirmResolve;
        this.close(window.currentConfirmModal);
        delete window.currentConfirmModal;
      };
      
      window.currentConfirmModal = this.show(modalContent, { 
        title, 
        size: 'small',
        backdrop: false 
      });
    });
  }
};

/**
 * Animar contador numérico
 */
function animateNumber(element, start, end, duration = 1000) {
  if (!element) return;
  
  const startTime = performance.now();
  const difference = end - start;
  
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    
    const current = start + (difference * easedProgress);
    element.textContent = Math.round(current);
    
    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }
  
  requestAnimationFrame(updateNumber);
}

/**
 * Copiar texto al portapapeles
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    Toast.success('Copiado al portapapeles');
    return true;
  } catch (err) {
    // Fallback para navegadores antiguos
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      Toast.success('Copiado al portapapeles');
      return true;
    } catch (fallbackErr) {
      Toast.error('Error al copiar');
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Detectar si un elemento está visible en el viewport
 */
function isInViewport(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Lazy loading de imágenes
 */
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback para navegadores que no soportan IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazy');
    });
  }
}

/**
 * Helpers para elementos DOM
 */
const DOM = {
  // Buscar elemento con error handling
  $(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (e) {
      console.warn('Invalid selector:', selector);
      return null;
    }
  },
  
  // Buscar múltiples elementos
  $$(selector, context = document) {
    try {
      return Array.from(context.querySelectorAll(selector));
    } catch (e) {
      console.warn('Invalid selector:', selector);
      return [];
    }
  },
  
  // Mostrar elemento
  show(element) {
    if (element) element.classList.remove('hidden');
  },
  
  // Ocultar elemento
  hide(element) {
    if (element) element.classList.add('hidden');
  },
  
  // Toggle visibilidad
  toggle(element, force) {
    if (!element) return;
    if (force !== undefined) {
      element.classList.toggle('hidden', !force);
    } else {
      element.classList.toggle('hidden');
    }
  },
  
  // Agregar clase
  addClass(element, className) {
    if (element) element.classList.add(className);
  },
  
  // Remover clase
  removeClass(element, className) {
    if (element) element.classList.remove(className);
  },
  
  // Toggle clase
  toggleClass(element, className, force) {
    if (element) element.classList.toggle(className, force);
  },
  
  // Verificar si tiene clase
  hasClass(element, className) {
    return element ? element.classList.contains(className) : false;
  },
  
  // Remover elemento del DOM
  remove(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },
  
  // Vaciar contenido
  empty(element) {
    if (element) element.innerHTML = '';
  },
  
  // Crear elemento
  create(tag, attrs = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.keys(attrs).forEach(key => {
      if (key === 'className') {
        element.className = attrs[key];
      } else if (key === 'innerHTML') {
        element.innerHTML = attrs[key];
      } else {
        element.setAttribute(key, attrs[key]);
      }
    });
    
    if (content) element.innerHTML = content;
    return element;
  }
};

/**
 * Validadores de formulario
 */
const Validators = {
  required(value) {
    return value != null && value.toString().trim() !== '';
  },
  
  email(value) {
    return isValidEmail(value);
  },
  
  minLength(value, min) {
    return value && value.length >= min;
  },
  
  maxLength(value, max) {
    return value && value.length <= max;
  },
  
  number(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },
  
  positiveNumber(value) {
    return this.number(value) && parseFloat(value) > 0;
  },
  
  phone(value) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },
  
  file(file, options = {}) {
    if (!file) return false;
    
    const { maxSize = Infinity, allowedTypes = [] } = options;
    
    if (file.size > maxSize) return false;
    
    if (allowedTypes.length > 0) {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(extension)) return false;
    }
    
    return true;
  }
};

/**
 * Helpers para fechas
 */
const DateUtils = {
  format(date, locale = 'es-CL') {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  },
  
  formatDateTime(date, locale = 'es-CL') {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  },
  
  timeAgo(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'hace un momento';
  },
  
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  isToday(date) {
    const d = date instanceof Date ? date : new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }
};

/**
 * Inicializar utilidades cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar lazy loading
  initLazyLoading();
  
  // Inicializar Toast
  Toast.init();
  
  // Inicializar Modal
  Modal.init();
});

// Exportar para uso global
window.debounce = debounce;
window.throttle = throttle;
window.isValidEmail = isValidEmail;
window.isValidPrintFile = isValidPrintFile;
window.formatFileSize = formatFileSize;
window.capitalize = capitalize;
window.generateId = generateId;
window.createElementFromHTML = createElementFromHTML;
window.toggleElement = toggleElement;
window.animateNumber = animateNumber;
window.copyToClipboard = copyToClipboard;
window.isInViewport = isInViewport;
window.initLazyLoading = initLazyLoading;
window.Toast = Toast;
window.Modal = Modal;
window.DOM = DOM;
window.Validators = Validators;
window.DateUtils = DateUtils;
