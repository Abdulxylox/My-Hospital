// Authentication Module
const API_URL = 'http://localhost:3000/api';

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, role })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token and user info
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            showError('Connection error. Please try again.');
            console.error('Login error:', error);
        }
    });
}

// Logout Handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// Logout Function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Get Auth Token
function getToken() {
    return localStorage.getItem('token');
}

// Get Current User
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Check Authentication
function checkAuth() {
    const token = getToken();
    const user = getCurrentUser();
    
    if (!token || !user) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Load User Info in Dashboard
function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        const userNameEl = document.getElementById('userName');
        const userRoleEl = document.getElementById('userRole');
        
        if (userNameEl) userNameEl.textContent = user.name;
        if (userRoleEl) userRoleEl.textContent = user.role.toUpperCase();
    }
}

// Show Error Message
function showError(message) {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check auth for dashboard pages
    if (document.querySelector('.dashboard-container') || 
        document.querySelector('.main-content')) {
        checkAuth();
        loadUserInfo();
    }
});
