/**
 * AdvancedParticleSphere - Enhanced 3D particle system with metallic materials
 * Features MeshPhysicalMaterial for realistic metallic/refractive effects
 */
class AdvancedParticleSphere {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.particles = [];
        this.particleGroup = null;
        this.raycaster = null;
        this.mouse = null;
        this.clock = null;
        
        // Particle system parameters
        this.particleCount = 400;
        this.particleSize = 0.04;
        this.sphereRadius = 6.0; // Much bigger cluster
        this.scatterRadius = 20; // Much larger to fill the screen
        
        // Material properties
        this.materialProperties = {
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 0.8,
            ior: 1.5,
            transmission: 0.0,
            thickness: 0.5,
            color: 0xffffff, // Pure white
            emissive: 0x333333, // Subtle gray glow
            emissiveIntensity: 0.05
        };
        
        // Animation parameters
        this.rotationSpeed = 0.3;
        this.scatterValue = 0; // 0 = clustered, 1 = scattered
        this.clusterValue = 1; // 0 = scattered, 1 = clustered
        
        // Lightspeed effect parameters
        this.streakLength = 0.5;
        this.streakIntensity = 0.3;
        this.motionBlur = 0.2;
        this.lightspeedZoom = 0;
        
        // Shape morphing parameters
        this.currentShape = 'sphere';
        this.outlineMode = false;
        this.shapeRotation = 0;
        
        // Mouse interaction
        this.mousePosition = new THREE.Vector3();
        this.interactionRadius = 2;
        this.interactionStrength = 0.5;
        this.isMouseNear = false;
        
        // Camera movement tracking for lightspeed effect
        this.lastCameraDistance = 10;
        this.cameraMovementSpeed = 0;
        this.isCameraMoving = false;
        
