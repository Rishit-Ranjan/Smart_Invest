import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './App.css';

// Icons
const SunIcon = () => (
  <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const NewsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 7h10M7 11h10M7 15h7" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
  </svg>
);

const WatchlistIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// Price Chart Component
function PriceChart({ ticker }) {
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

// Watchlist Page Component
function WatchlistPage() {
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

// Live Market Ticker Component
function MarketTicker() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
    // Refresh every 15 minutes (900000 ms)
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

  // Duplicate the data for seamless scrolling
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

function Navbar({ isDark, onToggleTheme, currentPage, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <span className="navbar-brand" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
            Smart Invest
          </span>
        </div>
        <div className="navbar-right">
          <div className="navbar-links">
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              Home
            </button>
            <button
              className={`nav-link ${currentPage === 'news' ? 'active' : ''}`}
              onClick={() => onNavigate('news')}
            >
              News
            </button>
            <button
              className={`nav-link ${currentPage === 'watchlist' ? 'active' : ''}`}
              onClick={() => onNavigate('watchlist')}
            >
              Watchlist
            </button>
          </div>
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}

// News Page Component
function NewsPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('indian');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Clean HTML tags from text
  const cleanHtml = (text) => {
    if (!text) return '';
    // Remove HTML tags
    let clean = text.replace(/<[^>]+>/g, '');
    // Remove HTML entities
    clean = clean.replace(/&[a-zA-Z]+;/g, ' ');
    clean = clean.replace(/&#\d+;/g, ' ');
    // Remove URLs
    clean = clean.replace(/https?:\/\/\S+/g, '');
    // Clean up whitespace
    clean = clean.replace(/\s+/g, ' ').trim();
    return clean;
  };

  useEffect(() => {
    fetchNews(activeTab);
  }, [activeTab]);

  const fetchNews = async (category) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/news?category=${category}&limit=10`);
      const data = await response.json();
      // Clean the articles on frontend as well
      const cleanedArticles = (data.articles || []).map(article => ({
        ...article,
        title: cleanHtml(article.title),
        description: cleanHtml(article.description),
      }));
      setNews(cleanedArticles);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get related articles from same source
  const getRelatedArticles = () => {
    return news
      .filter(a => a.title !== selectedArticle.title)
      .slice(0, 3);
  };

  // Article Reading Modal
  if (selectedArticle) {
    const relatedArticles = getRelatedArticles();

    return (
      <div className="news-page">
        <div className="back-bar">
          <button className="back-btn" onClick={() => setSelectedArticle(null)}>
            <ArrowLeftIcon />
            <span>Back to News</span>
          </button>
        </div>
        <div className="article-reader">
          <article className="article-full">
            <header className="article-header">
              <span className="article-category">{activeTab === 'indian' ? '🇮🇳 Indian Markets' : '🌍 World Markets'}</span>
              <h1 className="article-full-title">{selectedArticle.title}</h1>
              <div className="article-meta-full">
                <span className="article-source-badge">{selectedArticle.source}</span>
                <span className="article-date">{formatDate(selectedArticle.publishedAt)}</span>
              </div>
            </header>
            <div className="article-body">
              <div className="article-content">
                <p className="article-description">
                  {selectedArticle.description || 'This article covers the latest market developments. Click below to read the full story on the source website.'}
                </p>
              </div>
              <div className="article-cta">
                <p className="cta-hint">Continue reading on {selectedArticle.source}</p>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="read-full-btn"
                >
                  Read Full Article <ExternalLinkIcon />
                </a>
              </div>
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="related-section">
              <h3 className="related-title">More News</h3>
              <div className="related-list">
                {relatedArticles.map((article, idx) => (
                  <div
                    key={idx}
                    className="related-card"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <span className="related-source">{article.source}</span>
                    <h4 className="related-headline">{article.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="news-header">
        <h1 className="news-title">Market News</h1>
        <p className="news-subtitle">Stay updated with the latest stock market news</p>
      </div>

      {/* Tabs */}
      <div className="news-tabs">
        <button
          className={`tab-btn ${activeTab === 'indian' ? 'active' : ''}`}
          onClick={() => setActiveTab('indian')}
        >
          🇮🇳 Indian Markets
        </button>
        <button
          className={`tab-btn ${activeTab === 'world' ? 'active' : ''}`}
          onClick={() => setActiveTab('world')}
        >
          🌍 World Markets
        </button>
      </div>

      {/* News List */}
      <div className="news-content">
        {loading ? (
          <div className="news-loading">
            <div className="loading-spinner"></div>
            <p>Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="news-empty">
            <p>No news available. Please try again later.</p>
            <button className="btn-secondary" onClick={() => fetchNews(activeTab)}>
              Retry
            </button>
          </div>
        ) : (
          <div className="news-grid">
            {news.map((article, index) => (
              <div
                key={index}
                className="news-card"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="news-card-content">
                  <span className="news-source">{article.source}</span>
                  <h3 className="news-card-title">{article.title}</h3>
                  <p className="news-card-desc">
                    {article.description ? article.description.slice(0, 120) + '...' : 'Click to read more'}
                  </p>
                  <span className="news-date">{formatDate(article.publishedAt)}</span>
                </div>
                <div className="news-card-arrow">→</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatCurrencyCrore(value) {
  if (value == null || isNaN(Number(value))) return 'N/A';
  const n = Number(value);

  if (Math.abs(n) < 1e7) {
    return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} Cr`;
  } else {
    return `₹${(n / 1e7).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`;
  }
}

// Sentiment helpers
function classifySentiment(s) {
  if (s == null) return 'neutral';
  if (typeof s === 'string') {
    const l = s.toLowerCase();
    if (l.includes('pos') || l.includes('positive')) return 'positive';
    if (l.includes('neg') || l.includes('negative')) return 'negative';
    return 'neutral';
  }
  const n = Number(s);
  if (isNaN(n)) return 'neutral';
  if (n > 0.05) return 'positive';
  if (n < -0.05) return 'negative';
  return 'neutral';
}

function getArticleCompound(a) {
  if (!a) return null;
  if (a.compound != null && !isNaN(Number(a.compound))) return Number(a.compound);
  if (a.sentimentScore != null && !isNaN(Number(a.sentimentScore))) return Number(a.sentimentScore);
  if (a.sentiment != null) {
    if (typeof a.sentiment === 'number' && !isNaN(a.sentiment)) return Number(a.sentiment);
    if (typeof a.sentiment === 'object' && a.sentiment.compound != null && !isNaN(Number(a.sentiment.compound))) return Number(a.sentiment.compound);
  }
  if (a.pos != null && a.neu != null && a.neg != null) {
    const pos = Number(a.pos || 0);
    const neu = Number(a.neu || 0);
    const neg = Number(a.neg || 0);
    if (pos > neu && pos > neg) return 0.5;
    if (neg > neu && neg > pos) return -0.5;
    return 0.0;
  }
  return null;
}

function computeSentimentCounts(articles = []) {
  const counts = { positive: 0, neutral: 0, negative: 0 };
  (articles || []).forEach((a) => {
    const c = getArticleCompound(a);
    let label;
    if (c != null && !isNaN(c)) {
      label = classifySentiment(c);
    } else if (a && a.pos != null && a.neu != null && a.neg != null) {
      label = (a.pos > a.neg && a.pos > a.neu) ? 'positive' : ((a.neg > a.pos && a.neg > a.neu) ? 'negative' : 'neutral');
    } else {
      label = 'neutral';
    }
    counts[label] = (counts[label] || 0) + 1;
  });
  return counts;
}

function sanitizeArticleText(text) {
  if (!text) return '';
  let s = String(text);
  s = s.replace(/<a[^>]*>.*?<\/a>/gi, '');
  s = s.replace(/https?:\/\/\S+/gi, '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s;
}

// Sentiment Analysis Component
function SentimentAnalysis({ articles = [], onRetry = null, raw = null }) {
  const [expandedMap, setExpandedMap] = React.useState({});
  const [showRaw, setShowRaw] = React.useState(false);
  const [localArticles, setLocalArticles] = React.useState(articles || []);

  useEffect(() => {
    setLocalArticles(articles || []);
  }, [articles]);

  const sampleArticles = [
    {
      id: 'sample-1',
      title: 'Company posts record quarterly revenue',
      summary: 'The company reported a 25% increase in revenue driven by strong demand across segments.',
      compound: 0.32,
      source: 'Example News',
      publishedAt: new Date().toISOString(),
      url: '#',
    },
    {
      id: 'sample-2',
      title: 'Regulatory headwinds create short-term pressure',
      summary: 'New regulations could affect margins in the near term, analysts warn.',
      compound: -0.18,
      source: 'Market Daily',
      publishedAt: new Date().toISOString(),
      url: '#',
    },
  ];

  const counts = computeSentimentCounts(localArticles);
  const totalCount = (counts.positive || 0) + (counts.neutral || 0) + (counts.negative || 0);
  const positivePct = totalCount ? Math.round((counts.positive / totalCount) * 100) : 0;
  const neutralPct = totalCount ? Math.round((counts.neutral / totalCount) * 100) : 0;
  const negativePct = totalCount ? 100 - positivePct - neutralPct : 0;
  const neutralRatio = totalCount ? counts.neutral / totalCount : 0;

  return (
    <div className="card">
      <h3 className="card-title">Sentiment Analysis</h3>

      <div className="sentiment-summary">
        <div className="sentiment-breakdown">
          <div className="sentiment-pill positive">Positive: {counts.positive}</div>
          <div className="sentiment-pill neutral">Neutral: {counts.neutral}</div>
          <div className="sentiment-pill negative">Negative: {counts.negative}</div>
        </div>
      </div>

      <div className="sentiment-chart">
        <div className="chart-row">
          <div className="chart-label">Positive</div>
          <div className="chart-bar">
            <div className="chart-fill positive" style={{ width: `${positivePct}%` }} />
          </div>
          <div className="chart-value">{counts.positive} · {positivePct}%</div>
        </div>
        <div className="chart-row">
          <div className="chart-label">Neutral</div>
          <div className="chart-bar">
            <div className="chart-fill neutral" style={{ width: `${neutralPct}%` }} />
          </div>
          <div className="chart-value">{counts.neutral} · {neutralPct}%</div>
        </div>
        <div className="chart-row">
          <div className="chart-label">Negative</div>
          <div className="chart-bar">
            <div className="chart-fill negative" style={{ width: `${negativePct}%` }} />
          </div>
          <div className="chart-value">{counts.negative} · {negativePct}%</div>
        </div>
      </div>

      {totalCount > 0 && neutralRatio >= 0.85 && (
        <div className="muted" style={{ marginTop: 8 }}>
          Most articles appear neutral — this often happens with short headlines.
        </div>
      )}

      <div className="articles-list">
        {(localArticles || []).map((a, i) => {
          const key = a.id || a.url || i;
          const compound = getArticleCompound(a);
          const label = compound != null && !isNaN(compound) ? classifySentiment(compound) : 'neutral';
          const score = compound != null && !isNaN(compound) ? compound : null;
          const open = !!expandedMap[key];

          return (
            <div className="article-card" key={key}>
              <div className="article-head">
                <div className="article-title">{a?.title || 'Untitled'}</div>
                <div className={`sentiment-pill small ${label}`}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}{score != null ? ` ${score >= 0 ? '+' : ''}${score.toFixed(2)}` : ''}
                </div>
              </div>
              <div className="article-meta">
                {a?.source || ''}{a?.publishedAt ? ` · ${new Date(a.publishedAt).toLocaleDateString()}` : ''}
              </div>
              {(() => {
                const rawText = open ? (a?.content || a?.summary || '') : ((a?.summary || a?.content) ? (a.summary || a.content).slice(0, 200) : '');
                return <p className="article-summary">{sanitizeArticleText(rawText)}{!open && rawText.length > 200 ? '...' : ''}</p>;
              })()}
              <div className="article-actions">
                {(a?.content || a?.summary) && (
                  <button type="button" className="link-btn" onClick={() => setExpandedMap({ ...expandedMap, [key]: !open })}>
                    {open ? 'Collapse' : 'Read more'}
                  </button>
                )}
                {a?.url && <a className="link-btn" href={a.url} target="_blank" rel="noreferrer">Source ↗</a>}
              </div>
            </div>
          );
        })}

        {(localArticles || []).length === 0 && (
          <div className="empty-state">
            <p className="muted">No news articles available.</p>
            <div className="empty-actions">
              {onRetry && <button type="button" className="btn-secondary" onClick={onRetry}>Retry</button>}
              <button type="button" className="btn-secondary" onClick={() => setLocalArticles(sampleArticles)}>Load samples</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Score Ring Component (SVG circular gauge)
function ScoreRing({ value, size = 120, label }) {
  const pct = value != null ? value * 100 : 0;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 65 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="score-ring-wrapper">
      <svg width={size} height={size} className="score-ring-svg">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle"
          className="score-ring-value" fill="var(--text-primary)">
          {value != null ? value.toFixed(2) : 'N/A'}
        </text>
        {label && (
          <text x="50%" y="66%" textAnchor="middle" dominantBaseline="middle"
            className="score-ring-label" fill="var(--text-muted)">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

// Metric Bar Component (horizontal bar with color)
function MetricBar({ title, value, description, icon }) {
  const pct = value != null ? value * 100 : 0;
  const color = pct >= 65 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="metric-bar-card">
      <div className="metric-bar-top">
        <div className="metric-bar-info">
          {icon && <span className="metric-bar-icon">{icon}</span>}
          <span className="metric-bar-title">{title}</span>
        </div>
        <span className="metric-bar-value" style={{ color }}>{value != null ? value.toFixed(2) : 'N/A'}</span>
      </div>
      <div className="metric-bar-track">
        <div className="metric-bar-fill" style={{ width: `${pct}%`, background: color }} />
        <div className="metric-bar-threshold" style={{ left: '60%' }} />
      </div>
      <p className="muted">{description}</p>
    </div>
  );
}

// Home Page Component
function HomePage({ onAnalyze, loading, searchHistory = [], onLoadHistory, onRemoveHistory }) {
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
      {/* Glow orbs */}
      <div className="home-glow home-glow-1" />
      <div className="home-glow home-glow-2" />

      <div className="home-split-layout">
        {/* LEFT: Hero + Search + Features */}
        <div className="home-left">
          {/* Hero section */}
          <div className="hero">
            <span className="hero-badge">AI-Powered Stock Analysis</span>
            <h1 className="hero-title">
              Smarter decisions,<br />
              <span className="hero-gradient">better returns.</span>
            </h1>
            <p className="hero-description">
              Sentiment analysis, technical indicators, and fundamental data — all in one place.
            </p>
          </div>

          {/* Search form */}
          <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-card">
              <div className="search-input-row">
                <div className="search-input-wrap">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      <span className="btn-analyze-text">Analyze</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick picks */}
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

              {/* Advanced options */}
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

          {/* Feature cards */}
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

        {/* RIGHT: Recent Analyses */}
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
                      {/* Left side: info */}
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

                      {/* Right side: ring */}
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

// Results Page Component
function ResultsPage({ results, threshold, onRetry, onBack }) {
  const shouldInvest = results ? results.finalScore >= threshold : false;
  const articles = results?.sentimentArticles || results?.news || results?.articles || [];
  const [showAllArticles, setShowAllArticles] = useState(false);

  return (
    <div className="results-page-v2">
      {/* Sticky Top Bar */}
      <div className="results-topbar">
        <div className="results-topbar-inner">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
          <div className="topbar-ticker-info">
            <span className="topbar-ticker">{results.ticker}</span>
            <span className="topbar-price">₹{results.currentPrice.toFixed(2)}</span>
            <span className={`topbar-change ${results.priceChange >= 0 ? 'positive' : 'negative'}`}>
              {results.priceChange >= 0 ? '+' : ''}{results.priceChange.toFixed(2)}%
            </span>
          </div>
          <div className={`decision-badge-sm ${shouldInvest ? 'invest' : 'hold'}`}>
            {shouldInvest ? 'Invest' : 'Hold'}
          </div>
        </div>
      </div>

      <div className="results-v2-content">
        {/* Hero Section: Score Ring + Verdict + Scores */}
        <div className="results-hero">
          <div className="hero-left">
            <div className="hero-ticker-row">
              <h1 className="hero-ticker-name">{results.ticker}</h1>
              <div className={`verdict-pill ${shouldInvest ? 'invest' : 'hold'}`}>
                {shouldInvest ? 'Confident to Invest' : 'Not Confident'}
              </div>
            </div>
            <div className="hero-price-row">
              <span className="hero-price">₹{results.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`hero-change ${results.priceChange >= 0 ? 'positive' : 'negative'}`}>
                {results.priceChange >= 0 ? '+' : ''}{results.priceChange.toFixed(2)}%
              </span>
            </div>

            {/* Score Breakdown Bars */}
            <div className="score-bars-section">
              <MetricBar title="Sentiment" value={results.sentimentScore} description={`${articles.length} articles analyzed`} icon="S" />
              <MetricBar title="Technical" value={results.technicalScore} description="Price momentum & trends" icon="T" />
              <MetricBar title="Fundamental" value={results.fundamentalScore} description="Financial health" icon="F" />
            </div>
          </div>

          <div className="hero-right">
            <ScoreRing value={results.finalScore} size={160} label="FINAL" />
            <div className="hero-threshold">
              Threshold: <strong>{threshold}</strong>
            </div>
          </div>
        </div>

        {/* Price Chart - Full Width */}
        <PriceChart ticker={results.ticker} />

        {/* Two Column: Fundamentals + Sentiment Summary */}
        <div className="two-col-grid">
          {/* Fundamentals */}
          <div className="card">
            <h3 className="card-title">Fundamentals</h3>
            <div className="fundamentals-grid">
              <div className="fund-item">
                <span className="fund-label">Market Price</span>
                <span className="fund-value">{results.fundamentals?.marketPrice != null ? `₹${Number(results.fundamentals.marketPrice).toFixed(2)}` : 'N/A'}</span>
              </div>
              <div className="fund-item">
                <span className="fund-label">Revenue</span>
                <span className="fund-value">{formatCurrencyCrore(results.fundamentals?.totalRevenue)}</span>
              </div>
              <div className="fund-item">
                <span className="fund-label">Net Income</span>
                <span className="fund-value">{formatCurrencyCrore(results.fundamentals?.netIncome)}</span>
              </div>
              <div className="fund-item">
                <span className="fund-label">Revenue YoY</span>
                <span className={`fund-value ${results.fundamentals?.revenueYoY >= 0 ? 'positive' : 'negative'}`}>
                  {results.fundamentals?.revenueYoY != null ? `${Number(results.fundamentals.revenueYoY) >= 0 ? '+' : ''}${Number(results.fundamentals.revenueYoY).toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div className="fund-item">
                <span className="fund-label">Net Margin</span>
                <span className="fund-value">{results.fundamentals?.netMargin != null ? `${Number(results.fundamentals.netMargin).toFixed(2)}%` : 'N/A'}</span>
              </div>
              <div className="fund-item">
                <span className="fund-label">P/E Ratio</span>
                <span className="fund-value">{results.fundamentals?.trailingPE != null ? Number(results.fundamentals.trailingPE).toFixed(2) : 'N/A'}</span>
              </div>
              <div className="fund-item fund-item-full">
                <span className="fund-label">Trailing EPS</span>
                <span className="fund-value">{results.fundamentals?.trailingEPS != null ? `₹${Number(results.fundamentals.trailingEPS).toFixed(2)}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Sentiment Summary */}
          <div className="card">
            <h3 className="card-title">Sentiment Overview</h3>
            {(() => {
              const counts = computeSentimentCounts(articles);
              const total = counts.positive + counts.neutral + counts.negative;
              const posPct = total ? Math.round((counts.positive / total) * 100) : 0;
              const neuPct = total ? Math.round((counts.neutral / total) * 100) : 0;
              const negPct = total ? 100 - posPct - neuPct : 0;

              return (
                <div className="sentiment-overview">
                  <div className="sentiment-donut-row">
                    <div className="sentiment-stat positive">
                      <span className="sentiment-stat-num">{counts.positive}</span>
                      <span className="sentiment-stat-label">Positive</span>
                      <span className="sentiment-stat-pct">{posPct}%</span>
                    </div>
                    <div className="sentiment-stat neutral">
                      <span className="sentiment-stat-num">{counts.neutral}</span>
                      <span className="sentiment-stat-label">Neutral</span>
                      <span className="sentiment-stat-pct">{neuPct}%</span>
                    </div>
                    <div className="sentiment-stat negative">
                      <span className="sentiment-stat-num">{counts.negative}</span>
                      <span className="sentiment-stat-label">Negative</span>
                      <span className="sentiment-stat-pct">{negPct}%</span>
                    </div>
                  </div>
                  <div className="sentiment-stacked-bar">
                    <div className="stacked-positive" style={{ width: `${posPct}%` }} />
                    <div className="stacked-neutral" style={{ width: `${neuPct}%` }} />
                    <div className="stacked-negative" style={{ width: `${negPct}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* News Articles - Compact */}
        <div className="card">
          <div className="news-articles-header">
            <h3 className="card-title" style={{ marginBottom: 0 }}>News ({articles.length})</h3>
            {articles.length > 5 && (
              <button className="link-btn" onClick={() => setShowAllArticles(!showAllArticles)}>
                {showAllArticles ? 'Show less' : `Show all ${articles.length}`}
              </button>
            )}
          </div>
          <div className="compact-articles">
            {(showAllArticles ? articles : articles.slice(0, 5)).map((a, i) => {
              const compound = getArticleCompound(a);
              const label = compound != null && !isNaN(compound) ? classifySentiment(compound) : 'neutral';

              return (
                <div className="compact-article" key={a.id || a.url || i}>
                  <div className={`compact-article-dot ${label}`} />
                  <div className="compact-article-body">
                    <div className="compact-article-title">{a?.title || 'Untitled'}</div>
                    <div className="compact-article-meta">
                      {a?.source || ''}{a?.publishedAt ? ` · ${new Date(a.publishedAt).toLocaleDateString()}` : ''}
                      {compound != null && !isNaN(compound) && (
                        <span className={`compact-score ${label}`}> {compound >= 0 ? '+' : ''}{compound.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  {a?.url && <a className="compact-article-link" href={a.url} target="_blank" rel="noreferrer">↗</a>}
                </div>
              );
            })}
            {articles.length === 0 && (
              <div className="empty-state">
                <p className="muted">No news articles available.</p>
                {onRetry && <button className="btn-secondary" onClick={onRetry} style={{ marginTop: 12 }}>Retry</button>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Page Component
function LoadingPage({ ticker }) {
  return (
    <div className="loading-page">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">Analyzing {ticker}</h2>
        <p className="loading-text">Fetching market data, news sentiment, and fundamentals...</p>
      </div>
    </div>
  );
}

// History Icon
const HistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3" />
    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5-4H6m-2.95 0L1 9" />
  </svg>
);

const CloseSmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Main App Component
export default function SmartInvestDashboard() {
  const [page, setPage] = useState('home'); // 'home', 'loading', 'results', 'news'
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [currentTicker, setCurrentTicker] = useState('');
  const [currentThreshold, setCurrentThreshold] = useState(0.60);
  const [searchHistory, setSearchHistory] = useState([]);

  // Theme state - default to light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false; // Default: light mode
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navigateTo = (pageName) => {
    setPage(pageName);
  };

  const analyzeStock = async ({ ticker, threshold }) => {
    setCurrentTicker(ticker);
    setCurrentThreshold(threshold);
    setLoading(true);
    setPage('loading');

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          maxNews: 20,
          threshold: threshold,
          sentimentWeight: 0.30,
          technicalWeight: 0.30,
          fundamentalWeight: 0.40,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        setPage('results');
        // Add to search history (replace if same ticker exists)
        setSearchHistory(prev => {
          const filtered = prev.filter(h => h.ticker !== ticker);
          return [{ ticker, threshold, results: data, timestamp: Date.now() }, ...filtered].slice(0, 10);
        });
      } else {
        alert(data.error || 'Something went wrong');
        setPage('home');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to connect to the server. Make sure api.py is running.');
      setPage('home');
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setPage('home');
  };

  const loadFromHistory = (entry) => {
    setCurrentTicker(entry.ticker);
    setCurrentThreshold(entry.threshold);
    setResults(entry.results);
    setPage('results');
  };

  const removeFromHistory = (ticker) => {
    setSearchHistory(prev => prev.filter(h => h.ticker !== ticker));
  };

  return (
    <div className="app">
      <MarketTicker />
      <Navbar
        isDark={isDarkMode}
        onToggleTheme={toggleTheme}
        currentPage={page}
        onNavigate={navigateTo}
      />

      <main className="main">
        {page === 'home' && (
          <HomePage onAnalyze={analyzeStock} loading={loading} searchHistory={searchHistory} onLoadHistory={loadFromHistory} onRemoveHistory={removeFromHistory} />
        )}
        {page === 'loading' && (
          <LoadingPage ticker={currentTicker} />
        )}
        {page === 'results' && results && (
          <ResultsPage
            results={results}
            threshold={currentThreshold}
            onRetry={() => analyzeStock({ ticker: currentTicker, threshold: currentThreshold })}
            onBack={goHome}
          />
        )}
        {page === 'news' && (
          <NewsPage onBack={() => navigateTo('home')} />
        )}
        {page === 'watchlist' && (
          <WatchlistPage />
        )}
      </main>
    </div>
  );
}
