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

    // Footer acordeones en mobile
    initializeFooterAccordion();

    // Logica para los links "Tienda" que hacen scroll en index.html
    const tiendaLinks = document.querySelectorAll('#tienda-link, .footer-tienda-link');
    if (tiendaLinks.length) {
        tiendaLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';
                if (isHome) {
                    const allGamesSection = document.querySelector('.games-gallery');
                    if (allGamesSection) {
                        allGamesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    window.location.href = 'index.html';
                }
            });
        });
    }

    console.log('L-Store app initialized successfully with modular structure');
});

function initializeFooterAccordion() {
    const accordions = document.querySelectorAll('.footer-accordion');
    if (!accordions.length) return;

    const mq = window.matchMedia('(max-width: 768px)');

    const applyState = () => {
        accordions.forEach(acc => {
            const toggle = acc.querySelector('.footer-accordion-toggle');
            const panel = acc.querySelector('.footer-accordion-panel');
            if (!toggle || !panel) return;
            if (mq.matches) {
                const isOpen = acc.classList.contains('open');
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                toggle.style.cursor = 'pointer';
            } else {
                acc.classList.add('open');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.style.cursor = 'default';
            }
        });
    };

    accordions.forEach(acc => {
        const toggle = acc.querySelector('.footer-accordion-toggle');
        if (!toggle) return;
        toggle.addEventListener('click', () => {
            if (!mq.matches) return;
            // close others
            accordions.forEach(other => {
                if (other !== acc) {
                    other.classList.remove('open');
                }
            });
            acc.classList.toggle('open');
            applyState();
        });
    });

    mq.addEventListener('change', applyState);
    applyState();
}
