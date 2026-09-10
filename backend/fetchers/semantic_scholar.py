import requests
from config import SEMANTIC_SCHOLAR_API_KEY, S2_FIELDS


def fetch_semantic_scholar(query: str, limit: int = 20) -> list[dict]:
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = {
        "query": query,
        "limit": limit,
        "fields": S2_FIELDS,
    }
    headers = {}
    if SEMANTIC_SCHOLAR_API_KEY:
        headers["x-api-key"] = SEMANTIC_SCHOLAR_API_KEY

    resp = requests.get(url, params=params, headers=headers, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    items = []
    for paper in data.get("data", []):
        items.append({
            "id": None,  # Will be set by caller
            "source": "semantic_scholar",
            "source_id": paper.get("paperId", ""),
            "title": paper.get("title", ""),
            "abstract": paper.get("abstract", "") or "",
            "content_type": "research_paper",
            "published_at": paper.get("publicationDate"),
            "authors": [a.get("name", "") for a in (paper.get("authors") or [])],
            "url": paper.get("url", ""),
            "categories": [paper.get("venue", "")] if paper.get("venue") else [],
            "citation_count": paper.get("citationCount"),
            "source_metadata": {
                "externalIds": paper.get("externalIds", {}),
                "venue": paper.get("venue", ""),
            },
            "fetched_at": None,  # Will be set by caller
        })
    return items
