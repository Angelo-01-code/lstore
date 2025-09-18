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
            initializeFAQ(); // FAQ Accordion
            initializeAOS(); // AOS Animations
            loadGameCatalog(); // Loads game data and initializes product page
            loadPaymentMethods(); // Loads payment methods
            initializeCarousel(); // Hero Carousel
            initializeModals(); // Order Confirmation Modal

            console.log('L-Store app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    // Global data stores
    let gameCatalogData = null;
    let paymentMethodsData = null;
    let currentProduct = null; // Stores the currently displayed product data

    // --- Data Loading Functions ---
    function loadGameCatalog() {
        fetch('assets/packages/catalog.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                gameCatalogData = data; // Store the fetched data
                if (document.getElementById('featured-games')) {
                    renderGames(data.featured, '#featured-games', 'game-card');
                }
                if (document.getElementById('all-games')) {
                    renderGames(data.all, '#all-games', 'gallery-item');
                }

                // Initialize product page after catalog is loaded
                initializeProductPage();
            })
            .catch(error => {
                console.error('Error loading catalog:', error);
                showErrorMessage();
            });
    }

    function loadPaymentMethods() {
        fetch('assets/paymentMethods/payment_methods.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response for payment methods was not ok');
                }
                return response.json();
            })
            .then(data => {
                paymentMethodsData = data; // Store the fetched data
                renderPaymentMethods(data.paymentMethods, '#pcPaymentMethods', 'pc');
                renderPaymentMethods(data.paymentMethods, '#mobilePaymentMethods', 'mobile');
            })
            .catch(error => {
                console.error('Error loading payment methods:', error);
                // Optionally show an error message on the page
            });
    }

    function showErrorMessage() {
        const containers = ['#featured-games', '#all-games', '.product-page-container'];
        containers.forEach(containerId => {
            const container = document.querySelector(containerId);
            if (container) {
                container.innerHTML = '<p style="color: #ff4444; text-align: center; padding: 20px;">Error al cargar el contenido. Por favor, intenta de nuevo más tarde.</p>';
            }
        });
    }

    // --- Rendering Functions ---
    function renderGames(games, containerId, cardClass) {
        const container = document.querySelector(containerId);
        if (!container) return;

        // Clear existing content to prevent duplicates on re-render
        container.innerHTML = '';

        const fragment = document.createDocumentFragment(); // Use fragment for better performance

        games.forEach(game => {
            const link = `shop.html?game=${game.id}`;
            const gameCard = document.createElement('a');
            gameCard.href = link;
            gameCard.className = cardClass;
            gameCard.setAttribute('data-category', game.category);
            gameCard.setAttribute('data-aos', 'fade-up');

            // Add a small delay for gallery items to create a staggered effect
            if (cardClass === 'gallery-item') {
                const delay = Math.floor(Math.random() * 3) * 100; // 0ms, 100ms, 200ms
                gameCard.setAttribute('data-aos-delay', delay.toString());
            }

            gameCard.innerHTML = `
                <div class="${cardClass === 'game-card' ? 'game-image' : 'gallery-image'}">
                    <img loading="lazy" src="${game.image}" alt="${game.title}" onerror="this.src='assets/images/placeholder.jpg'">
                    ${game.badge ? `<span class="product-badge">${game.badge}</span>` : ''}
                </div>
                <div class="game-title">${game.title}</div>
            `;
            fragment.appendChild(gameCard);
        });
        container.appendChild(fragment);
    }

    function renderPaymentMethods(methods, containerElement, type) {
        if (!containerElement) return;

        containerElement.innerHTML = ''; // Clear existing content

        const fragment = document.createDocumentFragment();

        methods.forEach((method, index) => {
            const label = document.createElement('label');
            label.className = `${type}-payment-label cursor-pointer`;
            label.setAttribute('tabindex', '0');
            label.setAttribute('data-method-id', method.id);
            label.setAttribute('role', 'radio'); // ARIA role for radio button behavior
            label.setAttribute('aria-checked', index === 0 && type === 'pc' ? 'true' : 'false'); // ARIA state

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'payment';
            input.className = 'sr-only'; // sr-only for screen readers
            input.value = method.id;
            if (index === 0 && type === 'pc') {
                input.checked = true;
                label.classList.add('selected'); // Add selected class for initial PC state
            }

            const imgWrapper = document.createElement('div');
            imgWrapper.className = `${type}-payment-img-wrapper`;
            const img = document.createElement('img');
            img.alt = `Logo de ${method.name}`;
            img.height = 40;
            img.src = method.image;
            img.width = 60;
            imgWrapper.appendChild(img);

            const span = document.createElement('span');
            span.style.color = method.textColor || 'white';
            span.textContent = method.name;

            label.appendChild(input);
            label.appendChild(imgWrapper);
            label.appendChild(span);

            label.addEventListener('click', function() {
                // Update ARIA states for all radio buttons in the group
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
    }

    // --- Navigation Functionality ---
    function initializeNavigation() {
        try {
            const navToggle = document.querySelector('.nav-toggle');
            const nav = document.querySelector('.nav');
            const navLinks = document.querySelectorAll('.nav a');

            if (navToggle && nav) {
                navToggle.addEventListener('click', function() {
                    nav.classList.toggle('open');
                    navToggle.classList.toggle('active');
                    // Toggle ARIA expanded attribute for accessibility
                    const isExpanded = navToggle.classList.contains('active');
                    navToggle.setAttribute('aria-expanded', isExpanded);
                });

                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        nav.classList.remove('open');
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    });
                });

                document.addEventListener('click', function(e) {
                    if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
                        nav.classList.remove('open');
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                });

                // Close nav on escape key
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && nav.classList.contains('open')) {
                        nav.classList.remove('open');
                        navToggle.classList.remove('active');
                        navToggle.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing navigation:', error);
        }
    }

    // --- Scroll Effects ---
    function initializeScrollEffects() {
        try {
            const header = document.querySelector('.site-header');
            let lastScrollTop = 0;

            if (header) {
                window.addEventListener('scroll', function() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                    if (scrollTop > 50) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }

                    // Hide/show header on scroll down/up
                    if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) { // Only hide if scrolled past header height
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }

                    lastScrollTop = scrollTop;
                }, { passive: true }); // Use passive listener for better scroll performance
            }
        } catch (error) {
            console.error('Error initializing scroll effects:', error);
        }
    }

    // --- FAQ Accordion Functionality ---
    function initializeFAQ() {
        try {
            const faqItems = document.querySelectorAll('.faq-item');

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                const toggle = item.querySelector('.faq-toggle');

                if (question && answer && toggle) {
                    // Set initial ARIA attributes
                    question.setAttribute('role', 'button');
                    question.setAttribute('aria-expanded', 'false');
                    question.setAttribute('aria-controls', answer.id || `faq-answer-${Math.random().toString(36).substr(2, 9)}`); // Ensure ID
                    answer.id = answer.id || `faq-answer-${Math.random().toString(36).substr(2, 9)}`;
                    answer.setAttribute('aria-hidden', 'true');

                    question.addEventListener('click', function() {
                        const isActive = item.classList.contains('active');

                        // Close all other open FAQ items
                        faqItems.forEach(i => {
                            if (i !== item && i.classList.contains('active')) {
                                i.classList.remove('active');
                                const otherAnswer = i.querySelector('.faq-answer');
                                const otherQuestion = i.querySelector('.faq-question');
                                if (otherAnswer) {
                                    otherAnswer.style.maxHeight = null;
                                    otherAnswer.setAttribute('aria-hidden', 'true');
                                }
                                if (otherQuestion) {
                                    otherQuestion.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });

                        // Toggle current FAQ item
                        if (!isActive) {
                            item.classList.add('active');
                            answer.style.maxHeight = answer.scrollHeight + 'px';
                            question.setAttribute('aria-expanded', 'true');
                            answer.setAttribute('aria-hidden', 'false');
                        } else {
                            item.classList.remove('active');
                            answer.style.maxHeight = null;
                            question.setAttribute('aria-expanded', 'false');
                            answer.setAttribute('aria-hidden', 'true');
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error initializing FAQ:', error);
        }
    }

    // --- AOS Animations ---
    function initializeAOS() {
        try {
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    easing: 'ease-out',
                    once: true,
                    offset: 100,
                    delay: 50 // Global delay for a smoother staggered effect
                });
            }
        } catch (error) {
            console.error('Error initializing AOS:', error);
        }
    }

    // --- Product Page Specific Logic (for shop.html) ---
    function initializeProductPage() {
        // Ensure catalog data is loaded
        if (!gameCatalogData) {
            console.error('Game catalog data not loaded.');
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const gameIdFromUrl = urlParams.get('game');

        let productToDisplay = null;

        if (gameIdFromUrl) {
            productToDisplay = gameCatalogData.products.find(p => p.id === gameIdFromUrl);
            if (!productToDisplay) {
                console.warn(`Product with ID '${gameIdFromUrl}' not found. Falling back to Mobile Legends.`);
                productToDisplay = gameCatalogData.products.find(p => p.id === 'ml-diamonds');
            }
        } else {
            productToDisplay = gameCatalogData.products.find(p => p.id === 'ml-diamonds');
        }

        if (!productToDisplay) {
            console.error('No product found to display. Check catalog.json.');
            return;
        }

        currentProduct = productToDisplay; // Store current product globally

        // Update PC layout elements
        const pcProductImage = document.getElementById('pcProductImage');
        const pcProductTitle = document.getElementById('pcProductTitle');
        const pcProductDescription = document.getElementById('pcProductDescription');
        const pcInputFieldsContainer = document.getElementById('pcInputFields');
        const pcPackagesGrid = document.getElementById('pcPackagesGrid');
        const pcTotalPriceSpan = document.getElementById('pcTotalPrice');
        const pcBuyNowBtn = document.getElementById('pcBuyNowBtn');

        if (pcProductImage && pcProductTitle && pcProductDescription && pcInputFieldsContainer && pcPackagesGrid && pcTotalPriceSpan && pcBuyNowBtn) {
            pcProductImage.src = productToDisplay.image;
            pcProductImage.alt = productToDisplay.title;
            pcProductTitle.textContent = productToDisplay.title.toUpperCase();
            pcProductDescription.textContent = productToDisplay.description;

            renderInputFields(productToDisplay.input_fields, pcInputFieldsContainer, 'pc');
            renderPackages(productToDisplay.packages, pcPackagesGrid, pcTotalPriceSpan, 'pc');

            pcBuyNowBtn.addEventListener('click', () => openOrderConfirmationModal('pc'));
        }

        // Update Mobile layout elements
        const mobileProductImage = document.getElementById('mobileProductImage');
        const mobileProductTitle = document.getElementById('mobileProductTitle');
        const mobileProductDescription = document.getElementById('mobileProductDescription');
        const mobileInputFieldsContainer = document.getElementById('mobileInputFields');
        const mobilePackageToggle = document.getElementById('mobilePackageToggle');
        const mobileSelectedPackageText = document.getElementById('mobileSelectedPackageText');
        const mobileTotalPriceSpan = document.getElementById('mobileTotalPrice');
        const mobilePackageModal = document.getElementById('mobilePackageModal');
        const mobileModalCloseBtn = document.getElementById('mobileModalCloseBtn');
        const mobilePackageForm = document.getElementById('mobilePackageForm');
        const mobileModalConfirmBtn = document.getElementById('mobileModalConfirmBtn');
        const mobileBuyNowBtn = document.getElementById('mobileBuyNowBtn');


        if (mobileProductImage && mobileProductTitle && mobileProductDescription && mobileInputFieldsContainer && mobilePackageToggle && mobileSelectedPackageText && mobileTotalPriceSpan && mobilePackageModal && mobileModalCloseBtn && mobilePackageForm && mobileModalConfirmBtn && mobileBuyNowBtn) {
            mobileProductImage.src = productToDisplay.image;
            mobileProductImage.alt = productToDisplay.title;
            mobileProductTitle.textContent = productToDisplay.title.toUpperCase();
            mobileProductDescription.textContent = productToDisplay.description;

            renderInputFields(productToDisplay.input_fields, mobileInputFieldsContainer, 'mobile');

            // Initialize mobile package modal
            initializeMobilePackageModal(productToDisplay.packages, mobilePackageToggle, mobileSelectedPackageText, mobileTotalPriceSpan, mobilePackageModal, mobileModalCloseBtn, mobilePackageForm, mobileModalConfirmBtn);

            mobileBuyNowBtn.addEventListener('click', () => openOrderConfirmationModal('mobile'));
        }
    }

    function renderInputFields(inputFields, container, type) {
        container.innerHTML = ''; // Clear existing fields

        if (!inputFields || inputFields.length === 0) {
            container.innerHTML = `<p class="${type}-input-label">No specific input required for this game.</p>`;
            return;
        }

        inputFields.forEach(field => {
            const div = document.createElement('div');
            div.className = `${type}-input-item`;

            const label = document.createElement('label');
            label.className = `${type}-input-label`;
            label.htmlFor = field.id;
            label.textContent = field.label;
            div.appendChild(label);

            if (field.type === 'text') {
                const input = document.createElement('input');
                input.className = `${type}-input-field`;
                input.id = field.id;
                input.type = field.type;
                input.placeholder = field.placeholder;
                input.required = true; // Make input fields required
                if (field.pattern) input.pattern = field.pattern;
                if (field.inputmode) input.inputmode = field.inputmode;
                if (field.maxlength) input.maxLength = field.maxlength;
                input.autocomplete = 'off';
                input.autocorrect = 'off';
                input.autocapitalize = 'off';
                input.spellcheck = false;
                div.appendChild(input);

                // Add basic validation feedback
                input.addEventListener('input', () => {
                    if (input.checkValidity()) {
                        input.classList.remove('invalid');
                        input.classList.add('valid');
                    } else {
                        input.classList.add('invalid');
                        input.classList.remove('valid');
                    }
                });
            } else if (field.type === 'select' && field.options) {
                const select = document.createElement('select');
                select.className = `${type}-select-field`;
                select.id = field.id;
                select.required = true; // Make select fields required
                field.options.forEach(optionText => {
                    const option = document.createElement('option');
                    option.value = optionText;
                    option.textContent = optionText;
                    select.appendChild(option);
                });
                div.appendChild(select);
            }

            const helpButton = document.createElement('button');
            helpButton.className = `${type}-help-btn`;
            helpButton.type = 'button';
            helpButton.setAttribute('aria-label', `Help ${field.label}`);
            helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
            // Add tooltip or modal logic for help button if needed
            div.appendChild(helpButton);

            container.appendChild(div);
        });
    }

    function renderPackages(packages, container, totalPriceSpan, type) {
        container.innerHTML = ''; // Clear existing content

        const fragment = document.createDocumentFragment();

        packages.forEach((pkg, index) => {
            const totalDiamondsText = (typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0) ? `Total: ${pkg.total_diamonds} Diamantes` : '';
            const packageItem = document.createElement('div');
            packageItem.setAttribute('tabindex', '0');
            packageItem.setAttribute('data-price', pkg.price);
            packageItem.setAttribute('data-amount', pkg.amount);
            packageItem.setAttribute('data-total-diamonds', pkg.total_diamonds !== undefined ? pkg.total_diamonds : '');
            packageItem.className = `${type}-package-item ${index === 0 ? 'selected' : ''}`;
            packageItem.setAttribute('role', 'radio'); // ARIA role
            packageItem.setAttribute('aria-checked', index === 0 ? 'true' : 'false'); // ARIA state

            packageItem.innerHTML = `
                <div>
                    <p class="${type === 'pc' ? 'amount' : 'amount-text'}">${pkg.amount}</p>
                    ${totalDiamondsText ? `<p class="${type === 'pc' ? 'total-diamonds' : 'total-text'}">${totalDiamondsText}</p>` : ''}
                </div>
                <span class="${type === 'pc' ? 'price' : 'price-text'}">S/ ${parseFloat(pkg.price).toFixed(2)}</span>
            `;
            fragment.appendChild(packageItem);

            packageItem.addEventListener('click', () => {
                container.querySelectorAll(`.${type}-package-item`).forEach(p => {
                    p.classList.remove('selected');
                    p.setAttribute('aria-checked', 'false');
                });
                packageItem.classList.add('selected');
                packageItem.setAttribute('aria-checked', 'true');
                const price = packageItem.getAttribute('data-price');
                totalPriceSpan.textContent = `S/ ${parseFloat(price).toFixed(2)}`;

                // For mobile, update the toggle button text
                if (type === 'mobile') {
                    const amount = packageItem.getAttribute('data-amount');
                    const totalDiamonds = packageItem.getAttribute('data-total-diamonds');
                    const mobileSelectedPackageText = document.getElementById('mobileSelectedPackageText');
                    if (mobileSelectedPackageText) {
                        const displayTotalDiamonds = (totalDiamonds && parseFloat(totalDiamonds) > 0) ? `<span class="text-[#8BCF1E] text-[10px] mt-0.125rem">Total: ${totalDiamonds} Diamantes</span>` : '';
                        mobileSelectedPackageText.innerHTML = `
                            <span>${amount}</span>
                            ${displayTotalDiamonds}
                        `;
                    }
                }
            });
        });
        container.appendChild(fragment);

        // Set initial total price based on the first package
        if (packages.length > 0) {
            totalPriceSpan.textContent = `S/ ${parseFloat(packages[0].price).toFixed(2)}`;
            if (type === 'mobile') {
                const mobileSelectedPackageText = document.getElementById('mobileSelectedPackageText');
                if (mobileSelectedPackageText) {
                    const firstPkg = packages[0];
                    const totalDiamonds = (typeof firstPkg.total_diamonds === 'number' && firstPkg.total_diamonds > 0) ? firstPkg.total_diamonds : '';
                    mobileSelectedPackageText.innerHTML = `
                        <span>${firstPkg.amount}</span>
                        ${totalDiamonds ? `<span class="text-[#8BCF1E] text-[10px] mt-0.125rem">Total: ${totalDiamonds} Diamantes</span>` : ''}
                    `;
                }
            }
        } else {
            totalPriceSpan.textContent = 'S/ 0.00';
        }
    }

    // --- Mobile Package Modal Logic ---
    function initializeMobilePackageModal(packages, toggleBtn, selectedPackageTextSpan, totalPriceSpan, modal, closeBtn, form, confirmBtn) {
        let currentSelectedPackage = packages[0]; // Default to first package

        // Render packages inside the modal form
        form.innerHTML = ''; // Clear existing content
        const fragment = document.createDocumentFragment();

        packages.forEach((pkg, index) => {
            const totalDiamondsText = (typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0) ? `Total: <span class="font-bold">${pkg.total_diamonds} Diamantes</span>` : '';
            const label = document.createElement('label');
            label.htmlFor = `modal-pkg-${index}`;
            label.className = `mobile-package-label ${index === 0 ? 'selected' : ''}`; // Pre-select first
            label.setAttribute('role', 'radio');
            label.setAttribute('aria-checked', index === 0 ? 'true' : 'false');

            label.innerHTML = `
                <input type="radio" name="package" id="modal-pkg-${index}" value="${pkg.amount}" data-price="${pkg.price}" data-total-diamonds="${pkg.total_diamonds !== undefined ? pkg.total_diamonds : ''}" class="hidden" ${index === 0 ? 'checked' : ''} />
                <div class="content-left">
                    <div class="${index === 0 ? 'check-circle' : 'empty-circle'}">
                        ${index === 0 ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div>
                        <p class="amount-text">${pkg.amount}</p>
                        ${totalDiamondsText ? `<p class="total-text">${totalDiamondsText}</p>` : ''}
                    </div>
                </div>
                <p class="price-text">S/ ${parseFloat(pkg.price).toFixed(2)}</p>
            `;
            fragment.appendChild(label);
        });
        form.appendChild(fragment);

        // Set initial selected package for the modal
        updateMobileToggleText(currentSelectedPackage, selectedPackageTextSpan);
        totalPriceSpan.textContent = `S/ ${parseFloat(currentSelectedPackage.price).toFixed(2)}`;

        // Event listener for opening the modal
        toggleBtn.addEventListener('click', () => {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling on body
            toggleBtn.setAttribute('aria-expanded', 'true');

            // Ensure the correct package is selected in the modal when opened
            const currentSelectedAmount = selectedPackageTextSpan.querySelector('span:first-child').textContent;
            form.querySelectorAll('input[type="radio"]').forEach(input => {
                if (input.value === currentSelectedAmount) {
                    input.checked = true;
                } else {
                    input.checked = false;
                }
            });
            updateModalSelectionCircles();
        });

        // Event listener for closing the modal
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto'; // Restore scrolling on body
            toggleBtn.setAttribute('aria-expanded', 'false');
        });

        // Close modal when clicking outside content
        modal.querySelector('.mobile-modal-overlay').addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            toggleBtn.setAttribute('aria-expanded', 'false');
        });

        // Event listener for package selection within the modal
        form.addEventListener('change', (event) => {
            const selectedInput = event.target;
            if (selectedInput.name === 'package') {
                currentSelectedPackage = {
                    amount: selectedInput.value,
                    price: selectedInput.getAttribute('data-price'),
                    total_diamonds: selectedInput.getAttribute('data-total-diamonds')
                };
                updateModalSelectionCircles();
            }
        });

        // Event listener for confirming selection in the modal
        confirmBtn.addEventListener('click', () => {
            if (currentSelectedPackage) {
                updateMobileToggleText(currentSelectedPackage, selectedPackageTextSpan);
                totalPriceSpan.textContent = `S/ ${parseFloat(currentSelectedPackage.price).toFixed(2)}`;

                // Also update the PC layout's selected package if it exists
                const pcPackages = document.querySelectorAll('#pcPackagesGrid .pc-package-item');
                pcPackages.forEach(pkgItem => {
                    pkgItem.classList.remove('selected');
                    pkgItem.setAttribute('aria-checked', 'false');
                    if (pkgItem.getAttribute('data-amount') === currentSelectedPackage.amount) {
                        pkgItem.classList.add('selected');
                        pkgItem.setAttribute('aria-checked', 'true');
                    }
                });
            }
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            toggleBtn.setAttribute('aria-expanded', 'false');
        });

        function updateModalSelectionCircles() {
            form.querySelectorAll('label').forEach(label => {
                const input = label.querySelector('input[type="radio"]');
                const contentLeft = label.querySelector('.content-left');
                let circle = contentLeft.querySelector('.check-circle, .empty-circle');

                if (input.checked) {
                    label.classList.add('selected');
                    label.setAttribute('aria-checked', 'true');
                    if (circle) circle.remove();
                    const div = document.createElement('div');
                    div.className = 'check-circle';
                    div.innerHTML = '<i class="fas fa-check"></i>';
                    contentLeft.prepend(div);
                } else {
                    label.classList.remove('selected');
                    label.setAttribute('aria-checked', 'false');
                    if (circle) circle.remove();
                    const div = document.createElement('div');
                    div.className = 'empty-circle';
                    contentLeft.prepend(div);
                }
            });
        }

        function updateMobileToggleText(pkg, spanElement) {
            const totalDiamonds = (typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0) ? pkg.total_diamonds : '';
            spanElement.innerHTML = `
                <span>${pkg.amount}</span>
                ${totalDiamonds ? `<span class="text-[#8BCF1E] text-[10px] mt-0.125rem">Total: ${totalDiamonds} Diamantes</span>` : ''}
            `;
        }
    }

    // --- Order Confirmation Modal Logic ---
    function initializeModals() {
        const orderConfirmationModal = document.getElementById('orderConfirmationModal');
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');
        const cancelOrderBtn = document.getElementById('cancelOrderBtn');
        const closeModalBtn = orderConfirmationModal ? orderConfirmationModal.querySelector('.close-modal-btn') : null;
        const orderSummaryDiv = document.getElementById('orderSummary');

        if (!orderConfirmationModal || !confirmOrderBtn || !cancelOrderBtn || !closeModalBtn || !orderSummaryDiv) {
            console.warn('Order confirmation modal elements not found. Skipping modal initialization.');
            return;
        }

        // Close modal function
        const closeOrderConfirmationModal = () => {
            orderConfirmationModal.classList.remove('show');
            document.body.style.overflow = 'auto';
            orderConfirmationModal.setAttribute('aria-hidden', 'true');
        };

        // Event listeners for closing modal
        cancelOrderBtn.addEventListener('click', closeOrderConfirmationModal);
        closeModalBtn.addEventListener('click', closeOrderConfirmationModal);
        orderConfirmationModal.addEventListener('click', (e) => {
            if (e.target === orderConfirmationModal) { // Close if clicked outside content
                closeOrderConfirmationModal();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && orderConfirmationModal.classList.contains('show')) {
                closeOrderConfirmationModal();
            }
        });

        // Confirm order and redirect to WhatsApp
        confirmOrderBtn.addEventListener('click', () => {
            const selectedPackage = getSelectedPackageDetails();
            const inputFieldValues = getInputFieldValues();
            const selectedPaymentMethod = getSelectedPaymentMethod();

            if (!selectedPackage || !selectedPaymentMethod || !validateInputFields()) {
                alert('Por favor, completa todos los campos requeridos y selecciona un paquete y método de pago.');
                return;
            }

            let whatsappMessage = `¡Hola L-Store! Me gustaría hacer un pedido.\n\n`;
            whatsappMessage += `*Juego:* ${currentProduct.title}\n`;
            whatsappMessage += `*Paquete:* ${selectedPackage.amount} (S/ ${selectedPackage.price})\n`;
            if (selectedPackage.total_diamonds && parseFloat(selectedPackage.total_diamonds) > 0) {
                whatsappMessage += `*Total Diamantes/Monedas:* ${selectedPackage.total_diamonds}\n`;
            }
            whatsappMessage += `*Método de Pago Preferido:* ${selectedPaymentMethod.name}\n`;
            whatsappMessage += `\n*Mis Datos:*\n`;
            for (const key in inputFieldValues) {
                whatsappMessage += `*${key}:* ${inputFieldValues[key]}\n`;
            }
            whatsappMessage += `\n¡Espero tu confirmación!`;

            const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
            closeOrderConfirmationModal();
        });
    }

    function openOrderConfirmationModal(layoutType) {
        const orderConfirmationModal = document.getElementById('orderConfirmationModal');
        const orderSummaryDiv = document.getElementById('orderSummary');

        const selectedPackage = getSelectedPackageDetails(layoutType);
        const inputFieldValues = getInputFieldValues(layoutType);
        const selectedPaymentMethod = getSelectedPaymentMethod(layoutType);

        if (!selectedPackage || !selectedPaymentMethod || !validateInputFields(layoutType)) {
            alert('Por favor, completa todos los campos requeridos y selecciona un paquete y método de pago.');
            return;
        }

        // Populate modal with order summary
        orderSummaryDiv.innerHTML = `
            <p><strong>Juego:</strong> ${currentProduct.title}</p>
            <p><strong>Paquete:</strong> ${selectedPackage.amount}</p>
            ${selectedPackage.total_diamonds && parseFloat(selectedPackage.total_diamonds) > 0 ? `<p><strong>Total Diamantes/Monedas:</strong> ${selectedPackage.total_diamonds}</p>` : ''}
            <p><strong>Precio:</strong> S/ ${parseFloat(selectedPackage.price).toFixed(2)}</p>
            <p><strong>Método de Pago:</strong> ${selectedPaymentMethod.name}</p>
            <p><strong>Tus Datos:</strong></p>
            ${Object.entries(inputFieldValues).map(([key, value]) => `<p class="ml-4"><em>${key}:</em> ${value}</p>`).join('')}
        `;

        orderConfirmationModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling on body
        orderConfirmationModal.setAttribute('aria-hidden', 'false');
    }

    function getSelectedPackageDetails(layoutType) {
        const packagesContainerId = layoutType === 'pc' ? 'pcPackagesGrid' : 'mobilePackageForm';
        const selectedPackageElement = document.getElementById(packagesContainerId).querySelector(`.${layoutType}-package-item.selected, input[name="package"]:checked`);

        if (selectedPackageElement) {
            return {
                amount: selectedPackageElement.getAttribute('data-amount') || selectedPackageElement.value,
                price: selectedPackageElement.getAttribute('data-price'),
                total_diamonds: selectedPackageElement.getAttribute('data-total-diamonds')
            };
        }
        return null;
    }

    function getInputFieldValues(layoutType) {
        const inputFieldsContainerId = layoutType === 'pc' ? 'pcInputFields' : 'mobileInputFields';
        const inputFieldsContainer = document.getElementById(inputFieldsContainerId);
        const values = {};

        if (inputFieldsContainer) {
            inputFieldsContainer.querySelectorAll('input, select').forEach(field => {
                values[field.id] = field.value;
            });
        }
        return values;
    }

    function getSelectedPaymentMethod(layoutType) {
        const paymentMethodsContainerId = layoutType === 'pc' ? 'pcPaymentMethods' : 'mobilePaymentMethods';
        const selectedPaymentElement = document.getElementById(paymentMethodsContainerId).querySelector(`.${layoutType}-payment-label.selected, input[name="payment"]:checked`);

        if (selectedPaymentElement) {
            const methodId = selectedPaymentElement.getAttribute('data-method-id') || selectedPaymentElement.value;
            return paymentMethodsData.paymentMethods.find(method => method.id === methodId);
        }
        return null;
    }

    function validateInputFields(layoutType) {
        const inputFieldsContainerId = layoutType === 'pc' ? 'pcInputFields' : 'mobileInputFields';
        const inputFieldsContainer = document.getElementById(inputFieldsContainerId);
        let allValid = true;

        if (inputFieldsContainer) {
            inputFieldsContainer.querySelectorAll('input[required], select[required]').forEach(field => {
                if (!field.checkValidity()) {
                    field.classList.add('invalid');
                    field.classList.remove('valid');
                    allValid = false;
                } else {
                    field.classList.remove('invalid');
                    field.classList.add('valid');
                }
            });
        }
        return allValid;
    }

    // --- Carousel Logic ---
    function initializeCarousel() {
        const carouselSlides = document.querySelector('.carousel-slides');
        // Eliminadas las referencias a los botones prev y next
        const paginationDotsContainer = document.querySelector('.carousel-pagination');

        if (!carouselSlides || !paginationDotsContainer) {
            console.warn('Carousel elements not found. Skipping carousel initialization.');
            return;
        }

        // Usar algunas imágenes de ejemplo o el placeholder
        const images = [
            'assets/images/mobile-legends.jpg',
            'assets/images/pubg-mobile.jpg',
            'assets/images/free-fire.jpg',
            'assets/images/genshin-impact.jpg'
            // Puedes añadir más imágenes aquí
        ];

        let currentIndex = 0;
        let slideInterval;

        function createSlides() {
            carouselSlides.innerHTML = '';
            paginationDotsContainer.innerHTML = '';

            images.forEach((src, index) => {
                const slide = document.createElement('div');
                slide.classList.add('carousel-slide');
                const img = document.createElement('img');
                img.src = src;
                img.alt = `Slide ${index + 1}`;
                img.onerror = function() { this.src = 'assets/images/placeholder.jpg'; }; // Fallback
                img.setAttribute('loading', 'lazy'); // Native lazy loading
                img.setAttribute('width', '1920'); // Example width for aspect ratio
                img.setAttribute('height', '1080'); // Example height for aspect ratio
                // Add srcset for responsive images (assuming you'll provide different sizes)
                // img.setAttribute('srcset', `${src.replace('.jpg', '_small.jpg')} 480w, ${src.replace('.jpg', '_medium.jpg')} 800w, ${src} 1200w`);
                // img.setAttribute('sizes', '(max-width: 600px) 480px, (max-width: 1200px) 800px, 1200px');

                slide.appendChild(img);
                carouselSlides.appendChild(slide);

                const dot = document.createElement('span');
                dot.classList.add('pagination-dot');
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => goToSlide(index));
                paginationDotsContainer.appendChild(dot);
            });
            updateCarousel();
            startAutoSlide();
        }

        function updateCarousel() {
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
        }

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
            resetAutoSlide();
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % images.length;
            updateCarousel();
        }

        // Eliminadas las funciones prevSlide y los event listeners de los botones
        // prevButton.addEventListener('click', prevSlide);
        // nextButton.addEventListener('click', nextSlide);

        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
        }

        function resetAutoSlide() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        // Initialize carousel
        createSlides();
    }

    // Lazy loading images (handled natively with loading="lazy")
    if ('loading' in HTMLImageElement.prototype) {
        console.log('Native lazy loading supported');
    } else {
        console.log('Native lazy loading not supported, consider adding polyfill');
    }

})();