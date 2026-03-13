import React, { useState } from 'react';
import { HistoryIcon, CloseSmIcon, SearchIcon, BoltIcon } from './Icons';
import './HomePage.css';

export default function HomePage({ onAnalyze, loading, searchHistory = [], onLoadHistory, onRemoveHistory }) {
  const [ticker, setTicker] = useState('');
  const [threshold, setThreshold] = useState('');

  const isValid = ticker.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onAnalyze({ ticker: ticker.trim(), threshold: threshold || 0.60 });
    }
  };

  const quickPicks = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ITC'];

  return (
    <div className={`home-page ${searchHistory.length > 0 ? 'home-page--split' : ''}`}>
      <div className="home-glow home-glow-1" />
      <div className="home-glow home-glow-2" />

      <div className="home-split-layout">
        <div className="home-left">
          <div className="hero">
            <h1 className="hero-title">
              Smarter decisions,<br />
              <span className="hero-gradient">better returns.</span>
            </h1>
            <p className="hero-description">
              Sentiment analysis, technical indicators, and fundamental data — all in one place.
            </p>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-card">
              <div className="search-input-row">
                <div className="search-input-wrap">
                  <SearchIcon />
                  <input
                    type="text"
                    className="input input-lg search-main-input"
                    placeholder="Search any NSE stock..."
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className={`btn-primary btn-analyze ${!isValid ? 'btn-disabled' : ''}`}
                  disabled={!isValid || loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      <span className="btn-analyze-text">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <BoltIcon />
                      <span className="btn-analyze-text">Analyze</span>
                    </>
                  )}
                </button>
              </div>

              <div className="quick-picks">
                <span className="quick-picks-label">Popular:</span>
                {quickPicks.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="quick-pick-chip"
                    onClick={() => { setTicker(t); }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <details className="advanced-toggle">
                <summary className="advanced-summary">Advanced options</summary>
                <div className="advanced-body">
                  <label className="label">Score Threshold</label>
                  <input
                    type="number"
                    className="input"
                    value={threshold}
                    placeholder="0.60"
                    min="0"
                    max="1"
                    step="0.05"
                    onChange={(e) => setThreshold(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  />
                  <p className="input-hint">Investment confidence threshold (0-1)</p>
                </div>
              </details>
            </div>
          </form>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon-wrap feature-icon-sentiment">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
                  <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
                </svg>
              </div>
              <h3 className="feature-title">Sentiment</h3>
              <p className="feature-desc">News-based NLP analysis using VADER to gauge market mood.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap feature-icon-technical">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <h3 className="feature-title">Technical</h3>
              <p className="feature-desc">SMA crossovers, RSI, MACD, and momentum indicators.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrap feature-icon-fundamental">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" rx="1" />
                  <rect x="14" y="3" width="7" height="5" rx="1" />
                  <rect x="14" y="12" width="7" height="9" rx="1" />
                  <rect x="3" y="16" width="7" height="5" rx="1" />
                </svg>
              </div>
              <h3 className="feature-title">Fundamental</h3>
              <p className="feature-desc">P/E, P/B, ROE, debt ratios, and profitability metrics.</p>
            </div>
          </div>
        </div>

        {searchHistory.length > 0 && (
          <div className="home-right">
            <div className="history-header">
              <div className="history-header-left">
                <HistoryIcon />
                <span className="history-label">Recent Analyses</span>
              </div>
              <span className="history-count">{searchHistory.length}</span>
            </div>
            <div className="history-list">
              {searchHistory.map((entry) => {
                const score = entry.results.finalScore;
                const pct = (score * 100).toFixed(0);
                const shouldInvest = score >= entry.threshold;
                const change = entry.results.priceChange;
                const s = (entry.results.sentimentScore * 100).toFixed(0);
                const t = (entry.results.technicalScore * 100).toFixed(0);
                const f = (entry.results.fundamentalScore * 100).toFixed(0);

                return (
                  <div className={`history-card ${shouldInvest ? 'history-card--invest' : 'history-card--hold'}`} key={entry.ticker} onClick={() => onLoadHistory(entry)}>
                    <button className="history-card-close" onClick={(e) => { e.stopPropagation(); onRemoveHistory(entry.ticker); }} title="Remove">
                      <CloseSmIcon />
                    </button>

                    <div className="history-card-main">
                      <div className="history-card-info">
                        <div className="history-card-top">
                          <span className="history-card-ticker">{entry.ticker}</span>
                          <span className={`history-card-badge ${shouldInvest ? 'invest' : 'hold'}`}>
                            {shouldInvest ? 'Invest' : 'Hold'}
                          </span>
                        </div>
                        <div className="history-card-price-row">
                          <span className="history-card-price">₹{entry.results.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          {change != null && (
                            <span className={`history-card-change ${change >= 0 ? 'positive' : 'negative'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                            </span>
                          )}
                        </div>
                        <div className="history-card-scores">
                          <div className="history-card-score-row">
                            <span className="history-card-score-label">S</span>
                            <div className="history-card-score-bar"><div className="history-card-score-fill" style={{ width: `${s}%`, background: Number(s) >= 65 ? 'var(--success)' : Number(s) >= 40 ? 'var(--warning)' : 'var(--danger)' }} /></div>
                            <span className="history-card-score-val">{s}</span>
                          </div>
                          <div className="history-card-score-row">
                            <span className="history-card-score-label">T</span>
                            <div className="history-card-score-bar"><div className="history-card-score-fill" style={{ width: `${t}%`, background: Number(t) >= 65 ? 'var(--success)' : Number(t) >= 40 ? 'var(--warning)' : 'var(--danger)' }} /></div>
                            <span className="history-card-score-val">{t}</span>
                          </div>
                          <div className="history-card-score-row">
                            <span className="history-card-score-label">F</span>
                            <div className="history-card-score-bar"><div className="history-card-score-fill" style={{ width: `${f}%`, background: Number(f) >= 65 ? 'var(--success)' : Number(f) >= 40 ? 'var(--warning)' : 'var(--danger)' }} /></div>
                            <span className="history-card-score-val">{f}</span>
                          </div>
                        </div>
                      </div>

                      <div className="history-card-ring">
                        <svg width="64" height="64" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" />
                          <circle
                            cx="32" cy="32" r="26" fill="none"
                            stroke={shouldInvest ? 'var(--success)' : 'var(--danger)'}
                            strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 26}`}
                            strokeDashoffset={`${2 * Math.PI * 26 * (1 - score)}`}
                            transform="rotate(-90 32 32)"
                            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                          />
                          <text x="32" y="34" textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="15" fontWeight="800" fontFamily="'JetBrains Mono', monospace">
                            {pct}
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
