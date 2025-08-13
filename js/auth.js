/**
 * Sistema de Autenticación - Tienda3D
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        this.setupAuthButton();
        this.checkStoredAuth();
        console.log('AuthManager inicializado');
    }

    setupAuthButton() {
        const authButton = document.getElementById('auth-button');
        if (authButton) {
            authButton.addEventListener('click', () => {
                if (this.currentUser) {
                    this.logout();
                } else {
                    this.showLoginModal();
                }
            });
        }
    }

    checkStoredAuth() {
        const storedUser = sessionStorage.getItem('currentUser');
        const adminCode = sessionStorage.getItem('adminCode');
        
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.updateAuthUI();
        }
        
        if (adminCode === 'ADMIN123') {
            this.isAdmin = true;
        }
    }

    showLoginModal() {
        const modalHTML = `
            <div class="modal-overlay" id="login-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-sign-in-alt"></i> Iniciar Sesión</h3>
                        <button class="close-btn" onclick="authManager.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="login-form">
                            <div class="form-group">
                                <label for="login-email">Email:</label>
                                <input type="email" id="login-email" required>
                            </div>
                            <div class="form-group">
                                <label for="login-password">Contraseña:</label>
                                <input type="password" id="login-password" required>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-sign-in-alt"></i>
                                    Iniciar Sesión
                                </button>
                                <button type="button" class="btn btn-secondary" onclick="authManager.closeModal()">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                        
                        <div class="admin-access">
                            <hr>
                            <h4>Acceso de Administrador</h4>
                            <div class="form-group">
                                <label for="admin-code">Código de Admin:</label>
                                <input type="password" id="admin-code" placeholder="Código especial">
                                <button type="button" class="btn btn-warning" onclick="authManager.loginAsAdmin()">
                                    <i class="fas fa-user-shield"></i>
                                    Acceso Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
    }

    closeModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.remove();
        }
    }

    login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Simulación de login (en producción usar Firebase Auth)
        if (email && password) {
            this.currentUser = {
                email: email,
                name: email.split('@')[0],
                loginTime: new Date().toISOString()
            };

            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateAuthUI();
            this.closeModal();
            this.showToast('Sesión iniciada correctamente', 'success');
        } else {
            this.showToast('Por favor completa todos los campos', 'error');
        }
    }

    loginAsAdmin() {
        const adminCode = document.getElementById('admin-code').value;
        
        if (adminCode === 'ADMIN123') {
            this.isAdmin = true;
            sessionStorage.setItem('adminCode', adminCode);
            
            this.currentUser = {
                email: 'admin@tienda3d.com',
                name: 'Administrador',
                isAdmin: true,
                loginTime: new Date().toISOString()
            };
            
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateAuthUI();
            this.closeModal();
            this.showToast('Acceso de administrador concedido', 'success');
            
            // Navegar automáticamente al panel admin
            setTimeout(() => {
                if (window.tienda3DApp) {
                    window.tienda3DApp.navigateToSection('admin');
                }
            }, 1000);
        } else {
            this.showToast('Código de administrador incorrecto', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.isAdmin = false;
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('adminCode');
        this.updateAuthUI();
        this.showToast('Sesión cerrada', 'info');
        
        // Si estaba en admin, volver a inicio
        if (window.tienda3DApp && window.tienda3DApp.getCurrentSection() === 'admin') {
            window.tienda3DApp.navigateToSection('home');
        }
    }

    updateAuthUI() {
        const authButton = document.getElementById('auth-button');
        if (authButton) {
            if (this.currentUser) {
                authButton.innerHTML = `
                    <i class="fas fa-user-check"></i>
                    <span>${this.currentUser.name}</span>
                `;
                authButton.title = 'Cerrar sesión';
            } else {
                authButton.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span>Iniciar Sesión</span>
                `;
                authButton.title = 'Iniciar sesión';
            }
        }
    }

    showToast(message, type = 'info') {
        // Crear toast notification
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Agregar estilos inline básicos si no hay CSS
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getToastColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Auto remover después de 3 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getToastColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    // Métodos públicos para verificar estado
    isAuthenticated() {
        return this.currentUser !== null;
    }

    isUserAdmin() {
        return this.isAdmin && this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Inicializar cuando se carga la página
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    window.authManager = authManager;
});

// Función global para mostrar admin (actualizada para usar auth)
function showAdminSection() {
    if (!authManager) {
        authManager = new AuthManager();
        window.authManager = authManager;
    }
    
    if (authManager.isUserAdmin()) {
        // Usuario ya autenticado como admin
        if (window.tienda3DApp) {
            window.tienda3DApp.navigateToSection('admin');
        }
        
        if (window.initializeAdminPanel) {
            window.initializeAdminPanel();
        }
    } else {
        // Mostrar modal de login con enfoque en admin
        authManager.showLoginModal();
        // Focus en el campo admin
        setTimeout(() => {
            const adminCode = document.getElementById('admin-code');
            if (adminCode) {
                adminCode.focus();
            }
        }, 100);
    }
}
