// Configuración de Firebase - Cliente Tienda3D
// Usando Firebase Realtime Database: https://tienda-3d-6f11c-default-rtdb.firebaseio.com/

const firebaseConfig = {
  apiKey: "AIzaSyC2_eqziS2uSYwByFXnaKYK3uqMMg3eTbo",
  authDomain: "tienda-3d-6f11c.firebaseapp.com",
  databaseURL: "https://tienda-3d-6f11c-default-rtdb.firebaseio.com",
  projectId: "tienda-3d-6f11c",
  storageBucket: "tienda-3d-6f11c.appspot.com",
  messagingSenderId: "677607305100",
  appId: "1:677607305100:web:b8a0915b38997db85cf0a9"
};

// Detectar entorno
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar servicios
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Configurar idioma de autenticación
auth.useDeviceLanguage();

// Referencias principales de la base de datos
const dbRefs = {
  materials: database.ref('materials'),
  printers: database.ref('printers'),
  orders: database.ref('orders'),
  orderItems: database.ref('orderItems'),
  orderStatusHistory: database.ref('orderStatusHistory'),
  costBreakdown: database.ref('costBreakdown'),
  orderLookup: database.ref('orderLookup'),
  config: database.ref('config')
};

// Configuraciones por defecto
const DEFAULT_CONFIG = {
  tarifa_kwh: 120, // CLP por kWh
  margen_default: 0.35,
  costo_embalaje: 1500,
  costo_flete: 3000,
  roles_admin: {}
};

// Estados válidos para pedidos
const ORDER_STATES = {
  EN_PROCESO: 'en_proceso',
  DISEÑANDO: 'diseñando', 
  FABRICADO: 'fabricado',
  ENVIADO: 'enviado',
  ENTREGADO: 'entregado'
};

// Mapeo de progreso por estado
const PROGRESS_MAP = {
  [ORDER_STATES.EN_PROCESO]: 20,
  [ORDER_STATES.DISEÑANDO]: 40,
  [ORDER_STATES.FABRICADO]: 70,
  [ORDER_STATES.ENVIADO]: 90,
  [ORDER_STATES.ENTREGADO]: 100
};

