const API_BASE_URL = 'https://ubereats-backend.onrender.com';

async function fetchRestaurants() {
    const response = await fetch(`${API_BASE_URL}/api/restaurants`);
    if (!response.ok) throw new Error('Fout bij ophalen restaurants');
    return await response.json();
}

async function fetchMenu(restaurantId) {
    const response = await fetch(`${API_BASE_URL}/api/restaurants/${restaurantId}/menu`);
    if (!response.ok) throw new Error('Fout bij ophalen menu');
    return await response.json();
}

async function placeOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fout bij plaatsen bestelling');
    }
    return await response.json();
}