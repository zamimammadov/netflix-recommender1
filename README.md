
# NextOnNetflix

Lightweight Flask application that recommends **five similar movies** using
content‑based filtering, displays cast information, and classifies IMDb/TMDB
user reviews into Good/Bad sentiment.

> Coursework – Object‑Oriented Programming (Python)  
> Vilnius University, Spring 2025

---

## 1. Features

* **Instant search + autocomplete** (AutoComplete.js, 100 ms debounce)
* **Content‑based recommender** – CountVectorizer + cosine similarity
* **Cast modals** with biography, birthday, and place of birth
* **User‑review sentiment analysis** (Multinomial Naïve Bayes)
* Responsive UI (Bootstrap 4) & dark‑theme Netflix styling

---

## 2. Demo 

![image](https://github.com/user-attachments/assets/c6c046fd-1e42-4c2e-8bc5-520f8f9a3329)



---

## 3. Project structure

```

nextonnetflix/
├─ app.py                # Flask entry‑point
├─ models/               # pickled ML artefacts
│  ├─ nlp\_model.pkl
│  └─ transform.pkl
├─ static/               # CSS, JS, images, loader.gif
├─ templates/            # Jinja2 HTML
├─ tests/                # pytest smoke tests
├─ notebooks/EDA.ipynb   # full data‑prep & exploration
├─ requirements.txt
├─ .env.example
└─ README.md

````

---

## 4. Quick start

### 4.1 Prerequisites

* Python **3.11**  
* `pip` ≥ 23.0  
* (Optionally) `virtualenv` or `python -m venv`

### 4.2 Installation

```bash
# 1. clone repo or download ZIP
git clone https://github.com/YOUR_USERNAME/nextonnetflix.git
cd nextonnetflix

# 2. create & activate virtual environment (Windows PowerShell shown last)
python -m venv venv
source venv/bin/activate      # macOS/Linux
# .\venv\Scripts\activate     # Windows

# 3. install dependencies
pip install -r requirements.txt
````

### 4.3 Environment variables

Create a `.env` file from the template and paste your **TMDB API key**:

```bash
cp .env.example .env
# open .env and set
TMDB_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4.4 Run (development)

```bash
# Flask 2.3's new dispatcher
flask --app app run --debug
# > http://127.0.0.1:5000  ← open in browser
```

### 4.5 Run (production)

```bash
gunicorn -w 4 app:app
```

---

## 5. Testing

```bash
pytest -q          # should print "31 passed"
```

---

## 6. Data & Models

* **`main_data.csv`** – 4 803 movies, 27 columns – cleaned dataset
* **`nlp_model.pkl`** – Naïve Bayes classifier for review sentiment
* **`transform.pkl`** – fitted CountVectorizer (unigram + bigram)
* **`similarity.npy`** *(generated on first run)* – cosine similarity matrix

Full exploratory analysis and cleaning steps live in
[`notebooks/EDA.ipynb`](notebooks/EDA.ipynb).

---

## 7. Known limitations

* Pure content‑based; no collaborative signals (cold‑start for users)
* TMDB free tier → 40 requests per 10 s – heavy load may throttle
* Memory footprint \~180 MiB (similarity matrix held in RAM per worker)
  
---

## 8. Licence & Credits

MIT Licence – see `LICENSE`.
© 2025 *Zamin Mammadov* – built for the “Object‑Oriented Programming” coursework at
Vilnius University.




