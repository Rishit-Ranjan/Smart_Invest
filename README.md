# Smart Invest

An AI-powered stock analysis dashboard for Indian and global markets. Combines sentiment analysis, technical indicators, and fundamental data into a single weighted confidence score to support investment decisions.

---

## Features

- **Stock Analysis** — Three-factor scoring (sentiment, technical, fundamental) with customizable weights and confidence threshold
- **Live Market Ticker** — Real-time SENSEX, NIFTY 50, BANK NIFTY, DOW, S&P 500, NASDAQ with 15-minute cache
- **Interactive Price Charts** — Historical prices with toggleable SMA 50 / SMA 200 overlays across multiple time ranges
- **Market News** — Indian and World tabs, featured article layout, article reader with related stories sidebar
- **Search History** — Last 10 analyses persisted in localStorage, re-loadable with one click
- **Watchlist** — Add stocks, batch-refresh scores, track price changes
- **Dark / Light Mode** — Theme preference saved in localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Recharts |
| Backend | Python, Flask, Flask-CORS |
| Stock Data | yahooquery |
| Sentiment | VADER (vaderSentiment / NLTK) |
| News | Google News RSS, NewsAPI (optional) |
| Data Processing | pandas, numpy, BeautifulSoup4 |

---

## Project Structure

```
smart_invest/
├── api.py                      # Flask backend — 4 REST endpoints
├── smart_invest_logic.py       # Core scoring algorithm
├── src/
│   ├── App.jsx                 # Root component, routing, global state
│   ├── main.jsx                # React entry point
│   ├── components/
│   │   ├── HomePage.jsx/css    # Search + analysis input
│   │   ├── ResultsPage.jsx/css # Score display, charts, news
│   │   ├── NewsPage.jsx/css    # Market news browser
│   │   ├── WatchlistPage.jsx/css
│   │   ├── PriceChart.jsx/css  # Recharts price chart
│   │   ├── MarketTicker.jsx/css
│   │   ├── LoadingPage.jsx/css
│   │   ├── Navbar.jsx/css
│   │   └── Icons.jsx
│   ├── utils/
│   │   └── sentiment.js        # Frontend sentiment helpers
│   └── styles/
│       └── theme.css           # CSS custom properties (dark/light)
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js v16+
- Python 3.8+

### Install Dependencies

```bash
# Frontend
npm install

# Backend
pip install flask flask-cors yahooquery beautifulsoup4 requests pandas numpy nltk vaderSentiment
```

### Run in Development

```bash
# Both servers at once
npm start

# Or separately:
python api.py        # Flask on http://localhost:5000
npm run dev          # Vite on http://localhost:5173
```

### Build for Production

```bash
npm run build   # Output → dist/
```

---

## API Reference

Base URL: `http://localhost:5000`

### `POST /analyze`

Runs full stock analysis.

**Request body:**

```json
{
  "ticker": "TCS.NS",
  "maxNews": 20,
  "threshold": 0.60,
  "sentimentWeight": 0.3,
  "technicalWeight": 0.3,
  "fundamentalWeight": 0.4
}
```

**Response:**

```json
{
  "ticker": "TCS.NS",
  "currentPrice": 3450.25,
  "priceChange": 1.23,
  "sentimentScore": 0.62,
  "technicalScore": 0.55,
  "fundamentalScore": 0.70,
  "finalScore": 0.63,
  "suggestedThreshold": 0.58,
  "sentimentArticles": [
    {
      "title": "...",
      "source": "Economic Times",
      "url": "...",
      "publishedAt": "...",
      "compound": 0.45,
      "pos": 0.2,
      "neu": 0.7,
      "neg": 0.1
    }
  ],
  "fundamentals": {
    "marketPrice": 3450.25,
    "totalRevenue": 230000000000,
    "netIncome": 42000000000,
    "revenueYoY": 8.4,
    "netMargin": 18.2,
    "trailingEPS": 115.3,
    "trailingPE": 29.9,
    "sharesOutstanding": 3650000000
  }
}
```

---

### `GET /news`

Fetches news articles from RSS feeds.

