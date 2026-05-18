// Client-side JavaScript for E-Commerce Interactions
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Toast Notification Container dynamically
    injectToastContainer();

    // 2. Register Add-to-Cart Interceptors
    registerAddToCartInterceptors();

    // 3. Register Live Search and Filter Interceptors
    setupLiveSearch();

    // 4. Register Cart Page Adjusters
    setupCartOperations();
});

// Toast inject helper
function injectToastContainer() {
    if (document.getElementById('cartToast')) return;
    const toastEl = document.createElement('div');
    toastEl.innerHTML = `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;">
        <div id="cartToast" class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-check-circle me-2"></i> <span id="toastMessage">Item added to cart!</span>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    </div>
    `;
    document.body.appendChild(toastEl);
}

// Success Toast trigger helper
function showToast(message, isSuccess = true) {
    const toastMsg = document.getElementById('toastMessage');
    const toastNode = document.getElementById('cartToast');
    if (toastMsg && toastNode) {
        toastMsg.textContent = message;
        if (isSuccess) {
            toastNode.classList.remove('bg-danger');
            toastNode.classList.add('bg-success');
        } else {
            toastNode.classList.remove('bg-success');
            toastNode.classList.add('bg-danger');
        }
        const bsToast = new bootstrap.Toast(toastNode);
        bsToast.show();
    }
}

// Debounce helper to prevent excessive requests
function debounce(func, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Register dynamic cart submission
function registerAddToCartInterceptors() {
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    addToCartForms.forEach(form => {
        // Prevent multiple listeners
        if (form.dataset.listenerRegistered) return;
        form.dataset.listenerRegistered = 'true';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalHtml = submitBtn.innerHTML;
            
            // Loading Animation
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

            const productId = form.querySelector('input[name="productId"]').value;
            const quantity = form.querySelector('input[name="quantity"]')?.value || 1;

            try {
                const response = await fetch('/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ productId, quantity })
                });

                const data = await response.json();
                
                if (data.success) {
                    // Update Navbar Badge dynamically
                    const badge = document.querySelector('.navbar-nav .badge');
                    if (badge) {
                        badge.textContent = data.cart.totalQuantity;
                        // Add mini pop animation
                        badge.style.transform = 'scale(1.3)';
                        badge.style.transition = 'transform 0.2s ease-in-out';
                        setTimeout(() => badge.style.transform = 'scale(1)', 300);
                    }

                    // Success Animation
                    submitBtn.className = 'btn btn-outline-success btn-sm';
                    submitBtn.innerHTML = `<i class="fas fa-check me-1"></i> Added!`;
                    
                    showToast(data.message || 'Added to cart successfully!');
                } else {
                    showToast('Failed to add item to cart', false);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalHtml;
                }
            } catch (err) {
                console.error(err);
                showToast('Network error, please try again', false);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHtml;
            }

            // Restore button styling after a short delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.className = 'btn btn-success btn-sm';
                submitBtn.innerHTML = originalHtml;
            }, 2000);
        });
    });
}

// Live Search & Filtering setup
function setupLiveSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const productGrid = document.getElementById('product-grid');

    if (!searchInput && !categorySelect) return;

    // Prevent enter key from doing page reload on search input
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => e.preventDefault());
    }

    const performSearch = async () => {
        if (!productGrid) return;

        const searchVal = searchInput ? searchInput.value.trim() : '';
        const catVal = categorySelect ? categorySelect.value : '';

        // Add visual loading state/spinner inside the product grid
        productGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted small">Loading products...</p>
        </div>
        `;

        try {
            const url = `/products?search=${encodeURIComponent(searchVal)}&category=${encodeURIComponent(catVal)}&json=1`;
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await response.json();
            
            if (data.products) {
                renderProductGrid(data.products);
            }
        } catch (err) {
            console.error(err);
            productGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                <p class="text-danger">Failed to fetch products. Please refresh and try again.</p>
            </div>
            `;
        }
    };

    const debouncedSearch = debounce(performSearch, 300);

    if (searchInput) {
        searchInput.addEventListener('input', debouncedSearch);
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', performSearch);
    }
}

