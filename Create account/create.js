registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = registerForm.querySelector('button[type="submit"]');

    // Prevent double submission
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    submitBtn.textContent = "A criar conta...";

    const display_name = document.getElementById('create-display_name').value;
    const email = document.getElementById('create-email').value;
    const password = document.getElementById('create-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert("As passwords não coincidem.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Registar";
        return;
    }

    const timeoutId = setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Registar";
        alert("O pedido demorou muito. Tente novamente.");
    }, 15000); // 15 second timeout


    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { display_name } }
    });

    if (error) {
        alert("Erro no registo: " + error.message);
        submitBtn.disabled = false;  // Re-enable on error
        submitBtn.textContent = "Registar";
    } else {
        alert("Conta criada com sucesso! Podes fazer login.");
        window.location.href = "../login/login.html";
    }
});

clearTimeout(timeoutId);