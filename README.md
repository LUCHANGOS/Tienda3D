# 🖨️ Tienda3D - Plataforma Didáctica de Servicios de Impresión 3D

Una aplicación web progresiva (PWA) completa para servicios de impresión 3D, diseñada con fines didácticos para demostrar tecnologías web modernas.

## 🚀 Características Principales

### ✨ Funcionalidades Core
- **Catálogo de Servicios**: Navegación y filtrado de servicios de impresión 3D
- **Sistema de Pedidos**: Formulario completo con calculadora de precios en tiempo real
- **Seguimiento de Pedidos**: Timeline interactivo con actualizaciones de estado
- **Panel de Administración**: Gestión completa de pedidos, servicios y estadísticas
- **PWA Completa**: Instalable, funciona offline, notificaciones push

### 🎨 Diseño y UX
- **Diseño Responsivo**: Optimizado para móviles, tablets y escritorio
- **Tema Claro/Oscuro**: Cambio automático basado en preferencias del sistema
- **Animaciones Fluidas**: Transiciones suaves y feedback visual
- **Interfaz Intuitiva**: Navegación SPA sin recargas de página

### 🔧 Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Firebase Realtime Database
- **PWA**: Service Workers, Web App Manifest
- **Estilos**: CSS Grid, Flexbox, Custom Properties
- **Iconos**: Font Awesome

## 📁 Estructura del Proyecto

```
tienda3d/
├── index.html              # Página principal SPA
├── manifest.json           # Manifiesto PWA
├── sw.js                   # Service Worker
├── css/
│   └── styles.css          # Estilos principales con temas
├── js/
│   ├── app.js              # Aplicación principal y navegación
│   ├── firebase-config.js  # Configuración de Firebase
│   ├── utils.js            # Utilidades y funciones helper
│   ├── theme-manager.js    # Gestor de temas claro/oscuro
│   ├── catalog.js          # Gestión del catálogo de servicios
│   ├── orders.js           # Sistema de pedidos y calculadora
│   ├── tracking.js         # Seguimiento de pedidos con timeline
│   └── admin.js            # Panel de administración completo
└── README.md               # Documentación del proyecto
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Servidor web local (Live Server, http-server, etc.)
- Cuenta de Firebase (opcional para producción)
- Navegador moderno con soporte para PWA

### Configuración Rápida

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/tienda3d.git
   cd tienda3d
   ```

2. **Configurar Firebase** (opcional)
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilitar Realtime Database
   - Actualizar `js/firebase-config.js` con tus credenciales:
   ```javascript
   const firebaseConfig = {
     apiKey: "tu-api-key",
     authDomain: "tu-proyecto.firebaseapp.com",
     databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com/",
     projectId: "tu-proyecto-id",
     // ... resto de configuración
   };
   ```

3. **Servir la aplicación**
   ```bash
   # Con http-server (npm install -g http-server)
   http-server -p 3000
   
   # Con Python
   python -m http.server 3000
   
   # Con Live Server (VS Code extension)
   # Clic derecho en index.html > "Open with Live Server"
   ```

4. **Acceder a la aplicación**
   - Abrir `http://localhost:3000`
   - Para PWA: usar HTTPS o localhost

## 🖥️ Uso de la Aplicación

### Para Clientes
1. **Explorar Catálogo**: Navegar por servicios disponibles
2. **Hacer Pedido**: Completar formulario con archivos 3D
3. **Seguir Pedido**: Introducir código de seguimiento
4. **Ver Progreso**: Timeline detallado del estado

### Para Administradores
1. **Acceder al Panel**: Click en el logo para acceso admin
2. **Código de Acceso**: `ADMIN123` (cambiar en producción)
3. **Gestionar Pedidos**: Ver, editar y actualizar estados
4. **Administrar Servicios**: Crear, modificar y eliminar servicios
5. **Ver Estadísticas**: Dashboard con métricas y gráficos

## 🎯 Funcionalidades Destacadas

### 📱 Progressive Web App (PWA)
- **Instalación**: Botón "Instalar App" en navegadores compatibles
- **Offline**: Funciona sin conexión gracias al Service Worker
- **Notificaciones**: Push notifications para actualizaciones de pedidos
- **Shortcuts**: Accesos rápidos desde el icono de la app

### 🎨 Sistema de Temas
- **Auto-detección**: Respeta preferencias del sistema operativo
- **Persistencia**: Recuerda la selección del usuario
- **Transiciones**: Cambios suaves entre temas
- **Soporte completo**: Todos los componentes adaptados

### 💡 Características Técnicas
- **SPA Navigation**: Navegación sin recargas con History API
- **File Upload**: Drag & drop para archivos 3D
- **Real-time Pricing**: Calculadora de precios dinámica
- **Form Validation**: Validación completa de formularios
- **Responsive Design**: Mobile-first approach

## 🔧 Desarrollo y Personalización

### Añadir Nuevos Servicios
```javascript
// En catalog.js
const nuevoServicio = {
  id: 'mi-servicio',
  name: 'Mi Nuevo Servicio',
  description: 'Descripción del servicio...',
  price: 25,
  unit: 'por hora',
  category: 'printing',
  icon: '🔧'
};
```

### Personalizar Colores
```css
/* En styles.css */
:root {
  --primary-600: #tu-color-principal;
  --success: #tu-color-exito;
  --warning: #tu-color-advertencia;
}
```

### Configurar Firebase
```javascript
// En firebase-config.js
const firebaseConfig = {
  // Tu configuración de Firebase
};
```

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Estructura HTML responsive
- [x] Sistema de estilos con temas
- [x] Navegación SPA
- [x] Catálogo con filtros
- [x] Sistema de pedidos completo
- [x] Seguimiento con timeline
- [x] Panel de administración
- [x] PWA con Service Worker
- [x] Firebase integration

### 🔄 En Desarrollo (Futuras Mejoras)
- [ ] Sistema de autenticación real
- [ ] Pasarela de pagos
- [ ] Chat en vivo
- [ ] Notificaciones por email
- [ ] Sistema de reviews
- [ ] Multi-idioma

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la [Licencia MIT](LICENSE).

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 Email: soporte@tienda3d.com
- 💬 Issues: [GitHub Issues](https://github.com/tu-usuario/tienda3d/issues)
- 📱 WhatsApp: +34 600 123 456

## 🙏 Agradecimientos

- [Firebase](https://firebase.google.com/) por el backend
- [Font Awesome](https://fontawesome.com/) por los iconos
- [MDN Web Docs](https://developer.mozilla.org/) por la documentación
- Comunidad de desarrolladores por la inspiración

---

**Hecho con ❤️ para la comunidad educativa y de desarrollo web**

### 📈 Estadísticas del Proyecto
- **Líneas de código**: ~3,500
- **Archivos**: 12
- **Componentes**: 6 principales
- **Temas**: 2 (claro/oscuro)
- **Dispositivos soportados**: Móvil, Tablet, Escritorio
