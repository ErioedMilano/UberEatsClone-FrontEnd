document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await getDashboardData();
        renderStats(data);
        renderRestaurantsChart(data.topRestaurants);
        renderDishesChart(data.topDishes);
        renderOrdersChart(data.ordersByHour);
    } catch (err) {
        console.error(err);
        document.querySelector('main').innerHTML = '<p style="color:red;">Fout bij laden dashboard: ' + err.message + '</p>';
    }
});

function renderStats(data) {
    document.getElementById('total-orders-today').textContent = data.totalOrdersToday || 0;
    document.getElementById('revenue-today').textContent = `€${(data.revenueToday || 0).toFixed(2)}`;
    document.getElementById('total-orders').textContent = data.totalOrders || 0;
}

function renderRestaurantsChart(restaurants) {
    const canvas = document.getElementById('restaurants-chart');
    if (!restaurants || restaurants.length === 0) {
        canvas.parentElement.innerHTML = '<p>Geen data</p>';
        return;
    }
    const ctx = canvas.getContext('2d');
    const labels = restaurants.map(r => r.name);
    const counts = restaurants.map(r => r.orderCount);
    const colors = generateColors(labels.length);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%'
        }
    });
}

function renderDishesChart(dishes) {
    const canvas = document.getElementById('dishes-chart');
    if (!dishes || dishes.length === 0) {
        canvas.parentElement.innerHTML = '<p>Geen data</p>';
        return;
    }
    const ctx = canvas.getContext('2d');
    const labels = dishes.map(d => d.name);
    const counts = dishes.map(d => d.totalQuantity);
    const colors = generateColors(labels.length);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 15  // zorgt dat segment naar buiten komt bij hover
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%'
        }
    });
}

function renderOrdersChart(ordersByHour) {
    const canvas = document.getElementById('orders-chart');
    if (!ordersByHour || Object.keys(ordersByHour).length === 0) {
        canvas.parentElement.innerHTML = '<p>Geen bestellingen in de laatste 24 uur</p>';
        return;
    }
    const ctx = canvas.getContext('2d');
    const hours = Object.keys(ordersByHour);
    const counts = Object.values(ordersByHour);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Aantal bestellingen',
                data: counts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
        }
    });
}

function generateColors(count) {
    const baseColors = ['#ff6b35', '#4299e1', '#48bb78', '#f56565', '#9f7aea', '#ed8936', '#667eea'];
    const colors = [];
    for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}