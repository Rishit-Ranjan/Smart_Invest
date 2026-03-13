import React from 'react';
import './LoadingPage.css';

export default function LoadingPage({ ticker }) {
  return (
    <div className="loading-page">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2 className="loading-title">Analyzing {ticker}</h2>
        <p className="loading-text">Fetching market data, news sentiment, and fundamentals...</p>
      </div>
    </div>
  );
}
