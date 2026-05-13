document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;

    console.log("Tentativa de login:", { email, password });
    alert("Funcionalidade de login disparada para: " + email);

    // 1. Efeito na Barra de Navegação ao fazer Scroll
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = '#4a634a'; // Tom de verde mais escuro
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = '#5d7a5d'; // Cor original
            navbar.style.boxShadow = 'none';
        }
    });
