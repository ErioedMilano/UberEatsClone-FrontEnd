const ADMIN_API_BASE = 'http://localhost:8080/api/admin';

// Helper om token op te halen
function getToken() {
    return localStorage.getItem('adminToken');
}

// Helper om headers met token te maken
function authHeaders() {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Inloggen
async function adminLogin(username, password) {
    const response = await fetch(`${ADMIN_API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Inloggen mislukt');
    }
    return await response.json();
}

// Uitloggen
async function adminLogout() {
    const token = getToken();
    if (!token) return;
    const response = await fetch(`${ADMIN_API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        localStorage.removeItem('adminToken');
    }
}

// Beveiligde GET
async function adminFetch(url) {
    const response = await fetch(`${ADMIN_API_BASE}${url}`, {
        headers: authHeaders()
    });
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
        throw new Error('Niet ingelogd');
    }
    if (!response.ok) throw new Error('Fout bij ophalen data');
    return await response.json();
}

// Beveiligde POST
async function adminPost(url, data) {
    const response = await fetch(`${ADMIN_API_BASE}${url}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
        throw new Error('Niet ingelogd');
    }
    if (!response.ok) throw new Error('Fout bij opslaan');
    return await response.json();
}

// Beveiligde PUT
async function adminPut(url, data) {
    const response = await fetch(`${ADMIN_API_BASE}${url}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
    });
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
        throw new Error('Niet ingelogd');
    }
    if (!response.ok) throw new Error('Fout bij bijwerken');
    return await response.json();
}

// Beveiligde DELETE
async function adminDelete(url) {
    const response = await fetch(`${ADMIN_API_BASE}${url}`, {
        method: 'DELETE',
        headers: authHeaders()
    });
    if (response.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
        throw new Error('Niet ingelogd');
    }
    if (!response.ok) throw new Error('Fout bij verwijderen');
    return await response.json();
}

// Restaurants
async function getRestaurants() {
    return adminFetch('/restaurants');
}

async function createRestaurant(restaurant) {
    return adminPost('/restaurants', restaurant);
}

async function updateRestaurant(id, restaurant) {
    return adminPut(`/restaurants/${id}`, restaurant);
}

async function deleteRestaurant(id) {
    return adminDelete(`/restaurants/${id}`);
}

// Menu items per restaurant
async function getMenuByRestaurant(restaurantId) {
    return adminFetch(`/restaurants/${restaurantId}/menu`);
}

async function createMenuItem(item) {
    return adminPost('/menu', item);
}

async function updateMenuItem(id, item) {
    return adminPut(`/menu/${id}`, item);
}

async function deleteMenuItem(id) {
    return adminDelete(`/menu/${id}`);
}

// Orders
async function getOrders() {
    return adminFetch('/orders');
}

async function getOrderDetails(orderId) {
    return adminFetch(`/orders/${orderId}/items`);
}

async function deleteOrder(orderId) {
    return adminDelete(`/orders/${orderId}`);
}

// Dashboard
async function getDashboardData() {
    return adminFetch('/dashboard');
}