async function loadStats() {
    const { data } = await supabase
        .from('orders')
        .select('revenue, created_at')
        .gte('created_at', todayStart);

    dataToday.orders = data.length;
    dataToday.revenue = data.reduce((sum, r) => sum + r.revenue, 0);
    calculateStats();
}

// Dados simulados (Podes alterar estes números para testar)
const dataToday = {
    orders: 47,
    revenue: 683,
    scans: 134
};

const dataYesterday = {
    orders: 42,
    revenue: 630,
    scans: 110
};

function calculateStats() {
    // 1. Cálculo do Ticket Médio (Revenue / Orders)
    const avgToday = dataToday.revenue / dataToday.orders;
    const avgYesterday = dataYesterday.revenue / dataYesterday.orders;

    // 2. Função para calcular a variação percentual
    const getTrend = (current, previous) => {
        const diff = ((current - previous) / previous) * 100;
        const symbol = diff >= 0 ? "↑" : "↓";
        const cssClass = diff >= 0 ? "trend-up" : "trend-down";
        return {
            text: `${symbol} ${Math.abs(diff).toFixed(1)}% vs yesterday`,
            class: cssClass
        };
    };

    // 3. Atualizar o DOM (Interface)
    updateElement("orders-value", dataToday.orders);
    updateTrend("orders-trend", getTrend(dataToday.orders, dataYesterday.orders));

    updateElement("revenue-value", `€${dataToday.revenue}`);
    updateTrend("revenue-trend", getTrend(dataToday.revenue, dataYesterday.revenue));

    updateElement("avg-value", `€${avgToday.toFixed(2)}`);
    updateTrend("avg-trend", getTrend(avgToday, avgYesterday));

    updateElement("scans-value", dataToday.scans);
    updateTrend("scans-trend", getTrend(dataToday.scans, dataYesterday.scans));
}

// Funções auxiliares para limpar o código
function updateElement(id, value) {
    document.getElementById(id).textContent = value;
}

function updateTrend(id, trendObj) {
    const el = document.getElementById(id);
    el.textContent = trendObj.text;
    el.className = `stat-trend ${trendObj.class}`;
}

// Executa os cálculos ao carregar a página
window.onload = calculateStats;