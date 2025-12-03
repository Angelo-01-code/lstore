// src/js/shop.js
import { loadJSON, showErrorMessage, renderPaymentMethods, renderGames as renderGameCards } from './utils.js';

let gameCatalogData = null;
let paymentMethodsData = null;
let currentProduct = null;

export const loadShopData = async () => {
    gameCatalogData = await loadJSON('../assets/data/catalog.json');
    paymentMethodsData = await loadJSON('../assets/data/payment_methods.json');

    if (!gameCatalogData) {
        showErrorMessage('.product-page-container');
        return;
    }
    if (!paymentMethodsData) {
        showErrorMessage('.product-page-container');
        return;
    }

    if (document.body.classList.contains('shop-page')) {
        initializeProductPage();
        initializeGameSearch();
        return;
    }

    if (document.getElementById('featured-games')) {
        renderGameCards(gameCatalogData.featured, '#featured-games', 'game-card');
    }
    if (document.getElementById('all-games')) {
        renderGameCards(gameCatalogData.all, '#all-games', 'gallery-item');
    }

    initializeGameSearch();
};

const initializeProductPage = () => {
    if (!gameCatalogData || !paymentMethodsData) {
        console.error('Game catalog or payment methods data not loaded.');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const gameIdFromUrl = urlParams.get('game');
    const fallbackProduct = gameCatalogData.products.find(p => p.id === 'ml-diamonds');

    let productToDisplay = fallbackProduct;
    if (gameIdFromUrl) {
        const matchedProduct = gameCatalogData.products.find(p => p.id === gameIdFromUrl);
        productToDisplay = matchedProduct || fallbackProduct;
        if (!matchedProduct) {
            console.warn(`Product with ID '${gameIdFromUrl}' not found. Falling back to default product.`);
        }
    }

    if (!productToDisplay) {
        console.error('No product found to display. Check catalog.json.');
        return;
    }

    currentProduct = productToDisplay;
    setupPcLayout(productToDisplay);
    setupMobileLayout(productToDisplay);
    setUidGuideImage(productToDisplay);
};

const setupPcLayout = (productToDisplay) => {
    const pcProductImage = document.getElementById('pcProductImage');
    const pcProductTitle = document.getElementById('pcProductTitle');
    const pcProductDescription = document.getElementById('pcProductDescription');
    const pcInputFieldsContainer = document.getElementById('pcInputFields');
    const pcPackagesGrid = document.getElementById('pcPackagesGrid');
    const pcTotalPriceSpan = document.getElementById('pcTotalPrice');
    const pcBuyNowBtn = document.getElementById('pcBuyNowBtn');

    if (pcProductImage && pcProductTitle && pcProductDescription && pcInputFieldsContainer && pcPackagesGrid && pcTotalPriceSpan && pcBuyNowBtn) {
        pcProductImage.src = `../assets/images/${productToDisplay.image.split('/').pop()}`;
        pcProductImage.alt = productToDisplay.title;
        pcProductTitle.textContent = deriveGameName(productToDisplay.title);
        pcProductDescription.textContent = productToDisplay.description;

        renderInputFields(productToDisplay.input_fields, pcInputFieldsContainer, 'pc');
        renderPackages(productToDisplay.packages, pcPackagesGrid, pcTotalPriceSpan, 'pc');
        renderPaymentMethods(paymentMethodsData.paymentMethods, document.getElementById('pcPaymentMethods'), 'pc');

        pcBuyNowBtn.addEventListener('click', () => openOrderConfirmationModal('pc'));

        triggerEntryAnimations();
    }
};

const setupMobileLayout = (productToDisplay) => {
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
        mobileProductImage.src = `../assets/images/${productToDisplay.image.split('/').pop()}`;
        mobileProductImage.alt = productToDisplay.title;
        mobileProductTitle.textContent = deriveGameName(productToDisplay.title);
        mobileProductDescription.textContent = productToDisplay.description;

        renderInputFields(productToDisplay.input_fields, mobileInputFieldsContainer, 'mobile');

        initializeMobilePackageModal(productToDisplay.packages, mobilePackageToggle, mobileSelectedPackageText, mobileTotalPriceSpan, mobilePackageModal, mobileModalCloseBtn, mobilePackageForm, mobileModalConfirmBtn);
        renderPaymentMethods(paymentMethodsData.paymentMethods, document.getElementById('mobilePaymentMethods'), 'mobile');

        mobileBuyNowBtn.addEventListener('click', () => openOrderConfirmationModal('mobile'));

        triggerEntryAnimations();
    }
};

