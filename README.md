# Smart Invest 📈

AI-Powered Stock Analysis for Indian & Global Markets

![Smart Invest](https://img.shields.io/badge/React-18-blue) ![Flask](https://img.shields.io/badge/Flask-2.0-green) ![Python](https://img.shields.io/badge/Python-3.8+-yellow)

## Features

- 🎯 **Stock Analysis** - Sentiment, Technical & Fundamental scores
- 📰 **Market News** - Indian & World market news with tabs
- 📊 **Live Ticker** - Real-time Sensex, Nifty, and US indices
- 🌙 **Dark/Light Mode** - Smooth theme transitions

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://python.org/) (3.8+)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rishit-Ranjan/Smart_Invest.git
   cd Smart_Invest
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install flask flask-cors yfinance beautifulsoup4 requests pandas vaderSentiment
   ```

### Running the App

**Option 1: Single command** (runs both servers)
```bash
npm start
```

**Option 2: Separate terminals**

Terminal 1 - Backend:
```bash
python api.py
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Access the App

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze` | POST | Analyze a stock ticker |
| `/news` | GET | Get market news (category: indian/world) |
| `/market` | GET | Get live market indices data |

## Tech Stack

**Frontend:** React, Vite, CSS3  
**Backend:** Flask, Python  
**Data:** yfinance, Google News RSS, VADER Sentiment