        // Initialize the system
        this.init();
    }
    
    /**
     * Initialize the Three.js scene, camera, renderer, and controls
     */
    init() {
        console.log('Initializing AdvancedParticleSphere...');
        
        // Create scene with enhanced lighting
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Pure black space background
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 0, 10);
        
        // Create renderer with enhanced settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Enable physically correct lighting
        this.renderer.physicallyCorrectLights = true;
        this.container.appendChild(this.renderer.domElement);
        
        // Create orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 25;
        this.controls.minDistance = 3;
        this.controls.autoRotate = false;
        
        // Create enhanced lighting
        this.setupLighting();
        
        // Create particle system
        this.createParticles();
        console.log('Particles created:', this.particles.length);
        
        // Setup raycaster for mouse interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Create clock for animations
        this.clock = new THREE.Clock();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.animate();
        console.log('Animation loop started');
    }
    
    /**
     * Setup enhanced lighting for metallic materials
     */
    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // Secondary directional light for fill
        const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.4);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Point light for particle glow
        const pointLight = new THREE.PointLight(0xffffff, 0.8, 15);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
        
        // Rim light for metallic highlights
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, 0, 10);
        this.scene.add(rimLight);
    }
    
    /**
     * Create the particle system with MeshPhysicalMaterial for advanced refraction
     */
    createParticles() {
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
        
        // Create particle geometry
        const particleGeometry = new THREE.SphereGeometry(this.particleSize, 16, 16);
        
        // Create MeshPhysicalMaterial for metallic space particles
        const particleMaterial = new THREE.MeshPhysicalMaterial({
            color: this.materialProperties.color,
            metalness: this.materialProperties.metalness,
            roughness: this.materialProperties.roughness,
            clearcoat: this.materialProperties.clearcoat,
            clearcoatRoughness: 0.05,
            ior: this.materialProperties.ior,
            reflectivity: 1.0,
            emissive: this.materialProperties.emissive,
            emissiveIntensity: this.materialProperties.emissiveIntensity,
            transparent: true,
            opacity: 0.95,
            envMapIntensity: 1.2
        });
        
        // Create particles in a spherical distribution
        for (let i = 0; i < this.particleCount; i++) {
            // Generate spherical coordinates for even distribution
            const phi = Math.acos(-1 + (2 * i) / this.particleCount);
            const theta = Math.sqrt(this.particleCount * Math.PI) * phi;
            
            // Convert to Cartesian coordinates
            const x = this.sphereRadius * Math.cos(theta) * Math.sin(phi);
            const y = this.sphereRadius * Math.sin(theta) * Math.sin(phi);
            const z = this.sphereRadius * Math.cos(phi);
            
            // Create particle mesh
            const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
            particle.position.set(x, y, z);
            particle.castShadow = true;
            particle.receiveShadow = true;
            
            // Store original position and data for morphing
            particle.userData = {
                originalPosition: new THREE.Vector3(x, y, z),
                scatteredPosition: this.getScatteredPosition(),
                targetPosition: new THREE.Vector3(x, y, z),
                shapePosition: new THREE.Vector3(x, y, z),
                velocity: new THREE.Vector3(),
                isInteracting: false,
                interactionStartTime: 0,
                originalScale: new THREE.Vector3(1, 1, 1),
                streakTrail: [], // For lightspeed effect trails
                lastPosition: new THREE.Vector3(x, y, z)
            };
            
            this.particles.push(particle);
            this.particleGroup.add(particle);
        }
    }
    
    /**
     * Generate a random scattered position for particles
     */
    getScatteredPosition() {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = this.scatterRadius * (0.2 + Math.random() * 0.8); // Wider distribution
        
        return new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
    }
    
    /**
     * Generate smiley face positions
     */
    generateSmileyPositions() {
        const positions = [];
        const radius = 3;
        
        // Face outline (circle)
        const outlineCount = Math.floor(this.particleCount * 0.4);
        for (let i = 0; i < outlineCount; i++) {
            const angle = (i / outlineCount) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            positions.push(new THREE.Vector3(x, y, 0));
        }
        
        // Eyes
        const eyeCount = Math.floor(this.particleCount * 0.2);
        for (let i = 0; i < eyeCount; i++) {
            const angle = (i / eyeCount) * Math.PI * 2;
            const eyeRadius = 0.5;
            // Left eye
            const leftX = Math.cos(angle) * eyeRadius - 1;
            const leftY = Math.sin(angle) * eyeRadius + 1;
            positions.push(new THREE.Vector3(leftX, leftY, 0));
            // Right eye
            const rightX = Math.cos(angle) * eyeRadius + 1;
            const rightY = Math.sin(angle) * eyeRadius + 1;
            positions.push(new THREE.Vector3(rightX, rightY, 0));
        }
        
        // Smile
        const smileCount = Math.floor(this.particleCount * 0.2);
        for (let i = 0; i < smileCount; i++) {
            const angle = (i / smileCount) * Math.PI + Math.PI;
            const smileRadius = 1.5;
            const x = Math.cos(angle) * smileRadius;
            const y = Math.sin(angle) * smileRadius - 0.5;
            positions.push(new THREE.Vector3(x, y, 0));
        }
        
        // Fill the rest with random positions inside the face
        const remainingCount = this.particleCount - positions.length;
        for (let i = 0; i < remainingCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius * 0.8;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            positions.push(new THREE.Vector3(x, y, 0));
        }
        
        return positions.slice(0, this.particleCount);
    }
    
    /**
     * Generate thumbs up positions
     */
    generateThumbsPositions() {
        const positions = [];
        
        // Thumb outline
        const thumbCount = Math.floor(this.particleCount * 0.3);
        for (let i = 0; i < thumbCount; i++) {
            const t = i / thumbCount;
            const x = Math.sin(t * Math.PI) * 1.5;
            const y = t * 3 - 1.5;
            positions.push(new THREE.Vector3(x, y, 0));
        }
        
        // Hand outline
        const handCount = Math.floor(this.particleCount * 0.4);
        for (let i = 0; i < handCount; i++) {
            const t = i / handCount;
            const x = Math.sin(t * Math.PI) * 2;
            const y = t * 2 - 1;
            positions.push(new THREE.Vector3(x, y, 0));
        }
        
        // Fingers
        const fingerCount = Math.floor(this.particleCount * 0.3);
        for (let i = 0; i < fingerCount; i++) {
            const t = i / fingerCount;
            const x = Math.sin(t * Math.PI) * 1.8;
            const y = t * 1.5 - 0.5;
            positions.push(new THREE.Vector3(x, y, 0));
        }
        
        return positions.slice(0, this.particleCount);
    }
    
    /**
     * Generate ring positions
     */
    generateRingPositions() {
        const positions = [];
        const ringRadius = 3;
        const tubeRadius = 0.5;
        
        for (let i = 0; i < this.particleCount; i++) {
            const theta = (i / this.particleCount) * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;
            
            const x = (ringRadius + Math.cos(phi) * tubeRadius) * Math.cos(theta);
            const y = (ringRadius + Math.cos(phi) * tubeRadius) * Math.sin(theta);
            const z = Math.sin(phi) * tubeRadius;
            
            positions.push(new THREE.Vector3(x, y, z));
        }
        
        return positions;
    }
    
    /**
     * Setup event listeners for mouse interaction and window resizing
     */
    setupEventListeners() {
        // Mouse move for interaction
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }
    
    /**
     * Handle mouse movement for particle interaction
     */
    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find intersection with an invisible plane at the particle sphere's center
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersection);
        
        // Transform intersection to world space
        this.mousePosition.copy(intersection);
        
        // Check distance to particle group center
        const distanceToCenter = this.mousePosition.distanceTo(this.particleGroup.position);
        this.isMouseNear = distanceToCenter < this.interactionRadius;
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Update particle positions with lightspeed scatter effect
     */
    updateParticles() {
        const time = this.clock.getElapsedTime();
        
        // Track camera movement for lightspeed effect
        const currentCameraDistance = this.camera.position.length();
        const cameraDistanceChange = Math.abs(currentCameraDistance - this.lastCameraDistance);
        this.cameraMovementSpeed = cameraDistanceChange * 20; // Amplify the effect more
        this.isCameraMoving = cameraDistanceChange > 0.005; // More sensitive to zoom
        this.lastCameraDistance = currentCameraDistance;
        
        this.particles.forEach((particle, index) => {
            const userData = particle.userData;
            
            // Calculate target position based on shape, scatter and cluster values
            let targetPosition = new THREE.Vector3();
            
            if (this.currentShape !== 'sphere') {
                // Use shape position
                targetPosition.copy(userData.shapePosition);
                
                // Apply rotation for ring
                if (this.currentShape === 'ring') {
                    this.shapeRotation += 0.02;
                    const cos = Math.cos(this.shapeRotation);
                    const sin = Math.sin(this.shapeRotation);
                    const x = targetPosition.x;
                    const y = targetPosition.y;
                    targetPosition.x = x * cos - y * sin;
                    targetPosition.y = x * sin + y * cos;
                }
            } else {
                // Use scatter and cluster values
                const scatterTarget = new THREE.Vector3();
                scatterTarget.lerpVectors(
                    userData.originalPosition,
                    userData.scatteredPosition,
                    this.scatterValue
                );
                
                const clusterTarget = new THREE.Vector3();
                clusterTarget.lerpVectors(
                    userData.scatteredPosition,
                    userData.originalPosition,
                    this.clusterValue
                );
                
                // Combine scatter and cluster effects
                targetPosition.lerpVectors(scatterTarget, clusterTarget, 0.5);
            }
            
            // Apply mouse interaction
            if (this.isMouseNear) {
                const distanceToMouse = particle.position.distanceTo(this.mousePosition);
                if (distanceToMouse < this.interactionRadius) {
                    // Calculate repulsion force
                    const repulsionDirection = new THREE.Vector3()
                        .subVectors(particle.position, this.mousePosition)
                        .normalize();
                    
                    const repulsionStrength = (this.interactionRadius - distanceToMouse) / this.interactionRadius;
                    const repulsionOffset = repulsionDirection.multiplyScalar(
                        repulsionStrength * this.interactionStrength
                    );
                    
                    targetPosition.add(repulsionOffset);
                    userData.isInteracting = true;
                    userData.interactionStartTime = time;
                }
            } else {
                userData.isInteracting = false;
            }
            
            // Store previous position for streak calculation
            const previousPosition = particle.position.clone();
            
            // Smooth interpolation to target position with lightspeed effect
            const lerpSpeed = this.scatterValue > 0.5 ? 0.15 : 0.08; // Faster when scattering
            particle.position.lerp(targetPosition, lerpSpeed);
            
            // Calculate velocity for lightspeed effect
            const velocity = new THREE.Vector3().subVectors(particle.position, previousPosition);
            const speed = velocity.length();
            
            // Apply lightspeed effect based on camera movement OR scatter value
            const lightspeedActive = this.isCameraMoving || (this.scatterValue > 0.3 && speed > 0.01);
            
            if (lightspeedActive) {
                // Create streak effect
                this.createStreakEffect(particle, velocity, speed);
                
                // Enhance material properties during lightspeed
                const streakIntensity = Math.min((speed + this.cameraMovementSpeed) * this.streakIntensity, 1.0);
                particle.material.emissiveIntensity = this.materialProperties.emissiveIntensity + streakIntensity * 0.5;
                
                // Scale particle based on speed and camera movement
                const scaleFactor = 1 + ((speed + this.cameraMovementSpeed) * this.streakLength);
                particle.scale.setScalar(scaleFactor);
                
                // Add camera movement effect to all particles
                if (this.isCameraMoving) {
                    // Create a "warp" effect when camera is moving
                    const warpDirection = new THREE.Vector3().subVectors(this.camera.position, new THREE.Vector3(0, 0, 0)).normalize();
                    const warpStrength = this.cameraMovementSpeed * 0.2; // Stronger warp effect
                    const warpOffset = warpDirection.multiplyScalar(warpStrength);
                    particle.position.add(warpOffset);
                    
                    // Add extra glow during camera movement
                    particle.material.emissiveIntensity = this.materialProperties.emissiveIntensity + this.cameraMovementSpeed * 0.3;
                }
            } else {
                // Reset to normal appearance
                particle.material.emissiveIntensity = this.materialProperties.emissiveIntensity;
                particle.scale.lerp(userData.originalScale, 0.1);
            }
            
            // Apply lightspeed zoom effect
            if (this.lightspeedZoom > 0) {
                const zoomFactor = this.lightspeedZoom * 0.15; // Reduced max zoom to 15%
                const zoomDirection = new THREE.Vector3(0, 0, -1);
                zoomDirection.applyQuaternion(this.camera.quaternion);
                this.camera.position.lerp(
                    this.camera.position.clone().add(zoomDirection.multiplyScalar(zoomFactor * 5)),
                    0.05 // Slower, more gradual zoom
                );
            }
            
            // Update particle appearance based on interaction
            if (userData.isInteracting) {
                const interactionTime = time - userData.interactionStartTime;
                const pulse = Math.sin(interactionTime * 8) * 0.5 + 0.5;
                
                // Enhance material properties during interaction
                particle.material.emissiveIntensity = 0.3 + pulse * 0.4;
                particle.material.metalness = this.materialProperties.metalness + pulse * 0.2;
                particle.scale.setScalar(1 + pulse * 0.2);
            }
        });
    }
    
    /**
     * Create streak effect for lightspeed scatter
     */
    createStreakEffect(particle, velocity, speed) {
        const userData = particle.userData;
        
        // Add current position to trail
        userData.streakTrail.push({
            position: particle.position.clone(),
            time: this.clock.getElapsedTime(),
            intensity: speed * this.streakIntensity
        });
        
        // Limit trail length
        if (userData.streakTrail.length > 5) {
            userData.streakTrail.shift();
        }
        
        // Create visual streak effect by adjusting material
        const streakFactor = Math.min(speed * 2, 1.0);
        particle.material.opacity = 0.9 + streakFactor * 0.1;
    }
    
    /**
     * Rotate the entire particle group
     */
    updateRotation() {
        const time = this.clock.getElapsedTime();
        this.particleGroup.rotation.x = Math.sin(time * 0.2) * 0.1;
        this.particleGroup.rotation.y = time * this.rotationSpeed * 0.01;
        this.particleGroup.rotation.z = Math.cos(time * 0.15) * 0.05;
    }
    
    /**
     * Main animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Update particle system
        this.updateParticles();
        this.updateRotation();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Update material properties for all particles
     */
    updateMaterialProperties(properties) {
        this.materialProperties = { ...this.materialProperties, ...properties };
        
        this.particles.forEach(particle => {
            const material = particle.material;
            material.metalness = this.materialProperties.metalness;
            material.roughness = this.materialProperties.roughness;
            material.clearcoat = this.materialProperties.clearcoat;
            material.ior = this.materialProperties.ior;
            material.emissiveIntensity = this.materialProperties.emissiveIntensity;
        });
    }
    
    /**
     * Set particle size and recreate particles
     */
    setParticleSize(size) {
        this.particleSize = size;
        this.recreateParticles();
    }
    
    /**
     * Set particle count and recreate particles
     */
    setParticleCount(count) {
        this.particleCount = count;
        this.recreateParticles();
    }
    
    /**
     * Set scatter value (0 = clustered, 1 = scattered)
     */
    setScatterValue(value) {
        this.scatterValue = Math.max(0, Math.min(1, value));
    }
    
    /**
     * Set cluster value (0 = scattered, 1 = clustered)
     */
    setClusterValue(value) {
        this.clusterValue = Math.max(0, Math.min(1, value));
    }
    
    /**
     * Set lightspeed effect parameters
     */
    setStreakLength(length) {
        this.streakLength = Math.max(0, Math.min(2, length));
    }
    
    setStreakIntensity(intensity) {
        this.streakIntensity = Math.max(0, Math.min(1, intensity));
    }
    
    setMotionBlur(blur) {
        this.motionBlur = Math.max(0, Math.min(1, blur));
    }
    
    setLightspeedZoom(zoom) {
        this.lightspeedZoom = Math.max(0, Math.min(1, zoom));
    }
    
    /**
     * Morph particles to a specific shape
     */
    morphToShape(shapeName) {
        this.currentShape = shapeName;
        let shapePositions = [];
        
        switch (shapeName) {
            case 'smiley':
                shapePositions = this.generateSmileyPositions();
                break;
            case 'thumbs':
                shapePositions = this.generateThumbsPositions();
                break;
            case 'ring':
                shapePositions = this.generateRingPositions();
                break;
            default:
                // Return to sphere
                shapePositions = this.particles.map(particle => particle.userData.originalPosition);
                break;
        }
        
        // Update particle shape positions
        this.particles.forEach((particle, index) => {
            if (index < shapePositions.length) {
                particle.userData.shapePosition = shapePositions[index];
            }
        });
    }
    
    /**
     * Set outline mode
     */
    setOutlineMode(enabled) {
        this.outlineMode = enabled;
        // Regenerate shape positions if a shape is active
        if (this.currentShape !== 'sphere') {
            this.morphToShape(this.currentShape);
        }
    }
    
    /**
     * Set interaction radius
     */
    setInteractionRadius(radius) {
        this.interactionRadius = radius;
    }
    
    /**
     * Set interaction strength
     */
    setInteractionStrength(strength) {
        this.interactionStrength = strength;
    }
    
    /**
     * Recreate particles with new parameters
     */
    recreateParticles() {
        // Remove existing particles
        this.particles.forEach(particle => {
            this.particleGroup.remove(particle);
        });
        this.particles = [];
        
        // Create new particles
        this.createParticles();
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.renderer.dispose();
        this.controls.dispose();
        window.removeEventListener('resize', this.onWindowResize);
    }
}
