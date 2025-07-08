// DOM Elements
const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');
const statNumbers = document.querySelectorAll('.stat-number');
const contactForm = document.getElementById('contactForm');

// Header Scroll Effect
function handleScroll() {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// Close mobile menu when clicking on a link
function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
}

// Smooth Scrolling
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerHeight = header.offsetHeight;
        const elementPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Counter Animation with decimal support
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0; // Check if target has decimal places
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (target - start) * easeOutQuart;
        
        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Intersection Observer for Animations
function createIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Trigger counter animation for stats
                if (entry.target.classList.contains('stats')) {
                    statNumbers.forEach(stat => {
                        const target = parseFloat(stat.getAttribute('data-count'));
                        animateCounter(stat, target);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .feature, .contact-item, .stats');
    animatedElements.forEach(el => observer.observe(el));
}

// Form Validation and Submission
function validateForm(formData) {
    const errors = [];
    
    // Name validation
    if (!formData.get('name') || formData.get('name').trim().length < 2) {
        errors.push('성함을 정확히 입력해주세요 (2자 이상)');
    }
    
    // Phone validation
    const phone = formData.get('phone');
    const phoneRegex = /^[0-9-+\s()]{10,}$/;
    if (!phone || !phoneRegex.test(phone)) {
        errors.push('올바른 연락처를 입력해주세요');
    }
    
    // Email validation
    const email = formData.get('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('올바른 이메일 주소를 입력해주세요');
    }
    
    // Service selection validation
    if (!formData.get('service')) {
        errors.push('관심 있는 서비스를 선택해주세요');
    }
    
    // Message validation
    if (!formData.get('message') || formData.get('message').trim().length < 10) {
        errors.push('도입 계획 및 문의 내용을 자세히 작성해주세요 (10자 이상)');
    }
    
    return errors;
}

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Color mapping for different notification types
    const colors = {
        'success': 'var(--primary-green)',
        'error': '#dc3545',
        'info': 'var(--secondary-green)'
    };
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return;
    }
    
    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = '분석 중...';
    submitButton.disabled = true;
    
    // Simulate form submission with processing
    setTimeout(() => {
        // Reset form
        contactForm.reset();
        
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showNotification('시스템 문의가 접수되었습니다. 전문가가 곧 연락드리겠습니다.');
    }, 1500);
}

// Hero Button Handlers
function handleHeroButtons() {
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    
    heroButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (button.textContent.includes('체험')) {
                showNotification('시스템 체험 페이지로 이동합니다.', 'info');
                setTimeout(() => {
                    smoothScroll('#services');
                }, 500);
            } else if (button.textContent.includes('서비스')) {
                showNotification('서비스 상세 정보를 확인하세요.', 'info');
                setTimeout(() => {
                    smoothScroll('#services');
                }, 500);
            }
        });
    });
}

// Background Image Slider
function initializeBackgroundSlider() {
    const images = document.querySelectorAll(".hero-bg-slider img");
    let current = 0;

    // Change image every 4 seconds
    setInterval(() => {
        images[current].classList.remove("active");
        current = (current + 1) % images.length;
        images[current].classList.add("active");
    }, 4000);
}

// Scroll to Top Functionality
function createScrollToTopButton() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-green);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(45, 90, 61, 0.3);
    `;
    
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(scrollButton);
    
    // Show/hide scroll button based on scroll position
    function toggleScrollButton() {
        if (window.scrollY > 500) {
            scrollButton.style.opacity = '1';
            scrollButton.style.visibility = 'visible';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.visibility = 'hidden';
        }
    }
    
    window.addEventListener('scroll', toggleScrollButton);
}

// Add CSS for animations
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .service-card,
        .feature,
        .contact-item {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .service-card.animate,
        .feature.animate,
        .contact-item.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .notification {
            font-family: var(--font-family);
        }
        
        @media (hover: hover) {
            .scroll-to-top:hover {
                background: var(--dark-green);
                transform: translateY(-2px);
            }
        }
        
        /* AI Badge Animation */
        .feature-badge {
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from {
                box-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
            }
            to {
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
            }
        }
    `;
    document.head.appendChild(style);
}

// Lazy Loading for Images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// System Feature Demo (for demonstration)
function initializeSystemDemo() {
    const systemButtons = document.querySelectorAll('.service-card');
    
    systemButtons.forEach((card, index) => {
        card.addEventListener('click', () => {
            const serviceName = card.querySelector('h3').textContent;
            showNotification(`${serviceName} 데모를 준비 중입니다...`, 'info');
            
            // Simulate system processing
            setTimeout(() => {
                const messages = [
                    '자동 분류 정확도: 99.8% 달성',
                    '품질 검수 완료: A등급 판정',
                    '실시간 모니터링 활성화됨',
                    '데이터 분석 리포트 생성 완료'
                ];
                showNotification(messages[index] || '시스템이 정상 작동 중입니다.');
            }, 2000);
        });
    });
}

// Initialize Page Functionality
function initializePage() {
    // Add animation styles
    addAnimationStyles();
    
    // Initialize background slider
    initializeBackgroundSlider();
    
    // Set up event listeners
    window.addEventListener('scroll', handleScroll);
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Handle hero buttons
    handleHeroButtons();
    
// Handle navigation links (updated for page navigation)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
            e.preventDefault();
            smoothScroll(href);
            closeMobileMenu();
        } else {
            // For external page links, just close mobile menu
            closeMobileMenu();
        }
    });
});

