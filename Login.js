// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
    }
    
    // Demo credentials
    const validCredentials = {
        username: 'admin',
        password: 'admin123'
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validate credentials
        if (username === validCredentials.username && password === validCredentials.password) {
            // Store login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            // Show success animation
            errorMessage.style.display = 'none';
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Login Berhasil!';
            submitBtn.style.background = '#10b981';
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else {
            // Show error message
            errorMessage.textContent = 'Username atau password salah!';
            errorMessage.style.display = 'block';
            
            // Shake animation
            loginForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 500);
        }
    });
});

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
