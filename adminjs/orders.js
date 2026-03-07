document.addEventListener('DOMContentLoaded', async () => {
    await loadOrders();
    setupEventListeners();
});

async function loadOrders() {
    try {
        const orders = await getOrders();
        renderOrders(orders);
    } catch (err) {
        console.error(err);
        document.getElementById('orders-table-body').innerHTML = '<tr><td colspan="6">Fout bij laden bestellingen</td></tr>';
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Geen bestellingen gevonden</td></tr>';
        return;
    }
    tbody.innerHTML = orders.map(o => `
        <tr data-id="${o.id}">
            <td>${o.id}</td>
            <td>${o.customerName}</td>
            <td>${o.customerAddress}</td>
            <td>${new Date(o.orderDate).toLocaleString()}</td>
            <td>€${o.total.toFixed(2)}</td>
            <td>
                <button class="btn-view" data-id="${o.id}">Details</button>
                <button class="btn-delete" data-id="${o.id}">Verwijder</button>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('orders-table-body').addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('btn-delete')) {
            if (confirm('Weet u zeker dat u deze bestelling wilt verwijderen?')) {
                try {
                    await deleteOrder(id);
                    await loadOrders();
                } catch (err) {
                    alert('Fout bij verwijderen');
                }
            }
        } else if (e.target.classList.contains('btn-view')) {
            try {
                const items = await getOrderDetails(id);
                showOrderDetailsModal(items);
            } catch (err) {
                alert('Fout bij ophalen details');
            }
        }
    });

    document.getElementById('close-details').addEventListener('click', () => {
        document.getElementById('order-details-modal').style.display = 'none';
    });
}

function showOrderDetailsModal(items) {
    const modal = document.getElementById('order-details-modal');
    const tbody = document.getElementById('order-items-body');
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Geen items</td></tr>';
    } else {
        tbody.innerHTML = items.map(i => `
            <tr>
                <td>${i.menuItemId}</td>
                <td>${i.quantity}</td>
                <td>€${i.price.toFixed(2)}</td>
                <td>€${(i.price * i.quantity).toFixed(2)}</td>
            </tr>
        `).join('');
    }
    modal.style.display = 'block';
}