// Service Page Specific Functions
function initializeServicePageFeatures() {
    // Animate service detail sections on scroll
    const serviceDetails = document.querySelectorAll('.service-detail');
    
    const serviceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    serviceDetails.forEach(section => {
        serviceObserver.observe(section);
    });
    
    // Animate benefit cards
    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // FAQ functionality (if exists on page)
    initializeFAQ();
    
    // Process flow animation
    animateProcessFlow();
    
    // Tech specs hover effects
    initializeTechSpecs();
}

// FAQ Toggle Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        if (question && answer && toggle) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        const otherToggle = otherItem.querySelector('.faq-toggle');
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                        if (otherToggle) otherToggle.textContent = '+';
                    }
                });
                
                // Toggle current item
                if (isOpen) {
                    item.classList.remove('open');
                    answer.style.maxHeight = null;
                    toggle.textContent = '+';
                } else {
                    item.classList.add('open');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    toggle.textContent = '-';
                }
            });
        }
    });
}

// Process Flow Animation
function animateProcessFlow() {
    const processSteps = document.querySelectorAll('.process-step');
    
    const processObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, {
        threshold: 0.1
    });
    
    processSteps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(30px)';
        step.style.transition = 'all 0.6s ease';
        processObserver.observe(step);
    });
}

// Tech Specs Interactive Features
function initializeTechSpecs() {
    const specItems = document.querySelectorAll('.spec-item');
    
    specItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.02)';
            item.style.boxShadow = '0 4px 15px rgba(45, 90, 61, 0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
            item.style.boxShadow = 'none';
        });
    });
}

// Enhanced Service Demo for detailed pages
function initializeEnhancedServiceDemo() {
    const serviceCards = document.querySelectorAll('.service-card, .benefit-card');
    
    serviceCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const serviceName = card.querySelector('h3')?.textContent || '서비스';
            
            // Create loading animation
            showServiceDemo(serviceName, index);
        });
        
        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.cursor = 'pointer';
        });
    });
}

function showServiceDemo(serviceName, index) {
    showNotification(`${serviceName} 데모를 시작합니다...`, 'info');
    
    // Simulate different demo scenarios
    setTimeout(() => {
        const demoMessages = [
            '자동 분류 시스템이 가동되었습니다.',
            '품질 검수 프로세스를 실행 중입니다.',
            '실시간 모니터링 대시보드를 표시합니다.',
            '데이터 분석 결과를 생성했습니다.',
            '시스템 최적화를 완료했습니다.'
        ];
        
        const message = demoMessages[index % demoMessages.length];
        showNotification(message, 'success');
        
        // Show additional info after demo
        setTimeout(() => {
            showNotification('자세한 정보는 담당자에게 문의하세요.', 'info');
        }, 3000);
    }, 2000);
}

// Page-specific initialization
function initializePageSpecificFeatures() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('services.html') || currentPage.includes('services')) {
        initializeServicePageFeatures();
        initializeEnhancedServiceDemo();
    }
    
    // Add active state to current page nav item
    updateActiveNavigation();
}

// Update active navigation based on current page
function updateActiveNavigation() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href && currentPage.includes(href)) {
            link.classList.add('active');
        } else if (currentPage === '/' || currentPage.includes('index.html')) {
            if (href === 'index.html' || href === '/') {
                link.classList.add('active');
            }
        }
    });
}

// Enhanced notification system for service demos
function showEnhancedNotification(message, type = 'success', duration = 5000) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const colors = {
        'success': 'var(--primary-green)',
        'error': '#dc3545',
        'info': 'var(--secondary-green)',
        'demo': 'var(--accent-green)'
    };
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'demo': '🔬'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-text">${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}
    
    // Set up form handling
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Initialize intersection observer for animations
    createIntersectionObserver();
    
    // Create scroll to top button
    createScrollToTopButton();
    
    // Initialize lazy loading
    lazyLoadImages();
    
    // Initialize system demo features
    initializeSystemDemo();
    
    // Initialize page-specific features
    initializePageSpecificFeatures();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Handle form input animations
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
}

// Performance optimization: Use requestIdleCallback if available
if ('requestIdleCallback' in window) {
    requestIdleCallback(initializePage);
} else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(initializePage, 100);
}

// Handle page visibility change (pause animations when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy animations when page is not visible
        document.body.classList.add('page-hidden');
    } else {
        document.body.classList.remove('page-hidden');
    }
});

// Add error handling for any uncaught errors
window.addEventListener('error', (e) => {
    console.warn('페이지 오류:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Prevent accidental form submission on Enter key for specific inputs
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.type === 'text') {
        const form = e.target.closest('form');
        if (form && !e.target.closest('textarea')) {
            e.preventDefault();
            const nextInput = form.querySelector(`input:not([type="submit"]):not([type="button"])`);
            if (nextInput) {
                nextInput.focus();
            }
        }
    }
});

// Welcome message for system
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🌱 GreenCycle 스마트 시스템이 초기화되었습니다.');
        console.log('💚 지속 가능한 미래를 위한 첨단 폐기물 관리');
    }, 4000);
});