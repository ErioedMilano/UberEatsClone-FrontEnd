document.addEventListener('DOMContentLoaded', async () => {
    await loadRestaurants();
    setupEventListeners();
});

let editingId = null;

async function loadRestaurants() {
    try {
        const restaurants = await getRestaurants();
        renderRestaurants(restaurants);
    } catch (err) {
        console.error(err);
        document.getElementById('restaurants-table-body').innerHTML = '<tr><td colspan="6">Fout bij laden restaurants</td></tr>';
    }
}

function renderRestaurants(restaurants) {
    const tbody = document.getElementById('restaurants-table-body');
    if (!restaurants || restaurants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Geen restaurants gevonden</td></tr>';
        return;
    }
    tbody.innerHTML = restaurants.map(r => `
        <tr data-id="${r.id}">
            <td>${r.id}</td>
            <td><img src="${r.imageUrl}" alt="${r.name}" style="width:50px; height:50px; object-fit:cover;"></td>
            <td>${r.name}</td>
            <td>${r.cuisine}</td>
            <td>${r.rating}</td>
            <td>
                <button class="btn-edit" data-id="${r.id}">Bewerk</button>
                <button class="btn-delete" data-id="${r.id}">Verwijder</button>
                <button class="btn-menu" data-id="${r.id}">Menu</button>
            </td>
        </tr>
    `).join('');
}

function setupEventListeners() {
    document.getElementById('add-restaurant-btn').addEventListener('click', () => {
        editingId = null;
        document.getElementById('form-title').textContent = 'Nieuw restaurant';
        document.getElementById('restaurant-form').reset();
        document.getElementById('restaurant-id').value = '';
        document.getElementById('form-modal').style.display = 'block';
    });

    document.getElementById('cancel-form').addEventListener('click', () => {
        document.getElementById('form-modal').style.display = 'none';
    });

    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('form-modal').style.display = 'none';
    });

    document.getElementById('restaurant-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            imageUrl: document.getElementById('imageUrl').value,
            cuisine: document.getElementById('cuisine').value,
            rating: parseFloat(document.getElementById('rating').value)
        };
        try {
            if (editingId) {
                await updateRestaurant(editingId, formData);
            } else {
                await createRestaurant(formData);
            }
            document.getElementById('form-modal').style.display = 'none';
            await loadRestaurants();
        } catch (err) {
            alert('Fout: ' + err.message);
        }
    });

    document.getElementById('restaurants-table-body').addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('btn-delete')) {
            if (confirm('Weet u zeker dat u dit restaurant wilt verwijderen?')) {
                try {
                    await deleteRestaurant(id);
                    await loadRestaurants();
                } catch (err) {
                    alert('Fout bij verwijderen');
                }
            }
        } else if (e.target.classList.contains('btn-edit')) {
            const row = e.target.closest('tr');
            editingId = id;
            document.getElementById('form-title').textContent = 'Bewerk restaurant';
            document.getElementById('restaurant-id').value = id;
            document.getElementById('name').value = row.cells[2].textContent;
            document.getElementById('imageUrl').value = row.querySelector('img').src;
            document.getElementById('cuisine').value = row.cells[3].textContent;
            document.getElementById('rating').value = row.cells[4].textContent;
            document.getElementById('form-modal').style.display = 'block';
        } else if (e.target.classList.contains('btn-menu')) {
            window.location.href = `menu.html?restaurantId=${id}`;
        }
    });
}