| Param | Type | Default | Description |
|---|---|---|---|
| `category` | string | `indian` | `indian` or `world` |
| `limit` | number | `10` | Max articles to return |

**Response:**

```json
{
  "category": "indian",
  "count": 10,
  "articles": [
    {
      "title": "...",
      "url": "...",
      "source": "Economic Times",
      "description": "...",
      "publishedAt": "2025-03-13T10:00:00Z"
    }
  ]
}
```

---

### `GET /history`

Historical price data with SMA indicators.

| Param | Type | Default | Description |
|---|---|---|---|
| `ticker` | string | required | e.g. `TCS.NS` |
| `period` | string | `1y` | `1mo`, `3mo`, `6mo`, `1y`, `2y` |

**Response:**

```json
{
  "ticker": "TCS.NS",
  "period": "1y",
  "count": 252,
  "history": [
    {
      "date": "2024-03-13",
      "close": 3420.00,
      "volume": 1234567,
      "sma50": 3380.50,
      "sma200": 3250.10
    }
  ]
}
```

---

### `GET /market`

Live market index data, cached for 15 minutes.

**Response:**

```json
{
  "success": true,
  "timestamp": "2025-03-13T10:15:00Z",
  "data": [
    {
      "symbol": "^NSEI",
      "name": "NIFTY 50",
      "price": 22350.40,
      "change": 125.30,
      "changePercent": 0.56,
      "region": "IN"
    }
  ]
}
```

---

## Scoring Algorithm

The final score is a weighted sum of three independent components, each normalized to `[0, 1]`.

```
finalScore = (sentiment × w₁) + (technical × w₂) + (fundamental × w₃)
```

Default weights: **30% sentiment / 30% technical / 40% fundamental**

### Sentiment Score

1. Fetches recent news headlines for the ticker
2. Runs VADER sentiment analysis on title + description
3. Takes the mean `compound` score across all articles
4. Rescales: `score = (compound + 1) / 2`

### Technical Score

Starting from a base of `0.5`:

| Signal | Condition | Adjustment |
|---|---|---|
| SMA crossover | SMA50 > SMA200 | +0.20 |
| SMA crossover | SMA50 ≤ SMA200 | −0.10 |
| 30-day momentum | Positive | +0.15 |
| 30-day momentum | Negative | −0.10 |
| Volatility | High std/price ratio | up to −0.20 |

### Fundamental Score

Starting from a base of `0.5`:

| Signal | Condition | Adjustment |
|---|---|---|
| P/E ratio | ≤ 25 | +0.10 |
| P/E ratio | 25–50 | +0.02 |
| P/E ratio | > 50 | −0.15 |
| Net income | Positive | +0.15 |
| EPS | Positive | +0.05 |

### Recommendation

If `finalScore ≥ threshold` → **Invest**, otherwise → **Hold**

The suggested threshold auto-adjusts based on market volatility.

---

## Indian Stock Tickers

Indian stocks require the `.NS` suffix (NSE). The backend will attempt to auto-append `.NS` if a plain ticker fails.

```
TCS      → TCS.NS
INFY     → INFY.NS
RELIANCE → RELIANCE.NS
```

US stocks use standard tickers: `AAPL`, `MSFT`, `TSLA`.

---

## Configuration

### Analysis Weights

Adjustable per-analysis via the UI or the API request body. Weights must sum to `1.0`.

### News Sources

- **Google News RSS** — Free, no API key required (default)
- **NewsAPI** — Optional. Add your key in `smart_invest_logic.py`

### Theme Colors

All colors are CSS custom properties defined in [src/styles/theme.css](src/styles/theme.css):

```css
--bg-primary, --bg-card, --bg-tertiary
--text-primary, --text-secondary, --text-muted
--border-color, --border-hover
--success, --warning, --danger
```

---

## Limitations

- Yahoo Finance may rate-limit aggressive request patterns
- News sentiment reflects headlines only (not analyst ratings or social media)
- Historical data capped at 2 years
- All user data (watchlist, history) is stored locally — no backend persistence
- SMA 200 may be `null` for tickers with insufficient history
