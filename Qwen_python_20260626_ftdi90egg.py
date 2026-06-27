import requests
import time
import logging
from typing import Dict, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class PolymarketClient:
    """
    Polymarket API Client for market data and trading
    """
    
    def __init__(self, config):
        self.clob_url = config.POLYMARKET_CLOB_URL
        self.gamma_url = config.POLYMARKET_GAMMA_URL
        self.data_url = config.POLYMARKET_DATA_URL
        self.private_key = config.PRIVATE_KEY
        self.wallet_address = config.WALLET_ADDRESS
        self.session = requests.Session()
        
    def get_markets(self, category: Optional[str] = None) -> List[Dict]:
        """Fetch live markets from Polymarket"""
        try:
            url = f"{self.gamma_url}/markets"
            params = {'category': category} if category else {}
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching markets: {e}")
            return []
    
    def get_market_orderbook(self, token_id: str) -> Dict:
        """Get orderbook for specific market"""
        try:
            url = f"{self.clob_url}/book"
            params = {'token_id': token_id}
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching orderbook for {token_id}: {e}")
            return {'yes_bid': 0.5, 'yes_ask': 0.5, 'no_bid': 0.5, 'no_ask': 0.5}
    
    def get_market_prices(self, token_ids: List[str]) -> Dict:
        """Get current prices for markets"""
        try:
            url = f"{self.clob_url}/prices"
            params = {'token_ids': token_ids}
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching prices: {e}")
            return {}
    
    def get_market_trades(self, token_id: str, limit: int = 100) -> List[Dict]:
        """Get recent trades for a market"""
        try:
            url = f"{self.data_url}/trades"
            params = {'token_id': token_id, 'limit': limit}
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching trades for {token_id}: {e}")
            return []
    
    def get_market_volume(self, token_id: str) -> Dict:
        """Get volume statistics"""
        try:
            url = f"{self.data_url}/markets/{token_id}/volume"
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching volume for {token_id}: {e}")
            return {'volume': 0}
    
    def calculate_implied_probability(self, yes_price: float) -> float:
        """Calculate implied probability from YES price"""
        return yes_price
    
    def get_tail_probability(self, token_id: str, threshold: float = 0.1) -> Dict:
        """
        Calculate tail probability for extreme outcomes
        Based on historical price movements and volume
        """
        try:
            trades = self.get_market_trades(token_id, limit=1000)
            
            if not trades or len(trades) < 10:
                return {
                    'tail_mass': 0.05,
                    'implied_mult': 1.05,
                    'std_dev': 0.1,
                    'mean_price': 0.5
                }
            
            # Calculate price volatility and tail events
            prices = [t.get('price', 0.5) for t in trades]
            mean_price = sum(prices) / len(prices)
            variance = sum((p - mean_price) ** 2 for p in prices) / len(prices)
            std_dev = variance ** 0.5
            
            # Count tail events (price movements > threshold * std_dev)
            tail_events = sum(1 for p in prices if abs(p - mean_price) > threshold * std_dev)
            tail_mass = tail_events / len(prices) if prices else 0
            
            # Implied multiplier for tail risk
            implied_mult = 1 / (1 - tail_mass) if tail_mass < 1 else 10.0
            
            return {
                'tail_mass': tail_mass,
                'implied_mult': implied_mult,
                'std_dev': std_dev,
                'mean_price': mean_price
            }
        except Exception as e:
            logger.error(f"Error calculating tail probability: {e}")
            return {
                'tail_mass': 0.05,
                'implied_mult': 1.05,
                'std_dev': 0.1,
                'mean_price': 0.5
            }