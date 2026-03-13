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

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getRelatedArticles = () => {
    return news.filter(a => a.title !== selectedArticle.title).slice(0, 3);
  };

  if (selectedArticle) {
    const relatedArticles = getRelatedArticles();
    return (
      <div className="news-page">
        <div className="np-back-row">
          <button className="np-back-btn" onClick={() => setSelectedArticle(null)}>
            <ArrowLeftIcon />
            <span>Back</span>
          </button>
        </div>
        <div className="np-reader">
          <div className="np-reader-main">
            <article className="np-article-full">
              <div className="np-article-header">
                <span className="np-article-cat">
                  {activeTab === 'indian' ? 'Indian Markets' : 'World Markets'}
                </span>
                <h1 className="np-article-title">{selectedArticle.title}</h1>
                <div className="np-article-meta">
                  <span className="np-source-pill">{selectedArticle.source}</span>
                  <span className="np-article-time">{timeAgo(selectedArticle.publishedAt)}</span>
                </div>
              </div>
              <div className="np-article-body">
                <p>{selectedArticle.description || 'This article covers the latest market developments.'}</p>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="np-read-full"
                >
                  Read on {selectedArticle.source} <ExternalLinkIcon />
                </a>
              </div>
            </article>
          </div>

          {relatedArticles.length > 0 && (
            <div className="np-related">
              <h3 className="np-related-title">More Stories</h3>
              {relatedArticles.map((article, idx) => (
                <div key={idx} className="np-related-item" onClick={() => setSelectedArticle(article)}>
                  <span className="np-related-source">{article.source}</span>
                  <h4 className="np-related-headline">{article.title}</h4>
                  <span className="np-related-time">{timeAgo(article.publishedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const featured = news[0];
  const rest = news.slice(1);

  return (
    <div className="news-page">
      <div className="np-header">
        <div className="np-header-top">
          <div>
            <h1 className="np-title">Market News</h1>
            <p className="np-subtitle">Latest headlines from stock markets</p>
          </div>
          <div className="np-tabs">
            <div className={`np-tab-slider ${activeTab === 'world' ? 'np-tab-slider--right' : ''}`} />
            <button
              className={`np-tab ${activeTab === 'indian' ? 'np-tab--active' : ''}`}
              onClick={() => setActiveTab('indian')}
            >
              Indian
            </button>
            <button
              className={`np-tab ${activeTab === 'world' ? 'np-tab--active' : ''}`}
              onClick={() => setActiveTab('world')}
            >
              World
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="np-loading">
          <div className="loading-spinner"></div>
          <p>Fetching latest news...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="np-empty">
          <p>No news available right now.</p>
          <button className="btn-secondary" onClick={() => fetchNews(activeTab)}>Retry</button>
        </div>
      ) : (
        <>
          {/* Featured article */}
          {featured && (
            <div className="np-featured" onClick={() => setSelectedArticle(featured)}>
              <div className="np-featured-badge">Latest</div>
              <h2 className="np-featured-title">{featured.title}</h2>
              <p className="np-featured-desc">
                {featured.description ? featured.description.slice(0, 200) : 'Click to read more'}
              </p>
              <div className="np-featured-footer">
                <span className="np-source-pill">{featured.source}</span>
                <span className="np-time">{timeAgo(featured.publishedAt)}</span>
              </div>
            </div>
          )}

          {/* News grid */}
          <div className="np-grid">
            {rest.map((article, index) => (
              <div key={index} className="np-card" onClick={() => setSelectedArticle(article)}>
                <div className="np-card-body">
                  <span className="np-card-source">{article.source}</span>
                  <h3 className="np-card-title">{article.title}</h3>
                  <p className="np-card-desc">
                    {article.description ? article.description.slice(0, 100) + '...' : 'Click to read more'}
                  </p>
                </div>
                <div className="np-card-footer">
                  <span className="np-time">{timeAgo(article.publishedAt)}</span>
                  <span className="np-card-read">Read →</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
