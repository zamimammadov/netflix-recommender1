"""NextOnNetflix – Flask back‑end
   Refactored 2025‑05‑05
   • IMDb ▸ TMDB review fallback
   • case‑insensitive similarity search
   • pathlib + type‑hints + textwrap
"""

from __future__ import annotations

import json
import pickle
import textwrap
from pathlib import Path
from typing import List, Dict

import bs4 as bs
import pandas as pd
import requests
from flask import Flask, render_template, request
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ──────────────────────────────────────────
# 1)  Global paths / data / model (load once)
# ──────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent
DATA_PATH  = BASE_DIR / "main_data.csv"
MODEL_PATH = BASE_DIR / "nlp_model.pkl"
VECT_PATH  = BASE_DIR / "transform.pkl"

_movies_df: pd.DataFrame = pd.read_csv(DATA_PATH)
_movies_df["movie_lower"] = _movies_df["movie_title"].str.lower()

_cv          = CountVectorizer()
_similarity  = cosine_similarity(_cv.fit_transform(_movies_df["comb"]))

_clf         = pickle.load(open(MODEL_PATH, "rb"))
_vectorizer  = pickle.load(open(VECT_PATH, "rb"))

from dotenv import load_dotenv
import os

load_dotenv()  # .env dosyasını yükle
TMDB_KEY = os.getenv("TMDB_KEY")

UA_HDRS  = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    )
}

# ──────────────────────────────────────────
# 2)  Helpers
# ──────────────────────────────────────────
def recommendations(title: str, top_n: int = 10) -> List[str]:
    """Return *top_n* similar movies (case‑insensitive)."""
    title_lc = title.lower()
    if title_lc not in _movies_df["movie_lower"].values:
        return []
    idx = _movies_df.loc[_movies_df["movie_lower"] == title_lc].index[0]
    scores = sorted(
        enumerate(_similarity[idx]),
        key=lambda x: x[1],
        reverse=True,
    )[1 : top_n + 1]
    return [_movies_df["movie_title"][i] for i, _ in scores]


def flask_json_list(raw: str) -> List[str]:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return []


def imdb_reviews(imdb_id: str) -> List[str]:
    if not imdb_id:
        return []
    url = f"https://www.imdb.com/title/{imdb_id}/reviews"
    try:
        html = requests.get(url, headers=UA_HDRS, timeout=10).text
        soup = bs.BeautifulSoup(html, "lxml")
        return [div.get_text(strip=True) for div in soup.select("div.text.show-more__control")]
    except requests.exceptions.RequestException:
        return []


def tmdb_reviews(movie_id: str) -> List[str]:
    if not movie_id:
        return []
    url = (
        f"https://api.themoviedb.org/3/movie/{movie_id}/reviews"
        f"?api_key={TMDB_KEY}&language=en-US&page=1"
    )
    try:
        js = requests.get(url, timeout=10).json()
        return [itm["content"] for itm in js.get("results", [])]
    except requests.exceptions.RequestException:
        return []


def sentiment_dict(reviews: List[str]) -> Dict[str, str]:
    if not reviews:
        return {}
    preds = _clf.predict(_vectorizer.transform(reviews))
    return {rv: ("Good" if p else "Bad") for rv, p in zip(reviews, preds)}


def suggestions() -> List[str]:
    return _movies_df["movie_title"].str.capitalize().tolist()

# ──────────────────────────────────────────
# 3)  Flask app
# ──────────────────────────────────────────
app = Flask(__name__)


@app.route("/")
@app.route("/home")
def home() -> str:
    return render_template("home.html", suggestions=suggestions())


@app.route("/similarity", methods=["POST"])
def similarity_route() -> str:
    movie = request.form["name"].strip()
    recs  = recommendations(movie)
    return "---".join(recs) if recs else (
        "Sorry! The movie you requested is not in our database. "
        "Please check the spelling or try with some other movies"
    )


@app.route("/recommend", methods=["POST"])
def recommend() -> str:  # type: ignore[override]
    f = request.form

    # ── basic fields ─────────────────────
    title        = f["title"]
    imdb_id      = f["imdb_id"]
    poster       = f["poster"]
    genres       = f["genres"]
    overview     = f["overview"]
    vote_avg     = f["rating"]
    vote_cnt     = f["vote_count"]
    release_date = f["release_date"]
    runtime      = f["runtime"]
    status       = f["status"]
    movie_id     = f.get("movie_id", "")

    # ── lists from front‑end ─────────────
    rec_movies    = flask_json_list(f["rec_movies"])
    rec_posters   = flask_json_list(f["rec_posters"])
    cast_names    = flask_json_list(f["cast_names"])
    cast_chars    = flask_json_list(f["cast_chars"])
    cast_profiles = flask_json_list(f["cast_profiles"])
    cast_ids      = [cid.strip() for cid in f["cast_ids"].strip("[]").split(",")]
    cast_bdays    = flask_json_list(f["cast_bdays"])
    cast_bios     = flask_json_list(f["cast_bios"])
    cast_places   = flask_json_list(f["cast_places"])

    # ── reviews (IMDb → TMDB fallback) ───
    raw_reviews   = imdb_reviews(imdb_id) or tmdb_reviews(movie_id)
    movie_reviews = sentiment_dict(raw_reviews)

    # ── dicts for template ───────────────
    movie_cards = dict(zip(rec_posters, rec_movies))
    casts = {
        cast_names[i]: [cast_ids[i], cast_chars[i], cast_profiles[i]]
        for i in range(len(cast_profiles))
    }
    cast_details = {
        cast_names[i]: [
            cast_ids[i],
            cast_profiles[i],
            cast_bdays[i],
            cast_places[i],
            textwrap.shorten(cast_bios[i], 500, placeholder=" …"),
        ]
        for i in range(len(cast_bios))
    }

    return render_template(
        "recommend.html",
        title=title,
        poster=poster,
        overview=overview,
        vote_average=vote_avg,
        vote_count=vote_cnt,
        release_date=release_date,
        runtime=runtime,
        status=status,
        genres=genres,
        movie_cards=movie_cards,
        reviews=movie_reviews,
        casts=casts,
        cast_details=cast_details,
    )


if __name__ == "__main__":
    app.run(debug=True)
