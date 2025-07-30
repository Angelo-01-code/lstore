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
            initializeFilters(); // Keep for other pages if needed, but shop.html no longer uses it directly
            initializeFAQ();
            initializeAOS();
            loadGameCatalog(); // This will also trigger initializeProductPage after loading
            loadPaymentMethods(); // Load payment methods

            console.log('L-Store app initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    // Global data stores
    let gameCatalogData = null;
    let paymentMethodsData = null;

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
                container.innerHTML = '<p style="color: #ff4444; text-align: center;">Error al cargar el contenido. Por favor, intenta de nuevo más tarde.</p>';
            }
        });
    }

    // --- Rendering Functions ---
    function renderGames(games, containerId, cardClass) {
        const container = document.querySelector(containerId);
        if (!container) return;

        container.innerHTML = games.map(game => {
            const link = `shop.html?game=${game.id}`;
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

    function renderPaymentMethods(methods, container, type) {
        if (!container) return;

        container.innerHTML = methods.map((method, index) => `
            <label class="${type}-payment-label cursor-pointer" tabindex="0" data-method-id="${method.id}">
                <input type="radio" name="payment" class="sr-only" value="${method.id}" ${index === 0 && type === 'pc' ? 'checked' : ''} />
                <div class="${type}-payment-img-wrapper}">
                    <img alt="Logo de ${method.name}" height="40" src="${method.image}" width="60" />
                </div>
                <span style="color: ${method.textColor || 'white'};">${method.name}</span>
            </label>
        `).join('');

        // Add event listeners for selection
        container.querySelectorAll(`.${type}-payment-label`).forEach(label => {
            label.addEventListener('click', function() {
                // Remove 'selected' class from all payment methods in this container
                container.querySelectorAll(`.${type}-payment-label`).forEach(item => {
                    item.classList.remove('selected');
                });
                // Add 'selected' class to the clicked payment method
                this.classList.add('selected');
            });
        });

        // For PC layout, select the first payment method by default
        if (type === 'pc' && methods.length > 0) {
            const firstPaymentMethod = container.querySelector(`.${type}-payment-label`);
            if (firstPaymentMethod) {
                firstPaymentMethod.classList.add('selected');
            }
        }
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
                });

                navLinks.forEach(link => {
                    link.addEventListener('click', function() {
                        nav.classList.remove('open');
                        navToggle.classList.remove('active');
                    });
                });

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

    // --- Product Filters (kept for other pages if needed) ---
    function initializeFilters() {
        // No direct use on shop.html anymore, but kept for other pages
    }

    // --- FAQ Accordion Functionality ---
    function initializeFAQ() {
        try {
            const faqItems = document.querySelectorAll('.faq-item');

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                if (question) {
                    question.addEventListener('click', function() {
                        const isActive = item.classList.contains('active');

                        faqItems.forEach(i => {
                            i.classList.remove('active');
                            const answer = i.querySelector('.faq-answer');
                            if (answer) {
                                answer.style.maxHeight = null;
                            }
                        });

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

    // --- AOS Animations ---
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

        // Update PC layout elements
        const pcProductImage = document.getElementById('pcProductImage');
        const pcProductTitle = document.getElementById('pcProductTitle');
        const pcProductDescription = document.getElementById('pcProductDescription');
        const pcInputFieldsContainer = document.getElementById('pcInputFields');
        const pcPackagesGrid = document.getElementById('pcPackagesGrid');
        const pcTotalPriceSpan = document.getElementById('pcTotalPrice');

        if (pcProductImage && pcProductTitle && pcProductDescription && pcInputFieldsContainer && pcPackagesGrid && pcTotalPriceSpan) {
            pcProductImage.src = productToDisplay.image;
            pcProductImage.alt = productToDisplay.title;
            pcProductTitle.textContent = productToDisplay.title.toUpperCase();
            pcProductDescription.textContent = productToDisplay.description;

            renderInputFields(productToDisplay.input_fields, pcInputFieldsContainer, 'pc');
            renderPackages(productToDisplay.packages, pcPackagesGrid, pcTotalPriceSpan, 'pc');
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

        if (mobileProductImage && mobileProductTitle && mobileProductDescription && mobileInputFieldsContainer && mobilePackageToggle && mobileSelectedPackageText && mobileTotalPriceSpan && mobilePackageModal && mobileModalCloseBtn && mobilePackageForm && mobileModalConfirmBtn) {
            mobileProductImage.src = productToDisplay.image;
            mobileProductImage.alt = productToDisplay.title;
            mobileProductTitle.textContent = productToDisplay.title.toUpperCase();
            mobileProductDescription.textContent = productToDisplay.description;

            renderInputFields(productToDisplay.input_fields, mobileInputFieldsContainer, 'mobile');

            // Initialize mobile package modal
            initializeMobilePackageModal(productToDisplay.packages, mobilePackageToggle, mobileSelectedPackageText, mobileTotalPriceSpan, mobilePackageModal, mobileModalCloseBtn, mobilePackageForm, mobileModalConfirmBtn);
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
                if (field.pattern) input.pattern = field.pattern;
                if (field.inputmode) input.inputmode = field.inputmode;
                if (field.maxlength) input.maxLength = field.maxlength;
                input.autocomplete = 'off';
                input.autocorrect = 'off';
                input.autocapitalize = 'off';
                input.spellcheck = false;
                div.appendChild(input);
            } else if (field.type === 'select' && field.options) {
                const select = document.createElement('select');
                select.className = `${type}-select-field`;
                select.id = field.id;
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
        container.innerHTML = packages.map((pkg, index) => {
            // Only show total_diamonds if it's a number and greater than 0
            const totalDiamondsText = (typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0) ? `Total: ${pkg.total_diamonds} Diamantes` : '';
            return `
                <div tabindex="0" data-price="${pkg.price}" data-amount="${pkg.amount}" data-total-diamonds="${pkg.total_diamonds !== undefined ? pkg.total_diamonds : ''}"
                     class="${type}-package-item ${index === 0 ? 'selected' : ''}">
                    <div>
                        <p class="${type === 'pc' ? 'amount' : 'amount-text'}">${pkg.amount}</p>
                        ${totalDiamondsText ? `<p class="${type === 'pc' ? 'total-diamonds' : 'total-text'}">${totalDiamondsText}</p>` : ''}
                    </div>
                    <span class="${type === 'pc' ? 'price' : 'price-text'}">S/ ${parseFloat(pkg.price).toFixed(2)}</span>
                </div>
            `;
        }).join('');

        // Add event listeners for package selection
        const packageItems = container.querySelectorAll(`.${type}-package-item`);
        packageItems.forEach(item => {
            item.addEventListener('click', () => {
                packageItems.forEach(p => p.classList.remove('selected'));
                item.classList.add('selected');
                const price = item.getAttribute('data-price');
                totalPriceSpan.textContent = `S/ ${parseFloat(price).toFixed(2)}`;

                // For mobile, update the toggle button text
                if (type === 'mobile') {
                    const amount = item.getAttribute('data-amount');
                    const totalDiamonds = item.getAttribute('data-total-diamonds');
                    const mobileSelectedPackageText = document.getElementById('mobileSelectedPackageText');
                    if (mobileSelectedPackageText) {
                        // Only show total_diamonds if it's a number and greater than 0
                        const displayTotalDiamonds = (totalDiamonds && parseFloat(totalDiamonds) > 0) ? `<span class="text-[#8BCF1E] text-[10px] mt-0.125rem">Total: ${totalDiamonds} Diamantes</span>` : '';
                        mobileSelectedPackageText.innerHTML = `
                            <span>${amount}</span>
                            ${displayTotalDiamonds}
                        `;
                    }
                }
            });
        });

        // Set initial total price based on the first package
        if (packages.length > 0) {
            totalPriceSpan.textContent = `S/ ${parseFloat(packages[0].price).toFixed(2)}`;
            if (type === 'mobile') {
                const mobileSelectedPackageText = document.getElementById('mobileSelectedPackageText');
                if (mobileSelectedPackageText) {
                    const firstPkg = packages[0];
                    // Only show total_diamonds if it's a number and greater than 0
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
        let currentSelectedPackage = null;

        // Render packages inside the modal form
        form.innerHTML = packages.map((pkg, index) => {
            // Only show total_diamonds if it's a number and greater than 0
            const totalDiamondsText = (typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0) ? `Total: <span class="font-bold">${pkg.total_diamonds} Diamantes</span>` : '';
            return `
                <label for="modal-pkg-${index}" class="mobile-package-label">
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
                </label>
            `;
        }).join('');

        // Set initial selected package for the modal
        currentSelectedPackage = packages[0];
        updateMobileToggleText(currentSelectedPackage, selectedPackageTextSpan);
        totalPriceSpan.textContent = `S/ ${parseFloat(currentSelectedPackage.price).toFixed(2)}`;

        // Event listener for opening the modal
        toggleBtn.addEventListener('click', () => {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling on body
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
        });

        // Close modal when clicking outside content
        modal.querySelector('.mobile-modal-overlay').addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
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
                    if (pkgItem.getAttribute('data-amount') === currentSelectedPackage.amount) {
                        pkgItem.classList.add('selected');
                    }
                });
            }
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        });

        function updateModalSelectionCircles() {
            form.querySelectorAll('label').forEach(label => {
                const input = label.querySelector('input[type="radio"]');
                const contentLeft = label.querySelector('.content-left');
                let circle = contentLeft.querySelector('.check-circle, .empty-circle');

                if (input.checked) {
                    label.classList.add('selected');
                    if (circle) circle.remove();
                    const div = document.createElement('div');
                    div.className = 'check-circle';
                    div.innerHTML = '<i class="fas fa-check"></i>';
                    contentLeft.prepend(div);
                } else {
                    label.classList.remove('selected');
                    if (circle) circle.remove();
                    const div = document.createElement('div');
                    div.className = 'empty-circle';
                    contentLeft.prepend(div);
                }
            });
        }

        function updateMobileToggleText(pkg, spanElement) {
            // Only show total_diamonds if it's a number and greater than 0
            const totalDiamonds = (typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0) ? pkg.total_diamonds : '';
            spanElement.innerHTML = `
                <span>${pkg.amount}</span>
                ${totalDiamonds ? `<span class="text-[#8BCF1E] text-[10px] mt-0.125rem">Total: ${totalDiamonds} Diamantes</span>` : ''}
            `;
        }
    }

    // Lazy loading images (handled natively with loading="lazy")
    if ('loading' in HTMLImageElement.prototype) {
        console.log('Native lazy loading supported');
    } else {
        console.log('Native lazy loading not supported, consider adding polyfill');
    }

})();
