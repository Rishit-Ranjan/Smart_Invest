import React, { useState, useEffect } from 'react';
import './MarketTicker.css';

export default function MarketTicker() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 900000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('http://localhost:5000/market');
      const data = await response.json();
      if (data.success && data.data) {
        setMarketData(data.data);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, region) => {
    if (region === 'US') {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading || marketData.length === 0) {
    return null;
  }

  const doubledData = [...marketData, ...marketData];

  return (
    <div className="market-ticker">
      <div className="ticker-track">
        {doubledData.map((item, index) => (
          <div key={index} className="ticker-item">
            <span className="ticker-name">{item.name}</span>
            <span className="ticker-price">{formatPrice(item.price, item.region)}</span>
            <span className={`ticker-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
