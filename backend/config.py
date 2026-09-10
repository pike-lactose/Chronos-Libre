import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service role key for server-side
SEMANTIC_SCHOLAR_API_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

# Cache TTL in seconds (5 minutes)
CACHE_TTL = 300

# Semantic Scholar fields to request
S2_FIELDS = "paperId,title,abstract,authors,publicationDate,url,citationCount,venue,externalIds"
