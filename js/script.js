// L-Store JavaScript - Interactive functionality
(function() {
    'use strict';

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    function initializeApp() {
        try {
            // Initialize all components
            initializeNavigation();
            initializeScrollEffects();
            initializeFilters();
            initializeModals();
            initializeFAQ();
            initializeAOS();
            loadGameCatalog();
            
            console.log('L-Store app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    // Load game catalog from catalog.json
    function loadGameCatalog() {
        fetch('assets/packages/catalog.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (document.getElementById('featured-games')) {
                    renderGames(data.featured, '#featured-games', 'game-card');
                }
                if (document.getElementById('all-games')) {
                    renderGames(data.all, '#all-games', 'gallery-item');
                }
                if (document.getElementById('shop-products')) {
                    renderProducts(data.products, '#shop-products');
                }
            })
            .catch(error => {
                console.error('Error loading catalog:', error);
                showErrorMessage();
            });
    }

    function showErrorMessage() {
        const containers = ['#featured-games', '#all-games', '#shop-products'];
        containers.forEach(containerId => {
            const container = document.querySelector(containerId);
            if (container) {
                container.innerHTML = '<p style="color: #ff4444; text-align: center;">Error al cargar el catálogo. Por favor, intenta de nuevo más tarde.</p>';
            }
        });
    }

    function renderGames(games, containerId, cardClass) {
        const container = document.querySelector(containerId);
        if (!container) return;

        container.innerHTML = games.map(game => {
            const link = cardClass === 'game-card' ? `javascript:LStore.openGameModal('${game.id}')` : (game.category === 'mobile-legends' || game.category === 'pubg-mobile' || game.category === 'free-fire' ? 'shop.html' : '#');
            return `
                <a href="${link}" class="${cardClass}" data-category="${game.category}" data-aos="fade-up">
                    <div class="${cardClass === 'game-card' ? 'game-image' : 'gallery-image'}">
                        <img loading="lazy" src="${game.image}" alt="${game.title}" onerror="this.src='assets/images/placeholder.jpg'">
                        ${game.badge ? `<span class="product-badge">${game.badge}</span>` : ''}
                    </div>
                    <div class="game-title">${game.title}</div>
                </a>
            `;
        }).join('');
    }

    function renderProducts(products, containerId) {
        const container = document.querySelector(containerId);
        if (!container) return;

        container.innerHTML = products.map(product => `
            <div class="product-card" data-category="${product.category}" data-aos="fade-up">
                <div class="product-image">
                    <img loading="lazy" src="${product.image}" alt="${product.title}" onerror="this.src='assets/images/placeholder.jpg'">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                </div>
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <div class="product-options">
                        ${product.packages.map(pkg => `
                            <div class="option">
                                <span class="amount">${pkg.amount}</span>
                                <span class="price">${pkg.price}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="product-actions">
                        <a href="#" class="btn btn-primary" onclick="LStore.openModal('${product.id}')">Ver Detalles</a>
                        <a href="https://wa.me/1234567890?text=Hola!%20Quiero%20comprar%20${encodeURIComponent(product.title)}" class="btn btn-whatsapp" target="_blank">Ordenar por WhatsApp</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Navigation functionality
    function initializeNavigation() {
        try {
            const navToggle = document.querySelector('.nav-toggle');
            const nav = document.querySelector('.nav');
            const navLinks = document.querySelectorAll('.nav a');

            if (navToggle && nav) {
                // Mobile menu toggle
                navToggle.addEventListener('click', function() {
                    nav.classList.toggle('open');
                    navToggle.classList.toggle('active');
                });

                // Close mobile menu when clicking on links
                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        nav.classList.remove('open');
                        navToggle.classList.remove('active');
                    });
                });

                // Close mobile menu when clicking outside
                document.addEventListener('click', function(e) {
                    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
                        nav.classList.remove('open');
                        navToggle.classList.remove('active');
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing navigation:', error);
        }
    }

    // Scroll effects
    function initializeScrollEffects() {
        try {
            const header = document.querySelector('.site-header');
            let lastScrollTop = 0;

            if (header) {
                window.addEventListener('scroll', function() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    
                    // Add scrolled class when scrolling down
                    if (scrollTop > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }

                    // Hide header when scrolling down, show when scrolling up
                    if (scrollTop > lastScrollTop && scrollTop > 100) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }
                    
                    lastScrollTop = scrollTop;
                });
            }
        } catch (error) {
            console.error('Error initializing scroll effects:', error);
        }
    }

    // Product filters functionality
    function initializeFilters() {
        try {
            const filterButtons = document.querySelectorAll('.filter-btn');
            const productCards = document.querySelectorAll('.product-card');

            if (filterButtons.length > 0 && productCards.length > 0) {
                filterButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const category = this.getAttribute('data-category');
                        
                        // Update active button
                        filterButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Filter products
                        filterProducts(category, productCards);
                    });
                });
            }
        } catch (error) {
            console.error('Error initializing filters:', error);
        }
    }

    function filterProducts(category, productCards) {
        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Modal functionality
    function initializeModals() {
        try {
            const modal = document.getElementById('productModal');
            const gameModal = document.getElementById('gameModal');
            const closeButtons = document.querySelectorAll('.close');

            // Close modals when clicking close button
            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    closeModal(modal);
                    closeModal(gameModal);
                });
            });

            // Close modals when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal(modal);
                }
                if (e.target === gameModal) {
                    closeModal(gameModal);
                }
            });

            // Close modals with Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeModal(modal);
                    closeModal(gameModal);
                }
            });
        } catch (error) {
            console.error('Error initializing modals:', error);
        }
    }

    // Open product modal
    window.LStore = window.LStore || {};
    window.LStore.openModal = function(productId) {
        try {
            const modal = document.getElementById('productModal');
            const modalBody = document.getElementById('modalBody');
            
            if (modal && modalBody) {
                const productData = getProductData(productId);
                modalBody.innerHTML = generateModalContent(productData);
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('Error opening modal:', error);
        }
    };

    // Open game modal
    window.LStore.openGameModal = function(gameId) {
        try {
            const modal = document.getElementById('gameModal');
            const modalBody = document.getElementById('gameModalBody');
            
            if (modal && modalBody) {
                const gameData = getGameData(gameId);
                modalBody.innerHTML = generateGameModalContent(gameData);
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('Error opening game modal:', error);
        }
    };

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Product data (fallback in case catalog.json fails)
    function getProductData(productId) {
        const products = {
            'ml-diamonds': {
                title: 'Diamantes de Mobile Legends',
                description: 'Diamantes premium para Mobile Legends Bang Bang. Obtén skins exclusivos, héroes y pases de batalla.',
                image: 'assets/images/ml-diamonds.jpg',
                packages: [
                    { amount: '86 Diamantes', price: '$2.99', popular: false },
                    { amount: '172 Diamantes', price: '$5.99', popular: true },
                    { amount: '344 Diamantes', price: '$11.99', popular: false },
                    { amount: '706 Diamantes', price: '$23.99', popular: false },
                    { amount: '1412 Diamantes', price: '$47.99', popular: false }
                ],
                features: [
                    'Entrega instantánea en 5-15 minutos',
                    'Método de recarga seguro',
                    'Soporte al cliente 24/7',
                    'Mejores precios garantizados'
                ]
            },
            'pubg-uc': {
                title: 'UC de PUBG Mobile',
                description: 'Unknown Cash para PUBG Mobile. Compra trajes premium, skins de armas y pases de batalla.',
                image: 'assets/images/pubg-uc.jpg',
                packages: [
                    { amount: '60 UC', price: '$0.99', popular: false },
                    { amount: '325 UC', price: '$4.99', popular: true },
                    { amount: '660 UC', price: '$9.99', popular: false },
                    { amount: '1800 UC', price: '$24.99', popular: false },
                    { amount: '3850 UC', price: '$49.99', popular: false }
                ],
                features: [
                    'Recarga oficial de PUBG Mobile',
                    'Entrega instantánea de UC',
                    'Métodos de pago seguros',
                    'Satisfacción garantizada'
                ]
            },
            'ff-diamonds': {
                title: 'Diamantes de Free Fire',
                description: 'Diamantes premium para Garena Free Fire. Desbloquea personajes, mascotas y paquetes exclusivos.',
                image: 'assets/images/ff-diamonds.jpg',
                packages: [
                    { amount: '100 Diamantes', price: '$1.99', popular: false },
                    { amount: '310 Diamantes', price: '$4.99', popular: true },
                    { amount: '520 Diamantes', price: '$7.99', popular: false },
                    { amount: '1080 Diamantes', price: '$14.99', popular: false },
                    { amount: '2200 Diamantes', price: '$29.99', popular: false }
                ],
                features: [
                    'Entrega rápida y confiable',
                    'Diamantes oficiales de Free Fire',
                    'Múltiples opciones de pago',
                    'Confiado por miles de jugadores'
                ]
            },
            'cod-cp': {
                title: 'Puntos COD',
                description: 'Puntos COD para Call of Duty Mobile. Obtén pases de batalla y artículos premium.',
                image: 'assets/images/cod-cp.jpg',
                packages: [
                    { amount: '80 CP', price: '$0.99', popular: false },
                    { amount: '400 CP', price: '$4.99', popular: true },
                    { amount: '800 CP', price: '$9.99', popular: false },
                    { amount: '2000 CP', price: '$24.99', popular: false },
                    { amount: '4000 CP', price: '$49.99', popular: false }
                ],
                features: [
                    'Entrega instantánea',
                    'Método de recarga oficial',
                    'Soporte 24/7',
                    'Precios competitivos'
                ]
            },
            'valorant-vp': {
                title: 'Puntos Valorant',
                description: 'VP para Valorant. Compra skins premium, pases de batalla y agentes.',
                image: 'assets/images/valorant-vp.jpg',
                packages: [
                    { amount: '475 VP', price: '$4.99', popular: false },
                    { amount: '1000 VP', price: '$9.99', popular: true },
                    { amount: '2050 VP', price: '$19.99', popular: false },
                    { amount: '4000 VP', price: '$34.99', popular: false },
                    { amount: '8150 VP', price: '$69.99', popular: false }
                ],
                features: [
                    'Entrega rápida',
                    'Método de recarga seguro',
                    'Soporte al cliente 24/7',
                    'Precios competitivos'
                ]
            },
            'genshin-crystals': {
                title: 'Cristales Génesis',
                description: 'Moneda premium para Genshin Impact. Obtén personajes y armas.',
                image: 'assets/images/genshin-crystals.jpg',
                packages: [
                    { amount: '60 Cristales', price: '$0.99', popular: false },
                    { amount: '300 Cristales', price: '$4.99', popular: true },
                    { amount: '980 Cristales', price: '$14.99', popular: false },
                    { amount: '1980 Cristales', price: '$29.99', popular: false },
                    { amount: '3280 Cristales', price: '$49.99', popular: false }
                ],
                features: [
                    'Entrega instantánea',
                    'Método de recarga oficial',
                    'Soporte 24/7',
                    'Precios competitivos'
                ]
            }
        };
        return products[productId] || {};
    }

    // Game data (fallback for game modals)
    function getGameData(gameId) {
        const games = {
            'mobile-legends': {
                title: 'Mobile Legends',
                description: 'Paquetes premium para Mobile Legends Bang Bang. Obtén diamantes para skins, héroes y más.',
                image: 'assets/images/mobile-legends-banner.jpg',
                features: [
                    'Diamantes para compras en el juego',
                    'Entrega instantánea',
                    'Soporte para todas las regiones',
                    'Precios competitivos'
                ],
                relatedProducts: ['ml-diamonds']
            },
            'pubg-mobile': {
                title: 'PUBG Mobile',
                description: 'UC para PUBG Mobile. Compra trajes, skins de armas y pases de batalla.',
                image: 'assets/images/pubg-banner.jpg',
                features: [
                    'UC oficial para PUBG Mobile',
                    'Entrega rápida',
                    'Métodos de pago seguros',
                    'Soporte 24/7'
                ],
                relatedProducts: ['pubg-uc']
            },
            'free-fire': {
                title: 'Free Fire',
                description: 'Diamantes premium para Garena Free Fire. Desbloquea personajes, mascotas y paquetes exclusivos.',
                image: 'assets/images/free-fire-banner.jpg',
                features: [
                    'Diamantes oficiales',
                    'Entrega en minutos',
                    'Múltiples opciones de pago',
                    'Confiado por miles'
                ],
                relatedProducts: ['ff-diamonds']
            },
            'cod-mobile': {
                title: 'Call of Duty Mobile',
                description: 'Puntos COD para Call of Duty Mobile. Obtén pases de batalla y artículos premium.',
                image: 'assets/images/cod-mobile.jpg',
                features: [
                    'Entrega instantánea',
                    'Método de recarga oficial',
                    'Soporte 24/7',
                    'Precios competitivos'
                ],
                relatedProducts: ['cod-cp']
            },
            'valorant': {
                title: 'Valorant',
                description: 'Puntos VP para Valorant. Compra skins premium y pases de batalla.',
                image: 'assets/images/valorant.jpg',
                features: [
                    'Entrega rápida',
                    'Método de recarga seguro',
                    'Soporte al cliente 24/7',
                    'Precios competitivos'
                ],
                relatedProducts: ['valorant-vp']
            },
            'genshin-impact': {
                title: 'Genshin Impact',
                description: 'Cristales Génesis para Genshin Impact. Obtén personajes y armas.',
                image: 'assets/images/genshin-impact.jpg',
                features: [
                    'Entrega instantánea',
                    'Método de recarga oficial',
                    'Soporte 24/7',
                    'Precios competitivos'
                ],
                relatedProducts: ['genshin-crystals']
            }
        };
        return games[gameId] || {};
    }

    // Generate modal content for products
    function generateModalContent(product) {
        return `
            <div class="modal-header">
                <h2>${product.title}</h2>
            </div>
            <div class="modal-body">
                <img src="${product.image}" alt="${product.title}" class="modal-image" loading="lazy">
                <p>${product.description}</p>
                <h3>Paquetes Disponibles</h3>
                <div class="modal-packages">
                    ${product.packages.map(pkg => `
                        <div class="package-option ${pkg.popular ? 'popular' : ''}">
                            <span class="amount">${pkg.amount}</span>
                            <span class="price">${pkg.price}</span>
                            ${pkg.popular ? '<span class="popular-badge">Popular</span>' : ''}
                        </div>
                    `).join('')}
                </div>
                <h3>Características</h3>
                <ul class="modal-features">
                    ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <a href="https://wa.me/1234567890?text=Hola!%20Quiero%20comprar%20${encodeURIComponent(product.title)}" class="btn btn-whatsapp btn-large" target="_blank">Ordenar por WhatsApp</a>
            </div>
        `;
    }

    // Generate modal content for games
    function generateGameModalContent(game) {
        return `
            <div class="modal-header">
                <h2>${game.title}</h2>
            </div>
            <div class="modal-body">
                <img src="${game.image}" alt="${game.title}" class="modal-image" loading="lazy">
                <p>${game.description}</p>
                <h3>Características</h3>
                <ul class="modal-features">
                    ${game.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <a href="shop.html" class="btn btn-primary btn-large">Ver Paquetes</a>
            </div>
        `;
    }

    // FAQ accordion functionality
    function initializeFAQ() {
        try {
            const faqItems = document.querySelectorAll('.faq-item');

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                if (question) {
                    question.addEventListener('click', function() {
                        const isActive = item.classList.contains('active');
                        
                        // Close all other FAQ items
                        faqItems.forEach(i => {
                            i.classList.remove('active');
                            const answer = i.querySelector('.faq-answer');
                            if (answer) {
                                answer.style.maxHeight = null;
                            }
                        });

                        // Toggle current FAQ item
                        if (!isActive) {
                            item.classList.add('active');
                            const answer = item.querySelector('.faq-answer');
                            if (answer) {
                                answer.style.maxHeight = answer.scrollHeight + 'px';
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error initializing FAQ:', error);
        }
    }

    // Initialize AOS animations
    function initializeAOS() {
        try {
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    easing: 'ease-out',
                    once: true,
                    offset: 100
                });
            }
        } catch (error) {
            console.error('Error initializing AOS:', error);
        }
    }

    // Lazy loading images (handled natively with loading="lazy")
    // Fallback for older browsers
    if ('loading' in HTMLImageElement.prototype) {
        console.log('Native lazy loading supported');
    } else {
        console.log('Native lazy loading not supported, consider adding polyfill');
    }

})();