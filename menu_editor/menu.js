const modal = document.getElementById('dishModal');
const menuForm = document.getElementById('menuForm');
const menuGrid = document.getElementById('menuGrid');
let editingCard = null; // Variável para saber se estamos a editar ou a criar novo

// --- FUNÇÃO PARA ABRIR/FECHAR MODAL ---
function toggleModal() {
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    if (modal.style.display === 'none') {
        menuForm.reset();
        editingCard = null; // Limpa o estado de edição
        document.querySelector('.btn-save').textContent = "Guardar Prato";
    }
}

// --- LOGICA DOS FILTROS ---
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remover classe active de todos e adicionar ao clicado
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const category = button.textContent;
        const cards = document.querySelectorAll('.dish-card');

        cards.forEach(card => {
            if (category === 'All' || card.getAttribute('data-category') === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// --- SUBMETER FORMULÁRIO (CRIAR OU EDITAR) ---
menuForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('dishName').value;
    const desc = document.getElementById('dishDesc').value;
    const price = document.getElementById('dishPrice').value;
    const category = document.getElementById('dishCategory').value;
    const imgFile = document.getElementById('dishImage').files[0];

    const processCard = (imgUrl) => {
        if (editingCard) {
            // Se estivermos a editar, atualizamos o card existente
            editingCard.querySelector('h3').textContent = name;
            editingCard.querySelector('p').textContent = desc;
            editingCard.querySelector('.dish-price').textContent = `€${parseFloat(price).toFixed(2)}`;
            editingCard.setAttribute('data-category', category);
            if (imgUrl) editingCard.querySelector('img').src = imgUrl;
        } else {
            // Se for novo, criamos do zero
            const card = document.createElement('div');
            card.className = 'dish-card';
            card.setAttribute('data-category', category);
            card.innerHTML = `
                <div class="dish-img-container">
                    <img src="${imgUrl || 'https://via.placeholder.com/70'}" alt="${name}">
                </div>
                <div class="dish-info">
                    <h3>${name}</h3>
                    <p>${desc}</p>
                    <span class="dish-price">€${parseFloat(price).toFixed(2)}</span>
                </div>
                <div class="card-actions">
                    <button class="btn-icon edit-btn"><i class="far fa-edit"></i></button>
                    <button class="btn-icon delete-btn"><i class="far fa-trash-alt"></i></button>
                </div>
            `;

            // Adicionar eventos aos novos botões
            card.querySelector('.delete-btn').addEventListener('click', () => card.remove());
            card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(card));

            menuGrid.appendChild(card);
        }
        toggleModal();
    };

    if (imgFile) {
        const reader = new FileReader();
        reader.onload = (event) => processCard(event.target.result);
        reader.readAsDataURL(imgFile);
    } else {
        processCard(null);
    }
});

// --- FUNÇÃO PARA EDITAR ---
function openEditModal(card) {
    editingCard = card;
    document.getElementById('dishName').value = card.querySelector('h3').textContent;
    document.getElementById('dishDesc').value = card.querySelector('p').textContent;
    document.getElementById('dishPrice').value = card.querySelector('.dish-price').textContent.replace('€', '');
    document.getElementById('dishCategory').value = card.getAttribute('data-category');

    document.querySelector('.btn-save').textContent = "Atualizar Prato";
    toggleModal();
}