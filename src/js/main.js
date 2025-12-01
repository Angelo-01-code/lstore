// src/js/main.js
import { initializeNavigation, initializeScrollEffects, loadPartials } from './navigation.js';
import { initializeAOS, initializeFAQ, initializeCarousel } from './utils.js';
import { loadShopData, initializeModals } from './shop.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Carga los partials de header y footer antes de inicializar comportamientos
    await loadPartials();

    // Inicializa navegacion y efectos de scroll
    initializeNavigation();
    initializeScrollEffects();

    // Inicializa AOS para animaciones
    initializeAOS();

    // Inicializa FAQ si existe la seccion
    if (document.querySelector('.faq-section')) {
        initializeFAQ();
    }

    // Inicializa carrusel si existe la seccion
    if (document.querySelector('.hero-carousel')) {
        initializeCarousel();
    }

    // Carga datos de juegos y metodos de pago, y renderiza segun pagina
    await loadShopData();

    // Inicializa modales (confirmacion de pedido)
    initializeModals();

    // Logica para el link "Tienda" que hace scroll en index.html
    const tiendaLink = document.getElementById('tienda-link');
    if (tiendaLink) {
        tiendaLink.addEventListener('click', (event) => {
            event.preventDefault();
            const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
            if (isHome) {
                const allGamesSection = document.getElementById('all-games');
                if (allGamesSection) {
                    allGamesSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    console.log('L-Store app initialized successfully with modular structure');
});
