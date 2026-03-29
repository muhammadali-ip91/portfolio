/**
 * Neural Network Canvas Background
 * Creates an animated neural network effect with nodes and connections
 * Optimized for performance with requestAnimationFrame
 */

class NeuralNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.hasInteractivePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        this.animationId = null;
        this.isRunning = false;
        
        // Configuration
        this.config = {
            nodeCount: this.getNodeCount(),
            nodeRadius: { min: 2, max: 4 },
            connectionDistance: 150,
            nodeSpeed: 0.5,
            colors: {
                node: '#6366f1',
                nodeGlow: 'rgba(99, 102, 241, 0.5)',
                connection: 'rgba(99, 102, 241, 0.15)',
                connectionHover: 'rgba(99, 102, 241, 0.4)'
            }
        };
        
        // Check for reduced motion preference
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }
    
    /**
     * Get node count based on screen size
     */
    getNodeCount() {
        const width = window.innerWidth;
        if (width < 576) return 30;
        if (width < 768) return 50;
        if (width < 992) return 70;
        return 100;
    }
    
    /**
     * Initialize the neural network
     */
    init() {
        this.resize();
        this.createNodes();
        this.bindEvents();
        
        if (!this.prefersReducedMotion) {
            this.start();
        } else {
            // Draw static frame for reduced motion
            this.draw();
        }
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Resize handler with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resize();
                this.config.nodeCount = this.getNodeCount();
                this.createNodes();
            }, 250);
        });
        
        // Only enable pointer interaction on devices with a real hover-capable pointer.
        if (this.hasInteractivePointer) {
            let lastMouseMove = 0;
            window.addEventListener('mousemove', (e) => {
                const now = Date.now();
                if (now - lastMouseMove < 16) return; // ~60fps throttle
                lastMouseMove = now;
                
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });
            
            window.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
        
        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stop();
            } else if (!this.prefersReducedMotion) {
                this.start();
            }
        });
        
        // Theme change handler
        this.observeThemeChanges();
    }
    
    /**
     * Observe theme changes and update colors
     */
    observeThemeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.updateColors();
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
    }
    
    /**
     * Update colors based on theme
     */
    updateColors() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        
        if (isLight) {
            this.config.colors = {
                node: '#6366f1',
                nodeGlow: 'rgba(99, 102, 241, 0.4)',
                connection: 'rgba(99, 102, 241, 0.1)',
                connectionHover: 'rgba(99, 102, 241, 0.3)'
            };
        } else {
            this.config.colors = {
                node: '#6366f1',
                nodeGlow: 'rgba(99, 102, 241, 0.5)',
                connection: 'rgba(99, 102, 241, 0.15)',
                connectionHover: 'rgba(99, 102, 241, 0.4)'
            };
        }
    }
    
    /**
     * Resize canvas to window size
     */
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Prevent compounded scaling after repeated viewport changes.
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
    }
    
    /**
     * Create nodes with random positions and velocities
     */
    createNodes() {
        this.nodes = [];
        
        for (let i = 0; i < this.config.nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * this.config.nodeSpeed,
                vy: (Math.random() - 0.5) * this.config.nodeSpeed,
                radius: Math.random() * (this.config.nodeRadius.max - this.config.nodeRadius.min) + this.config.nodeRadius.min,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * Update node positions
     */
    update() {
        for (const node of this.nodes) {
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off edges
            if (node.x < 0 || node.x > this.width) {
                node.vx *= -1;
                node.x = Math.max(0, Math.min(this.width, node.x));
            }
            if (node.y < 0 || node.y > this.height) {
                node.vy *= -1;
                node.y = Math.max(0, Math.min(this.height, node.y));
            }
            
            // Mouse interaction - attract/repel
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - node.x;
                const dy = this.mouse.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    
                    // Gentle attraction towards mouse
                    node.vx += Math.cos(angle) * force * 0.02;
                    node.vy += Math.sin(angle) * force * 0.02;
                    
                    // Limit velocity
                    const maxSpeed = this.config.nodeSpeed * 2;
                    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
                    if (speed > maxSpeed) {
                        node.vx = (node.vx / speed) * maxSpeed;
                        node.vy = (node.vy / speed) * maxSpeed;
                    }
                }
            }
            
            // Update pulse phase for animation
            node.pulsePhase += 0.02;
        }
    }
    
    /**
     * Draw the neural network
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw connections
        this.drawConnections();
        
        // Draw nodes
        this.drawNodes();
    }
    
    /**
     * Draw connections between nearby nodes
     */
    drawConnections() {
        const { connectionDistance, colors } = this.config;
        
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeA = this.nodes[i];
                const nodeB = this.nodes[j];
                
                const dx = nodeA.x - nodeB.x;
                const dy = nodeA.y - nodeB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    // Calculate opacity based on distance
                    const opacity = 1 - (distance / connectionDistance);
                    
                    // Check if near mouse for highlight effect
                    let isNearMouse = false;
                    if (this.mouse.x !== null && this.mouse.y !== null) {
                        const midX = (nodeA.x + nodeB.x) / 2;
                        const midY = (nodeA.y + nodeB.y) / 2;
                        const mouseDist = Math.sqrt(
                            Math.pow(this.mouse.x - midX, 2) + 
                            Math.pow(this.mouse.y - midY, 2)
                        );
                        isNearMouse = mouseDist < this.mouse.radius;
                    }
                    
                    // Draw connection
                    this.ctx.beginPath();
                    this.ctx.moveTo(nodeA.x, nodeA.y);
                    this.ctx.lineTo(nodeB.x, nodeB.y);
                    
                    if (isNearMouse) {
                        this.ctx.strokeStyle = colors.connectionHover.replace('0.4', (opacity * 0.5).toFixed(2));
                        this.ctx.lineWidth = 1.5;
                    } else {
                        this.ctx.strokeStyle = colors.connection.replace('0.15', (opacity * 0.2).toFixed(2));
                        this.ctx.lineWidth = 1;
                    }
                    
                    this.ctx.stroke();
                }
            }
        }
    }
    
    /**
     * Draw nodes with glow effect
     */
    drawNodes() {
        const { colors } = this.config;
        
        for (const node of this.nodes) {
            // Pulse animation
            const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.2;
            const radius = node.radius * pulseScale;
            
            // Check if near mouse
            let isNearMouse = false;
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const distance = Math.sqrt(
                    Math.pow(this.mouse.x - node.x, 2) + 
                    Math.pow(this.mouse.y - node.y, 2)
                );
                isNearMouse = distance < this.mouse.radius;
            }
            
            // Draw glow
            if (isNearMouse) {
                const gradient = this.ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, radius * 4
                );
                gradient.addColorStop(0, colors.nodeGlow);
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }
            
            // Draw node
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = isNearMouse ? colors.node : colors.nodeGlow;
            this.ctx.fill();
        }
    }
    
    /**
     * Animation loop
     */
    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Start animation
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }
    
    /**
     * Stop animation
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Destroy instance and clean up
     */
    destroy() {
        this.stop();
        this.nodes = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.neuralNetwork = new NeuralNetwork('neural-canvas');
});





