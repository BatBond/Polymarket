from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import asyncio
import logging
import threading
import time
from datetime import datetime

from config import Config
from polymarket_client import PolymarketClient
from trading_engine import AutomatedTradingEngine

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize clients
polymarket_client = PolymarketClient(Config)
trading_engine = AutomatedTradingEngine(polymarket_client, Config)

# Background thread for trading
trading_thread = None
trading_active = False

def background_trading_loop():
    """Background thread for running trading cycles"""
    logger.info("Starting background trading loop...")
    while trading_active:
        try:
            asyncio.run(trading_engine.run_strategy_cycle())
            # Emit dashboard update
            dashboard_data = trading_engine.get_dashboard_data()
            socketio.emit('dashboard_update', dashboard_data)
            time.sleep(30)  # Run every 30 seconds
        except Exception as e:
            logger.error(f"Error in trading loop: {e}")
            time.sleep(5)

# REST API Routes
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'trading_active': trading_active
    })

@app.route('/api/dashboard')
def get_dashboard():
    """Get current dashboard state"""
    return jsonify(trading_engine.get_dashboard_data())

@app.route('/api/markets')
def get_markets():
    """Get available markets"""
    category = request.args.get('category')
    markets = polymarket_client.get_markets(category)
    return jsonify(markets)

@app.route('/api/trades')
def get_trades():
    """Get trade history"""
    return jsonify(trading_engine.active_positions[-50:])

@app.route('/api/strategy/start', methods=['POST'])
def start_strategy():
    """Start automated trading"""
    global trading_active, trading_thread
    
    if not trading_active:
        trading_active = True
        trading_thread = threading.Thread(target=background_trading_loop, daemon=True)
        trading_thread.start()
        logger.info("Trading strategy started")
        return jsonify({'success': True, 'message': 'Strategy started'})
    
    return jsonify({'success': False, 'message': 'Already running'})

@app.route('/api/strategy/stop', methods=['POST'])
def stop_strategy():
    """Stop automated trading"""
    global trading_active
    
    trading_active = False
    logger.info("Trading strategy stopped")
    return jsonify({'success': True, 'message': 'Strategy stopped'})

# WebSocket events
@socketio.on('connect')
def handle_connect():
    logger.info('Client connected')
    emit('connected', {'status': 'connected'})
    # Send initial dashboard data
    emit('dashboard_update', trading_engine.get_dashboard_data())

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

@socketio.on('subscribe_dashboard')
def handle_subscribe():
    """Subscribe to dashboard updates"""
    emit('dashboard_update', trading_engine.get_dashboard_data())

if __name__ == '__main__':
    logger.info("Starting Mirofish Trading Bot...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=Config.DEBUG)