import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# 1) Veriyi oku ─ dosya adını gerekirse değiştir
df = pd.read_csv('reviews.csv')          # 'review' ve 'sentiment' sütunları olmalı
X = df['review']
y = df['sentiment'].map({'positive': 1, 'negative': 0})  # etiketleri 1‑0'a çevir

# 2) Metni sayısallaştır
tfidf = TfidfVectorizer(stop_words='english', lowercase=True, max_features=30_000)
X_vec = tfidf.fit_transform(X)

# 3) Modeli eğit
X_train, X_test, y_train, y_test = train_test_split(X_vec, y, test_size=0.2, random_state=42)
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train, y_train)

# 4) Performansa bak (isteğe bağlı)
print(classification_report(y_test, clf.predict(X_test)))

# 5) Modeli ve vektörleyiciyi diske yaz
with open('nlp_model.pkl', 'wb') as f:
    pickle.dump(clf, f)

with open('transform.pkl', 'wb') as f:
    pickle.dump(tfidf, f)

print("✓ Kaydedildi: nlp_model.pkl  ve  transform.pkl")
