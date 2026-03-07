document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await getDashboardData();
        renderTopRestaurants(data.topRestaurants);
        renderTopDishes(data.topDishes);
        renderTodayStats(data.totalOrdersToday, data.revenueToday);
        renderOrdersChart(data.ordersByHour);
    } catch (err) {
        console.error(err);
        document.querySelector('main').innerHTML = '<p style="color:red;">Fout bij laden dashboard: ' + err.message + '</p>';
    }
});

function renderTopRestaurants(restaurants) {
    const list = document.getElementById('top-restaurants');
    if (!restaurants || restaurants.length === 0) {
        list.innerHTML = '<li>Geen restaurants met bestellingen</li>';
        return;
    }
    list.innerHTML = restaurants.map(r =>
        `<li><span>${r.name}</span> <span class="count">${r.orderCount} bestellingen</span></li>`
    ).join('');
}

function renderTopDishes(dishes) {
    const list = document.getElementById('top-dishes');
    if (!dishes || dishes.length === 0) {
        list.innerHTML = '<li>Geen gerechten besteld</li>';
        return;
    }
    list.innerHTML = dishes.map(d =>
        `<li><span>${d.name}</span> <span class="count">${d.totalQuantity} keer besteld</span></li>`
    ).join('');
}

function renderTodayStats(totalOrders, revenue) {
    document.getElementById('total-orders-today').textContent = totalOrders || 0;
    document.getElementById('revenue-today').textContent = `€${(revenue || 0).toFixed(2)}`;
}

function renderOrdersChart(ordersByHour) {
    const canvas = document.getElementById('orders-chart');
    const container = canvas.parentElement;
    if (!ordersByHour || Object.keys(ordersByHour).length === 0) {
        container.innerHTML = '<p>Geen bestellingen in de laatste 24 uur</p>';
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
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}