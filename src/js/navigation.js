// src/js/navigation.js
export const initializeNavigation = () => {
    try {
        const navToggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.nav');
        const navLinks = document.querySelectorAll('.nav a');
        const closeMenu = () => {
            if (!nav || !navToggle) return;
            nav.classList.remove('open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        };

        if (navToggle && nav) {
            navToggle.addEventListener('click', () => {
                nav.classList.toggle('open');
                navToggle.classList.toggle('active');
                navToggle.setAttribute('aria-expanded', navToggle.classList.contains('active').toString());
            });

            navLinks.forEach(link => {
                link.addEventListener('click', closeMenu);
            });

            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
                    closeMenu();
                }
            }, { passive: true });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && nav.classList.contains('open')) {
                    closeMenu();
                }
            });
        }

        // Highlight active navigation link
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });

        // Legal modal
        const legalLink = document.getElementById('legal-link');
        const legalModal = document.getElementById('legalModal');
        const legalCloseBtn = document.getElementById('legalCloseBtn');
        if (legalLink && legalModal) {
            const closeLegal = () => {
                legalModal.classList.remove('show');
                legalModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = 'auto';
            };
            legalLink.addEventListener('click', () => {
                legalModal.classList.add('show');
                legalModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            });
            if (legalCloseBtn) {
                legalCloseBtn.addEventListener('click', closeLegal);
            }
            legalModal.addEventListener('click', (e) => {
                if (e.target === legalModal) closeLegal();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && legalModal.classList.contains('show')) {
                    closeLegal();
                }
            });
        }

    } catch (error) {
        console.error('Error initializing navigation:', error);
    }
};

export const initializeScrollEffects = () => {
    try {
        const header = document.querySelector('.site-header');

        if (header) {
            const handleScroll = () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                if (scrollTop > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                header.style.transform = 'translateY(0)';
            };

            handleScroll();
            window.addEventListener('scroll', handleScroll, { passive: true });
        }
    } catch (error) {
        console.error('Error initializing scroll effects:', error);
    }
};

export const loadPartials = async () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    const fetchPartial = async (placeholder, fileName) => {
        try {
            const response = await fetch(`../src/partials/${fileName}`);
            if (response.ok) {
                placeholder.innerHTML = await response.text();
            } else {
                console.error(`Failed to load ${fileName}.`);
            }
        } catch (error) {
            console.error(`Error loading ${fileName}:`, error);
        }
    };

    await Promise.all([
        headerPlaceholder ? fetchPartial(headerPlaceholder, 'header.html') : null,
        footerPlaceholder ? fetchPartial(footerPlaceholder, 'footer.html') : null
    ]);
};