const renderInputFields = (inputFields, container, type) => {
    container.innerHTML = '';

    if (!inputFields || inputFields.length === 0) {
        container.innerHTML = `<p class="${type}-input-label">No se requiere informaci\u00f3n adicional para este juego.</p>`;
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
            input.required = true;
            if (field.pattern) input.pattern = field.pattern;
            if (field.inputmode) input.inputmode = field.inputmode;
            if (field.maxlength) input.maxLength = field.maxlength;
            input.autocomplete = 'off';
            input.autocorrect = 'off';
            input.autocapitalize = 'off';
            input.spellcheck = false;
            if (field.id === 'zoneId') {
                input.pattern = '\\d{4}';
                input.maxLength = 4;
                input.inputMode = 'numeric';
            }
            if (field.id === 'userId') {
                input.inputMode = 'numeric';
            }
            div.appendChild(input);

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
            select.required = true;
            field.options.forEach(optionText => {
                const option = document.createElement('option');
                option.value = optionText;
                option.textContent = optionText;
                select.appendChild(option);
            });
            div.appendChild(select);
        }

        container.appendChild(div);

        if (field.id === 'zoneId') {
            const nicknameDiv = document.createElement('div');
            nicknameDiv.className = `${type}-input-item`;

            const nicknameLabel = document.createElement('label');
            nicknameLabel.className = `${type}-input-label`;
            nicknameLabel.htmlFor = 'nickname';
            nicknameLabel.textContent = 'Nick';
            nicknameDiv.appendChild(nicknameLabel);

            const nicknameInput = document.createElement('input');
            nicknameInput.className = `${type}-input-field`;
            nicknameInput.id = 'nickname';
            nicknameInput.type = 'text';
            nicknameInput.placeholder = 'Se llenar\u00e1 autom\u00e1ticamente';
            nicknameInput.readOnly = true;
            nicknameInput.autocomplete = 'off';
            nicknameInput.autocorrect = 'off';
            nicknameInput.autocapitalize = 'off';
            nicknameInput.spellcheck = false;
            nicknameDiv.appendChild(nicknameInput);

            container.appendChild(nicknameDiv);
        }
    });
};

