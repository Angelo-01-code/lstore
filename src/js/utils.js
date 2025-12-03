// src/js/utils.js

export const loadJSON = async (path) => {
    try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading JSON from ${path}:`, error);
        return null;
    }
};

export const showErrorMessage = (containerId) => {
    const container = document.querySelector(containerId);
    if (container) {
        container.innerHTML = '<p style="color: #ff4444; text-align: center; padding: 20px;">Error al cargar el contenido. Por favor, intenta de nuevo m\u00e1s tarde.</p>';
    }
};

export const initializeAOS = () => {
    try {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out',
                once: true,
                offset: 100,
                delay: 50
            });
        }
    } catch (error) {
        console.error('Error initializing AOS:', error);
    }
};

export const initializeFAQ = () => {
    try {
        const faqItems = document.querySelectorAll('.faq-item');
        const collapseItem = (item) => {
            const answer = item.querySelector('.faq-answer');
            const question = item.querySelector('.faq-question');
            if (answer && question) {
                answer.style.maxHeight = null;
                answer.setAttribute('aria-hidden', 'true');
                question.setAttribute('aria-expanded', 'false');
            }
            item.classList.remove('active');
        };

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            const toggle = item.querySelector('.faq-toggle');

            if (question && answer && toggle) {
                question.setAttribute('role', 'button');
                question.setAttribute('aria-expanded', 'false');
                answer.id = answer.id || `faq-answer-${Math.random().toString(36).slice(2)}`;
                question.setAttribute('aria-controls', answer.id);
                answer.setAttribute('aria-hidden', 'true');

                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');

                    faqItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            collapseItem(otherItem);
                        }
                    });

                    if (!isActive) {
                        item.classList.add('active');
                        answer.style.maxHeight = `${answer.scrollHeight}px`;
                        question.setAttribute('aria-expanded', 'true');
                        answer.setAttribute('aria-hidden', 'false');
                    } else {
                        collapseItem(item);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error initializing FAQ:', error);
    }
};

export const initializeCarousel = () => {
    const carouselSlides = document.querySelector('.carousel-slides');
    const paginationDotsContainer = document.querySelector('.carousel-pagination');

    if (!carouselSlides || !paginationDotsContainer) {
        console.warn('Carousel elements not found. Skipping carousel initialization.');
        return;
    }

    const images = [
        '../assets/images/mobile-legends.jpg',
        '../assets/images/pubg-mobile.jpg',
        '../assets/images/free-fire.jpg',
        '../assets/images/genshin-impact.jpg'
    ];

    let currentIndex = 0;
    let slideInterval;

    const updateCarousel = () => {
        carouselSlides.style.transform = `translateX(-${currentIndex * 100}%)`;
        document.querySelectorAll('.pagination-dot').forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.setAttribute('aria-current', 'false');
            }
        });
    };

    const goToSlide = (index) => {
        currentIndex = index;
        updateCarousel();
        resetAutoSlide();
    };

    const prevSlide = () => {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateCarousel();
    };

    const nextSlide = () => {
        currentIndex = (currentIndex + 1) % images.length;
        updateCarousel();
    };

    const startAutoSlide = () => {
        slideInterval = setInterval(nextSlide, 5000);
    };

    const resetAutoSlide = () => {
        clearInterval(slideInterval);
        startAutoSlide();
    };

    const createSlides = () => {
        carouselSlides.innerHTML = '';
        paginationDotsContainer.innerHTML = '';

        images.forEach((src, index) => {
            const slide = document.createElement('div');
            slide.classList.add('carousel-slide');

            const img = document.createElement('img');
            img.src = src;
            img.alt = `Slide ${index + 1}`;
            img.onerror = function() { this.src = '../assets/images/placeholder.jpg'; };
            img.loading = 'lazy';
            img.width = 1920;
            img.height = 1080;
            img.draggable = false;

            slide.appendChild(img);
            carouselSlides.appendChild(slide);

            const dot = document.createElement('span');
            dot.classList.add('pagination-dot');
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Ir al slide ${index + 1}`);
            dot.addEventListener('click', () => goToSlide(index));
            paginationDotsContainer.appendChild(dot);
        });
        updateCarousel();
        startAutoSlide();
    };

    const enableDragNavigation = () => {
        let startX = 0;
        let deltaX = 0;
        let isDragging = false;

        const getClientX = (event) => event.touches ? event.touches[0].clientX : event.clientX;

        const onDragStart = (event) => {
            if (event.type === 'mousedown' && event.button !== 0) return;
            event.preventDefault();
            startX = getClientX(event);
            isDragging = true;
            deltaX = 0;
            carouselSlides.style.transition = 'none';
            clearInterval(slideInterval);
        };

        const onDragMove = (event) => {
            if (!isDragging) return;
            if (event.cancelable) event.preventDefault();
            const currentX = getClientX(event);
            deltaX = currentX - startX;
            carouselSlides.style.transform = `translateX(calc(-${currentIndex * 100}% + ${deltaX}px))`;
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            carouselSlides.style.transition = 'transform 0.6s ease';

            if (Math.abs(deltaX) > 60) {
                if (deltaX < 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            } else {
                updateCarousel();
            }
            resetAutoSlide();
        };

        carouselSlides.addEventListener('dragstart', (e) => e.preventDefault());
        carouselSlides.addEventListener('mousedown', onDragStart);
        carouselSlides.addEventListener('touchstart', onDragStart, { passive: true });
        window.addEventListener('mousemove', onDragMove, { passive: false });
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('mouseup', onDragEnd);
        window.addEventListener('mouseleave', onDragEnd);
        window.addEventListener('touchend', onDragEnd);
        window.addEventListener('touchcancel', onDragEnd);
    };

    createSlides();
    enableDragNavigation();
};

