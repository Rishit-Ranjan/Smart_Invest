import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, ExternalLinkIcon } from './Icons';
import './NewsPage.css';

export default function NewsPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('indian');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const cleanHtml = (text) => {
    if (!text) return '';
    let clean = text.replace(/<[^>]+>/g, '');
    clean = clean.replace(/&[a-zA-Z]+;/g, ' ');
    clean = clean.replace(/&#\d+;/g, ' ');
    clean = clean.replace(/https?:\/\/\S+/g, '');
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

  const getRelatedArticles = () => {
    return news
      .filter(a => a.title !== selectedArticle.title)
      .slice(0, 3);
  };

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
