import { useState } from "react";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function highlightKeywords(text) {
  const keywords = [
    "transformer", "genome", "quantum", "neural", "deep learning",
    "machine learning", "artificial intelligence", "AI", "LLM",
    "climate", "pandemic", "vaccine", "gene", "protein",
    "CRISPR", "blockchain", "encryption", "cybersecurity",
  ];
  const pattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    keywords.some((k) => k.toLowerCase() === part.toLowerCase()) ? (
      <strong key={i}>{part}</strong>
    ) : (
      part
    )
  );
}

function truncateSentences(text, maxSentences = 2) {
  if (!text) return "";
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.slice(0, maxSentences).join(" ");
}

export default function FeedCard({ item, onSave, onBookmark, isSaved, isBookmarked }) {
  const [expanded, setExpanded] = useState(false);
  const isResearch = item.content_type === "research_paper";
  const icon = isResearch ? "\u{1F9EA}" : "\u{1F4F0}";

  const fullText = item.abstract || "No abstract available.";
  const truncated = truncateSentences(fullText);
  const needsTruncation = fullText.length > truncated.length;

  return (
    <div className="feed-card">
      <div className="card-header">
        <span className="source-icon">{icon}</span>
        <span className="source-name">
          {isResearch
            ? item.categories?.[0] || "Research"
            : item.source_metadata?.source_name || "News"}
        </span>
        {isResearch && item.citation_count != null && (
          <span className="citation-badge">⭐ {item.citation_count}</span>
        )}
      </div>

      <h3 className="card-title">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>

      <p className="card-abstract">
        {expanded ? highlightKeywords(fullText) : highlightKeywords(truncated)}
        {needsTruncation && (
          <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? " [-]" : " [+]"}
          </button>
        )}
      </p>

      <div className="card-meta">
        <span>{timeAgo(item.published_at)}</span>
        {item.authors?.length > 0 && <span>{item.authors.length} authors</span>}
      </div>

      <div className="card-actions">
        <button
          className={isSaved ? "saved" : ""}
          onClick={() => onSave(item)}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
        <button
          className={isBookmarked ? "bookmarked" : ""}
          onClick={() => onBookmark(item)}
        >
          {isBookmarked ? "Bookmarked" : "Bookmark"}
        </button>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="read-more"
        >
          Read more
        </a>
      </div>
    </div>
  );
}
