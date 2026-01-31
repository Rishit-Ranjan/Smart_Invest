import os
import time
from datetime import datetime, timedelta
from typing import List, Dict

import numpy as np
import pandas as pd
import requests
from bs4 import BeautifulSoup
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
from yahooquery import Ticker

# Download VADER lexicon
try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon')

sia = SentimentIntensityAnalyzer()

def fetch_price_data(tickers: List[str], period: str = "1y") -> pd.DataFrame:
    """Fetch Close price series for tickers using yahooquery."""
    try:
        print(f"DEBUG: Fetching price data for {tickers} with period {period}")
        # Use single string if only one ticker to avoid MultiIndex complexity in some cases
        query_tickers = tickers[0] if len(tickers) == 1 else tickers
        tk = Ticker(query_tickers)
        data = tk.history(period=period)
        
        print(f"DEBUG: Raw data from YahooQuery: {type(data)}")
        if data is not None and not data.empty:
             print(f"DEBUG: Raw data Columns: {data.columns}")
             print(f"DEBUG: Raw data Head:\n{data.head(2)}")
        
        if data is None or data.empty:
            print("DEBUG: YahooQuery returned None or Empty")
            return pd.DataFrame()
        
        # Normalize column names to title case to match rest of logic if needed, 
        # but pivoted uses 'close' from yahooquery which is lower case.
        if 'close' not in data.columns and 'Close' not in data.columns:
            print(f"DEBUG: 'close' column not found. Columns: {data.columns}")
            return pd.DataFrame()

        # Handle MultiIndex vs Flat Index
        df_reset = data.reset_index()
        
        if 'symbol' not in df_reset.columns:
            # If single ticker, symbols might not be in columns, 
            # maybe it's just the date index
            if len(tickers) == 1:
                df_reset['symbol'] = tickers[0]
            else:
                print("DEBUG: 'symbol' column missing and multiple tickers requested")
                return pd.DataFrame()

        # Ensure 'date' column exists (it might be 'Date' or index)
        if 'date' not in df_reset.columns:
            if 'Date' in df_reset.columns:
                df_reset = df_reset.rename(columns={'Date': 'date'})
            else:
                 print(f"DEBUG: 'date' column missing. Columns: {df_reset.columns}")
                 return pd.DataFrame()

        # Convert to datetime and strip timezone info to avoid "Cannot mix tz-aware with tz-naive"
        df_reset['date'] = pd.to_datetime(df_reset['date'], utc=True).dt.tz_localize(None)
        
        # Use whatever 'close' variant exists
        val_col = 'close' if 'close' in df_reset.columns else 'Close'
        
        pivoted = df_reset.pivot(index='date', columns='symbol', values=val_col)
        print(f"DEBUG: Successfully pivoted data. Shape: {pivoted.shape}")
        return pivoted
    except Exception as e:
        print(f"DEBUG: YahooQuery fetch failed: {e}")
        import traceback
        traceback.print_exc()
        return pd.DataFrame()

def fetch_fundamentals(ticker: str) -> Dict[str, float]:
    """Fetch fundamental data using yahooquery properties."""
    try:
        tk = Ticker(ticker)
        
        # Use simple properties instead of get_modules to avoid ValidationErrors
        summary_detail = tk.summary_detail.get(ticker, {})
        financial_data = tk.financial_data.get(ticker, {})
        key_stats = tk.key_stats.get(ticker, {})
        default_stats = tk.key_stats.get(ticker, {}) # Backup
        
        # Helper to safely get float
        def get_val(data_dict, key):
            val = data_dict.get(key)
            if isinstance(val, (int, float)):
                return float(val)
            return None

        revenue = get_val(financial_data, 'totalRevenue')
        net_income = get_val(financial_data, 'netIncomeToCommon') or get_val(key_stats, 'netIncomeToCommon')
        trailing_pe = get_val(summary_detail, 'trailingPE')
        eps = get_val(key_stats, 'trailingEps') or get_val(default_stats, 'trailingEps')
        
        market_price = get_val(financial_data, 'currentPrice') or get_val(summary_detail, 'navPrice')
        revenue_growth = get_val(financial_data, 'revenueGrowth')
        net_margin = get_val(financial_data, 'profitMargins')
        shares_outstanding = get_val(key_stats, 'sharesOutstanding') or get_val(default_stats, 'sharesOutstanding')
        
        return {
            'revenue': revenue if revenue is not None else np.nan,
            'net_income': net_income if net_income is not None else np.nan,
            'trailingPE': trailing_pe if trailing_pe is not None else np.nan,
            'eps': eps if eps is not None else np.nan,
            'marketPrice': market_price if market_price is not None else np.nan,
            'revenueYoY': (revenue_growth * 100) if revenue_growth is not None else 0.0,
            'netMargin': (net_margin * 100) if net_margin is not None else 0.0,
            'sharesOutstanding': int(shares_outstanding) if shares_outstanding is not None else 0
        }
    except Exception as e:
        print(f"YahooQuery fundamentals failed for {ticker}: {e}")
        return {}

