import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './PriceChart.css';

export default function PriceChart({ ticker }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1y');
  const [showSMA, setShowSMA] = useState({ sma50: true, sma200: true });

  useEffect(() => {
    if (ticker) fetchHistory(period);
  }, [ticker, period]);

  const fetchHistory = async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/history?ticker=${encodeURIComponent(ticker)}&period=${p}`);
      const data = await res.json();
      if (data.history) {
        setChartData(data.history);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="card-title">Price Chart</h3>
        <div className="chart-loading">
          <div className="loading-spinner" style={{ width: 32, height: 32 }}></div>
          <p className="muted">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Price Chart</h3>
        <p className="muted">No historical data available.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="chart-header">
        <h3 className="card-title" style={{ marginBottom: 0 }}>Price Chart</h3>
        <div className="chart-controls">
          <div className="period-btns">
            {['1mo', '3mo', '6mo', '1y', '2y'].map((p) => (
              <button
                key={p}
                className={`period-btn ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="sma-toggles">
            <label className="sma-toggle">
              <input
                type="checkbox"
                checked={showSMA.sma50}
                onChange={() => setShowSMA((s) => ({ ...s, sma50: !s.sma50 }))}
              />
              <span className="sma-label sma50">SMA 50</span>
            </label>
            <label className="sma-toggle">
              <input
                type="checkbox"
                checked={showSMA.sma200}
                onChange={() => setShowSMA((s) => ({ ...s, sma200: !s.sma200 }))}
              />
              <span className="sma-label sma200">SMA 200</span>
            </label>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(d) => {
                const date = new Date(d);
                return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear().toString().slice(2)}`;
              }}
              interval="preserveStartEnd"
              minTickGap={50}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              tickFormatter={(v) => v.toLocaleString()}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                fontSize: 13,
              }}
              labelStyle={{ color: 'var(--text-secondary)' }}
              formatter={(value, name) => {
                const labels = { close: 'Price', sma50: 'SMA 50', sma200: 'SMA 200' };
                return [value?.toLocaleString(undefined, { minimumFractionDigits: 2 }), labels[name] || name];
              }}
            />
            <Line type="monotone" dataKey="close" stroke="var(--text-primary)" strokeWidth={2} dot={false} />
            {showSMA.sma50 && (
              <Line type="monotone" dataKey="sma50" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" connectNulls={false} />
            )}
            {showSMA.sma200 && (
              <Line type="monotone" dataKey="sma200" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="6 3" connectNulls={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
