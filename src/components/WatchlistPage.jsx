import React, { useState, useEffect } from 'react';
import { TrashIcon } from './Icons';
import './WatchlistPage.css';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartinvest_watchlist') || '[]');
    } catch { return []; }
  });
  const [newTicker, setNewTicker] = useState('');
  const [loading, setLoading] = useState({});
  const [scores, setScores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartinvest_watchlist_scores') || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('smartinvest_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('smartinvest_watchlist_scores', JSON.stringify(scores));
  }, [scores]);

  const addTicker = (e) => {
    e.preventDefault();
    const t = newTicker.trim().toUpperCase();
    if (t && !watchlist.includes(t)) {
      setWatchlist([...watchlist, t]);
      setNewTicker('');
      refreshTicker(t);
    }
  };

  const removeTicker = (t) => {
    setWatchlist(watchlist.filter((x) => x !== t));
    const newScores = { ...scores };
    delete newScores[t];
    setScores(newScores);
  };

  const refreshTicker = async (t) => {
    setLoading((prev) => ({ ...prev, [t]: true }));
    try {
      const res = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: t, maxNews: 10, sentimentWeight: 0.3, technicalWeight: 0.3, fundamentalWeight: 0.4 }),
      });
      const data = await res.json();
      if (!data.error) {
        setScores((prev) => ({
          ...prev,
          [t]: {
            ticker: data.ticker,
            currentPrice: data.currentPrice,
            priceChange: data.priceChange,
            finalScore: data.finalScore,
            sentimentScore: data.sentimentScore,
            technicalScore: data.technicalScore,
            fundamentalScore: data.fundamentalScore,
            updatedAt: new Date().toISOString(),
          },
        }));
      }
    } catch (err) {
      console.error(`Error refreshing ${t}:`, err);
    } finally {
      setLoading((prev) => ({ ...prev, [t]: false }));
    }
  };

  const refreshAll = () => {
    watchlist.forEach((t) => refreshTicker(t));
  };

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h1 className="news-title">Watchlist</h1>
        <p className="news-subtitle">Track your favourite stocks at a glance</p>
      </div>

      <form className="watchlist-add-form" onSubmit={addTicker}>
        <input
          type="text"
          className="input"
          placeholder="Add ticker (e.g., TCS, RELIANCE)"
          value={newTicker}
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
        />
        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '14px 28px' }} disabled={!newTicker.trim()}>
          Add
        </button>
      </form>

      {watchlist.length > 0 && (
        <div className="watchlist-actions">
          <button className="btn-secondary" onClick={refreshAll}>
            Refresh All
          </button>
          <span className="muted">{watchlist.length} stock{watchlist.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="watchlist-grid">
        {watchlist.length === 0 ? (
          <div className="empty-state">
            <p className="muted">Your watchlist is empty. Add a ticker above to get started.</p>
          </div>
        ) : (
          watchlist.map((t) => {
            const data = scores[t];
            const isLoading = loading[t];

            return (
              <div className="watchlist-card" key={t}>
                <div className="watchlist-card-header">
                  <div className="watchlist-ticker">{data?.ticker || t}</div>
                  <button className="watchlist-remove" onClick={() => removeTicker(t)} title="Remove">
                    <TrashIcon />
                  </button>
                </div>

                {isLoading ? (
                  <div className="watchlist-card-loading">
                    <div className="loading-spinner" style={{ width: 24, height: 24 }}></div>
                  </div>
                ) : data ? (
                  <>
                    <div className="watchlist-price-row">
                      <span className="watchlist-price">
                        ₹{data.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={`price-change ${data.priceChange >= 0 ? 'positive' : 'negative'}`}>
                        {data.priceChange >= 0 ? '+' : ''}{data.priceChange?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="watchlist-scores">
                      <div className="watchlist-score-item">
                        <span className="watchlist-score-label">Final</span>
                        <span className="watchlist-score-value">{data.finalScore?.toFixed(2)}</span>
                      </div>
                      <div className="watchlist-score-item">
                        <span className="watchlist-score-label">Sentiment</span>
                        <span className="watchlist-score-value">{data.sentimentScore?.toFixed(2)}</span>
                      </div>
                      <div className="watchlist-score-item">
                        <span className="watchlist-score-label">Technical</span>
                        <span className="watchlist-score-value">{data.technicalScore?.toFixed(2)}</span>
                      </div>
                      <div className="watchlist-score-item">
                        <span className="watchlist-score-label">Fundamental</span>
                        <span className="watchlist-score-value">{data.fundamentalScore?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="watchlist-card-footer">
                      <span className="muted">
                        Updated {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : 'N/A'}
                      </span>
                      <button className="link-btn" onClick={() => refreshTicker(t)}>Refresh</button>
                    </div>
                  </>
                ) : (
                  <div className="watchlist-card-empty">
                    <p className="muted">No data yet</p>
                    <button className="btn-secondary" onClick={() => refreshTicker(t)}>Fetch Scores</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
