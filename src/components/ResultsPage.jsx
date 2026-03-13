import React, { useState } from 'react';
import { ArrowLeftIcon } from './Icons';
import PriceChart from './PriceChart';
import { classifySentiment, getArticleCompound, computeSentimentCounts, formatCurrencyCrore } from '../utils/sentiment';
import './ResultsPage.css';

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

export default function ResultsPage({ results, threshold, onRetry, onBack }) {
  const shouldInvest = results ? results.finalScore >= threshold : false;
  const articles = results?.sentimentArticles || results?.news || results?.articles || [];
  const [showAllArticles, setShowAllArticles] = useState(false);

  return (
    <div className="results-page-v2">
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

        <PriceChart ticker={results.ticker} />

        <div className="two-col-grid">
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