def fetch_news_for_ticker(ticker: str, company_name: str = None, max_articles: int = 20, newsapi_key: str = "") -> pd.DataFrame:
    articles = []
    query = (company_name or ticker.replace('.NS', '')).strip()
    if newsapi_key:
        url = 'https://newsapi.org/v2/everything'
        params = {
            'q': query,
            'pageSize': max_articles,
            'language': 'en',
            'sortBy': 'publishedAt',
            'apiKey': newsapi_key
        }
        try:
            r = requests.get(url, params=params, timeout=15)
            data = r.json()
            for art in data.get('articles', []):
                articles.append({
                    'ticker': ticker,
                    'title': art.get('title'),
                    'description': art.get('description'),
                    'content': art.get('content'),
                    'publishedAt': art.get('publishedAt'),
                    'source': art.get('source', {}).get('name')
                })
        except Exception as e:
            print('NewsAPI fetch failed for', ticker, e)
    else:
        rss_url = f"https://news.google.com/rss/search?q={query}+when:7d&hl=en-IN&gl=IN&ceid=IN:en"
        try:
            r = requests.get(rss_url, timeout=10)
            soup = BeautifulSoup(r.content, 'html.parser') # Changed from xml as per notebook output error
            items = soup.find_all('item')[:max_articles]
            for it in items:
                articles.append({
                    'ticker': ticker,
                    'title': it.title.text if it.title else None,
                    'description': it.description.text if it.description else None,
                    'content': None,
                    'publishedAt': it.pubDate.text if it.pubDate else None,
                    'source': it.source.text if it.source else None
                })
        except Exception as e:
            print('Google News fetch failed for', ticker, e)
    
    df = pd.DataFrame(articles)
    if not df.empty:
        df['publishedAt'] = pd.to_datetime(df['publishedAt'], errors='coerce')
        df = df.drop_duplicates(subset=['title']).reset_index(drop=True)
    return df

