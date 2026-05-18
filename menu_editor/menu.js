// =============================
// SUPABASE
// =============================
import { SUPABASE_URL, SUPABASE_KEY } from '../.env.js';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// =============================
// SETTINGS
// =============================

const restaurantId = 'restaurant123';

let editingDishId = null;

// =============================
// MODAL
// =============================

const modal = document.getElementById('dishModal');

function openModal() {
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    resetForm();
}
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// =============================
// LOAD DISHES
// =============================

async function loadDishes() {

    const { data, error } = await supabaseClient
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });

    if (error) {
        console.log(error);
        return;
    }

    renderDishes(data);
}

// =============================
// RENDER DISHES
// =============================

function renderDishes(dishes) {
    const container = document.getElementById('menuContainer');

    if (dishes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No dishes yet</h2>
                <p>Add your first menu item.</p>
            </div>
        `;

        return;
    }

    const categories = ['Starters', 'Mains', 'Desserts', 'Drinks'];

    let html = '';

    categories.forEach(category => {

        const filtered = dishes.filter(dish => dish.category === category);

        if (filtered.length === 0) return;

        html += `
            <section class="menu-section">
                <h2>${category}</h2>

                <div class="menu-grid">
        `;

        filtered.forEach(dish => {

            html += `
                <div class="dish-card"> <img src="${dish.image_url || 'https://placehold.co/600x400'}">

                    <div class="dish-content">

                        <h3>${dish.name}</h3>

                        <p>${dish.description}</p>

                        <span class="price">€${dish.price}</span>

                        <div class="card-actions">

                            <button
                                class="edit-btn"
                                onclick="editDish('${dish.id}')"
                            >
                                Edit
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteDish('${dish.id}')"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            `;
        });
        html += `
                </div>
            </section>
        `;
    });

    container.innerHTML = html;
}

// =============================
// SAVE DISH
// =============================

const dishForm = document.getElementById('dishForm');

dishForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    const saveBtn = document.getElementById('saveBtn');

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const dish = {
        restaurant_id: restaurantId,
        name: document.getElementById('dishName').value,
        description: document.getElementById('dishDescription').value,
        price: document.getElementById('dishPrice').value,
        category: document.getElementById('dishCategory').value,
        image_url: document.getElementById('dishImage').value
    };

    let error;

    if (editingDishId) {

        const response = await supabaseClient
            .from('menu_items').update(dish)
            .eq('id', editingDishId);

        error = response.error;

    } else {

        const response = await supabaseClient
            .from('menu_items')
            .insert([dish]);

        error = response.error;
    }

    if (error) {
        console.log(error);
        alert('Error saving dish');
    } else {
        closeModal();
        loadDishes();
    }

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Dish';
});

// =============================
// DELETE DISH
// =============================

async function deleteDish(id) {
    const confirmed = confirm('Delete this dish?');

    if (!confirmed) return;

    const { error } = await supabaseClient
        .from('menu_items')
        .delete()
        .eq('id', id);

    if (error) {
        console.log(error);
        return;
    }

    loadDishes();
}

// =============================
// EDIT DISH
// =============================

async function editDish(id) {

    const { data, error } = await supabaseClient
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.log(error);
        return;
    }

    editingDishId = id;
    document.getElementById('modalTitle').textContent = 'Edit Dish';

    document.getElementById('dishName').value = data.name;
    document.getElementById('dishDescription').value = d