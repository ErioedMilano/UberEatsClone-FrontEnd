document.addEventListener('DOMContentLoaded', async () => {
    await loadRestaurants();
    setupEventListeners();
});

let currentRestaurantId = null;
let editingId = null;

async function loadRestaurants() {
    try {
        const restaurants = await getRestaurants();
        const select = document.getElementById('restaurant-select');
        select.innerHTML = '<option value="">-- Selecteer restaurant --</option>';
        restaurants.forEach(r => {
            const option = document.createElement('option');
            option.value = r.id;
            option.textContent = r.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Fout bij laden restaurants:', err);
        alert('Kon restaurants niet laden. Ben je ingelogd?');
    }
}

async function loadMenu(restaurantId) {
    try {
        const items = await getMenuByRestaurant(restaurantId);
        renderMenu(items);
    } catch (err) {
        console.error(err);
        document.getElementById('menu-table-body').innerHTML = '<tr><td colspan="6">Fout bij laden menu: ' + err.message + '</td></tr>';
    }
}

function renderMenu(items) {
    const tbody = document.getElementById('menu-table-body');
    if (!items || items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Geen menu-items gevonden</td></tr>';
        return;
    }
    tbody.innerHTML = items.map(i => `
        <tr data-id="${i.id}">
            <td>${i.id}</td>
            <td><img src="${i.imageUrl || 'https://via.placeholder.com/50'}" alt="${i.name}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"></td>
            <td>${i.name}</td>
            <td>${i.description || ''}</td>
            <td>€${i.price.toFixed(2)}</td>
            <td>
                <button class="btn-edit" data-id="${i.id}">Bewerk</button>
                <button class="btn-delete" data-id="${i.id}">Verwijder</button>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('restaurant-select').addEventListener('change', (e) => {
        currentRestaurantId = e.target.value;
        if (currentRestaurantId) {
            loadMenu(currentRestaurantId);
        } else {
            document.getElementById('menu-table-body').innerHTML = '<tr><td colspan="6">Selecteer eerst een restaurant</td></tr>';
        }
    });

    document.getElementById('add-menu-btn').addEventListener('click', () => {
        if (!currentRestaurantId) {
            alert('Selecteer eerst een restaurant');
            return;
        }
        editingId = null;
        document.getElementById('menu-form-title').textContent = 'Nieuw gerecht';
        document.getElementById('menu-form').reset();
        document.getElementById('menu-item-id').value = '';
        document.getElementById('menu-form-modal').style.display = 'block';
    });

    document.getElementById('cancel-menu-form').addEventListener('click', () => {
        document.getElementById('menu-form-modal').style.display = 'none';
    });

    document.getElementById('close-menu-modal').addEventListener('click', () => {
        document.getElementById('menu-form-modal').style.display = 'none';
    });

    document.getElementById('menu-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentRestaurantId) {
            alert('Selecteer eerst een restaurant');
            return;
        }
        const formData = {
            restaurantId: parseInt(currentRestaurantId),
            name: document.getElementById('menu-name').value,
            description: document.getElementById('menu-description').value,
            price: parseFloat(document.getElementById('menu-price').value),
            imageUrl: document.getElementById('menu-image').value || null
        };
        try {
            if (editingId) {
                await updateMenuItem(editingId, formData);
            } else {
                await createMenuItem(formData);
            }
            document.getElementById('menu-form-modal').style.display = 'none';
            await loadMenu(currentRestaurantId);
        } catch (err) {
            alert('Fout: ' + err.message);
        }
    });

    document.getElementById('menu-table-body').addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (!currentRestaurantId) return;
        if (e.target.classList.contains('btn-delete')) {
            if (confirm('Weet u zeker dat u dit gerecht wilt verwijderen?')) {
                try {
                    await deleteMenuItem(id);
                    await loadMenu(currentRestaurantId);
                } catch (err) {
                    alert('Fout bij verwijderen');
                }
            }
        } else if (e.target.classList.contains('btn-edit')) {
            const row = e.target.closest('tr');
            editingId = id;
            document.getElementById('menu-form-title').textContent = 'Bewerk gerecht';
            document.getElementById('menu-item-id').value = id;
            document.getElementById('menu-name').value = row.cells[2].textContent;
            document.getElementById('menu-description').value = row.cells[3].textContent;
            document.getElementById('menu-price').value = row.cells[4].textContent.replace('€', '');
            const img = row.cells[1].querySelector('img');
            document.getElementById('menu-image').value = img ? img.src : '';
            document.getElementById('menu-form-modal').style.display = 'block';
        }
    });
}