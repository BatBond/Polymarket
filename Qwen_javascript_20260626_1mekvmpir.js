// Main dashboard initialization and control

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initializing...');
    
    // Initialize WebSocket connection
    if (window.dashboardWS) {
        window.dashboardWS.connect();
    }
    
    // Update UTC time
    updateUTCTime();
    setInterval(updateUTCTime, 1000);
    
    // Initialize charts
    if (window.initializeCharts) {
        // Wait a bit for layout to settle
        setTimeout(() => {
            window.initializeCharts();
        }, 100);
    }
    
    // Fetch initial data
    fetchInitialData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.initializeCharts) {
                window.initializeCharts();
            }
        }, 250);
    });
});

function updateUTCTime() {
    const now = new Date();
    const timeString = now.toISOString().substr(11, 8) + ' UTC';
    const timeElement = document.getElementById('utc-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

async function fetchInitialData() {
    try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
            const data = await response.json();
            if (window.dashboardWS) {
                window.dashboardWS.updateDashboard(data);
            }
        }
    } catch (error) {
        console.log('Using demo data (backend not available)');
        loadDemoData();
    }
}

function loadDemoData() {
    // Load demo data if backend is not available
    const demoData = {
        total_pnl: 406984,
        total_trades: 5944,
        win_rate: 71.2,
        session_pnl: 19778,
        probability_lattice: {
            balls_dropped: 265,
            landed_green: 201,
            win_rate: 75.8
        },
        tail_ridge: {
            sessions: 1292,
            tail_mass: 0.0021,
            implied_mult: 476.2
        },
        relationship_graph: {
            nodes: 66,
            edges: 149,
            signal: 94.8,
            p_up: 0.72,
            p_down: 0.28,
            confidence: 94.8,
            bear_paths: 570,
            bull_paths: 1433
        }
    };
    
    if (window.dashboardWS) {
        window.dashboardWS.updateDashboard(demoData);
    }
}

function setupEventListeners() {
    // Listen for chart updates
    window.addEventListener('chartsUpdate', (event) => {
        if (window.updateCharts) {
            window.updateCharts(event.detail);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + R: Refresh dashboard
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            fetchInitialData();
        }
    });
}

// Utility functions
function formatNumber(num) {
    return num.toLocaleString();
}

function formatCurrency(num) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(num);
}

function formatPercentage(num) {
    return num.toFixed(2) + '%';
}

// Export functions for global access
window.updateDashboard = function(data) {
    if (window.dashboardWS) {
        window.dashboardWS.updateDashboard(data);
    }
};

window.formatCurrency = formatCurrency;
window.formatPercentage = formatPercentage;