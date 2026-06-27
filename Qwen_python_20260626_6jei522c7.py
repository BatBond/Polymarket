import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import numpy as np

logger = logging.getLogger(__name__)

class SignalType(Enum):
    BULL = "bull"
    BEAR = "bear"
    NEUTRAL = "neutral"

@dataclass
class TradingSignal:
    token_id: str
    signal_type: SignalType
    confidence: float
    entry_price: float
    target_price: float
    stop_loss: float
    position_size: float
    timestamp: datetime

class ProbabilityLattice:
    """Implements the Probability Lattice visualization logic"""
    
    def __init__(self, num_gates: int = 8):
        self.num_gates = num_gates
        self.balls_dropped = 0
        self.landed_green = 0
        self.trades = []
    
    def add_trade(self, trade: Dict):
        """Add trade to lattice simulation"""
        self.balls_dropped += 1
        
        # Simulate ball drop through gates
        path = self._simulate_ball_path(trade)
        is_profitable = trade.get('pnl', 0) > 0
        
        if is_profitable:
            self.landed_green += 1
        
        self.trades.append({
            'path': path,
            'profitable': is_profitable,
            'pnl': trade.get('pnl', 0),
            'timestamp': trade.get('timestamp')
        })
        
        # Keep only last 1000 trades
        if len(self.trades) > 1000:
            self.trades = self.trades[-1000:]
    
    def _simulate_ball_path(self, trade: Dict) -> List[int]:
        """Simulate ball dropping through lattice gates"""
        path = []
        current_position = self.num_gates // 2
        
        for gate in range(self.num_gates):
            # Random walk with bias based on trade outcome
            bias = 0.6 if trade.get('pnl', 0) > 0 else 0.4
            direction = 1 if np.random.random() < bias else -1
            current_position = max(0, min(self.num_gates, current_position + direction))
            path.append(current_position)
        
        return path
    
    def get_stats(self) -> Dict:
        """Get lattice statistics"""
        win_rate = (self.landed_green / self.balls_dropped * 100) if self.balls_dropped > 0 else 0
        
        return {
            'balls_dropped': self.balls_dropped,
            'landed_green': self.landed_green,
            'win_rate': win_rate,
            'trades': self.trades[-100:]  # Last 100 trades
        }

class TailProbabilityRidge:
    """Implements Tail Probability Ridge analysis"""
    
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.price_history = []
        self.sessions = 0
    
    def update(self, price: float, volume: float):
        """Update ridge with new price data"""
        self.price_history.append({
            'price': price,
            'volume': volume,
            'timestamp': datetime.now()
        })
        
        # Keep only recent window
        if len(self.price_history) > self.window_size:
            self.price_history = self.price_history[-self.window_size:]
        
        self.sessions += 1
    
    def calculate_ridge(self) -> Dict:
        """Calculate tail probability ridge landscape"""
        if len(self.price_history) < 10:
            return {
                'sessions': self.sessions,
                'tail_mass': 0.05,
                'implied_mult': 1.05,
                'avg_entry': 0.5,
                'ridges': [],
                'tail_zone': {'threshold': 0.7, 'payout': 5.0}
            }
        
        prices = np.array([p['price'] for p in self.price_history])
        volumes = np.array([p['volume'] for p in self.price_history])
        
        # Calculate price density distribution
        mean_price = np.mean(prices)
        std_dev = np.std(prices)
        
        # Identify tail zones (extreme price movements)
        tail_threshold = mean_price + 2 * std_dev
        tail_mask = prices > tail_threshold
        tail_mass = np.sum(tail_mask) / len(prices) if len(prices) > 0 else 0
        
        # Calculate implied multiplier
        implied_mult = 1 / (1 - tail_mass) if tail_mass < 1 else 10.0
        
        # Generate ridge curves (probability distributions over time)
        ridges = []
        for i in range(0, len(prices), 10):
            window = prices[i:i+10]
            if len(window) > 0:
                ridges.append({
                    'mean': float(np.mean(window)),
                    'std': float(np.std(window)),
                    'volume': float(np.sum(volumes[i:i+10]))
                })
        
        return {
            'sessions': self.sessions,
            'tail_mass': float(tail_mass),
            'implied_mult': float(implied_mult),
            'avg_entry': float(mean_price),
            'ridges': ridges,
            'tail_zone': {
                'threshold': float(tail_threshold),
                'payout': float(tail_mass * 100)
            }
        }

