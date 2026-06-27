import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration class"""
    
    # Polymarket API Configuration
    POLYMARKET_CLOB_URL = os.getenv('POLYMARKET_CLOB_URL', 'https://clob.polymarket.com')
    POLYMARKET_GAMMA_URL = os.getenv('POLYMARKET_GAMMA_URL', 'https://gamma.polymarket.com')
    POLYMARKET_DATA_URL = os.getenv('POLYMARKET_DATA_URL', 'https://data.polymarket.com')
    
    # Authentication
    PRIVATE_KEY = os.getenv('PRIVATE_KEY')
    WALLET_ADDRESS = os.getenv('WALLET_ADDRESS')
    
    # Trading Configuration
    MAX_POSITION_SIZE = float(os.getenv('MAX_POSITION_SIZE', 100))
    STOP_LOSS_PCT = float(os.getenv('STOP_LOSS_PCT', 5.0))
    TAKE_PROFIT_PCT = float(os.getenv('TAKE_PROFIT_PCT', 15.0))
    
    # Risk Management
    MAX_DAILY_TRADES = int(os.getenv('MAX_DAILY_TRADES', 10))
    MAX_EXPOSURE = float(os.getenv('MAX_EXPOSURE', 500))
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'