document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Mouse coordinates
    let mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    };

    // Configuration object for all adjustable parameters
    const config = {
        gridSize: 25,
        particleSize: 1,
        mouseInfluence: 150,
        connectionOpacity: 0.05,
        animationSpeed: 0.3,
        particleColor: '#ffffff',
        connectionColor: '#87ceeb'
    };

    // Explosion settings
    let isExploding = false;
    const explosionForce = 15;
    const explosionDecay = 0.92;

    // Control panel functionality
    const controlsBtn = document.getElementById('controlsBtn');
    const controlPanel = document.getElementById('controlPanel');
    let isPanelOpen = false;

    controlsBtn.addEventListener('click', () => {
        isPanelOpen = !isPanelOpen;
        controlPanel.classList.toggle('open', isPanelOpen);
    });

    // Control inputs
    const controls = {
        gridSize: document.getElementById('gridSize'),
        particleSize: document.getElementById('particleSize'),
        mouseInfluence: document.getElementById('mouseInfluence'),
        connectionOpacity: document.getElementById('connectionOpacity'),
        animationSpeed: document.getElementById('animationSpeed'),
        particleColor: document.getElementById('particleColor'),
        connectionColor: document.getElementById('connectionColor'),
        resetBtn: document.getElementById('resetBtn')
    };

    // Value display elements
    const valueDisplays = {
        gridSize: document.getElementById('gridSizeValue'),
        particleSize: document.getElementById('particleSizeValue'),
        mouseInfluence: document.getElementById('mouseInfluenceValue'),
        connectionOpacity: document.getElementById('connectionOpacityValue'),
        animationSpeed: document.getElementById('animationSpeedValue')
    };

    // Update configuration and display values
    function updateConfig(key, value) {
        config[key] = parseFloat(value);
        if (valueDisplays[key]) {
            valueDisplays[key].textContent = value;
        }
        
        // Reinitialize particles if grid size changed
        if (key === 'gridSize') {
            init();
        }
    }

    // Add event listeners for controls
    Object.keys(controls).forEach(key => {
        if (controls[key] && key !== 'resetBtn') {
            controls[key].addEventListener('input', (e) => {
                updateConfig(key, e.target.value);
            });
        }
    });

    // Reset button functionality
    controls.resetBtn.addEventListener('click', () => {
        const defaults = {
            gridSize: 25,
            particleSize: 1,
            mouseInfluence: 150,
            connectionOpacity: 0.05,
            animationSpeed: 0.3,
            particleColor: '#ffffff',
            connectionColor: '#87ceeb'
        };
        
        Object.keys(defaults).forEach(key => {
            config[key] = defaults[key];
            if (controls[key]) {
                controls[key].value = defaults[key];
            }
            if (valueDisplays[key]) {
                valueDisplays[key].textContent = defaults[key];
            }
        });
        
        init();
    });

    // Helper function to convert hex to rgba
    function hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Particle class
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.distance = 0;
            this.angle = Math.random() * Math.PI * 2;
            this.density = (Math.random() * 5) + 8;
            this.velocity = {
                x: 0,
                y: 0
            };
        }

        draw() {
            // Create gradient for particle
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, config.particleSize * 2
            );
            
            // Distance-based color transition
            const intensity = Math.max(0, 1 - (this.distance / 200));
            const particleRgba = hexToRgba(config.particleColor, 0.8);
            const connectionRgb = hexToRgba(config.connectionColor, 0.1);
            
            gradient.addColorStop(0, particleRgba);
            gradient.addColorStop(1, connectionRgb);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, config.particleSize, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        explode() {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Particles closer to click point get more velocity
            const force = Math.max(0, 1 - (distance / 200)) * explosionForce;
            
            this.velocity.x = Math.cos(angle) * force;
            this.velocity.y = Math.sin(angle) * force;
        }

        update() {
            if (isExploding) {
                // Update position based on velocity
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                
                // Decay velocity
                this.velocity.x *= explosionDecay;
                this.velocity.y *= explosionDecay;
                
                // Gradually return to base position
                const dx = this.baseX - this.x;
                const dy = this.baseY - this.y;
                this.x += dx * 0.05;
                this.y += dy * 0.05;
                
                // Check if explosion is finished
                if (Math.abs(this.velocity.x) < 0.1 && Math.abs(this.velocity.y) < 0.1) {
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                }
            } else {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                this.distance = distance;
                
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = config.mouseInfluence;
                let force = (maxDistance - distance) / maxDistance;
                
                if (force < 0) force = 0;
                
                // Apply animation speed multiplier
                let directionX = forceDirectionX * force * this.density * config.animationSpeed;
                let directionY = forceDirectionY * force * this.density * config.animationSpeed;

                if (distance < maxDistance) {
                    this.x += directionX;
                    this.y += directionY;
                } else {
                    // Smoother return to base position
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx/20;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy/20;
                    }
                }
                
                // Add subtle floating motion
                this.angle += 0.02;
                this.x += Math.sin(this.angle) * 0.1;
                this.y += Math.cos(this.angle) * 0.1;
            }
        }
    }

    // Array to hold particles
    const particles = [];

    // Initialize particles in a grid
    function init() {
        particles.length = 0;
        
        const columns = Math.floor(window.innerWidth / config.gridSize);
        const rows = Math.floor(window.innerHeight / config.gridSize);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                particles.push(
                    new Particle(
                        x * config.gridSize + config.gridSize/2,
                        y * config.gridSize + config.gridSize/2
                    )
                );
            }
        }
    }

    function triggerExplosion() {
        isExploding = true;
        particles.forEach(particle => particle.explode());
        
        // Reset explosion state after a delay
        setTimeout(() => {
            isExploding = false;
        }, 1000);
    }

    function drawConnections() {
        ctx.lineWidth = 0.5;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.gridSize * 1.5) {
                    const opacity = 1 - (distance / (config.gridSize * 1.5));
                    const connectionRgba = hexToRgba(config.connectionColor, opacity * config.connectionOpacity);
                    ctx.strokeStyle = connectionRgba;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawConnections();
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        init();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('click', (e) => {
        // Don't trigger explosion if clicking on control panel
        if (!controlPanel.contains(e.target) && !controlsBtn.contains(e.target)) {
            triggerExplosion();
        }
    });

    resizeCanvas();
    init();
    animate();
}); 