import React, { useState, useEffect } from 'react';
import './App.css';

function formatCurrencyCrore(value) {
  if (value == null || isNaN(Number(value))) return 'N/A';
  const n = Number(value);
  
  // Heuristic: if value < 1e7 treat it as already "in crores" (e.g., 260802 => 260,802 Cr)
  // otherwise treat it as rupees and convert to crores
  if (Math.abs(n) < 1e7) {
    return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} Cr`;
  } else {
    return `₹${(n / 1e7).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`;
  }
}

// --- Sentiment helpers ---
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
  
  // Prefer backend 'compound' field
  if (a.compound != null && !isNaN(Number(a.compound))) return Number(a.compound);
  
  // Backwards compatibility: sentimentScore or sentiment (number or object)
  if (a.sentimentScore != null && !isNaN(Number(a.sentimentScore))) return Number(a.sentimentScore);
  if (a.sentiment != null) {
    if (typeof a.sentiment === 'number' && !isNaN(a.sentiment)) return Number(a.sentiment);
    if (typeof a.sentiment === 'object' && a.sentiment.compound != null && !isNaN(Number(a.sentiment.compound))) return Number(a.sentiment.compound);
  }
  // Fallback: POS/NEU/NEG fields
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

function computeAvgScore(articles = []) {
  const scores = (articles || [])
    .map((a) => getArticleCompound(a))
    .filter((v) => v != null && !isNaN(v));
  if (!scores.length) return null;
  return scores.reduce((s, v) => s + v, 0) / scores.length;
}

function sanitizeArticleText(text) {
  if (!text) return '';
  let s = String(text);
  
  // Strip any HTML anchor tags
  s = s.replace(/<a[^>]*>.*?<\/a>/gi, '');
  
  // Remove raw URLs
  s = s.replace(/https?:\/\/\S+/gi, '');
  
  // Collapse whitespace
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s;
}


// Sentiment Analysis Component
function SentimentAnalysis({ articles = [], overallScore = null, onRetry = null, raw = null }) {
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
      sentimentScore: 0.32,
      compound: 0.32,
      source: 'Example News',
      publishedAt: new Date().toISOString(),
      url: '#',
    },
    {
      id: 'sample-2',
      title: 'Regulatory headwinds create short-term pressure',
      summary: 'New regulations could affect margins in the near term, analysts warn.',
      sentimentScore: -0.18,
      compound: -0.18,
      source: 'Market Daily',
      publishedAt: new Date().toISOString(),
      url: '#',
    },
  ];


  const counts = computeSentimentCounts(localArticles);

  // Bar chart percentages (safe calculations)
  const totalCount = (counts.positive || 0) + (counts.neutral || 0) + (counts.negative || 0);
  const positivePct = totalCount ? Math.round((counts.positive / totalCount) * 100) : 0;
  const neutralPct = totalCount ? Math.round((counts.neutral / totalCount) * 100) : 0;
  const negativePct = totalCount ? 100 - positivePct - neutralPct : 0;
  const neutralRatio = totalCount ? counts.neutral / totalCount : 0; 

  return (
    <div className="sentiment-section">
      <h3 className="table-title">Sentiment Analysis</h3>

      <div className="sentiment-summary">
        <div className="sentiment-breakdown">
          <div className="sentiment-pill positive">Positive: {counts.positive}</div>
          <div className="sentiment-pill neutral">Neutral: {counts.neutral}</div>
          <div className="sentiment-pill negative">Negative: {counts.negative}</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="sentiment-chart" role="img" aria-label={`Sentiment distribution: ${positivePct}% positive, ${neutralPct}% neutral, ${negativePct}% negative`}>
        <div className="chart-row">
          <div className="chart-label">Positive</div>
          <div className="chart-bar" aria-hidden>
            <div className="chart-fill positive" style={{ width: `${positivePct}%` }} />
          </div>
          <div className="chart-value">{counts.positive} · {positivePct}%</div>
        </div>
        <div className="chart-row">
          <div className="chart-label">Neutral</div>
          <div className="chart-bar" aria-hidden>
            <div className="chart-fill neutral" style={{ width: `${neutralPct}%` }} />
          </div>
          <div className="chart-value">{counts.neutral} · {neutralPct}%</div>
        </div>
        <div className="chart-row">
          <div className="chart-label">Negative</div>
          <div className="chart-bar" aria-hidden>
            <div className="chart-fill negative" style={{ width: `${negativePct}%` }} />
          </div>
          <div className="chart-value">{counts.negative} · {negativePct}%</div>
        </div>
      </div>

      {totalCount > 0 && neutralRatio >= 0.85 && (
        <div className="muted" style={{ marginTop: 8 }}>
          Most articles appear neutral — this often happens with short headlines or limited text. Try increasing the number of articles (maxNews), check the raw response, or use the "Use sample articles" button to validate the UI.
        </div>
      )}

      <div className="articles-list">
        {(localArticles || []).map((a, i) => {
          const key = a.id || a.url || i;
          const compound = getArticleCompound(a);
          const label = compound != null && !isNaN(compound) ? classifySentiment(compound) : ((a?.pos != null && a?.neu != null && a?.neg != null) ? ((a.pos > a.neg && a.pos > a.neu) ? 'positive' : ((a.neg > a.pos && a.neg > a.neu) ? 'negative' : 'neutral')) : 'neutral');
          const score = compound != null && !isNaN(compound) ? compound : null;
          const open = !!expandedMap[key];

          return (
            <div className="article-card" key={key}>
              <div className="article-head">
                <div className="article-title">{a?.title || a?.headline || 'Untitled'}</div>
                <div className={`sentiment-pill ${label}`}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}{score != null ? ` · ${score >= 0 ? '+' : ''}${score.toFixed(2)}` : ''}
                </div>
              </div>

              <div className="article-meta">
                {a?.source || a?.sourceName || ''}{a?.publishedAt ? ` · ${new Date(a.publishedAt).toLocaleString()}` : ''}
              </div>

              {(() => {
                const rawText = open ? (a?.content || a?.summary || a?.description || '') : ((a?.summary || a?.content) ? (a.summary || a.content).slice(0, 280) : '');
                const summaryText = sanitizeArticleText(rawText);
                return <p className="article-summary">{summaryText}</p>;
              })()}

              <div className="article-actions">
                {(a?.content || a?.summary) && (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setExpandedMap({ ...expandedMap, [key]: !open })}
                  >{open ? 'Collapse' : 'Read more'}</button>
                )}
                {a?.url && (
                  <a className="link-btn" href={a.url} target="_blank" rel="noreferrer">Open Source</a>
                )}
              </div>
            </div>
          );
        })}

        {(localArticles || []).length === 0 && (
          <div>
            <p className="muted">No news/articles available for sentiment analysis.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {onRetry && (
                <button type="button" className="action-btn" onClick={onRetry}>Retry fetching news</button>
              )}
              <button type="button" className="action-btn" onClick={() => setLocalArticles(sampleArticles)}>Use sample articles</button>
              <button type="button" className="link-btn" onClick={() => setShowRaw(!showRaw)}>{showRaw ? 'Hide raw response' : 'Show raw response'}</button>
            </div>
            {showRaw && raw && (
              <pre style={{ marginTop: 12, maxHeight: 260, overflow: 'auto', background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E6EEF3' }}>{JSON.stringify(raw, null, 2)}</pre>
            )}
          </div>
        )}

        {(localArticles || []).length > 0 && showRaw && raw && (
          <pre style={{ marginTop: 12, maxHeight: 260, overflow: 'auto', background: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E6EEF3' }}>{JSON.stringify(raw, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}

export default function SmartInvestDashboard() {
  const [ticker, setTicker] = useState('');
  const [maxNews, _setMaxNews] = useState('');
  const [threshold, setThreshold] = useState('');
  const [suggestedThreshold, setSuggestedThreshold] = useState(null);
  const [sentimentWeight, _setSentimentWeight] = useState('');
  const [technicalWeight, _setTechnicalWeight] = useState('');
  const [fundamentalWeight, _setFundamentalWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const analyzeStock = async () => {
    setLoading(true);
    setShowResults(false);

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          maxNews: maxNews || 20,
          threshold: threshold || 0.60,
          sentimentWeight: sentimentWeight || 0.30,
          technicalWeight: technicalWeight || 0.30,
          fundamentalWeight: fundamentalWeight || 0.40,
        }),
      });

      const data = await response.json();
      console.log('API fundamentals (raw):', data?.fundamentals);
      console.log('API sentimentArticles (raw count):', (data?.sentimentArticles || []).length);

      if (response.ok) {
        setResults(data);
        setShowResults(true);
        
        // Update suggested threshold from backend when available
        setSuggestedThreshold(data?.suggestedThreshold ?? null);
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error analyzing stock:', error);
      alert('Failed to connect to the analysis server. Make sure api.py is running.');
    } finally {
      setLoading(false);
    }
  };

  const shouldInvest = results ? results.finalScore >= threshold : false;
  const articles = results?.sentimentArticles || results?.news || results?.articles || []; 

  return (
    <div className="app-body">
      <div className="noise" />

      <div className="container">
        <header className="header">
          <h1 className="app-title">Smart Invest</h1>
          <p className="tagline">Stock Analysis</p>
        </header>

        <form
          className="input-section"
          onSubmit={(e) => {
            e.preventDefault();
            analyzeStock();
          }}
        >
          <div className="input-grid">
            <div className="input-group">
              <label className="label">Stock Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., TCS/tcs, RELIANCE/reliance, etc."
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              />
            </div>
            <div className="input-group">
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
              <div style={{ marginTop: 8 }}>
                <small className="muted">Suggested (based on market volatility): <strong>{suggestedThreshold != null ? suggestedThreshold.toFixed(2) : '—'}</strong></small>
                {suggestedThreshold != null && (
                  <button
                    type="button"
                    className="action-btn"
                    style={{ marginLeft: 8 }}
                    onClick={() => setThreshold(Number(suggestedThreshold))}
                  >Use suggested</button>
                )}
              </div>
            </div>
          </div>
          <div className="center-row">
            <button type="submit" className="analyze-btn" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Stock'}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>Analyzing market data and fundamentals...</p>
        </div>
      )}

      {showResults && !loading && (
        <div className="results-section">
          <div className="results-header">
            <h2 className="ticker-title">{results.ticker}</h2>
            <div className="price-info">
              <span className="current-price">₹{results.currentPrice.toFixed(2)}</span>
              <span className={`price-change ${results.priceChange >= 0 ? 'positive' : 'negative'}`}>
                {results.priceChange >= 0 ? '+' : ''}{results.priceChange.toFixed(2)}%
              </span>
            </div>

            <div className="decision-card">
              <span className={`decision-badge ${shouldInvest ? 'invest' : 'hold'}`}>
                {shouldInvest ? '✓ Confident to Invest' : '✗ Not Confident to Invest'}
              </span>
              <p className="muted" style={{ margin: 0 }}>
                Final Score: <strong>{results.finalScore}</strong> / 1.00 (Threshold: <span>{threshold}</span>)
              </p>
              <div className="muted" style={{ marginTop: 8 }}>
                Suggested Threshold: <strong>{suggestedThreshold != null ? suggestedThreshold.toFixed(2) : '—'}</strong>
                {suggestedThreshold != null && (
                  <button type="button" className="action-btn" style={{ marginLeft: 8 }} onClick={() => setThreshold(Number(suggestedThreshold))}>Use suggested</button>
                )}
              </div>
            </div>
          </div>

          <div className="metrics-grid">
            <MetricCard
              title="Sentiment Score"
              value={results.sentimentScore}
              description={`Based on ${articles.length || (maxNews || 20)} news articles`}
            />
            <MetricCard
              title="Technical Score"
              value={results.technicalScore}
              description="RSI, MACD, Moving Averages"
            />
            <MetricCard
              title="Fundamental Score"
              value={results.fundamentalScore}
              description="Revenue, Margins, P/E Ratio"
            />
          </div>

          <SentimentAnalysis articles={articles} overallScore={results?.sentimentScore} onRetry={analyzeStock} raw={results} />

          <div className="fundamentals-table">
            <h3 className="table-title">Fundamental Analysis</h3>
            <table className="table">
              <thead>
                <tr>
                  <th className="th">Metric</th>
                  <th className="th">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="tr">
                  <td className="td">Market Price</td>
                  <td className="td value-highlight">
                    {results.fundamentals?.marketPrice != null
                      ? `₹${Number(results.fundamentals.marketPrice).toFixed(2)}`
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="tr">
                  <td className="td">Total Revenue</td>
                  <td className="td value-highlight">
                    {formatCurrencyCrore(results.fundamentals?.totalRevenue)}
                  </td>
                </tr>
                <tr className="tr">
                  <td className="td">Net Income</td>
                  <td className="td value-highlight">
                    {formatCurrencyCrore(results.fundamentals?.netIncome)}
                  </td>
                </tr>
                <tr className="tr">
                  <td className="td">Revenue YoY Growth</td>
                  <td className="td value-highlight">
                    {results.fundamentals?.revenueYoY != null
                      ? `${Number(results.fundamentals.revenueYoY) >= 0 ? '+' : ''}${Number(results.fundamentals.revenueYoY).toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="tr">
                  <td className="td">Net Margin</td>
                  <td className="td value-highlight">
                    {results.fundamentals?.netMargin != null
                      ? `${Number(results.fundamentals.netMargin).toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="tr">
                  <td className="td">Trailing EPS</td>
                  <td className="td value-highlight">
                    {results.fundamentals?.trailingEPS != null
                      ? `₹${Number(results.fundamentals.trailingEPS).toFixed(2)}`
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="tr">
                  <td className="td">Trailing P/E</td>
                  <td className="td value-highlight">
                    {results.fundamentals?.trailingPE != null
                      ? Number(results.fundamentals.trailingPE).toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr className="tr">
                  <td className="td">Shares Outstanding</td>
                  <td className="td value-highlight">
                    {results.fundamentals?.sharesOutstanding != null
                      ? Number(results.fundamentals.sharesOutstanding).toLocaleString()
                      : 'N/A'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, description }) {
  return (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value != null ? value.toFixed(2) : 'N/A'}</div>
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${value != null ? value * 100 : 0}%` }} />
      </div>
      <p className="muted" style={{ margin: 0 }}>{description}</p>
    </div>
  );
}

