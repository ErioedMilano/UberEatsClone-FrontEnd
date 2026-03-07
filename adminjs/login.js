document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        errorDiv.textContent = '';

        try {
            const result = await adminLogin(username, password);
            localStorage.setItem('adminToken', result.token);
            window.location.href = 'dashboard.html';
        } catch (err) {
            errorDiv.textContent = err.message;
        }
    });
});