// Render dynamic search grids
function renderProductGrid(products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <p class="lead text-muted">No products found matching your criteria.</p>
        </div>
        `;
        return;
    }

    grid.innerHTML = products.map(product => {
        const ratingVal = Math.round(product.rating || 0);
        const starsHtml = '★'.repeat(ratingVal) + '☆'.repeat(5 - ratingVal);
        return `
        <div class="col">
            <div class="card h-100 border-0 shadow-sm rounded product-card">
                <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}" style="height: 220px; object-fit: cover;">
                <div class="card-body d-flex flex-column p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold m-0 text-truncate" style="max-width: 70%;">${product.name}</h5>
                        <span class="badge bg-light text-success fw-bold py-2 px-3 border border-success border-opacity-25 rounded-pill">$${product.price.toFixed(2)}</span>
                    </div>
                    <div class="mb-3">
                        <span class="badge bg-secondary-subtle text-secondary px-2.5 py-1.5 rounded">${product.category}</span>
                        <span class="ms-2 text-warning small">
                            ${starsHtml}
                            <span class="text-muted small">(${product.numReviews || 0})</span>
                        </span>
                    </div>
                    <p class="card-text flex-grow-1 text-truncate" style="max-height: 3rem;">${product.description}</p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <a href="/products/${product._id}" class="btn btn-outline-primary btn-sm">View Details</a>
                        <form action="/cart" method="POST" class="m-0 add-to-cart-form">
                            <input type="hidden" name="productId" value="${product._id}">
                            <input type="hidden" name="quantity" value="1">
                            <button type="submit" class="btn btn-success btn-sm">Add to Cart</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Re-register dynamic additions
    registerAddToCartInterceptors();
}

// Shopping Cart dynamic logic
function setupCartOperations() {
    const qtyForms = document.querySelectorAll('.update-qty-form');
    const qtyInputs = document.querySelectorAll('.qty-input');
    const removeForms = document.querySelectorAll('.remove-item-form');

    // Intercept quantity updates
    qtyForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            updateCartQuantity(form);
        });
    });

    // Auto-update quantity on input change (without button click)
    qtyInputs.forEach(input => {
        const form = input.closest('.update-qty-form');
        input.addEventListener('change', debounce(() => {
            if (form) updateCartQuantity(form);
        }, 400));
    });

    // Intercept removal clicks
    removeForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const row = form.closest('.cart-item-row');
            const productId = form.querySelector('input[name="productId"]').value;
            const submitBtn = form.querySelector('button[type="submit"]');
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span>`;

            try {
                const response = await fetch('/cart/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ productId })
                });

                const data = await response.json();

                if (data.success) {
                    // Update totals
                    updateSummaryDOM(data.cart);

                    // Row transition slide-out animation
                    if (row) {
                        row.style.transition = 'all 0.4s ease-out';
                        row.style.opacity = '0';
                        row.style.transform = 'translateX(-30px)';
                        setTimeout(() => {
                            row.remove();
                            // If cart becomes empty, reload to display EJS empty layout
                            if (data.cart.items.length === 0) {
                                location.reload();
                            }
                        }, 400);
                    }
                    
                    showToast(data.message || 'Product removed from cart.');
                } else {
                    showToast('Failed to remove item', false);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
                }
            } catch (err) {
                console.error(err);
                showToast('Failed to connect to server', false);
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
            }
        });
    });
}

// Quantity update AJAX handler
async function updateCartQuantity(form) {
    const productId = form.querySelector('input[name="productId"]').value;
    const quantity = form.querySelector('input[name="quantity"]').value;
    const row = form.closest('.cart-item-row');
    const subtotalCell = row ? row.querySelector('.item-subtotal') : null;

    try {
        const response = await fetch('/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ productId, quantity })
        });

        const data = await response.json();

        if (data.success) {
            // Find item in updated cart to set correct individual item subtotal
            const updatedItem = data.cart.items.find(item => item.productId.toString() === productId);
            if (updatedItem && subtotalCell) {
                subtotalCell.textContent = `$${(updatedItem.price * updatedItem.quantity).toFixed(2)}`;
            } else if (!updatedItem && row) {
                // If item is no longer in cart (e.g. qty was set to 0), slide row out
                row.remove();
                if (data.cart.items.length === 0) {
                    location.reload();
                    return;
                }
            }

            // Recalculate order summary values
            updateSummaryDOM(data.cart);
            showToast('Cart updated successfully!');
        } else {
            showToast('Failed to update quantity', false);
        }
    } catch (err) {
        console.error(err);
        showToast('Error adjusting cart quantities', false);
    }
}

// DOM synchronizer for cart subtotal components
function updateSummaryDOM(cart) {
    const qtySpan = document.getElementById('summary-total-qty');
    const priceSpan = document.getElementById('summary-total-price');
    const navBadge = document.querySelector('.navbar-nav .badge');

    if (qtySpan) qtySpan.textContent = `${cart.totalQuantity} items`;
    if (priceSpan) priceSpan.textContent = `$${cart.totalPrice.toFixed(2)}`;
    if (navBadge) {
        navBadge.textContent = cart.totalQuantity;
        navBadge.style.transform = 'scale(1.2)';
        setTimeout(() => navBadge.style.transform = 'scale(1)', 200);
    }
}
