export function classifySentiment(s) {
  if (s == null) return 'neutral';
  if (typeof s === 'string') {
    const l = s.toLowerCase();
    if (l.includes('pos') || l.includes('positive')) return 'positive';
    if (l.includes('neg') || l.includes('negative')) return 'negative';
    return 'neutral';
  }
  const n = Number(s);
  if (isNaN(n)) return 'neutral';
  if (n > 0.05) return 'positive';
  if (n < -0.05) return 'negative';
  return 'neutral';
}

export function getArticleCompound(a) {
  if (!a) return null;
  if (a.compound != null && !isNaN(Number(a.compound))) return Number(a.compound);
  if (a.sentimentScore != null && !isNaN(Number(a.sentimentScore))) return Number(a.sentimentScore);
  if (a.sentiment != null) {
    if (typeof a.sentiment === 'number' && !isNaN(a.sentiment)) return Number(a.sentiment);
    if (typeof a.sentiment === 'object' && a.sentiment.compound != null && !isNaN(Number(a.sentiment.compound))) return Number(a.sentiment.compound);
  }
  if (a.pos != null && a.neu != null && a.neg != null) {
    const pos = Number(a.pos || 0);
    const neu = Number(a.neu || 0);
    const neg = Number(a.neg || 0);
    if (pos > neu && pos > neg) return 0.5;
    if (neg > neu && neg > pos) return -0.5;
    return 0.0;
  }
  return null;
}

export function computeSentimentCounts(articles = []) {
  const counts = { positive: 0, neutral: 0, negative: 0 };
  (articles || []).forEach((a) => {
    const c = getArticleCompound(a);
    let label;
    if (c != null && !isNaN(c)) {
      label = classifySentiment(c);
    } else if (a && a.pos != null && a.neu != null && a.neg != null) {
      label = (a.pos > a.neg && a.pos > a.neu) ? 'positive' : ((a.neg > a.pos && a.neg > a.neu) ? 'negative' : 'neutral');
    } else {
      label = 'neutral';
    }
    counts[label] = (counts[label] || 0) + 1;
  });
  return counts;
}

export function sanitizeArticleText(text) {
  if (!text) return '';
  let s = String(text);
  s = s.replace(/<a[^>]*>.*?<\/a>/gi, '');
  s = s.replace(/https?:\/\/\S+/gi, '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s;
}

export function formatCurrencyCrore(value) {
  if (value == null || isNaN(Number(value))) return 'N/A';
  const n = Number(value);
  if (Math.abs(n) < 1e7) {
    return `₹${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} Cr`;
  } else {
    return `₹${(n / 1e7).toLocaleString(undefined, { maximumFractionDigits: 0 })} Cr`;
  }
}
