class Cart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.loadFromStorage();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            this.items = JSON.parse(saved);
            this.calculateTotal();
        }
    }

    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    addItem(menuItem, quantity = 1) {
        const existing = this.items.find(item => item.id === menuItem.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.push({
                id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: quantity
            });
        }
        this.calculateTotal();
        this.saveToStorage();
        this.updateUI();
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.calculateTotal();
        this.saveToStorage();
        this.updateUI();
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = newQuantity;
                this.calculateTotal();
                this.saveToStorage();
                this.updateUI();
            }
        }
    }

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    clear() {
        this.items = [];
        this.total = 0;
        this.saveToStorage();
        this.updateUI();
    }

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    updateUI() {
        // Update cart count
        const cartCount = document.getElementById('cart-count');
        if (cartCount) cartCount.textContent = this.getItemCount();

        // Update cart sidebar
        this.renderCartItems();
    }

    renderCartItems() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<p>Je winkelmandje is leeg</p>';
        } else {
            cartItemsContainer.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-details">
                        <div>${item.name}</div>
                        <div>€${item.price.toFixed(2)} x ${item.quantity}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="decrease-qty">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-qty">+</button>
                        <button class="remove-item"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        }
        if (cartTotalSpan) cartTotalSpan.textContent = `€${this.total.toFixed(2)}`;
    }
}

// Maak een globale instantie aan
const cart = new Cart();