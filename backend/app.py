import hashlib
import uuid
from datetime import datetime, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

import cache
from fetchers.semantic_scholar import fetch_semantic_scholar
from fetchers.news_api import fetch_news_api
from supabase_client import supabase

app = Flask(__name__)
CORS(app)


def normalize_items(items: list[dict]) -> list[dict]:
    now = datetime.now(timezone.utc).isoformat()
    for item in items:
        if item["id"] is None:
            item["id"] = str(uuid.uuid4())
        if item["fetched_at"] is None:
            item["fetched_at"] = now
    return items


@app.route("/api/feed")
def get_feed():
    query = request.args.get("q", "technology")
    source = request.args.get("source", "all")

    cache_key = cache.make_key("feed", query, source)
    cached = cache.get(cache_key)
    if cached is not None:
        return jsonify(cached)

    items = []
    errors = []

    if source in ("all", "research"):
        try:
            items.extend(fetch_semantic_scholar(query))
        except Exception as e:
            errors.append({"source": "semantic_scholar", "error": str(e)})

    if source in ("all", "news"):
        try:
            items.extend(fetch_news_api(query))
        except Exception as e:
            errors.append({"source": "news_api", "error": str(e)})

    items = normalize_items(items)
    items.sort(key=lambda x: x.get("published_at") or "", reverse=True)

    result = {"items": items, "errors": errors}
    cache.set(cache_key, result)
    return jsonify(result)


@app.route("/api/feed/trending")
def get_trending():
    cache_key = cache.make_key("trending")
    cached = cache.get(cache_key)
    if cached is not None:
        return jsonify(cached)

    items = []
    try:
        items.extend(fetch_semantic_scholar("machine learning"))
    except Exception:
        pass
    try:
        items.extend(fetch_news_api("technology"))
    except Exception:
        pass

    items = normalize_items(items)
    items.sort(key=lambda x: x.get("published_at") or "", reverse=True)

    result = {"items": items[:20]}
    cache.set(cache_key, result)
    return jsonify(result)


@app.route("/api/history", methods=["GET"])
def get_history():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Missing auth token"}), 401

    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    result = (
        supabase.table("history")
        .select("id,ciphertext,iv,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return jsonify({"items": result.data})


@app.route("/api/history", methods=["POST"])
def add_history():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Missing auth token"}), 401

    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    data = request.get_json()
    ciphertext = data.get("ciphertext")
    iv = data.get("iv")

    if not ciphertext or not iv:
        return jsonify({"error": "Missing ciphertext or iv"}), 400

    result = (
        supabase.table("history")
        .insert({"user_id": user_id, "ciphertext": ciphertext, "iv": iv})
        .execute()
    )

    return jsonify({"id": result.data[0]["id"]}), 201


@app.route("/api/history/<entry_id>", methods=["DELETE"])
def delete_history(entry_id: str):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Missing auth token"}), 401

    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    supabase.table("history").delete().eq("id", entry_id).eq("user_id", user_id).execute()

    return jsonify({"ok": True})


@app.route("/api/bookmarks", methods=["GET"])
def get_bookmarks():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Missing auth token"}), 401

    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    result = (
        supabase.table("bookmarks")
        .select("id,ciphertext,iv,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return jsonify({"items": result.data})


@app.route("/api/bookmarks", methods=["POST"])
def add_bookmark():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Missing auth token"}), 401

    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    data = request.get_json()
    ciphertext = data.get("ciphertext")
    iv = data.get("iv")

    if not ciphertext or not iv:
        return jsonify({"error": "Missing ciphertext or iv"}), 400

    result = (
        supabase.table("bookmarks")
        .insert({"user_id": user_id, "ciphertext": ciphertext, "iv": iv})
        .execute()
    )

    return jsonify({"id": result.data[0]["id"]}), 201


@app.route("/api/bookmarks/<entry_id>", methods=["DELETE"])
def delete_bookmark(entry_id: str):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Missing auth token"}), 401

    try:
        user = supabase.auth.get_user(token)
        user_id = user.user.id
    except Exception:
        return jsonify({"error": "Invalid token"}), 401

    supabase.table("bookmarks").delete().eq("id", entry_id).eq("user_id", user_id).execute()

    return jsonify({"ok": True})


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
