/**
 * Animations Module
 * Handles scroll-based animations, typing effect, and other UI animations
 */

const Animations = {
    
    /**
     * Initialize all animations
     */
    init() {
        this.initScrollAnimations();
        this.initTypingEffect();
        this.initSkillBars();
        this.initTimelineProgress();
        this.initTiltEffect();
        this.initParallax();
    },
    
    /**
     * Scroll-based reveal animations using Intersection Observer
     */
    initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-in');
        
        if (!animatedElements.length) return;
        
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animatedElements.forEach((el) => observer.observe(el));
    },
    
    /**
     * Typing effect for hero subtitle
     */
    initTypingEffect() {
        const typingElement = document.getElementById('typing-text');
        if (!typingElement) return;
        
        const words = [
            'Full Stack Developer',
            'Machine Learning Engineer',
            'Python Developer',
            'UI/UX Enthusiast',
            'Problem Solver'
        ];
        
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isPaused = false;
        
        // Check for reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            typingElement.textContent = words[0];
            return;
        }
        
        const typeSpeed = 80;
        const deleteSpeed = 50;
        const pauseDuration = 2000;
        
        function type() {
            const currentWord = words[wordIndex];
            
            if (isPaused) {
                setTimeout(type, pauseDuration);
                isPaused = false;
                isDeleting = true;
                return;
            }
            
            if (isDeleting) {
                // Deleting characters
                typingElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                
                if (charIndex === 0) {
                    isDeleting = false;
                    wordIndex = (wordIndex + 1) % words.length;
                }
                
                setTimeout(type, deleteSpeed);
            } else {
                // Typing characters
                typingElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                
                if (charIndex === currentWord.length) {
                    isPaused = true;
                }
                
                setTimeout(type, typeSpeed);
            }
        }
        
        // Start typing after a short delay
        setTimeout(type, 500);
        
        // Pause when tab is not visible
        document.addEventListener('visibilitychange', () => {
            // Animation continues but we could pause here if needed
        });
    },
    
    /**
     * Animate skill bars on scroll
     */
    initSkillBars() {
        const skillBars = document.querySelectorAll('.skill-card__progress');
        
        if (!skillBars.length) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.getAttribute('data-width');
                    
                    // Add small delay for stagger effect
                    const index = Array.from(skillBars).indexOf(bar);
                    setTimeout(() => {
                        bar.style.width = `${width}%`;
                    }, index * 100);
                    
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });
        
        skillBars.forEach((bar) => observer.observe(bar));
    },
    
    /**
     * Animate timeline progress line on scroll
     */
    initTimelineProgress() {
        const timeline = document.querySelector('.timeline');
        const progressLine = document.querySelector('.timeline__progress');
        
        if (!timeline || !progressLine) return;
        
        const updateProgress = () => {
            const rect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Calculate how much of the timeline is visible
            const start = Math.max(0, windowHeight - rect.top);
            const total = rect.height + windowHeight;
            const progress = Math.min(1, Math.max(0, start / total));
            
            progressLine.style.height = `${progress * 100}%`;
        };
        
        // Use passive listener for better scroll performance
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Initial call
    },
    
    /**
     * 3D Tilt effect for cards
     */
    initTiltEffect() {
        const tiltElements = document.querySelectorAll('[data-tilt]');
        
        if (!tiltElements.length) return;
        
        // Check for reduced motion or touch device
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (prefersReducedMotion || isTouchDevice) return;
        
        tiltElements.forEach((element) => {
            const maxTilt = 10; // degrees
            const perspective = 1000; // px
            const scale = 1.02;
            const speed = 400; // ms
            
            element.style.transformStyle = 'preserve-3d';
            element.style.transition = `transform ${speed}ms ease-out`;
            
            element.addEventListener('mouseenter', () => {
                element.style.transition = `transform ${speed}ms ease-out`;
            });
            
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;
                
                const rotateX = (mouseY / (rect.height / 2)) * -maxTilt;
                const rotateY = (mouseX / (rect.width / 2)) * maxTilt;
                
                element.style.transform = `
                    perspective(${perspective}px) 
                    rotateX(${rotateX}deg) 
                    rotateY(${rotateY}deg) 
                    scale3d(${scale}, ${scale}, ${scale})
                `;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transition = `transform ${speed}ms ease-out`;
                element.style.transform = `
                    perspective(${perspective}px) 
                    rotateX(0deg) 
                    rotateY(0deg) 
                    scale3d(1, 1, 1)
                `;
            });
        });
    },
    
    /**
     * Parallax effect for floating elements
     */
    initParallax() {
        const floatingIcons = document.querySelectorAll('.floating-icon');
        
        if (!floatingIcons.length) return;
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const hasInteractivePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        
        if (prefersReducedMotion || !hasInteractivePointer) return;
        
        let ticking = false;
        
        const updateParallax = () => {
            const scrollY = window.scrollY;
            
            floatingIcons.forEach((icon, index) => {
                const speed = 0.1 + (index * 0.02);
                const yOffset = scrollY * speed;
                
                icon.style.transform = `translateY(${-yOffset}px)`;
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    },
    
    /**
     * Counter animation for stats
     */
    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOut);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    },
    
    /**
     * Smooth scroll to element
     */
    smoothScrollTo(target, offset = 80) {
        const element = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
        
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Animations.init();
});

// Export for use in other modules
window.Animations = Animations;