export const renderGames = (games, containerId, cardClass) => {
    const container = document.querySelector(containerId);
    if (!container) return;

    container.innerHTML = '';

    const fragment = document.createDocumentFragment();

    games.forEach(game => {
        const link = `shop.html?game=${game.id}`;
        const gameCard = document.createElement('a');
        gameCard.href = link;
        gameCard.className = cardClass;
        gameCard.setAttribute('data-category', game.category);
        gameCard.setAttribute('data-aos', 'fade-up');

        if (cardClass === 'gallery-item') {
            const delay = Math.floor(Math.random() * 3) * 100;
            gameCard.setAttribute('data-aos-delay', delay.toString());
        }

        gameCard.innerHTML = `
            <div class="${cardClass === 'game-card' ? 'game-image' : 'gallery-image'}">
                <img loading="lazy" src="../assets/images/${game.image.split('/').pop()}" alt="${game.title}" onerror="this.src='../assets/images/placeholder.jpg'">
                ${game.badge ? `<span class="product-badge">${game.badge}</span>` : ''}
            </div>
            <div class="game-title">${game.title}</div>
        `;
        fragment.appendChild(gameCard);
    });
    container.appendChild(fragment);
};

export const renderPaymentMethods = (methods, containerElement, type) => {
    if (!containerElement) return;

    containerElement.innerHTML = '';

    const fragment = document.createDocumentFragment();

    methods.forEach((method, index) => {
        const isDefault = index === 0;
        const label = document.createElement('label');
        label.className = `${type}-payment-label cursor-pointer`;
        label.setAttribute('tabindex', '0');
        label.setAttribute('data-method-id', method.id);
        label.setAttribute('role', 'radio');
        label.setAttribute('aria-checked', isDefault ? 'true' : 'false');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'payment';
        input.className = 'sr-only';
        input.value = method.id;
        if (isDefault) {
            input.checked = true;
            label.classList.add('selected');
        }

        const imgWrapper = document.createElement('div');
        imgWrapper.className = `${type}-payment-img-wrapper`;
        const img = document.createElement('img');
        img.alt = `Logo de ${method.name}`;
        img.height = 40;
        img.src = `../assets/images/${method.image.split('/').pop()}`;
        img.width = 60;
        imgWrapper.appendChild(img);

        const span = document.createElement('span');
        const textColor = method.id === 'googlepay' ? '#D9F99D' : (method.textColor || '#D9F99D');
        span.style.color = textColor;
        span.textContent = method.name;

        label.appendChild(input);
        label.appendChild(imgWrapper);
        label.appendChild(span);

        label.addEventListener('click', function() {
            containerElement.querySelectorAll(`.${type}-payment-label`).forEach(item => {
                item.classList.remove('selected');
                item.setAttribute('aria-checked', 'false');
            });
            this.classList.add('selected');
            this.setAttribute('aria-checked', 'true');
        });

        fragment.appendChild(label);
    });
    containerElement.appendChild(fragment);
};
