import React, { useState, useEffect } from 'react';
import './styles/theme.css';
import MarketTicker from './components/MarketTicker';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoadingPage from './components/LoadingPage';
import ResultsPage from './components/ResultsPage';
import NewsPage from './components/NewsPage';
import WatchlistPage from './components/WatchlistPage';

export default function SmartInvestDashboard() {
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [currentTicker, setCurrentTicker] = useState('');
  const [currentThreshold, setCurrentThreshold] = useState(0.60);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartinvest_history') || '[]');
    } catch { return []; }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('smartinvest_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

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
