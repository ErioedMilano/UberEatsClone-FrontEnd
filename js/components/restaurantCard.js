function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = restaurant.id;
    card.innerHTML = `
        <img src="${restaurant.imageUrl}" alt="${restaurant.name}">
        <div class="card-content">
            <h3>${restaurant.name}</h3>
            <div class="cuisine">${restaurant.cuisine}</div>
            <div class="rating">⭐ ${restaurant.rating}</div>
        </div>
    `;
    card.addEventListener('click', () => {
        loadMenu(restaurant.id, restaurant.name);
    });
    return card;
}