const renderPackages = (packages, container, totalPriceSpan, type) => {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    packages.forEach((pkg, index) => {
        const totalDiamondsText = typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0 ? `Total: ${pkg.total_diamonds} Diamantes` : '';
        const packageItem = document.createElement('div');
        packageItem.setAttribute('tabindex', '0');
        packageItem.setAttribute('data-price', pkg.price);
        packageItem.setAttribute('data-amount', pkg.amount);
        packageItem.setAttribute('data-total-diamonds', pkg.total_diamonds !== undefined ? pkg.total_diamonds : '');
        packageItem.className = `${type}-package-item ${index === 0 ? 'selected' : ''}`;
        packageItem.setAttribute('role', 'radio');
        packageItem.setAttribute('aria-checked', index === 0 ? 'true' : 'false');

        packageItem.innerHTML = `
            <div>
                <p class="${type === 'pc' ? 'amount' : 'amount-text'}">${pkg.amount}</p>
                ${totalDiamondsText ? `<p class="${type === 'pc' ? 'total-diamonds package-total-highlight' : 'total-text package-total-highlight'}">${totalDiamondsText}</p>` : ''}
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

            if (type === 'mobile') {
                const amount = packageItem.getAttribute('data-amount');
                const totalDiamonds = packageItem.getAttribute('data-total-diamonds');
                const mobileSelectedPackageText = document.getElementById('mobileSelectedPackageText');
                if (mobileSelectedPackageText) {
                    const displayTotalDiamonds = totalDiamonds && parseFloat(totalDiamonds) > 0
                        ? `<span class="mobile-selected-total package-total-highlight subtle-accent">Total: ${totalDiamonds} Diamantes</span>`
                        : '';
                    mobileSelectedPackageText.innerHTML = `
                        <span class="mobile-selected-amount">${amount}</span>
                        ${displayTotalDiamonds}
                    `;
                }
            }
        });
    });
    container.appendChild(fragment);

    if (packages.length > 0) {
        totalPriceSpan.textContent = `S/ ${parseFloat(packages[0].price).toFixed(2)}`;
    } else {
        totalPriceSpan.textContent = 'S/ 0.00';
    }
};

const initializeMobilePackageModal = (packages, toggleBtn, selectedPackageTextSpan, totalPriceSpan, modal, closeBtn, form, confirmBtn) => {
    let currentSelectedPackage = packages[0];

    form.innerHTML = '';
    const fragment = document.createDocumentFragment();

    packages.forEach((pkg, index) => {
        const totalDiamondsText = typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0 ? `Total: <span class="package-total-highlight">${pkg.total_diamonds} Diamantes</span>` : '';
        const label = document.createElement('label');
        label.htmlFor = `modal-pkg-${index}`;
        label.className = `mobile-package-label ${index === 0 ? 'selected' : ''}`;
        label.setAttribute('role', 'radio');
        label.setAttribute('aria-checked', index === 0 ? 'true' : 'false');

        label.innerHTML = `
            <input type="radio" name="package" id="modal-pkg-${index}" value="${pkg.amount}" data-price="${pkg.price}" data-total-diamonds="${pkg.total_diamonds !== undefined ? pkg.total_diamonds : ''}" class="hidden" ${index === 0 ? 'checked' : ''} />
            <div class="content-left">
                <div class="${index === 0 ? 'check-circle' : 'empty-circle'}">
                    ${index === 0 ? '<i class="fas fa-check" aria-hidden="true"></i>' : ''}
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

    totalPriceSpan.textContent = `S/ ${parseFloat(currentSelectedPackage.price).toFixed(2)}`;

    toggleBtn.addEventListener('click', () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        toggleBtn.setAttribute('aria-expanded', 'true');

        const currentSelectedAmount = selectedPackageTextSpan.querySelector('span:first-child').textContent;
        form.querySelectorAll('input[type="radio"]').forEach(input => {
            input.checked = input.value === currentSelectedAmount;
        });
        updateModalSelectionCircles(form);
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        toggleBtn.setAttribute('aria-expanded', 'false');
    });

    modal.querySelector('.mobile-modal-overlay').addEventListener('click', () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        toggleBtn.setAttribute('aria-expanded', 'false');
    });

    form.addEventListener('change', (event) => {
        const selectedInput = event.target;
        if (selectedInput.name === 'package') {
            currentSelectedPackage = {
                amount: selectedInput.value,
                price: selectedInput.getAttribute('data-price'),
                total_diamonds: selectedInput.getAttribute('data-total-diamonds')
            };
            updateModalSelectionCircles(form);
        }
    });

    confirmBtn.addEventListener('click', () => {
        if (currentSelectedPackage) {
            updateMobileToggleText(currentSelectedPackage, selectedPackageTextSpan);
            totalPriceSpan.textContent = `S/ ${parseFloat(currentSelectedPackage.price).toFixed(2)}`;

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
};

const updateModalSelectionCircles = (form) => {
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
            div.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
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
};

const updateMobileToggleText = (pkg, spanElement) => {
    const totalDiamonds = typeof pkg.total_diamonds === 'number' && pkg.total_diamonds > 0 ? pkg.total_diamonds : '';
    spanElement.innerHTML = `
        <span class="mobile-selected-amount">${pkg.amount}</span>
        ${totalDiamonds ? `<span class="mobile-selected-total package-total-highlight subtle-accent">Total: ${totalDiamonds} Diamantes</span>` : ''}
    `;
};

export const initializeModals = () => {
    const orderConfirmationModal = document.getElementById('orderConfirmationModal');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    const closeModalBtn = orderConfirmationModal ? orderConfirmationModal.querySelector('.close-modal-btn') : null;
    const orderSummaryDiv = document.getElementById('orderSummary');

    if (!orderConfirmationModal || !confirmOrderBtn || !cancelOrderBtn || !closeModalBtn || !orderSummaryDiv) {
        console.warn('Order confirmation modal elements not found. Skipping modal initialization.');
        return;
    }

    const closeOrderConfirmationModal = () => {
        orderConfirmationModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        orderConfirmationModal.setAttribute('aria-hidden', 'true');
    };

    cancelOrderBtn.addEventListener('click', closeOrderConfirmationModal);
    closeModalBtn.addEventListener('click', closeOrderConfirmationModal);
    orderConfirmationModal.addEventListener('click', (e) => {
        if (e.target === orderConfirmationModal) {
            closeOrderConfirmationModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && orderConfirmationModal.classList.contains('show')) {
            closeOrderConfirmationModal();
        }
    });

    confirmOrderBtn.addEventListener('click', () => {
        const selectedPackage = getSelectedPackageDetails();
        const inputFieldValues = getInputFieldValues();
        const selectedPaymentMethod = getSelectedPaymentMethod();

        if (!selectedPackage || !selectedPaymentMethod || !validateInputFields()) {
            alert('Por favor, completa todos los campos requeridos y selecciona un paquete y m\u00e9todo de pago.');
            return;
        }

        let whatsappMessage = `\u00a1Hola L-Store! Me gustar\u00eda hacer un pedido.\n\n`;
        whatsappMessage += `*Juego:* ${currentProduct.title}\n`;
        whatsappMessage += `*Paquete:* ${selectedPackage.amount} (S/ ${selectedPackage.price})\n`;
        if (selectedPackage.total_diamonds && parseFloat(selectedPackage.total_diamonds) > 0) {
            whatsappMessage += `*Total Diamantes/Monedas:* ${selectedPackage.total_diamonds}\n`;
        }
        whatsappMessage += `*M\u00e9todo de Pago Preferido:* ${selectedPaymentMethod.name}\n`;
        whatsappMessage += `\n*Mis Datos:*\n`;
        for (const key in inputFieldValues) {
            whatsappMessage += `*${key}:* ${inputFieldValues[key]}\n`;
        }
        whatsappMessage += `\n\u00a1Espero tu confirmaci\u00f3n!`;

        const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        closeOrderConfirmationModal();
    });
};

const openOrderConfirmationModal = (layoutType) => {
    const orderConfirmationModal = document.getElementById('orderConfirmationModal');
    const orderSummaryDiv = document.getElementById('orderSummary');

    const selectedPackage = getSelectedPackageDetails(layoutType);
    const inputFieldValues = getInputFieldValues(layoutType);
    const selectedPaymentMethod = getSelectedPaymentMethod(layoutType);

    if (!selectedPackage || !selectedPaymentMethod || !validateInputFields(layoutType)) {
        alert('Por favor, completa todos los campos requeridos y selecciona un paquete y m\u00e9todo de pago.');
        return;
    }

    orderSummaryDiv.innerHTML = `
        <p><strong>Juego:</strong> ${currentProduct.title}</p>
        <p><strong>Paquete:</strong> ${selectedPackage.amount}</p>
        ${selectedPackage.total_diamonds && parseFloat(selectedPackage.total_diamonds) > 0 ? `<p><strong>Total Diamantes/Monedas:</strong> ${selectedPackage.total_diamonds}</p>` : ''}
        <p><strong>Precio:</strong> S/ ${parseFloat(selectedPackage.price).toFixed(2)}</p>
        <p><strong>M\u00e9todo de Pago:</strong> ${selectedPaymentMethod.name}</p>
        <p><strong>Tus Datos:</strong></p>
        ${Object.entries(inputFieldValues).map(([key, value]) => `<p class="ml-4"><em>${key}:</em> ${value}</p>`).join('')}
    `;

    orderConfirmationModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    orderConfirmationModal.setAttribute('aria-hidden', 'false');
};

const getSelectedPackageDetails = (layoutType) => {
    const packagesContainerId = layoutType === 'pc' ? 'pcPackagesGrid' : 'mobilePackageForm';
    const container = document.getElementById(packagesContainerId);
    if (!container) return null;

    let selectedPackageElement = null;

    if (layoutType === 'pc') {
        selectedPackageElement = container.querySelector(`.${layoutType}-package-item.selected`);
    } else {
        selectedPackageElement = container.querySelector('input[name="package"]:checked');
    }

    if (selectedPackageElement) {
        return {
            amount: selectedPackageElement.getAttribute('data-amount') || selectedPackageElement.value,
            price: selectedPackageElement.getAttribute('data-price'),
            total_diamonds: selectedPackageElement.getAttribute('data-total-diamonds')
        };
    }
    return null;
};

const getInputFieldValues = (layoutType) => {
    const inputFieldsContainerId = layoutType === 'pc' ? 'pcInputFields' : 'mobileInputFields';
    const inputFieldsContainer = document.getElementById(inputFieldsContainerId);
    const values = {};

    if (inputFieldsContainer) {
        inputFieldsContainer.querySelectorAll('input, select').forEach(field => {
            values[field.id] = field.value;
        });
    }
    return values;
};

const getSelectedPaymentMethod = (layoutType) => {
    const paymentMethodsContainerId = layoutType === 'pc' ? 'pcPaymentMethods' : 'mobilePaymentMethods';
    const container = document.getElementById(paymentMethodsContainerId);
    if (!container) return null;

    let selectedPaymentElement = null;

    if (layoutType === 'pc') {
        selectedPaymentElement = container.querySelector(`.${layoutType}-payment-label.selected`);
    } else {
        selectedPaymentElement = container.querySelector('input[name="payment"]:checked');
    }

    if (selectedPaymentElement) {
        const methodId = selectedPaymentElement.getAttribute('data-method-id') || selectedPaymentElement.value;
        return paymentMethodsData.paymentMethods.find(method => method.id === methodId);
    }
    return null;
};

const validateInputFields = (layoutType) => {
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
};

const deriveGameName = (title = '') => {
    const parts = title.split(' de ');
    if (parts.length > 1) {
        return parts[parts.length - 1].trim();
    }
    return title;
};

const setUidGuideImage = (product) => {
    const guideImg = document.getElementById('uidGuideImage');
    if (!guideImg || !product) return;

    const gameName = deriveGameName(product.title);
    const firstWord = (gameName || '').split(/\s+/)[0] || 'guide';
    const normalized = firstWord
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const fileName = `${normalized || 'guide'}-id.jpg`;

    guideImg.onerror = () => {
        guideImg.onerror = null;
        guideImg.src = '../assets/images/placeholder.jpg';
    };
    guideImg.src = `../assets/images/${fileName}`;
    guideImg.alt = `Ejemplo de UID para ${gameName}`;
};

const triggerEntryAnimations = () => {
    const fadeTargets = document.querySelectorAll('.fade-in');
    if (!fadeTargets.length) return;

    fadeTargets.forEach(el => {
        el.classList.remove('show');
        void el.offsetWidth; // force reflow to restart animation
    });

    fadeTargets.forEach((el, idx) => {
        setTimeout(() => {
            el.classList.add('show');
        }, 80 + idx * 70);
    });
};

const initializeGameSearch = () => {
    const searchInput = document.getElementById('gameSearchInput');
    const searchButton = document.getElementById('gameSearchButton');
    const searchResults = document.getElementById('gameSearchResults');

    if (!searchInput || !gameCatalogData || !gameCatalogData.all) {
        return;
    }

    const normalize = (text = '') => text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const clearSuggestions = () => {
        if (searchResults) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('open');
        }
    };

    const renderSuggestions = (matches) => {
        if (!searchResults) return;
        if (!matches.length) {
            clearSuggestions();
            return;
        }

        const limited = matches.slice(0, 8);
        searchResults.innerHTML = limited.map(game => `
            <a class="search-suggestion-item" href="shop.html?game=${game.id}" role="option">
                <span class="search-suggestion-thumb">
                    <img src="../assets/images/${game.image.split('/').pop()}" alt="${game.title}" loading="lazy">
                </span>
                <span class="search-suggestion-title">${game.title}</span>
            </a>
        `).join('');
        searchResults.classList.add('open');
    };

    const performSearch = () => {
        const query = normalize(searchInput.value.trim());

        if (!query) {
            clearSuggestions();
            return;
        }

        const filteredGames = gameCatalogData.all.filter(game => {
            const title = normalize(game.title);
            const category = normalize(game.category);
            const id = normalize(game.id);
            return title.includes(query) || category.includes(query) || id.includes(query);
        });

        renderSuggestions(filteredGames);
    };

    searchInput.addEventListener('input', performSearch);
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    document.addEventListener('click', (e) => {
        if (searchResults && !searchResults.contains(e.target) && e.target !== searchInput) {
            clearSuggestions();
        }
    });
};
