
const loginForm = document.getElementById('loginForm');
const navbar = document.querySelector('.navbar');

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = '#4a634a';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = '#5d7a5d';
            navbar.style.boxShadow = 'none';
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = loginForm.querySelector('input[type="email"]');
        const passwordInput = loginForm.querySelector('input[type="password"]');
        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
            alert('Por favor, preencha email e password.');
            return;
        }

        console.log('Tentativa de login:', { email, password });

        if (window.supabase && typeof supabase.auth.signInWithPassword === 'function') {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert('Login falhou: ' + error.message);
                return;
            }

            console.log('Utilizador logado:', data.user);
        } else {
            alert('Funcionalidade de login simulada para: ' + email);
        }

        window.location.href = 'editor.html';
    });
} else {
    console.warn('loginForm não encontrado em login.js');
}

async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Se não houver utilizador, manda de volta para o login
        window.location.href = "login.html";
    } else {
        console.log("Bem-vindo ao Menu4U,", user.email);
    }
}

checkUser();