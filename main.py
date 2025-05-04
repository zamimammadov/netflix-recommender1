from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    suggestions = ["Inception", "Interstellar", "Matrix", "Avengers", "Tenet"]  # <<< BURASI EKLENDİ

    return render_template(
        "home.html",
        title="Inception",
        poster="https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
        overview="Bir hırsız, insanların rüyalarına girerek sır çalmakta uzmanlaşmıştır.",
        vote_average=8.8,
        vote_count=10000,
        genres="Aksiyon, Bilim Kurgu",
        release_date="2010-07-16",
        runtime="148 dk",
        status="Released",
        cast_details={},
        casts={},
        reviews={},
        movie_cards={},
        suggestions=suggestions  # <<< BURAYA EKLEMEK ŞART
    )

if __name__ == "__main__":
    app.run(debug=True)
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    suggestions = ["Inception", "Interstellar", "Matrix", "Avatar", "Tenet"]
    return render_template("home.html",
                           title="Inception",
                           poster="https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
                           overview="Bir hırsız, insanların rüyalarına girerek sır çalmakta uzmanlaşmıştır.",
                           vote_average=8.8,
                           vote_count=10000,
                           genres="Aksiyon, Bilim Kurgu",
                           release_date="2010-07-16",
                           runtime="148 dk",
                           status="Released",
                           cast_details={},
                           casts={},
                           reviews={},
                           movie_cards={},
                           suggestions=suggestions)

# ✅ BU KISMI EKLE
@app.route("/recommend", methods=["POST"])
def recommend():
    movie = request.form.get("movie")
    
    # Buraya örnek olarak sabit veri döndürüyoruz.
    # Gerçek projede bu kısımda öneri algoritması olur.
    return jsonify({
        "success": True,
        "title": movie,
        "poster": "https://image.tmdb.org/t/p/w500/example.jpg",
        "overview": f"{movie} için açıklama örneği.",
        "vote_average": 7.5,
        "vote_count": 2000,
        "genres": "Bilim Kurgu",
        "release_date": "2020-01-01",
        "runtime": "120 dk",
        "status": "Released"
    })

if __name__ == "__main__":
    app.run(debug=True)
