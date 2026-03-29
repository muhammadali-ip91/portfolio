/**
 * Main Application Script
 * Handles navigation, theme switching, forms, modals, and other UI interactions
 */

'use strict';

const App = {
    
    // DOM Elements cache
    elements: {},
    
    // State
    state: {
        isMenuOpen: false,
        currentTheme: 'dark',
        currentCertificateSlide: 0
    },
    
    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.initTheme();
        this.initNavigation();
        this.initCertificatesSlider();
        this.initProjectsFilter();
        this.initSkillsTabs();
        this.initSkillsOrbit();
        this.initContactForm();
        this.initModal();
        this.initBackToTop();
        this.setCurrentYear();
    },
    
    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            // Navigation
            header: document.querySelector('.header'),
            navToggle: document.getElementById('nav-toggle'),
            navMenu: document.getElementById('nav-menu'),
            navLinks: document.querySelectorAll('.nav__link'),
            
            // Theme
            themeToggle: document.getElementById('theme-toggle'),
            
            // Skills
            skillsTabs: document.querySelectorAll('.skills__tab'),
            skillsPanels: document.querySelectorAll('.skills__panel'),
            skillsOrbitTrack: document.querySelector('.skills__orbit-track'),
            skillsOrbitPrev: document.querySelector('.skills__orbit-nav--prev'),
            skillsOrbitNext: document.querySelector('.skills__orbit-nav--next'),
            
            // Projects
            projectFilters: document.querySelectorAll('.projects__filter'),
            projectCards: document.querySelectorAll('.project-card'),
            
            // Certificates
            certSlider: document.querySelector('.certificates__slider'),
            certTrack: document.querySelector('.certificates__track'),
            certCards: document.querySelectorAll('.certificate-card'),
            certPrevBtn: document.querySelector('.certificates__nav--prev'),
            certNextBtn: document.querySelector('.certificates__nav--next'),
            certDots: document.querySelector('.certificates__dots'),
            
            // Contact
            contactForm: document.getElementById('contact-form'),
            formStatus: document.getElementById('form-status'),
            
            // Modal
            modal: document.getElementById('certificate-modal'),
            modalImage: document.getElementById('modal-image'),
            modalClose: document.querySelector('.modal__close'),
            modalBackdrop: document.querySelector('.modal__backdrop'),
            
            // Toast
            toast: document.getElementById('toast'),
            toastClose: document.querySelector('.toast__close'),
            
            // Back to top
            backToTop: document.getElementById('back-to-top'),
            
            // Footer
            currentYear: document.getElementById('current-year')
        };
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Scroll events
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 250);
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', this.handleAnchorClick.bind(this));
        });
    },
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollY = window.scrollY;
        
        // Header scroll effect
        if (this.elements.header) {
            this.elements.header.classList.toggle('scrolled', scrollY > 50);
        }
        
        // Back to top visibility
        if (this.elements.backToTop) {
            this.elements.backToTop.classList.toggle('visible', scrollY > 500);
        }
        
        // Update active nav link based on scroll position
        this.updateActiveNavLink();
    },
    
    /**
     * Handle resize events
     */
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.state.isMenuOpen) {
            this.closeMenu();
        }
        
        // Update certificates slider
        this.renderCertificateDots();
        this.updateCertificatesSlider();
    },
    
    /**
     * Handle anchor link clicks
     */
    handleAnchorClick(e) {
        const href = e.currentTarget.getAttribute('href');
        
        if (href === '#' || href.length < 2) return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (this.state.isMenuOpen) {
                this.closeMenu();
            }
            
            // Smooth scroll
            window.Animations?.smoothScrollTo(target) || target.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    /**
     * Update active nav link based on scroll position
     */
    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.scrollY + 100;
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                this.elements.navLinks.forEach((link) => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    },
    
    /**
     * Initialize theme
     */
    initTheme() {
        // Get saved theme or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.state.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.applyTheme(this.state.currentTheme);
        
        // Theme toggle click
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => {
                this.state.currentTheme = this.state.currentTheme === 'dark' ? 'light' : 'dark';
                this.applyTheme(this.state.currentTheme);
                localStorage.setItem('theme', this.state.currentTheme);
            });
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.state.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.state.currentTheme);
            }
        });
    },
    
    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    },
    
    /**
     * Initialize navigation
     */
    initNavigation() {
        const { navToggle, navMenu } = this.elements;
        
        if (!navToggle || !navMenu) return;
        
        // Toggle menu
        navToggle.addEventListener('click', () => {
            if (this.state.isMenuOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        });
        
        // Close menu when clicking nav links
        this.elements.navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (this.state.isMenuOpen) {
                    this.closeMenu();
                }
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isMenuOpen) {
                this.closeMenu();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.state.isMenuOpen && 
                !navMenu.contains(e.target) && 
                !navToggle.contains(e.target)) {
                this.closeMenu();
            }
        });
    },
    
    /**
     * Open mobile menu
     */
    openMenu() {
        this.state.isMenuOpen = true;
        this.elements.navToggle.classList.add('active');
        this.elements.navToggle.setAttribute('aria-expanded', 'true');
        this.elements.navMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    /**
     * Close mobile menu
     */
    closeMenu() {
        this.state.isMenuOpen = false;
        this.elements.navToggle.classList.remove('active');
        this.elements.navToggle.setAttribute('aria-expanded', 'false');
        this.elements.navMenu.classList.remove('active');
        document.body.style.overflow = '';
    },
    
    /**
     * Initialize skills tabs
     */
    initSkillsTabs() {
        const { skillsTabs, skillsPanels } = this.elements;
        
        if (!skillsTabs.length || !skillsPanels.length) return;
        
        skillsTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-tab');
                
                // Update tabs
                skillsTabs.forEach((t) => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                
                // Update panels
                skillsPanels.forEach((panel) => {
                    panel.classList.remove('active');
                    panel.hidden = true;
                });
                
                const targetPanel = document.getElementById(`panel-${targetId}`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    targetPanel.hidden = false;
                    
                    // Re-trigger skill bar animations
                    const bars = targetPanel.querySelectorAll('.skill-card__progress');
                    bars.forEach((bar, index) => {
                        bar.style.width = '0';
                        setTimeout(() => {
                            bar.style.width = `${bar.getAttribute('data-width')}%`;
                        }, index * 100);
                    });
                }
            });
        });
    },
    
    /**
     * Initialize skills orbit navigation
     */
    initSkillsOrbit() {
        const { skillsOrbitTrack, skillsOrbitPrev, skillsOrbitNext } = this.elements;
        
        if (!skillsOrbitTrack || !skillsOrbitPrev || !skillsOrbitNext) return;
        
        const scrollAmount = () => Math.max(220, Math.floor(skillsOrbitTrack.clientWidth * 0.75));
        
        skillsOrbitPrev.addEventListener('click', () => {
            skillsOrbitTrack.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        });
        
        skillsOrbitNext.addEventListener('click', () => {
            skillsOrbitTrack.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        });
    },
        /**
     * Initialize projects filter
     */
    initProjectsFilter() {
        const { projectFilters, projectCards } = this.elements;
        
        if (!projectFilters.length || !projectCards.length) return;
        
        projectFilters.forEach((filter) => {
            filter.addEventListener('click', () => {
                const category = filter.getAttribute('data-filter');
                
                // Update active filter
                projectFilters.forEach((f) => f.classList.remove('active'));
                filter.classList.add('active');
                
                // Filter cards
                projectCards.forEach((card) => {
                    const cardCategory = card.getAttribute('data-category');
                    
                    if (category === 'all' || cardCategory === category) {
                        card.style.display = '';
                        // Re-trigger animation
                        card.classList.remove('visible');
                        setTimeout(() => card.classList.add('visible'), 50);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    },
    
    /**
     * Initialize certificates slider
     */
    initCertificatesSlider() {
        const { certSlider, certTrack, certCards, certPrevBtn, certNextBtn } = this.elements;
        
        if (!certSlider || !certCards.length) return;
        
        this.renderCertificateDots();
        
        if (certPrevBtn) {
            certPrevBtn.addEventListener('click', () => {
                this.state.currentCertificateSlide = Math.max(0, this.state.currentCertificateSlide - 1);
                this.updateCertificatesSlider();
            });
        }
        
        if (certNextBtn) {
            certNextBtn.addEventListener('click', () => {
                const maxSlide = Math.max(0, certCards.length - this.getSlidesPerView());
                this.state.currentCertificateSlide = Math.min(maxSlide, this.state.currentCertificateSlide + 1);
                this.updateCertificatesSlider();
            });
        }
        
        if (certTrack) {
            certTrack.addEventListener('scroll', () => {
                if (!this.isMobileCertificatesView()) return;
                
                clearTimeout(this.certificateScrollTimeout);
                this.certificateScrollTimeout = setTimeout(() => {
                    const trackCenter = certTrack.scrollLeft + (certTrack.clientWidth / 2);
                    let closestIndex = 0;
                    let closestDistance = Number.POSITIVE_INFINITY;
                    
                    certCards.forEach((card, index) => {
                        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
                        const distance = Math.abs(cardCenter - trackCenter);
                        
                        if (distance < closestDistance) {
                            closestDistance = distance;
                            closestIndex = index;
                        }
                    });
                    
                    this.state.currentCertificateSlide = closestIndex;
                    this.syncCertificateDots();
                }, 80);
            }, { passive: true });
        }
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        certSlider.addEventListener('touchstart', (e) => {
            if (this.isMobileCertificatesView()) return;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        certSlider.addEventListener('touchend', (e) => {
            if (this.isMobileCertificatesView()) return;
            
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    const maxSlide = Math.max(0, certCards.length - this.getSlidesPerView());
                    this.state.currentCertificateSlide = Math.min(maxSlide, this.state.currentCertificateSlide + 1);
                } else {
                    this.state.currentCertificateSlide = Math.max(0, this.state.currentCertificateSlide - 1);
                }
                
                this.updateCertificatesSlider();
            }
        }, { passive: true });
        
        document.querySelectorAll('.certificate-card__zoom').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const src = btn.getAttribute('data-src');
                if (src) {
                    this.openModal(src);
                }
            });
        });
    },
    
    isMobileCertificatesView() {
        return window.innerWidth < 576;
    },
    
    renderCertificateDots() {
        const { certCards, certDots } = this.elements;
        
        if (!certDots || !certCards.length) return;
        
        const maxSlide = this.isMobileCertificatesView()
            ? certCards.length - 1
            : Math.max(0, certCards.length - this.getSlidesPerView());
        
        certDots.innerHTML = '';
        
        for (let i = 0; i <= maxSlide; i++) {
            const dot = document.createElement('button');
            dot.className = `certificates__dot ${i === this.state.currentCertificateSlide ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => this.goToSlide(i));
            certDots.appendChild(dot);
        }
        
        this.syncCertificateDots();
    },
    
    syncCertificateDots() {
        const { certDots } = this.elements;
        
        if (!certDots) return;
        
        const dots = certDots.querySelectorAll('.certificates__dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.state.currentCertificateSlide);
        });
    },
    
    scrollCertificateTrackToCurrent() {
        const { certTrack, certCards } = this.elements;
        
        if (!certTrack || !certCards.length) return;
        
        const currentCard = certCards[this.state.currentCertificateSlide];
        if (!currentCard) return;
        
        const centeredOffset = currentCard.offsetLeft - Math.max(0, (certTrack.clientWidth - currentCard.offsetWidth) / 2);
        certTrack.scrollTo({
            left: centeredOffset,
            behavior: 'smooth'
        });
    },
    
    /**
     * Get number of slides per view based on screen size
     */
    getSlidesPerView() {
        if (window.innerWidth < 576) return 1;
        if (window.innerWidth < 992) return 2;
        return 3;
    },
    
    /**
     * Go to specific slide
     */
    goToSlide(index) {
        this.state.currentCertificateSlide = index;
        this.updateCertificatesSlider();
    },
    
    /**
     * Update certificates slider position
     */
    updateCertificatesSlider() {
        const { certSlider, certTrack, certCards } = this.elements;
        
        if (!certSlider || !certCards.length) return;
        
        if (this.isMobileCertificatesView()) {
            this.state.currentCertificateSlide = Math.max(0, Math.min(certCards.length - 1, this.state.currentCertificateSlide));
            certSlider.style.transform = '';
            this.scrollCertificateTrackToCurrent();
            this.syncCertificateDots();
            return;
        }
        
        const maxSlide = Math.max(0, certCards.length - this.getSlidesPerView());
        this.state.currentCertificateSlide = Math.max(0, Math.min(maxSlide, this.state.currentCertificateSlide));
        
        if (certTrack) {
            certTrack.scrollTo({ left: 0, behavior: 'auto' });
        }
        
        const cardWidth = certCards[0].offsetWidth;
        const gap = 24;
        const offset = this.state.currentCertificateSlide * (cardWidth + gap);
        
        certSlider.style.transform = `translateX(-${offset}px)`;
        this.syncCertificateDots();
    },
    
    /**
     * Initialize contact form
     */
    initContactForm() {
        const { contactForm, formStatus } = this.elements;
        
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate
            if (!this.validateForm(data)) return;
            
            // Get submit button
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            try {
                // Simulate API call (replace with actual API endpoint)
                await this.submitForm(data);
                
                // Success
                this.showFormStatus('success', 'Message sent successfully! I\'ll get back to you soon.');
                this.showToast('Success!', 'Your message has been sent.');
                contactForm.reset();
                
            } catch (error) {
                // Error
                this.showFormStatus('error', 'Failed to send message. Please try again.');
                console.error('Form submission error:', error);
                
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('.form-input');
        inputs.forEach((input) => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateInput(input);
                }
            });
        });
    },
    
    /**
     * Validate form data
     */
    validateForm(data) {
        let isValid = true;
        const form = this.elements.contactForm;
        
        // Name validation
        const nameInput = form.querySelector('#name');
        if (!data.name || data.name.trim().length < 2) {
            this.showInputError(nameInput, 'Please enter your name');
            isValid = false;
        }
        
        // Email validation
        const emailInput = form.querySelector('#email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
            this.showInputError(emailInput, 'Please enter a valid email');
            isValid = false;
        }
        
        // Message validation
        const messageInput = form.querySelector('#message');
        if (!data.message || data.message.trim().length < 10) {
            this.showInputError(messageInput, 'Message must be at least 10 characters');
            isValid = false;
        }
        
        return isValid;
    },
    
    /**
     * Validate single input
     */
    validateInput(input) {
        const value = input.value.trim();
        const name = input.name;
        let isValid = true;
        let errorMessage = '';
        
        switch (name) {
            case 'name':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Please enter your name';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email';
                }
                break;
            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters';
                }
                break;
        }
        
        if (isValid) {
            this.clearInputError(input);
        } else {
            this.showInputError(input, errorMessage);
        }
        
        return isValid;
    },
    
    /**
     * Show input error
     */
    showInputError(input, message) {
        input.classList.add('error');
        const errorSpan = input.parentElement.querySelector('.form-error');
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    },
    
    /**
     * Clear input error
     */
    clearInputError(input) {
        input.classList.remove('error');
        const errorSpan = input.parentElement.querySelector('.form-error');
        if (errorSpan) {
            errorSpan.textContent = '';
        }
    },
    
    /**
     * Submit form to Firebase Realtime Database
     */
    async submitForm(data) {
        if (!window.ContactAPI?.saveContact) {
            throw new Error('Firebase contact API is not available');
        }

        const payload = {
            name: data.name?.trim() || '',
            email: data.email?.trim() || '',
            subject: data.subject?.trim() || '',
            message: data.message?.trim() || ''
        };

        await window.ContactAPI.saveContact(payload);
        return { success: true };
    },
    
    /**
     * Show form status message
     */
    showFormStatus(type, message) {
        const { formStatus } = this.elements;
        if (!formStatus) return;
        
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.hidden = false;
        
        // Hide after 5 seconds
        setTimeout(() => {
            formStatus.hidden = true;
        }, 5000);
    },
    
    /**
     * Initialize modal
     */
    initModal() {
        const { modal, modalClose, modalBackdrop } = this.elements;
        
        if (!modal) return;
        
        // Close button
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        // Backdrop click
        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', () => this.closeModal());
        }
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.hidden) {
                this.closeModal();
            }
        });
    },
    
    /**
     * Open modal with image
     */
    openModal(imageSrc) {
        const { modal, modalImage } = this.elements;
        
        if (!modal || !modalImage) return;
        
        modalImage.src = imageSrc;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        modal.focus();
    },
    
    /**
     * Close modal
     */
    closeModal() {
        const { modal, modalImage } = this.elements;
        
        if (!modal) return;
        
        modal.hidden = true;
        modalImage.src = '';
        document.body.style.overflow = '';
    },
    
    /**
     * Show toast notification
     */
    showToast(title, message, type = 'success') {
        const { toast } = this.elements;
        
        if (!toast) return;
        
        const toastTitle = toast.querySelector('.toast__title');
        const toastMessage = toast.querySelector('.toast__message');
        const toastIcon = toast.querySelector('.toast__icon i');
        
        if (toastTitle) toastTitle.textContent = title;
        if (toastMessage) toastMessage.textContent = message;
        
        // Update icon based on type
        if (toastIcon) {
            toastIcon.className = type === 'success' 
                ? 'fas fa-check-circle' 
                : 'fas fa-exclamation-circle';
        }
        
        toast.hidden = false;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            toast.hidden = true;
        }, 5000);
        
        // Close button
        if (this.elements.toastClose) {
            this.elements.toastClose.addEventListener('click', () => {
                toast.hidden = true;
            }, { once: true });
        }
    },
    
    /**
     * Initialize back to top button
     */
    initBackToTop() {
        const { backToTop } = this.elements;
        
        if (!backToTop) return;
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },
    
    /**
     * Set current year in footer
     */
    setCurrentYear() {
        const { currentYear } = this.elements;
        
        if (currentYear) {
            currentYear.textContent = new Date().getFullYear();
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for potential use
window.App = App;





