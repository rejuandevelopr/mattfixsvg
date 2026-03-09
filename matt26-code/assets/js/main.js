/**
 * Main application entry point
 * Initializes the AdvancedParticleSphere visualizer and sets up the modern control panel
 */

// Global variables
let particleSphere;
let fpsCounter = 0;
let lastFpsTime = performance.now();

/**
 * Initialize the application when the page loads
 */
function init() {
    console.log('Initializing Advanced 3D Particle Sphere Visualizer...');
    
    // Hide loading message
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // Get the container element
    const container = document.getElementById('container');
    if (!container) {
        console.error('Container element not found!');
        return;
    }
    
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded!');
        return;
    }
    
    // Create the advanced particle sphere visualizer
    try {
        particleSphere = new AdvancedParticleSphere(container);
        console.log('AdvancedParticleSphere created successfully');
    } catch (error) {
        console.error('Error creating AdvancedParticleSphere:', error);
        return;
    }
    
    // Setup the control panel
    setupControlPanel();
    
    // Start FPS counter
    startFpsCounter();
    
    console.log('Advanced 3D Particle Sphere Visualizer initialized successfully!');
}

/**
 * Setup the modern control panel with collapsible functionality
 */
function setupControlPanel() {
    // Get control panel elements
    const controlPanelCta = document.getElementById('controlPanelCta');
    const controlPanel = document.getElementById('controlPanel');
    const closeButton = document.getElementById('closeControlPanel');
    
    // Control panel toggle functionality
    controlPanelCta.addEventListener('click', () => {
        controlPanel.classList.add('open');
        controlPanelCta.style.display = 'none';
    });
    
    closeButton.addEventListener('click', () => {
        controlPanel.classList.remove('open');
        controlPanelCta.style.display = 'block';
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (event) => {
        if (!controlPanel.contains(event.target) && 
            !controlPanelCta.contains(event.target) && 
            controlPanel.classList.contains('open')) {
            controlPanel.classList.remove('open');
            controlPanelCta.style.display = 'block';
        }
    });
    
    // Setup all slider controls
    setupParticleControls();
    setupMorphingControls();
}



/**
 * Setup particle system controls
 */
function setupParticleControls() {
    // Particle size slider
    const particleSizeSlider = document.getElementById('particleSizeSlider');
    const particleSizeValue = document.getElementById('particleSizeValue');
    
    particleSizeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        particleSizeValue.textContent = value.toFixed(3);
        if (particleSphere && typeof particleSphere.setParticleSize === 'function') {
            particleSphere.setParticleSize(value);
        }
    });
    
    // Particle count slider
    const particleCountSlider = document.getElementById('particleCountSlider');
    const particleCountValue = document.getElementById('particleCountValue');
    
    particleCountSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        particleCountValue.textContent = value;
        if (particleSphere && typeof particleSphere.setParticleCount === 'function') {
            particleSphere.setParticleCount(value);
        }
    });
}



/**
 * Setup morphing controls
 */
function setupMorphingControls() {
    // Scatter slider
    const scatterSlider = document.getElementById('scatterSlider');
    const scatterValue = document.getElementById('scatterValue');
    
    scatterSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        scatterValue.textContent = value.toFixed(2);
        if (particleSphere && typeof particleSphere.setScatterValue === 'function') {
            particleSphere.setScatterValue(value);
        }
    });
    
    // Cluster slider
    const clusterSlider = document.getElementById('clusterSlider');
    const clusterValue = document.getElementById('clusterValue');
    
    clusterSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        clusterValue.textContent = value.toFixed(2);
        if (particleSphere && typeof particleSphere.setClusterValue === 'function') {
            particleSphere.setClusterValue(value);
        }
    });
}



/**
 * Update slider values and display values
 */
function updateSliderValues(properties) {
    // Material properties removed from UI but shader effects remain active
}

/**
 * Start FPS counter
 */
function startFpsCounter() {
    const fpsValue = document.getElementById('fpsValue');
    
    function updateFPS() {
        fpsCounter++;
        const currentTime = performance.now();
        
        if (currentTime - lastFpsTime >= 1000) {
            const fps = Math.round((fpsCounter * 1000) / (currentTime - lastFpsTime));
            if (fpsValue) {
                fpsValue.textContent = fps;
            }
            fpsCounter = 0;
            lastFpsTime = currentTime;
        }
        
        requestAnimationFrame(updateFPS);
    }
    
    updateFPS();
}



/**
 * Handle window resize
 */
function onWindowResize() {
    if (particleSphere) {
        particleSphere.onWindowResize();
    }
}

/**
 * Clean up resources when the page is unloaded
 */
function cleanup() {
    if (particleSphere) {
        particleSphere.dispose();
    }
}

// Initialize when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Clean up on page unload
window.addEventListener('beforeunload', cleanup);
