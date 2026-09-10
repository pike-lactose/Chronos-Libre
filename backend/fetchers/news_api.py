import requests
from config import NEWS_API_KEY


def fetch_news_api(query: str, limit: int = 20) -> list[dict]:
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "pageSize": limit,
        "sortBy": "publishedAt",
        "apiKey": NEWS_API_KEY,
    }

    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    items = []
    for article in data.get("articles", []):
        items.append({
            "id": None,
            "source": "news_api",
            "source_id": article.get("url", ""),
            "title": article.get("title", ""),
            "abstract": article.get("description", "") or "",
            "content_type": "news_article",
            "published_at": article.get("publishedAt"),
            "authors": [article.get("author", "")] if article.get("author") else [],
            "url": article.get("url", ""),
            "categories": [article.get("source", {}).get("name", "")] if article.get("source") else [],
            "citation_count": None,
            "source_metadata": {
                "source_name": article.get("source", {}).get("name", ""),
                "urlToImage": article.get("urlToImage"),
            },
            "fetched_at": None,
        })
    return items