class RelationshipGraph:
    """Implements relationship graph simulation for market correlations"""
    
    def __init__(self):
        self.nodes = []
        self.edges = []
        self.signal_history = []
    
    def add_market_node(self, token_id: str, price: float, volume: float):
        """Add market node to graph"""
        self.nodes.append({
            'id': token_id,
            'price': price,
            'volume': volume,
            'signal': self._calculate_signal(price, volume),
            'timestamp': datetime.now()
        })
        
        # Keep only last 100 nodes
        if len(self.nodes) > 100:
            self.nodes = self.nodes[-100:]
    
    def _calculate_signal(self, price: float, volume: float) -> SignalType:
        """Calculate signal type based on price and volume"""
        if price > 0.5 and volume > 10000:
            return SignalType.BULL
        elif price < 0.5 and volume > 10000:
            return SignalType.BEAR
        return SignalType.NEUTRAL
    
    def calculate_correlations(self) -> List[Dict]:
        """Calculate correlations between markets"""
        if len(self.nodes) < 2:
            return []
        
        correlations = []
        for i, node1 in enumerate(self.nodes):
            for node2 in self.nodes[i+1:]:
                # Simple correlation based on signal similarity
                corr = 1.0 if node1['signal'] == node2['signal'] else -0.5
                correlations.append({
                    'source': node1['id'],
                    'target': node2['id'],
                    'correlation': corr,
                    'weight': abs(corr)
                })
        
        return correlations
    
    def get_simulation_stats(self) -> Dict:
        """Get graph simulation statistics"""
        if not self.nodes:
            return {
                'nodes': 0,
                'edges': 0,
                'signal': 50.0,
                'p_up': 0.5,
                'p_down': 0.5,
                'confidence': 50.0,
                'bear_paths': 0,
                'bull_paths': 0
            }
        
        bull_count = sum(1 for n in self.nodes if n['signal'] == SignalType.BULL)
        bear_count = sum(1 for n in self.nodes if n['signal'] == SignalType.BEAR)
        total = len(self.nodes)
        
        p_up = bull_count / total if total > 0 else 0.5
        p_down = bear_count / total if total > 0 else 0.5
        
        return {
            'nodes': total,
            'edges': len(self.calculate_correlations()),
            'signal': (p_up - p_down + 1) / 2 * 100,
            'p_up': p_up,
            'p_down': p_down,
            'confidence': min(95.0, 50 + total * 0.5),
            'bear_paths': bear_count * 10,
            'bull_paths': bull_count * 10
        }