def preprocess_and_score_news(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame(columns=['ticker','title','description','text','publishedAt','source','neg','neu','pos','compound'])
    df = df.copy()
    df['title'] = df['title'].astype(str)
    df['description'] = df.get('description', '').fillna('').astype(str)
    df['text'] = (df['title'] + '. ' + df['description']).str.strip()
    scores = df['text'].apply(lambda t: sia.polarity_scores(t) if str(t).strip() else {'neg':0,'neu':1,'pos':0,'compound':0})
    scores_df = pd.DataFrame(list(scores))
    df = pd.concat([df.reset_index(drop=True), scores_df.reset_index(drop=True)], axis=1)
    return df

def compute_technicals(close_series: pd.Series) -> pd.DataFrame:
    if close_series.empty:
        return pd.DataFrame()
    df = close_series.rename('Close').to_frame()
    df['SMA50'] = df['Close'].rolling(window=50, min_periods=10).mean()
    df['SMA200'] = df['Close'].rolling(window=200, min_periods=50).mean()
    df['Momentum30'] = df['Close'] - df['Close'].shift(30)
    df['Volatility30'] = df['Close'].rolling(window=30, min_periods=10).std()
    return df

def technical_score_for_latest(df: pd.DataFrame) -> float:
    if df is None or df.empty:
        return 0.5
    latest = df.dropna(how='all').tail(1).iloc[0]
    score = 0.5
    try:
        if not np.isnan(latest.get('SMA50')) and not np.isnan(latest.get('SMA200')):
            score += 0.2 if latest['SMA50'] > latest['SMA200'] else -0.1
    except Exception:
        pass
    try:
        if not np.isnan(latest.get('Momentum30')):
            score += 0.15 if latest['Momentum30'] > 0 else -0.1
    except Exception:
        pass
    try:
        vol = latest.get('Volatility30', np.nan)
        if not np.isnan(vol) and not np.isnan(latest.get('Close')):
            vol_pen = min(0.2, (vol / (latest['Close'] + 1e-9)))
            score -= vol_pen
    except Exception:
        pass
    return float(np.clip(score, 0.0, 1.0))

def fundamental_score_from_info(info: Dict[str,float]) -> float:
    score = 0.5
    try:
        net_income = info.get('net_income', np.nan)
        if not np.isnan(net_income) and net_income > 0:
            score += 0.15
    except Exception:
        pass
    try:
        pe = info.get('trailingPE', np.nan)
        if not np.isnan(pe):
            if pe <= 25:
                score += 0.1
            elif pe <= 50:
                score += 0.02
            else:
                score -= 0.15
    except Exception:
        pass
    try:
        eps = info.get('eps', np.nan)
        if not np.isnan(eps) and eps > 0:
            score += 0.05
    except Exception:
        pass
    return float(np.clip(score, 0.0, 1.0))

def compute_composite_score(sentiment_s, technical_s, fundamental_s, weights) -> float:
    s = weights['sentiment'] * sentiment_s + weights['technical'] * technical_s + weights['fundamental'] * fundamental_s
    return float(np.clip(s, 0.0, 1.0))

def calculate_smart_threshold(tech_df: pd.DataFrame, base_threshold: float = 0.6) -> float:
    """
    Adjusts threshold based on market volatility.
    Higher Volatility -> Higher Threshold (Be safer)
    Lower Volatility -> Lower Threshold (Be more aggressive)
    """
    try:
        if tech_df is None or tech_df.empty:
            return base_threshold
            
        latest = tech_df.iloc[-1]
        volatility = latest.get('Volatility30', 0)
        close = latest.get('Close', 1)
        
        if close == 0: return base_threshold
        
        vol_pct = volatility / close
        
        # If volatility is high (> 2% daily), raise threshold to ensure quality
        if vol_pct > 0.02:
            return 0.70
        # If volatility is moderate (1-2%), keep standard
        elif vol_pct > 0.01:
            return 0.65
        # If volatility is low (< 1%), slightly lower threshold
        else:
            return 0.55
            
    except Exception:
        return base_threshold

def run_investment_analysis(params: Dict):
    ticker = params.get('ticker', 'TCS.NS').upper()
    max_news = params.get('maxNews', 20)
    
    # Weights configuration
    weights = {
        'sentiment': params.get('sentimentWeight', 0.3),
        'technical': params.get('technicalWeight', 0.3),
        'fundamental': params.get('fundamentalWeight', 0.4)
    }

    # Fetch data
    try:
        prices = fetch_price_data([ticker], period="1y")
        
        # If no data and ticker doesn't have a suffix, try adding .NS (for NSE India)
        if prices.empty and '.' not in ticker:
             print(f"DEBUG: No data for {ticker}, trying {ticker}.NS")
             alt_ticker = f"{ticker}.NS"
             alt_prices = fetch_price_data([alt_ticker], period="1y")
             if not alt_prices.empty:
                 ticker = alt_ticker
                 prices = alt_prices

        if prices.empty:
            return {"error": f"Yahoo Finance returned no data for {ticker}. This is often due to a temporary Rate Limit or an invalid ticker. If looking for an Indian stock, try explicitly adding .NS"}
        
        if ticker not in prices.columns and ticker.lower() not in [c.lower() for c in prices.columns]:
            return {"error": f"Ticker {ticker} not found in fetched data. Hint: For Indian stocks, use .NS suffix (e.g., TCS.NS)"}
        
        # Use the actual column name from the dataframe
        actual_col = ticker if ticker in prices.columns else [c for c in prices.columns if c.lower() == ticker.lower()][0]
        
        tech_df = compute_technicals(prices[actual_col].dropna())
        tscore = technical_score_for_latest(tech_df)
        
        # Fundamentals
        fund_info = fetch_fundamentals(ticker)
        fscore = fundamental_score_from_info(fund_info)
        
        # News/Sentiment
        news_df = fetch_news_for_ticker(ticker, max_articles=max_news)
        news_df = preprocess_and_score_news(news_df)
        
        sscore_raw = 0.0
        if not news_df.empty:
            sscore_raw = news_df['compound'].mean()
        
        sscore_rescaled = (sscore_raw + 1) / 2
        
        final_score = compute_composite_score(sscore_rescaled, tscore, fscore, weights)
        
        last_price = float(prices[ticker].dropna().iloc[-1])
        prev_price = float(prices[ticker].dropna().iloc[-2]) if len(prices[ticker].dropna()) > 1 else last_price
        price_change = ((last_price - prev_price) / prev_price) * 100

        result = {
            "ticker": ticker,
            "currentPrice": last_price,
            "priceChange": price_change,
            "sentimentScore": sscore_rescaled,
            "technicalScore": tscore,
            "fundamentalScore": fscore,
            "finalScore": final_score,
            "fundamentals": {
                "marketPrice": fund_info.get('marketPrice', last_price),
                "totalRevenue": fund_info.get('revenue', 0),
                "netIncome": fund_info.get('net_income', 0),
                "revenueYoY": fund_info.get('revenueYoY', 0.0),
                "netMargin": fund_info.get('netMargin', 0.0),
                "trailingEPS": fund_info.get('eps', 0.0),
                "trailingPE": fund_info.get('trailingPE', 0.0),
                "sharesOutstanding": fund_info.get('sharesOutstanding', 0)
            }
        }
        return result
    except Exception as e:
        return {"error": str(e)}
