import React, { useState, useEffect } from 'react';
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

// Navbar Component
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

// Metric Card Component
function MetricCard({ title, value, description }) {
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value != null ? value.toFixed(2) : 'N/A'}</div>
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${value != null ? value * 100 : 0}%` }} />
      </div>
      <p className="muted">{description}</p>
    </div>
  );
}

// Home Page Component
function HomePage({ onAnalyze, loading }) {
  const [ticker, setTicker] = useState('');
  const [threshold, setThreshold] = useState('');

  const isValid = ticker.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) {
      onAnalyze({ ticker: ticker.trim(), threshold: threshold || 0.60 });
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="hero">
          <h1 className="hero-title">Smart Invest</h1>
          <p className="hero-subtitle">AI-Powered Stock Analysis</p>
          <p className="hero-description">
            Get comprehensive insights with sentiment analysis, technical indicators, and fundamental data.
          </p>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-card">
            <div className="form-group">
              <label className="label">Stock Ticker</label>
              <input
                type="text"
                className="input input-lg"
                placeholder="e.g., TCS, RELIANCE, INFY"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                autoFocus
              />
              <p className="input-hint">Enter Indian stock ticker (NSE)</p>
            </div>

            <div className="form-group">
              <label className="label">Score Threshold (Optional)</label>
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

            <button
              type="submit"
              className={`btn-primary btn-lg ${!isValid ? 'btn-disabled' : ''}`}
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Analyze Stock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Results Page Component
function ResultsPage({ results, threshold, onRetry, onBack }) {
  const shouldInvest = results ? results.finalScore >= threshold : false;
  const articles = results?.sentimentArticles || results?.news || results?.articles || [];

  return (
    <div className="results-page">
      {/* Back Navigation */}
      <div className="back-bar">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeftIcon />
          <span>Back</span>
        </button>
      </div>

      <div className="results-content">
        {/* Header Card */}
        <div className="card card-highlight">
          <div className="results-header">
            <div>
              <h1 className="ticker-title">{results.ticker}</h1>
              <div className="price-info">
                <span className="current-price">₹{results.currentPrice.toFixed(2)}</span>
                <span className={`price-change ${results.priceChange >= 0 ? 'positive' : 'negative'}`}>
                  {results.priceChange >= 0 ? '+' : ''}{results.priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className={`decision-badge ${shouldInvest ? 'invest' : 'hold'}`}>
              {shouldInvest ? '✓ Confident to Invest' : '✗ Not Confident'}
            </div>
          </div>

          <div className="score-summary">
            <div className="score-main">
              <span className="score-label">Final Score</span>
              <span className="score-value">{results.finalScore.toFixed(2)}</span>
              <span className="score-max">/ 1.00</span>
            </div>
            <div className="score-threshold">
              Threshold: {threshold}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            title="Sentiment"
            value={results.sentimentScore}
            description={`${articles.length} articles analyzed`}
          />
          <MetricCard
            title="Technical"
            value={results.technicalScore}
            description="Price momentum & trends"
          />
          <MetricCard
            title="Fundamental"
            value={results.fundamentalScore}
            description="Financial health"
          />
        </div>

        {/* Sentiment Analysis */}
        <SentimentAnalysis articles={articles} onRetry={onRetry} raw={results} />

        {/* Fundamentals Table */}
        <div className="card">
          <h3 className="card-title">Fundamental Analysis</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <tbody>
                <tr>
                  <td className="td-label">Market Price</td>
                  <td className="td-value">{results.fundamentals?.marketPrice != null ? `₹${Number(results.fundamentals.marketPrice).toFixed(2)}` : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="td-label">Total Revenue</td>
                  <td className="td-value">{formatCurrencyCrore(results.fundamentals?.totalRevenue)}</td>
                </tr>
                <tr>
                  <td className="td-label">Net Income</td>
                  <td className="td-value">{formatCurrencyCrore(results.fundamentals?.netIncome)}</td>
                </tr>
                <tr>
                  <td className="td-label">Revenue YoY</td>
                  <td className="td-value">{results.fundamentals?.revenueYoY != null ? `${Number(results.fundamentals.revenueYoY) >= 0 ? '+' : ''}${Number(results.fundamentals.revenueYoY).toFixed(2)}%` : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="td-label">Net Margin</td>
                  <td className="td-value">{results.fundamentals?.netMargin != null ? `${Number(results.fundamentals.netMargin).toFixed(2)}%` : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="td-label">Trailing P/E</td>
                  <td className="td-value">{results.fundamentals?.trailingPE != null ? Number(results.fundamentals.trailingPE).toFixed(2) : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="td-label">Trailing EPS</td>
                  <td className="td-value">{results.fundamentals?.trailingEPS != null ? `₹${Number(results.fundamentals.trailingEPS).toFixed(2)}` : 'N/A'}</td>
                </tr>
              </tbody>
            </table>
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

// Main App Component
export default function SmartInvestDashboard() {
  const [page, setPage] = useState('home'); // 'home', 'loading', 'results', 'news'
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [currentTicker, setCurrentTicker] = useState('');
  const [currentThreshold, setCurrentThreshold] = useState(0.60);

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
    if (pageName === 'home') {
      setResults(null);
      setCurrentTicker('');
    }
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
    setResults(null);
    setCurrentTicker('');
  };

  return (
    <div className="app">
      <Navbar
        isDark={isDarkMode}
        onToggleTheme={toggleTheme}
        currentPage={page}
        onNavigate={navigateTo}
      />

      <main className="main">
        {page === 'home' && (
          <HomePage onAnalyze={analyzeStock} loading={loading} />
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
      </main>
    </div>
  );
}
