import pandas as pd

# 1) TSV'yi oku  (ilk sütun: etiket, ikincisi: yorum)
df = pd.read_csv('reviews.txt',
                 sep='\t',          # tab ayırıcı
                 header=None,       # üstbilgi yok
                 names=['sent', 'review'])   # sütun adları

# 2) Etiketi metne çevir (1→positive, 0→negative)
label_map = {1: 'positive', 0: 'negative', '1': 'positive', '0': 'negative'}
df['sentiment'] = df['sent'].map(label_map)

# 3) Yalnızca gereken iki sütunu tut ve CSV olarak kaydet
df[['review', 'sentiment']].to_csv('reviews.csv', index=False)
print("✓ Oluşturuldu: reviews.csv  (satır sayısı:", len(df), ")")
