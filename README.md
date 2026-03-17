<img width="1852" height="913" alt="Screenshot 2026-03-17 105513" src="https://github.com/user-attachments/assets/89bd6418-1605-4099-b9fb-c09e294fa0dd" /># Smart Invest 📈

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
**Data:** yfinance, Google News RSS, VADER Sentiment<br/><br/>

**Home Screen:**
<img width="1857" height="907" alt="Screenshot 2026-03-17 105244" src="https://github.com/user-attachments/assets/7cb4a019-b5fe-4b25-98d1-b89f67029104" /><br/><br/>

**Analysis:**
<img width="1846" height="905" alt="Screenshot 2026-03-17 105354" src="https://github.com/user-attachments/assets/88f1fe62-e17d-4f69-9ead-c4a680f94709" />
<br/><br/>

<img width="1852" height="913" alt="Screenshot 2026-03-17 105513" src="https://github.com/user-attachments/assets/a161970f-3a2f-4f2d-b66c-a3d700bedb9f" />
<br/><br/>

**News:**
<img width="1856" height="909" alt="Screenshot 2026-03-17 105533" src="https://github.com/user-attachments/assets/09b53b6e-9362-4281-827c-f92f7e91447c" />
<br/><br/>

<img width="1847" height="906" alt="Screenshot 2026-03-17 105544" src="https://github.com/user-attachments/assets/bbd02a3a-e081-47cb-8e1e-ff328fd5e8c2" />
<br/><br/>

**Watchlist:**
<img width="1854" height="902" alt="Screenshot 2026-03-17 105556" src="https://github.com/user-attachments/assets/717ce050-053a-4cbe-971e-25345b2640a3" />

