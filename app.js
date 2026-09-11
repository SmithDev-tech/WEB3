/**
 * WE03 - Web3 Design Agency
 * Core Interactive Animations, Responsive Controllers & Spotlight Effects
 */

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initScrollReveal();
    initStatCounters();
    initPricingToggle();
    initCardEffects();
    initSmoothAnchors();
});

/**
 * 1. Header scroll effect: Adds background blur & subtle border on scroll
 */
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    const onScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/**
 * 2. Mobile Navigation Drawer & Hamburger Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a, .mobile-drawer .btn-register');

    if (!menuToggle || !mobileDrawer) return;

    function openMenu() {
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        mobileDrawer.classList.add('open');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    }

    function closeMenu() {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileDrawer.classList.contains('open');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close on click outside drawer content
    mobileDrawer.addEventListener('click', (e) => {
        if (e.target === mobileDrawer) {
            closeMenu();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
            closeMenu();
        }
    });

    // Close when window resized to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && mobileDrawer.classList.contains('open')) {
            closeMenu();
        }
    });
}

/**
 * 3. Scroll Reveal Animations with IntersectionObserver
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-fade-left, .reveal-fade-right, .reveal-scale, .reveal-stagger');

    if (!revealElements.length) return;

    // Immediately reveal hero elements on first render so there's no delay above the fold
    const immediateSelectors = [
        '.hero-viewport .reveal-fade-up',
        '.hero-viewport .reveal-fade-left',
        '.hero-viewport .reveal-fade-right',
        '.hero-viewport .reveal-scale',
        '.pricing-stage .reveal-fade-up',
        '.pricing-stage .reveal-scale'
    ];

    immediateSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.classList.add('revealed');
        });
    });

    if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.08
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        if (!el.classList.contains('revealed')) {
            observer.observe(el);
        }
    });
}

/**
 * 4. Animated Number Counters
 */
function initStatCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (!counterElements.length) return;

    const animateCount = (el) => {
        const rawTarget = el.getAttribute('data-counter');
        const target = parseFloat(rawTarget);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = rawTarget.includes('.') ? rawTarget.split('.')[1].length : 0;
        const duration = 1600; // ms
        const startTime = performance.now();

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const currentValue = (easedProgress * target).toFixed(decimals);

            el.textContent = `${prefix}${currentValue}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
            }
        }

        requestAnimationFrame(update);
    };

    if (!('IntersectionObserver' in window)) {
        counterElements.forEach(animateCount);
        return;
    }

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -15px 0px' });

    counterElements.forEach(el => counterObserver.observe(el));
}

/**
 * 5. Pricing Page Toggle Animation & Dynamic Price Calculation
 */
function initPricingToggle() {
    const toggle = document.getElementById('billing-toggle');
    const priceElements = document.querySelectorAll('.price[data-monthly]');
    const monthlyLabel = document.querySelector('.toggle-label.monthly-label');
    const yearlyLabel = document.querySelector('.toggle-label.yearly-label');

    if (!toggle || !priceElements.length) return;

    const updatePrices = () => {
        const isYearly = toggle.checked;

        if (monthlyLabel && yearlyLabel) {
            if (isYearly) {
                monthlyLabel.classList.remove('active');
                yearlyLabel.classList.add('active');
            } else {
                monthlyLabel.classList.add('active');
                yearlyLabel.classList.remove('active');
            }
        }

        priceElements.forEach(el => {
            const monthlyVal = el.getAttribute('data-monthly');
            const yearlyVal = el.getAttribute('data-yearly');
            const targetVal = isYearly ? yearlyVal : monthlyVal;

            el.classList.add('price-changing');

            setTimeout(() => {
                if (targetVal === 'Free') {
                    el.innerHTML = 'Free';
                } else {
                    el.innerHTML = `$${targetVal}<span>/m</span>`;
                }
                el.classList.remove('price-changing');
            }, 150);
        });
    };

    toggle.addEventListener('change', updatePrices);
}

/**
 * 6. Interactive Card Mouse-Tracking Spotlight Glow
 */
function initCardEffects() {
    const interactiveCards = document.querySelectorAll('.stat-card, .testimonial-card, .card');

    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', '-200px');
            card.style.setProperty('--mouse-y', '-200px');
        });
    });
}

/**
 * 7. Smooth Anchor Navigation with Sticky Header Offset
 */
function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const header = document.querySelector('header');
                const headerOffset = header ? header.offsetHeight + 10 : 70;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
