// Globale variabelen
let currentRestaurantId = null;

// DOM elementen
const restaurantGrid = document.getElementById('restaurant-grid');
const menuSection = document.getElementById('menu-section');
const menuGrid = document.getElementById('menu-grid');
const restaurantName = document.getElementById('restaurant-name');
const backBtn = document.getElementById('back-to-restaurants');
const cartIcon = document.querySelector('.cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const orderModal = document.getElementById('order-modal');
const closeModal = document.querySelector('.close-modal');
const orderForm = document.getElementById('order-form');
const loader = document.getElementById('loader');

// Thema toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check voor opgeslagen thema
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    if (isDark) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
});

// Loader functies
function showLoader() {
    if (loader) loader.style.display = 'block';
    if (restaurantGrid) restaurantGrid.style.display = 'none';
}

function hideLoader() {
    if (loader) loader.style.display = 'none';
    if (restaurantGrid) restaurantGrid.style.display = 'grid';
}

// Laad restaurants bij start
document.addEventListener('DOMContentLoaded', async () => {
    await loadRestaurants();

    // Initialiseer cart UI
    if (typeof cart !== 'undefined') {
        cart.updateUI();
    }

    // Event listeners voor cart sidebar
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('open');
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
        });
    }

    // Event listeners voor modals
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.items.length === 0) {
                alert('Je winkelmandje is leeg');
                return;
            }
            orderModal.classList.add('show');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            orderModal.classList.remove('show');
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.classList.remove('show');
        }
    });

    // Bestelling plaatsen
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const customerName = document.getElementById('customer-name').value;
            const customerAddress = document.getElementById('customer-address').value;

            const orderData = {
                customerName,
                customerAddress,
                items: cart.items.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity
                }))
            };

            try {
                const result = await placeOrder(orderData);
                alert(`Bestelling geplaatst! Ordernummer: ${result.orderId}`);
                cart.clear();
                orderModal.classList.remove('show');
                cartSidebar.classList.remove('open');
                orderForm.reset();
            } catch (error) {
                alert('Fout bij plaatsen bestelling: ' + error.message);
            }
        });
    }

    // Terug naar restaurants
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.getElementById('restaurants').style.display = 'block';
            menuSection.style.display = 'none';
            currentRestaurantId = null;
        });
    }

    // Event delegation voor cart acties
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const cartItem = e.target.closest('.cart-item');
            if (cartItem) {
                const itemId = parseInt(cartItem.dataset.id);
                cart.removeItem(itemId);
            }
        }
        if (e.target.classList.contains('increase-qty')) {
            const cartItem = e.target.closest('.cart-item');
            if (cartItem) {
                const itemId = parseInt(cartItem.dataset.id);
                const item = cart.items.find(i => i.id === itemId);
                if (item) cart.updateQuantity(itemId, item.quantity + 1);
            }
        }
        if (e.target.classList.contains('decrease-qty')) {
            const cartItem = e.target.closest('.cart-item');
            if (cartItem) {
                const itemId = parseInt(cartItem.dataset.id);
                const item = cart.items.find(i => i.id === itemId);
                if (item) cart.updateQuantity(itemId, item.quantity - 1);
            }
        }
    });
});

async function loadRestaurants() {
    showLoader();
    try {
        const restaurants = await fetchRestaurants();
        renderRestaurants(restaurants);
    } catch (error) {
        console.error('Fout bij laden restaurants:', error);
        if (restaurantGrid) {
            restaurantGrid.innerHTML = '<p>Fout bij laden restaurants. Controleer of de backend draait.</p>';
        }
    } finally {
        hideLoader();
    }
}

function renderRestaurants(restaurants) {
    if (!restaurantGrid) return;
    restaurantGrid.innerHTML = '';
    restaurants.forEach(restaurant => {
        restaurantGrid.appendChild(createRestaurantCard(restaurant));
    });
}

async function loadMenu(restaurantId, name) {
    try {
        const menuItems = await fetchMenu(restaurantId);
        currentRestaurantId = restaurantId;
        renderMenu(menuItems, name);
        if (restaurantName) restaurantName.textContent = name;
        document.getElementById('restaurants').style.display = 'none';
        menuSection.style.display = 'block';
    } catch (error) {
        console.error('Fout bij laden menu:', error);
        alert('Kon menu niet laden');
    }
}

function renderMenu(menuItems, restaurantName) {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';
    if (menuItems.length === 0) {
        menuGrid.innerHTML = '<p>Geen menu-items gevonden</p>';
        return;
    }
    menuItems.forEach(item => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'menu-item';
        menuItemDiv.innerHTML = `
            <div style="display: flex; gap: 1rem; align-items: center;">
                <img src="${item.imageUrl || 'https://via.placeholder.com/80'}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div class="menu-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.description || ''}</p>
                    <div class="menu-item-price">€${item.price.toFixed(2)}</div>
                </div>
            </div>
            <button class="add-to-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">Toevoegen</button>
        `;
        menuGrid.appendChild(menuItemDiv);
    });

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menuItem = {
                id: parseInt(btn.dataset.id),
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price)
            };
            cart.addItem(menuItem, 1);
        });
    });

    // Voeg event listeners toe aan de knoppen
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const menuItem = {
                id: parseInt(btn.dataset.id),
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price)
            };
            cart.addItem(menuItem, 1);
        });
    });
}