class AutomatedTradingEngine:
    """Main trading engine that orchestrates all strategies"""
    
    def __init__(self, polymarket_client, config):
        self.client = polymarket_client
        self.config = config
        self.probability_lattice = ProbabilityLattice()
        self.tail_ridge = TailProbabilityRidge()
        self.relationship_graph = RelationshipGraph()
        
        self.active_positions = []
        self.total_pnl = 0
        self.total_trades = 0
        self.win_rate = 0
        self.session_pnl = 0
        
    async def run_strategy_cycle(self):
        """Execute one cycle of trading strategy"""
        logger.info("Running strategy cycle...")
        
        try:
            # 1. Fetch market opportunities
            markets = await self._fetch_opportunities()
            
            # 2. Analyze with relationship graph
            for market in markets[:10]:  # Top 10 markets
                self.relationship_graph.add_market_node(
                    market['token_id'],
                    market['price'],
                    market.get('volume', 0)
                )
                
                # Update tail ridge
                self.tail_ridge.update(market['price'], market.get('volume', 0))
            
            # 3. Generate trading signals
            signals = await self._generate_signals(markets)
            
            # 4. Execute trades (simulation mode)
            for signal in signals:
                if self._should_execute_trade(signal):
                    await self._execute_trade(signal)
            
            # 5. Update metrics
            self._update_metrics()
            
        except Exception as e:
            logger.error(f"Error in strategy cycle: {e}")
    
    async def _fetch_opportunities(self) -> List[Dict]:
        """Fetch market opportunities from Polymarket"""
        markets = self.client.get_markets()
        
        opportunities = []
        for market in markets[:20]:  # Limit to top 20
            try:
                token_id = market.get('token_id', market.get('condition_id', ''))
                if not token_id:
                    continue
                    
                orderbook = self.client.get_market_orderbook(token_id)
                tail_prob = self.client.get_tail_probability(token_id)
                
                opportunities.append({
                    'token_id': token_id,
                    'title': market.get('question', market.get('title', '')),
                    'price': orderbook.get('yes_bid', 0.5),
                    'volume': market.get('volume', 0),
                    'tail_mass': tail_prob.get('tail_mass', 0),
                    'implied_mult': tail_prob.get('implied_mult', 1.0)
                })
            except Exception as e:
                logger.error(f"Error processing market: {e}")
        
        return sorted(opportunities, key=lambda x: x.get('volume', 0), reverse=True)
    
    async def _generate_signals(self, markets: List[Dict]) -> List[TradingSignal]:
        """Generate trading signals based on analysis"""
        signals = []
        
        for market in markets:
            # Tail sniper strategy: enter when tail probability is high
            if market.get('tail_mass', 0) > 0.1 and market.get('implied_mult', 1) > 2.0:
                signal = TradingSignal(
                    token_id=market['token_id'],
                    signal_type=SignalType.BULL if market['price'] < 0.5 else SignalType.BEAR,
                    confidence=min(95.0, market.get('implied_mult', 1) * 20),
                    entry_price=market['price'],
                    target_price=market['price'] * 1.15,
                    stop_loss=market['price'] * 0.95,
                    position_size=min(self.config.MAX_POSITION_SIZE, 
                                    self.config.MAX_EXPOSURE * 0.1),
                    timestamp=datetime.now()
                )
                signals.append(signal)
        
        return signals
    
    def _should_execute_trade(self, signal: TradingSignal) -> bool:
        """Check if trade should be executed based on risk rules"""
        # Check daily trade limit
        today_trades = sum(1 for p in self.active_positions 
                         if p['timestamp'].date() == datetime.now().date())
        if today_trades >= self.config.MAX_DAILY_TRADES:
            return False
        
        # Check exposure
        current_exposure = sum(p.get('position_size', 0) for p in self.active_positions)
        if current_exposure + signal.position_size > self.config.MAX_EXPOSURE:
            return False
        
        # Check confidence threshold
        if signal.confidence < 70:
            return False
        
        return True
    
    async def _execute_trade(self, signal: TradingSignal):
        """Execute trade (simulation mode)"""
        try:
            # Simulate trade execution
            trade_result = {
                'order_id': f"sim_{datetime.now().timestamp()}",
                'token_id': signal.token_id,
                'side': 'BUY' if signal.signal_type == SignalType.BULL else 'SELL',
                'price': signal.entry_price,
                'size': signal.position_size,
                'timestamp': signal.timestamp,
                'status': 'closed',
                'pnl': signal.position_size * (0.1 if signal.signal_type == SignalType.BULL else -0.05)
            }
            
            self.active_positions.append(trade_result)
            self.total_trades += 1
            
            # Add to probability lattice
            self.probability_lattice.add_trade(trade_result)
            
            logger.info(f"Executed simulated trade: {signal.token_id} @ {signal.entry_price}")
            
        except Exception as e:
            logger.error(f"Trade execution failed: {e}")
    
    def _update_metrics(self):
        """Update trading metrics and visualizations"""
        # Update PnL
        closed_positions = [p for p in self.active_positions if p.get('status') == 'closed']
        if closed_positions:
            self.total_pnl = sum(p.get('pnl', 0) for p in closed_positions)
            wins = sum(1 for p in closed_positions if p.get('pnl', 0) > 0)
            self.win_rate = (wins / len(closed_positions)) * 100
            self.session_pnl = self.total_pnl
    
    def get_dashboard_data(self) -> Dict:
        """Get comprehensive dashboard data"""
        return {
            'total_pnl': self.total_pnl,
            'total_trades': self.total_trades,
            'win_rate': self.win_rate,
            'session_pnl': self.session_pnl,
            'active_positions': len([p for p in self.active_positions if p.get('status') == 'open']),
            'probability_lattice': self.probability_lattice.get_stats(),
            'tail_ridge': self.tail_ridge.calculate_ridge(),
            'relationship_graph': self.relationship_graph.get_simulation_stats()
        }