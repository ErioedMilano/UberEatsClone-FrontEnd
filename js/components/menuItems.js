function createMenuItemElement(item, addToCartCallback) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <div class="menu-item-info">
            <h4>${item.name}</h4>
            <p>${item.description || ''}</p>
            <span class="menu-item-price">€${item.price.toFixed(2)}</span>
        </div>
        <button class="add-to-cart" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">Toevoegen</button>
    `;
    div.querySelector('.add-to-cart').addEventListener('click', (e) => {
        e.stopPropagation();
        addToCartCallback(item);
    });
    return div;
}