// Datos semilla de materiales
const SEED_MATERIALS = {
  pla_premium: {
    nombre: "PLA Premium",
    tipo: "PLA",
    precio_kg: 15000,
    densidad: 1.24,
    colores: {
      blanco: true,
      negro: true,
      azul: true,
      rojo: true,
      verde: true,
      amarillo: true,
      gris: true
    },
    propiedades: {
      temp_boquilla: "190-220°C",
      temp_cama: "0-60°C",
      resistencia: "Baja-Media",
      tolerancias: "±0.1mm",
      facilidad: "Muy Fácil",
      reciclable: true
    },
    usos: [
      "Prototipos rápidos",
      "Modelos decorativos", 
      "Juguetes educativos",
      "Herramientas básicas",
      "Arte y diseño"
    ],
    limitaciones: [
      "No resistente al calor >60°C",
      "Quebradizo en aplicaciones mecánicas",
      "Sensible a UV prolongada"
    ],
    notas: "Material ideal para principiantes. Fácil de imprimir, sin olores fuertes y biodegradable."
  },
  abs_industrial: {
    nombre: "ABS Industrial",
    tipo: "ABS", 
    precio_kg: 18000,
    densidad: 1.04,
    colores: {
      blanco: true,
      negro: true,
      gris: true,
      azul: true
    },
    propiedades: {
      temp_boquilla: "220-250°C",
      temp_cama: "60-100°C",
      resistencia: "Alta",
      tolerancias: "±0.2mm",
      facilidad: "Media",
      reciclable: true
    },
    usos: [
      "Piezas mecánicas",
      "Carcasas electrónicas",
      "Herramientas de uso",
      "Automóvil (interior)",
      "Prototipos funcionales"
    ],
    limitaciones: [
      "Requiere cama caliente",
      "Genera vapores (ventilación)",
      "Puede agrietarse (warping)"
    ],
    notas: "Material resistente para aplicaciones mecánicas. Requiere más experiencia para imprimir correctamente."
  },
  petg_transparente: {
    nombre: "PETG Transparente",
    tipo: "PETG",
    precio_kg: 17000,
    densidad: 1.27,
    colores: {
      transparente: true,
      cristal: true,
      azul_transparente: true,
      verde_transparente: true
    },
    propiedades: {
      temp_boquilla: "220-250°C",
      temp_cama: "70-80°C",
      resistencia: "Media-Alta",
      tolerancias: "±0.1mm",
      facilidad: "Media",
      quimicamente_resistente: true
    },
    usos: [
      "Botellas y recipientes",
      "Protecciones transparentes",
      "Dispositivos médicos",
      "Piezas alimentarias",
      "Vitrinas y displays"
    ],
    limitaciones: [
      "Puede ser pegajoso al imprimir",
      "Sensible a sobreextrusión"
    ],
    notas: "Excelente para aplicaciones que requieren transparencia y resistencia química."
  },
  tpu_flexible: {
    nombre: "TPU Flexible",
    tipo: "TPU",
    precio_kg: 22000,
    densidad: 1.20,
    colores: {
      natural: true,
      negro: true,
      azul: true,
      rojo: true
    },
    propiedades: {
      temp_boquilla: "210-230°C",
      temp_cama: "0-50°C",
      resistencia: "Flexible",
      tolerancias: "±0.3mm",
      facilidad: "Difícil",
      dureza_shore: "85A-95A"
    },
    usos: [
      "Fundas y protectores",
      "Suelas de calzado",
      "Juntas y sellos",
      "Juguetes flexibles",
      "Piezas amortiguación"
    ],
    limitaciones: [
      "Impresión muy lenta",
      "Requiere extrusor directo",
      "Difícil de remover soportes"
    ],
    notas: "Material flexible ideal para aplicaciones que requieren elasticidad. Requiere experiencia avanzada."
  },
  resina_uv: {
    nombre: "Resina UV Standard",
    tipo: "Resina",
    precio_kg: 35000,
    densidad: 1.10,
    colores: {
      gris: true,
      blanco: true,
      negro: true,
      transparente: true,
      verde: true
    },
    propiedades: {
      tecnologia: "SLA/DLP",
      temp_curado: "UV 405nm",
      resistencia: "Media",
      tolerancias: "±0.05mm",
      facilidad: "Media",
      toxica_liquida: true
    },
    usos: [
      "Miniaturas detalladas",
      "Joyería y moldes",
      "Prototipos de precisión",
      "Modelos dentales",
      "Figuras coleccionables"
    ],
    limitaciones: [
      "Requiere postproceso (lavado + curado)",
      "Material tóxico antes del curado",
      "Requiere impresora de resina"
    ],
    notas: "Máxima precisión de detalle. Requiere medidas de seguridad y postproceso obligatorio."
  }
};

// Datos semilla de impresoras
const SEED_PRINTERS = {
  prusa_mk3s: {
    modelo: "Prusa MK3S+",
    tecnologia: "FDM",
    kwh_h: 0.12,
    costo_mant_h: 800,
    volumen_max: "250x210x210mm",
    materiales_compatibles: ["PLA", "ABS", "PETG", "TPU"],
    activo: true,
    caracteristicas: [
      "Auto-nivelación",
      "Detección de filamento",
      "Recuperación de energía",
      "Calidad profesional"
    ]
  },
  ender3_pro: {
    modelo: "Ender 3 Pro",
    tecnologia: "FDM", 
    kwh_h: 0.10,
    costo_mant_h: 600,
    volumen_max: "220x220x250mm",
    materiales_compatibles: ["PLA", "ABS", "PETG"],
    activo: true,
    caracteristicas: [
      "Excelente relación precio/calidad",
      "Comunidad grande",
      "Modificable",
      "Ideal para principiantes"
    ]
  },
  elegoo_mars: {
    modelo: "Elegoo Mars 3",
    tecnologia: "SLA",
    kwh_h: 0.08,
    costo_mant_h: 700,
    volumen_max: "143x89x175mm",
    materiales_compatibles: ["Resina"],
    activo: true,
    caracteristicas: [
      "Ultra alta precisión",
      "Pantalla 4K monocromática",
      "Curado rápido",
      "Ideal para detalles"
    ]
  }
};

