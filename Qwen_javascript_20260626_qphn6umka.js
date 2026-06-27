// WebSocket connection for real-time updates
class DashboardWebSocket {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.connected = false;
    }

    connect() {
        const backendUrl = window.location.origin;
        console.log('Connecting to:', backendUrl);
        
        this.socket = io(backendUrl, {
            transports: ['websocket', 'poll'],
            reconnection: true,
            reconnectionDelay: this.reconnectDelay,
            reconnectionAttempts: this.maxReconnectAttempts
        });

        this.socket.on('connect', () => {
            console.log('Connected to backend');
            this.connected = true;
            this.reconnectAttempts = 0;
            this.socket.emit('subscribe_dashboard');
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from backend');
            this.connected = false;
            this.updateConnectionStatus(false);
        });

        this.socket.on('dashboard_update', (data) => {
            console.log('Dashboard update received:', data);
            this.updateDashboard(data);
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    emit(event, data) {
        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        }
    }

    updateConnectionStatus(connected) {
        const statusBadge = document.getElementById('status-badge');
        if (statusBadge) {
            if (connected) {
                statusBadge.innerHTML = '<span class="status-dot"></span>LIVE · MAINNET';
                statusBadge.className = 'status-badge live';
            } else {
                statusBadge.innerHTML = '<span class="status-dot" style="background: var(--red)"></span>OFFLINE';
                statusBadge.className = 'status-badge';
                statusBadge.style.background = 'rgba(231, 76, 60, 0.15)';
            }
        }
    }

    updateDashboard(data) {
        // Update PnL
        if (data.total_pnl !== undefined) {
            const pnlElement = document.getElementById('total-pnl');
            if (pnlElement) {
                pnlElement.textContent = this.formatCurrency(data.total_pnl);
            }
        }

        // Update trades
        if (data.total_trades !== undefined) {
            const tradesElement = document.getElementById('total-trades');
            const latticeTradesElement = document.getElementById('lattice-trades');
            const footerFillsElement = document.getElementById('footer-fills');
            
            if (tradesElement) tradesElement.textContent = data.total_trades.toLocaleString();
            if (latticeTradesElement) latticeTradesElement.textContent = data.total_trades.toLocaleString();
            if (footerFillsElement) footerFillsElement.textContent = `${data.total_trades.toLocaleString()} FILLS`;
        }

        // Update win rate
        if (data.win_rate !== undefined) {
            const winRateElement = document.getElementById('win-rate');
            if (winRateElement) {
                winRateElement.textContent = data.win_rate.toFixed(1);
            }
        }

        // Update session PnL
        if (data.session_pnl !== undefined) {
            const sessionPnlElement = document.getElementById('session-pnl');
            if (sessionPnlElement) {
                sessionPnlElement.textContent = this.formatCurrency(data.session_pnl);
            }
        }

        // Update probability lattice stats
        if (data.probability_lattice) {
            const lattice = data.probability_lattice;
            const ballsDroppedElement = document.getElementById('balls-dropped');
            const landedGreenElement = document.getElementById('landed-green');
            
            if (ballsDroppedElement) ballsDroppedElement.textContent = lattice.balls_dropped.toLocaleString();
            if (landedGreenElement) landedGreenElement.textContent = lattice.win_rate.toFixed(1) + '%';
        }

        // Update tail ridge stats
        if (data.tail_ridge) {
            const ridge = data.tail_ridge;
            const sessionsElement = document.getElementById('ridge-sessions');
            const tailMassElement = document.getElementById('tail-mass');
            const impliedMultElement = document.getElementById('implied-mult');
            
            if (sessionsElement) sessionsElement.textContent = ridge.sessions.toLocaleString();
            if (tailMassElement) tailMassElement.textContent = (ridge.tail_mass * 100).toFixed(2) + '%';
            if (impliedMultElement) impliedMultElement.textContent = '×' + ridge.implied_mult.toFixed(1);
        }

        // Update relationship graph stats
        if (data.relationship_graph) {
            const graph = data.relationship_graph;
            const bearPathsElement = document.getElementById('bear-paths');
            const bullPathsElement = document.getElementById('bull-paths');
            const pUpElement = document.getElementById('p-up');
            const pDownElement = document.getElementById('p-down');
            const confidenceElement = document.getElementById('confidence');
            const nodeCountElement = document.getElementById('node-count');
            const edgeCountElement = document.getElementById('edge-count');
            const signalStrengthElement = document.getElementById('signal-strength');
            
            if (bearPathsElement) bearPathsElement.textContent = graph.bear_paths.toLocaleString();
            if (bullPathsElement) bullPathsElement.textContent = graph.bull_paths.toLocaleString();
            if (pUpElement) pUpElement.textContent = graph.p_up.toFixed(2);
            if (pDownElement) pDownElement.textContent = graph.p_down.toFixed(2);
            if (confidenceElement) confidenceElement.textContent = graph.confidence.toFixed(1) + '%';
            if (nodeCountElement) nodeCountElement.textContent = graph.nodes;
            if (edgeCountElement) edgeCountElement.textContent = graph.edges;
            if (signalStrengthElement) signalStrengthElement.textContent = graph.signal.toFixed(1) + '%';
        }

        // Trigger chart updates
        if (window.updateCharts) {
            window.updateCharts(data);
        }
    }

    formatCurrency(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return '$0';
        
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        return formatter.format(num);
    }
}

// Initialize WebSocket
const ws = new DashboardWebSocket();
window.dashboardWS = ws;