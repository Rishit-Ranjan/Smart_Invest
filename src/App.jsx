import React, { useState, useEffect } from 'react';

export default function SmartInvestDashboard() {
  const [ticker, setTicker] = useState('');
  const [maxNews, setMaxNews] = useState('');
  const [threshold, setThreshold] = useState('');
  const [sentimentWeight, setSentimentWeight] = useState('');
  const [technicalWeight, setTechnicalWeight] = useState('');
  const [fundamentalWeight, setFundamentalWeight] = useState('');
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

      if (response.ok) {
        setResults(data);
        setShowResults(true);
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

  return (
    <div style={styles.body}>
      <div style={styles.noise} />

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.h1}>SmartInvest</h1>
          <p style={styles.tagline}>Stock Analysis</p>
        </header>

        <div style={styles.inputSection}>
          <div style={styles.inputGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ticker Symbol</label>
              <input
                type="text"
                style={styles.input}
                placeholder="e.g., TCS, RELIANCE"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Score Threshold</label>
              <input
                type="number"
                style={styles.input}
                value={threshold}
                placeholder="0.60"
                min="0"
                max="1"
                step="0.05"
                onChange={(e) => setThreshold(e.target.value === '' ? '' : parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <button style={styles.analyzeBtn} onClick={analyzeStock}>
          Analyze Stock
        </button>
      </div>

      {loading && (
        <div style={styles.loading}>
          <div style={styles.spinner} />
          <p>Analyzing market data and fundamentals...</p>
        </div>
      )}

      {showResults && !loading && (
        <div style={styles.resultsSection}>
          <div style={styles.resultsHeader}>
            <h2 style={styles.tickerTitle}>{results.ticker}</h2>
            <div style={styles.priceInfo}>
              <span style={styles.currentPrice}>₹{results.currentPrice.toFixed(2)}</span>
              <span style={{
                ...styles.priceChange,
                ...(results.priceChange >= 0 ? styles.priceChangePositive : styles.priceChangeNegative)
              }}>
                {results.priceChange >= 0 ? '+' : ''}{results.priceChange.toFixed(2)}%
              </span>
            </div>

            <div style={styles.decisionCard}>
              <span style={{
                ...styles.decisionBadge,
                ...(shouldInvest ? styles.decisionBadgeInvest : styles.decisionBadgeHold)
              }}>
                {shouldInvest ? '✓ Confident to Invest' : '✗ Not Confident to Invest'}
              </span>
              <p style={{ color: '#6B7280', margin: 0 }}>
                Final Score: <strong>{results.finalScore}</strong> / 1.00 (Threshold: <span>{threshold}</span>)
              </p>
            </div>
          </div>

          <div style={styles.metricsGrid}>
            <MetricCard
              title="Sentiment Score"
              value={results.sentimentScore}
              description={`Based on ${maxNews || 20} news articles`}
              
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

          <div style={styles.fundamentalsTable}>
            <h3 style={styles.tableTitle}>Fundamental Analysis</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Metric</th>
                  <th style={styles.th}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tr}>
                  <td style={styles.td}>Market Price</td>
                  <td style={{ ...styles.td, ...styles.valueHighlight }}>
                    {results.fundamentals?.marketPrice != null
                      ? `₹${Number(results.fundamentals.marketPrice).toFixed(2)}`
                      : 'N/A'}
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>Total Revenue</td>
                  <td style={{ ...styles.td, ...styles.valueHighlight }}>
                    {results.fundamentals?.totalRevenue != null
                      ? `₹${(Number(results.fundamentals.totalRevenue) / 10000000).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`
                      : 'N/A'}
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>Net Income</td>
                  <td style={{ ...styles.td, ...styles.valueHighlight }}>
                    {results.fundamentals?.netIncome != null
                      ? `₹${(Number(results.fundamentals.netIncome) / 10000000).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`
                      : 'N/A'}
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>Revenue YoY Growth</td>
                  <td style={{ ...styles.td, ...styles.valueHighlight }}>
                    {results.fundamentals?.revenueYoY != null
                      ? `${Number(results.fundamentals.revenueYoY) >= 0 ? '+' : ''}${Number(results.fundamentals.revenueYoY).toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>Net Margin</td>
                  <td style={{ ...styles.td, ...styles.valueHighlight }}>
                    {results.fundamentals?.netMargin != null
                      ? `${Number(results.fundamentals.netMargin).toFixed(2)}%`
                      : 'N/A'}
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>Trailing EPS</td>
                  <td style={{ ...styles.td, ...styles.valueHighlight }}>
                    {results.fundamentals?.trailingEPS != null
                      ? `₹${Number(results.fundamentals.trailingEPS).toFixed(2)}`
                      : 'N/A'}
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>Trailing P/E</td>
                  <td style={{ ...styles.td, ...styles.valueHighlight }}>
                    {results.fundamentals?.trailingPE != null
                      ? Number(results.fundamentals.trailingPE).toFixed(2)
                      : 'N/A'}
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>Shares Outstanding</td>
                  <td style={{ ...styles.td, ...styles.valueHighlight }}>
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
    <div style={styles.metricCard}>
      <div style={styles.metricTitle}>{title}</div>
      <div style={styles.metricValue}>{value.toFixed(2)}</div>
      <div style={styles.scoreBar}>
        <div style={{ ...styles.scoreFill, width: `${value * 100}%` }} />
      </div>
      <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>{description}</p>
    </div>
  );
}

const styles = {
  body: {
    fontFamily: "'Work Sans', sans-serif",
    background: 'linear-gradient(135deg, #0A1F3D 0%, #1A2332 50%, #0A1F3D 100%)',
    minHeight: '100vh',
    padding: 0,
    margin: 0,
    color: '#0A1F3D',
  },
  noise: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    opacity: 0.05,
    zIndex: 1,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 2,
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
    animation: 'fadeInDown 0.8s ease',
  },
  h1: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 'clamp(3rem, 8vw, 5.5rem)',
    fontWeight: 900,
    background: 'linear-gradient(135deg, #00D9B5 0%, #FFB627 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '10px',
    letterSpacing: '-2px',
  },
  tagline: {
    fontFamily: "'IBM Plex Mono', monospace",
    color: '#00D9B5',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    opacity: 0.9,
  },
  inputSection: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    marginBottom: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    animation: 'fadeInUp 0.8s ease 0.2s backwards',
  },
  inputGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '20px',
    marginBottom: '30px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: '#6B7280',
    marginBottom: '8px',
    fontWeight: 600,
  },
  input: {
    fontFamily: "'Inter', 'Work Sans', sans-serif",
    padding: '12px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    background: '#ffffff',
    color: '#000000', // Absolute black for best visibility
    fontWeight: '600', // Bolder text
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  weightInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '20px',
  },
  weightInputGroup: {
    background: '#F3F4F6',
    padding: '15px',
    borderRadius: '12px',
    color: '#374151',
  },
  analyzeBtn: {
    width: '240px',
    display: 'block',
    margin: '0 auto',
    padding: '16px',
    background: 'linear-gradient(135deg, #00D9B5 0%, #00B89C 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontFamily: "'Work Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 10px 30px rgba(0, 217, 181, 0.3)',
  },
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: 'white',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(0, 217, 181, 0.2)',
    borderTopColor: '#00D9B5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  resultsSection: {
    display: 'block',
    animation: 'fadeInUp 0.8s ease',
  },
  resultsHeader: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '40px',
    marginBottom: '30px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  tickerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3rem',
    fontWeight: 900,
    color: '#0A1F3D',
    marginBottom: '10px',
  },
  priceInfo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '20px',
    marginBottom: '30px',
  },
  currentPrice: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#00D9B5',
  },
  priceChange: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '1.2rem',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  priceChangePositive: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10B981',
  },
  priceChangeNegative: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#EF4444',
  },
  decisionCard: {
    background: '#F8F9FA',
    padding: '30px',
    borderRadius: '16px',
    borderLeft: '6px solid #00D9B5',
  },
  decisionBadge: {
    display: 'inline-block',
    padding: '10px 24px',
    borderRadius: '30px',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '15px',
  },
  decisionBadgeInvest: {
    background: '#10B981',
    color: 'white',
  },
  decisionBadgeHold: {
    background: '#FFB627',
    color: 'white',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  metricTitle: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: '#6B7280',
    marginBottom: '15px',
  },
  metricValue: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3rem',
    fontWeight: 900,
    color: '#0A1F3D',
    marginBottom: '15px',
  },
  scoreBar: {
    height: '12px',
    background: '#F8F9FA',
    borderRadius: '20px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  scoreFill: {
    height: '100%',
    borderRadius: '20px',
    transition: 'width 1s ease',
    background: 'linear-gradient(90deg, #00D9B5, #FFB627)',
  },
  fundamentalsTable: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  tableTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
    fontWeight: 900,
    color: '#0A1F3D',
    marginBottom: '30px',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  th: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: '#6B7280',
    textAlign: 'left',
    padding: '15px 20px',
    background: '#F8F9FA',
    borderBottom: '2px solid #E5E7EB',
  },
  tr: {
    transition: 'background 0.2s ease',
  },
  td: {
    padding: '20px',
    borderBottom: '1px solid #E5E7EB',
    fontFamily: "'Work Sans', sans-serif",
  },
  valueHighlight: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600,
    color: '#00D9B5',
  },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&family=Work+Sans:wght@300;400;600&display=swap');

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  input:focus {
    border-color: #00D9B5 !important;
    box-shadow: 0 0 0 4px rgba(0, 217, 181, 0.15) !important;
    background: #ffffff !important;
  }

  @media (max-width: 768px) {
    .input-grid {
      grid-template-columns: 1fr !important;
    }
    .weight-inputs {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(styleSheet);