// Funciones de utilidad para Firebase
const fbUtils = {
  // Generar código de pedido único
  generateOrderCode() {
    const timestamp = new Date().toISOString().slice(0, 7).replace('-', ''); // YYYYMM
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `IMP3D-${timestamp}-${random}`;
  },

  // Crear lookup key para pedidos
  createLookupKey(code, email) {
    return `${code}:${email}`;
  },

  // Verificar si usuario es admin
  async isAdmin(user) {
    if (!user) return false;
    
    try {
      const snapshot = await dbRefs.config.child('roles_admin').child(user.uid).once('value');
      return snapshot.val() === true;
    } catch (error) {
      console.error('Error verificando admin:', error);
      return false;
    }
  },

  // Cargar configuración del sistema
  async loadConfig() {
    try {
      const snapshot = await dbRefs.config.once('value');
      return snapshot.val() || DEFAULT_CONFIG;
    } catch (error) {
      console.error('Error cargando configuración:', error);
      return DEFAULT_CONFIG;
    }
  },

  // Inicializar datos semilla (solo admin)
  async initSeedData() {
    try {
      console.log('🌱 Inicializando datos semilla...');
      
      // Verificar si ya existen datos
      const materialsSnapshot = await dbRefs.materials.once('value');
      if (materialsSnapshot.exists()) {
        console.log('📦 Los datos ya existen, saltando inicialización');
        return;
      }

      // Inicializar materiales
      await dbRefs.materials.set(SEED_MATERIALS);
      console.log('✅ Materiales inicializados');

      // Inicializar impresoras  
      await dbRefs.printers.set(SEED_PRINTERS);
      console.log('✅ Impresoras inicializadas');

      // Inicializar configuración
      await dbRefs.config.set(DEFAULT_CONFIG);
      console.log('✅ Configuración inicializada');

      console.log('🎉 Datos semilla inicializados correctamente');
      
    } catch (error) {
      console.error('❌ Error inicializando datos semilla:', error);
    }
  },

  // Calcular costo de pedido
  calculateCost(materialData, peso_g, tiempo_h, acabado, config) {
    const material_cost = (peso_g / 1000) * materialData.precio_kg;
    const energia_cost = (tiempo_h * 0.12) * config.tarifa_kwh; // Asumiendo 0.12kWh/h promedio
    const mantenimiento_cost = tiempo_h * 700; // Costo promedio mantenimiento
    
    let postproceso_cost = 0;
    const acabadoCosts = {
      lijado: 2500,
      pintura: 5000, 
      uv: 3000
    };
    if (acabadoCosts[acabado]) {
      postproceso_cost = acabadoCosts[acabado];
    }
    
    const logistica_cost = config.costo_embalaje + config.costo_flete;
    const subtotal = material_cost + energia_cost + mantenimiento_cost + postproceso_cost + logistica_cost;
    const precio_final = Math.round(subtotal * (1 + config.margen_default));

    return {
      material_cost: Math.round(material_cost),
      energia_cost: Math.round(energia_cost),
      mantenimiento_cost: Math.round(mantenimiento_cost),
      postproceso_cost,
      logistica_cost,
      subtotal: Math.round(subtotal),
      precio_sugerido: precio_final,
      margen: config.margen_default
    };
  },

  // Formatear precio en CLP
  formatPrice(amount) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Formatear fecha
  formatDate(date) {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }
};

// Helper para manejar errores de Firebase
const handleFirebaseError = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta', 
    'auth/email-already-in-use': 'Email ya registrado',
    'auth/weak-password': 'Contraseña muy débil',
    'auth/invalid-email': 'Email inválido',
    'permission-denied': 'Sin permisos para esta operación',
    'unavailable': 'Servicio no disponible temporalmente'
  };

  return errorMessages[error.code] || error.message || 'Error desconocido';
};

// Log de inicialización
console.log('🔥 Firebase inicializado');
console.log('📊 RTDB URL:', firebaseConfig.databaseURL);
console.log('🏗️ Ambiente:', isDevelopment ? 'Desarrollo' : 'Producción');

// Exportar para uso global
window.firebase = firebase;
window.auth = auth;
window.database = database;
window.storage = storage;
window.dbRefs = dbRefs;
window.fbUtils = fbUtils;
window.ORDER_STATES = ORDER_STATES;
window.PROGRESS_MAP = PROGRESS_MAP;
window.handleFirebaseError = handleFirebaseError;
