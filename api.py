from flask import Flask, request, jsonify
from flask_cors import CORS
from smart_invest_logic import run_investment_analysis
import requests
from bs4 import BeautifulSoup
from datetime import datetime

app = Flask(__name__)

CORS(app)

# News RSS feed URLs
NEWS_FEEDS = {
    'indian': [
        'https://news.google.com/rss/search?q=indian+stock+market&hl=en-IN&gl=IN&ceid=IN:en',
        'https://news.google.com/rss/search?q=nse+bse+sensex+nifty&hl=en-IN&gl=IN&ceid=IN:en',
    ],
    'world': [
        'https://news.google.com/rss/search?q=stock+market+news&hl=en-US&gl=US&ceid=US:en',
        'https://news.google.com/rss/search?q=wall+street+nasdaq+dow+jones&hl=en-US&gl=US&ceid=US:en',
    ]
}

import re

def clean_html(text):
    """Remove HTML tags and entities from text"""
    if not text:
        return ''
    # Remove HTML tags
    clean = re.sub(r'<[^>]+>', '', text)
    # Remove HTML entities
    clean = re.sub(r'&[a-zA-Z]+;', ' ', clean)
    clean = re.sub(r'&#\d+;', ' ', clean)
    # Remove URLs
    clean = re.sub(r'https?://\S+', '', clean)
    # Clean up whitespace
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def fetch_news(category='indian', limit=10):
    """Fetch news articles from Google RSS feeds"""
    articles = []
    feeds = NEWS_FEEDS.get(category, NEWS_FEEDS['indian'])
    
    for feed_url in feeds:
        try:
            response = requests.get(feed_url, timeout=10)
            soup = BeautifulSoup(response.content, 'xml')
            items = soup.find_all('item')
            
            for item in items:
                title = item.find('title')
                link = item.find('link')
                pub_date = item.find('pubDate')
                source = item.find('source')
                description = item.find('description')
                
                # Clean up title and description
                clean_title = clean_html(title.text) if title else ''
                clean_desc = clean_html(description.text) if description else ''
                
                if clean_title and link:
                    articles.append({
                        'title': clean_title,
                        'url': link.text.strip() if link else '',
                        'publishedAt': pub_date.text.strip() if pub_date else '',
                        'source': source.text.strip() if source else 'Google News',
                        'description': clean_desc[:200] if clean_desc else '',
                    })
        except Exception as e:
            print(f"Error fetching news from {feed_url}: {e}")
            continue
    
    # Remove duplicates based on title
    seen_titles = set()
    unique_articles = []
    for article in articles:
        if article['title'] not in seen_titles:
            seen_titles.add(article['title'])
            unique_articles.append(article)

    
    return unique_articles[:limit]

@app.route('/news', methods=['GET'])
def get_news():
    """Get market news - category can be 'indian' or 'world'"""
    category = request.args.get('category', 'indian')
    limit = int(request.args.get('limit', 10))
    
    try:
        articles = fetch_news(category, limit)
        return jsonify({
            'category': category,
            'count': len(articles),
            'articles': articles
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# In-memory cache for market data
MARKET_CACHE = {
    'data': [],
    'last_updated': None
}
CACHE_DURATION = 900  # 15 minutes

@app.route('/market', methods=['GET'])
def get_market_data():
    """Get live market data for indices (Cached)"""
    global MARKET_CACHE
    
    # Check cache first
    now = datetime.now()
    if MARKET_CACHE['data'] and MARKET_CACHE['last_updated']:
        elapsed = (now - MARKET_CACHE['last_updated']).total_seconds()
        if elapsed < CACHE_DURATION:
            print(f"DEBUG: Returning cached market data ({int(elapsed)}s old)")
            return jsonify({
                'success': True,
                'data': MARKET_CACHE['data'],
                'timestamp': str(now)
            })

    try:
        from yahooquery import Ticker
        
        # Indian market indices
        indices = {
            '^BSESN': 'SENSEX',
            '^NSEI': 'NIFTY 50',
            '^NSEBANK': 'BANK NIFTY',
        }
        
        # US market indices
        us_indices = {
            '^DJI': 'DOW JONES',
            '^GSPC': 'S&P 500',
            '^IXIC': 'NASDAQ',
        }
        
        market_data = []
        
        # Combine all symbols for a single batch request
        all_symbols = list(indices.keys()) + list(us_indices.keys())
        ticker = Ticker(all_symbols)
        quotes = ticker.price
        
        if not isinstance(quotes, dict):
            quotes = {}
        
        # Fetch Indian indices
        for symbol, name in indices.items():
            try:
                if symbol not in quotes or not isinstance(quotes[symbol], dict):
                    continue
                    
                data = quotes[symbol]
                current = data.get('regularMarketPrice', 0)
                prev_close = data.get('regularMarketPreviousClose', 0)
                change = current - prev_close if prev_close else 0
                change_pct = (change / prev_close * 100) if prev_close else 0
                
                market_data.append({
                    'symbol': symbol,
                    'name': name,
                    'price': round(current, 2),
                    'change': round(change, 2),
                    'changePercent': round(change_pct, 2),
                    'region': 'IN'
                })
            except Exception as e:
                print(f"Error fetching {symbol}: {e}")
                continue
        
        # Fetch US indices
        for symbol, name in us_indices.items():
            try:
                if symbol not in quotes or not isinstance(quotes[symbol], dict):
                    continue
                    
                data = quotes[symbol]
                current = data.get('regularMarketPrice', 0)
                prev_close = data.get('regularMarketPreviousClose', 0)
                change = current - prev_close if prev_close else 0
                change_pct = (change / prev_close * 100) if prev_close else 0
                
                market_data.append({
                    'symbol': symbol,
                    'name': name,
                    'price': round(current, 2),
                    'change': round(change, 2),
                    'changePercent': round(change_pct, 2),
                    'region': 'US'
                })
            except Exception as e:
                print(f"Error fetching {symbol}: {e}")
                continue
        
        # Update Cache
        if market_data:
            MARKET_CACHE['data'] = market_data
            MARKET_CACHE['last_updated'] = now
            
        return jsonify({
            'success': True,
            'data': market_data,
            'timestamp': str(now)
        })
    except Exception as e:
        print(f"Error fetching market data: {e}")
        # Fallback: Return stale cache if available, even if expired
        if MARKET_CACHE['data']:
            print("DEBUG: Returning STALE market data due to fetch error")
            return jsonify({
                'success': True,
                'data': MARKET_CACHE['data'],
                'timestamp': str(MARKET_CACHE['last_updated']),
                'warning': "Data is stale due to connection error"
            })
            
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    # Get the JSON data sent from the React frontend
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input. Please provide stock and amount."}), 400

    # Call your analysis function with the received data
    analysis_result = run_investment_analysis(data)

    if "error" in analysis_result:
        return jsonify(analysis_result), 500

    # Return the result to the frontend as JSON
    return jsonify(analysis_result)

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(debug=True, port=5000)
