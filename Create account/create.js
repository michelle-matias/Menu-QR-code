// Inicializa o supabase (usa as tuas chaves)
import { SUPABASE_URL, SUPABASE_KEY } from '../.env.js';


const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert("As passwords não coincidem.");
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        alert("Erro no registo: " + error.message);
    } else {
        alert("Conta criada com sucesso! Podes fazer login.");
        window.location.href = "login.html"; // Redireciona para o login
    }
});