/**
 * CACHO6 - Sistema de Visualización 3D
 * Maneja la carga y visualización de archivos STL/STEP
 */

class ThreeDViewer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            width: options.width || this.container.clientWidth,
            height: options.height || this.container.clientHeight || 400,
            backgroundColor: options.backgroundColor || 0x1a1a1a,
            cameraDistance: options.cameraDistance || 5,
            enableControls: options.enableControls !== false,
            enableWireframe: options.enableWireframe || false,
            showAxes: options.showAxes || false,
            ...options
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.options.backgroundColor);

        // Crear cámara
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.options.width / this.options.height, 
            0.1, 
            1000
        );
        this.camera.position.z = this.options.cameraDistance;

        // Crear renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.options.width, this.options.height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Limpiar container y agregar canvas
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // Controles de órbita
        if (this.options.enableControls && window.THREE.OrbitControls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.1;
            this.controls.enableZoom = true;
            this.controls.autoRotate = false;
        }

        // Iluminación
        this.setupLighting();

        // Ejes de ayuda
        if (this.options.showAxes) {
            const axesHelper = new THREE.AxesHelper(2);
            this.scene.add(axesHelper);
        }

        // Iniciar loop de renderizado
        this.animate();

        // Manejar redimensionado
        this.setupResize();
    }

    setupLighting() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Luz direccional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0x7c7cff, 0.3);
        fillLight.position.set(-10, -10, -5);
        this.scene.add(fillLight);

        // Luz puntual para destacar
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(0, 10, 10);
        this.scene.add(pointLight);
    }

    setupResize() {
        window.addEventListener('resize', () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight || 400;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }

    async loadSTLFile(file) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.STLLoader();
            
            if (file instanceof File) {
                // Cargar desde archivo local
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const geometry = loader.parse(event.target.result);
                        this.createMeshFromGeometry(geometry);
                        resolve(geometry);
                    } catch (error) {
                        reject(new Error(`Error parsing STL: ${error.message}`));
                    }
                };
                reader.onerror = () => reject(new Error('Error reading file'));
                reader.readAsArrayBuffer(file);
            } else if (typeof file === 'string') {
                // Cargar desde URL
                loader.load(
                    file,
                    (geometry) => {
                        this.createMeshFromGeometry(geometry);
                        resolve(geometry);
                    },
                    (progress) => {
                        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                    },
                    (error) => reject(new Error(`Error loading STL: ${error.message}`))
                );
            } else {
                reject(new Error('Invalid file parameter'));
            }
        });
    }

    async loadSTEPFile(file) {
        // STEP files require more complex parsing
        // For now, we'll show a placeholder and suggest STL conversion
        console.warn('STEP files require server-side conversion to STL/OBJ');
        throw new Error('STEP files not directly supported. Please convert to STL format.');
    }

    createMeshFromGeometry(geometry) {
        // Limpiar modelo anterior
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }

        // Centrar y normalizar geometría
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Escalar para que quepa bien en la vista
        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3 / maxDimension;
        geometry.scale(scaleFactor, scaleFactor, scaleFactor);

        // Calcular normales
        geometry.computeVertexNormals();

        // Material
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            shininess: 100,
            wireframe: this.options.enableWireframe
        });

        // Crear mesh
        this.currentModel = new THREE.Mesh(geometry, material);
        this.currentModel.castShadow = true;
        this.currentModel.receiveShadow = true;

        // Agregar a la escena
        this.scene.add(this.currentModel);

        // Ajustar cámara
        this.adjustCamera();
    }

    adjustCamera() {
        if (this.currentModel) {
            const box = new THREE.Box3().setFromObject(this.currentModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = this.camera.fov * (Math.PI / 180);
            const cameraDistance = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
            
            this.camera.position.set(
                center.x + cameraDistance * 0.5,
                center.y + cameraDistance * 0.5,
                center.z + cameraDistance
            );
            
            if (this.controls) {
                this.controls.target.copy(center);
                this.controls.update();
            }
        }
    }

    setWireframe(enabled) {
        if (this.currentModel && this.currentModel.material) {
            this.currentModel.material.wireframe = enabled;
        }
    }

    setModelColor(color) {
        if (this.currentModel && this.currentModel.material) {
            this.currentModel.material.color.setHex(color);
        }
    }

    toggleAutoRotate() {
        if (this.controls) {
            this.controls.autoRotate = !this.controls.autoRotate;
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            if (this.currentModel.geometry) this.currentModel.geometry.dispose();
            if (this.currentModel.material) this.currentModel.material.dispose();
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    // Métodos de utilidad
    exportScreenshot(filename = 'model-screenshot.png') {
        const canvas = this.renderer.domElement;
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    getModelInfo() {
        if (!this.currentModel) return null;

        const geometry = this.currentModel.geometry;
        const box = new THREE.Box3().setFromObject(this.currentModel);
        const size = box.getSize(new THREE.Vector3());

        return {
            vertices: geometry.attributes.position.count,
            faces: geometry.attributes.position.count / 3,
            dimensions: {
                width: size.x.toFixed(2),
                height: size.y.toFixed(2),
                depth: size.z.toFixed(2)
            },
            volume: this.calculateVolume(geometry)
        };
    }

    calculateVolume(geometry) {
        // Cálculo aproximado del volumen usando el convex hull
        // Para un cálculo preciso se necesitaría una librería especializada
        const positions = geometry.attributes.position.array;
        let volume = 0;
        
        for (let i = 0; i < positions.length; i += 9) {
            const v1 = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
            const v2 = new THREE.Vector3(positions[i+3], positions[i+4], positions[i+5]);
            const v3 = new THREE.Vector3(positions[i+6], positions[i+7], positions[i+8]);
            
            // Volumen del tetraedro formado por el origen y el triángulo
            const tetraVolume = Math.abs(v1.dot(v2.cross(v3))) / 6;
            volume += tetraVolume;
        }
        
        return volume.toFixed(4);
    }
}

// Utilidades globales para el viewer 3D
window.ThreeDViewer = ThreeDViewer;

// Helper function para cargar Three.js y dependencias
function loadThreeJS() {
    return new Promise((resolve) => {
        if (window.THREE) {
            resolve();
            return;
        }

        const scripts = [
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
            'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/STLLoader.js'
        ];

        let loadedCount = 0;
        scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loadedCount++;
                if (loadedCount === scripts.length) {
                    resolve();
                }
            };
            document.head.appendChild(script);
        });
    });
}

// Auto-inicialización cuando se carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Cargar Three.js automáticamente si hay viewers en la página
    if (document.querySelector('.model-viewer-3d')) {
        loadThreeJS();
    }
});
