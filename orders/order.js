// 1. SUPABASE CREDENTIALS CONFIGURATION
export const SUPABASE_URL = 'https://zxlylpetxrugjaqlnini.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bHlscGV0eHJ1Z2phcWxuaW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTg2MDQsImV4cCI6MjA5MzczNDYwNH0.4ZIINgph78f6m8_fyJzUop2O7xd6-Buw0Hlb3fH-sPw';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {

    // ── DOM refs ────────────────────────────────────────────────────────────────
    const metricTotal = document.getElementById('metric-total');
    const metricPending = document.getElementById('metric-pending');
    const metricDone = document.getElementById('metric-done');
    const metricRevenue = document.getElementById('metric-revenue');
    const ordersGrid = document.getElementById('orders-grid');
    const emptyState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const refreshBtn = document.getElementById('refresh-btn');
    const realtimeDot = document.getElementById('realtime-dot');
    const realtimeText = document.getElementById('realtime-text');
    const printerBtn = document.getElementById('printer-toggle');
    const printerStatus = document.getElementById('printer-status-text');
    const printerDot = document.getElementById('printer-dot');

    let isPrinterConnected = false;

    // ── 2. FETCH & RENDER ───────────────────────────────────────────────────────
    async function fetchOrders() {
        refreshBtn.textContent = '🔄 Loading…';

        try {
            // Pull today's orders only (optional — remove the .gte filter to show all)
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .gte('created_at', startOfDay.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (orders && orders.length > 0) {
                updateMetrics(orders);
                renderOrders(orders);
                emptyState.classList.add('hidden');
                ordersGrid.classList.remove('hidden');
            } else {
                showEmpty('No orders yet today. They will appear here in real time.');
            }

        } catch (err) {
            console.error('Fetch error:', err);
            showEmpty('Could not load orders. Check your Supabase table setup.');
        } finally {
            refreshBtn.textContent = '🔄 Refresh';
        }
    }

    // ── Metrics ─────────────────────────────────────────────────────────────────
    function updateMetrics(orders) {
        const pending = orders.filter(o => o.status === 'pending').length;
        const done = orders.filter(o => o.status === 'done').length;
        const revenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);

        metricTotal.textContent = orders.length;
        metricPending.textContent = pending;
        metricDone.textContent = done;
        metricRevenue.textContent = `€${revenue.toFixed(2)}`;
    }

    // ── Order Cards ─────────────────────────────────────────────────────────────
    function renderOrders(orders) {
        ordersGrid.innerHTML = '';

        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = `order-card ${order.status === 'done' ? 'card-done' : 'card-pending'}`;
            card.dataset.id = order.id;

            const items = parseItems(order.items);
            const time = new Date(order.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

            card.innerHTML = `
        <div class="card-header">
          <div class="card-meta">
            <span class="order-id">Order #${order.id.toString().slice(-5).toUpperCase()}</span>
            ${order.table_number ? `<span class="table-tag">Table ${order.table_number}</span>` : ''}
          </div>
          <div class="card-right">
            <span class="order-time">${time}</span>
            <span class="badge ${order.status === 'done' ? 'badge-done' : 'badge-pending'}">${order.status}</span>
          </div>
        </div>

        <ul class="items-list">
          ${items.length > 0
                    ? items.map(item => `
                <li class="item-row">
                  <span class="item-qty">${item.qty || item.quantity || 1}×</span>
                  <span class="item-name">${item.name || item.title || 'Item'}</span>
                  ${item.price ? `<span class="item-price">€${Number(item.price).toFixed(2)}</span>` : ''}
                </li>`).join('')
                    : '<li class="item-row muted">No item details available</li>'
                }
        </ul>

        <div class="card-footer">
          <span class="total-price">Total: <strong>€${Number(order.total_price).toFixed(2)}</strong></span>
          <button
            class="btn btn-status ${order.status === 'done' ? 'btn-reopen' : 'btn-done'}"
            data-id="${order.id}"
            data-current="${order.status}">
            ${order.status === 'done' ? '↩ Reopen' : '✓ Mark as Done'}
          </button>
        </div>
      `;

            ordersGrid.appendChild(card);
        });

        // Attach status-toggle listeners
        ordersGrid.querySelectorAll('.btn-status').forEach(btn => {
            btn.addEventListener('click', handleStatusToggle);
        });
    }

    // ── Parse items safely ───────────────────────────────────────────────────────
    function parseItems(raw) {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
            try { return JSON.parse(raw); } catch { return []; }
        }
        return [];
    }

    // ── 3. STATUS TOGGLE ────────────────────────────────────────────────────────
    async function handleStatusToggle(e) {
        const btn = e.currentTarget;
        const orderId = btn.dataset.id;
        const current = btn.dataset.current;
        const newStatus = current === 'done' ? 'pending' : 'done';

        btn.disabled = true;
        btn.textContent = 'Saving…';

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Status update failed:', error);
            btn.disabled = false;
            btn.textContent = current === 'done' ? '↩ Reopen' : '✓ Mark as Done';
            alert('Failed to update order status. Please try again.');
        }
        // Realtime subscription will trigger fetchOrders() automatically
    }

    // ── Empty / Error state ──────────────────────────────────────────────────────
    function showEmpty(msg) {
        errorMessage.textContent = msg;
        emptyState.classList.remove('hidden');
        ordersGrid.classList.add('hidden');
        metricTotal.textContent = '—';
        metricPending.textContent = '—';
        metricDone.textContent = '—';
        metricRevenue.textContent = '—';
    }

    // ── 4. REALTIME SUBSCRIPTION ─────────────────────────────────────────────────
    function initRealtime() {
        supabase
            .channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
                console.log('Realtime update:', payload);
                fetchOrders();
            })
            .subscribe(status => {
                if (status === 'SUBSCRIBED') {
                    realtimeDot.className = 'pulse-dot connected';
                    realtimeText.textContent = 'live';
                } else {
                    realtimeDot.className = 'pulse-dot error';
                    realtimeText.textContent = 'reconnecting…';
                }
            });
    }

    // ── Printer toggle (UI only) ──────────────────────────────────────────────────
    printerBtn.addEventListener('click', () => {
        isPrinterConnected = !isPrinterConnected;
        printerBtn.textContent = isPrinterConnected ? 'Disconnect printer' : 'Connect printer';
        printerStatus.textContent = isPrinterConnected ? 'Printer connected' : 'No printer connected';
        printerDot.style.backgroundColor = isPrinterConnected ? '#10b981' : '#6b7280';
    });

    refreshBtn.addEventListener('click', fetchOrders);

    // ── Boot ──────────────────────────────────────────────────────────────────────
    fetchOrders();
    initRealtime();
});