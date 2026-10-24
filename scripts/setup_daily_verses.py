import os
import json
import sys

target_base = r'c:\my projects\Church App\bible-data'

with open(os.path.join(target_base, 'books.json'), encoding='utf-8') as f:
    books_meta = json.load(f)

book_by_name = {b['name']: b for b in books_meta}

core_verses_refs = [
    ('John', 3, 16),
    ('Psalms', 23, 1),
    ('Proverbs', 3, 5),
    ('Philippians', 4, 13),
    ('Jeremiah', 29, 11),
    ('Romans', 8, 28),
    ('Isaiah', 40, 31),
    ('Joshua', 1, 9),
    ('Psalms', 46, 1),
    ('Matthew', 11, 28),
    ('Romans', 12, 2),
    ('2 Timothy', 1, 7),
    ('Psalms', 119, 105),
    ('Proverbs', 16, 3),
    ('Galatians', 5, 22),
    ('Ephesians', 2, 8),
    ('1 Corinthians', 13, 4),
    ('Hebrews', 11, 1),
    ('James', 1, 5),
    ('1 Peter', 5, 7),
    ('Psalms', 27, 1),
    ('Isaiah', 41, 10),
    ('Matthew', 6, 33),
    ('John', 14, 6),
    ('Romans', 8, 38),
    ('2 Corinthians', 5, 17),
    ('Philippians', 4, 6),
    ('Colossians', 3, 23),
    ('1 Thessalonians', 5, 16),
    ('Psalms', 91, 1),
    ('Proverbs', 4, 23),
    ('Isaiah', 26, 3),
    ('Lamentations', 3, 22),
    ('Micah', 6, 8),
    ('Habakkuk', 3, 19),
    ('Zephaniah', 3, 17),
    ('Matthew', 5, 14),
    ('Matthew', 28, 19),
    ('Mark', 11, 24),
    ('Luke', 1, 37),
    ('John', 1, 1),
    ('John', 8, 12),
    ('John', 10, 10),
    ('John', 15, 5),
    ('Romans', 5, 8),
    ('Romans', 6, 23),
    ('Romans', 10, 9),
    ('1 Corinthians', 10, 13),
    ('2 Corinthians', 12, 9),
    ('Galatians', 2, 20),
    ('Ephesians', 6, 10),
    ('Philippians', 1, 6),
    ('Hebrews', 4, 16),
    ('Hebrews', 12, 2),
    ('James', 4, 8),
    ('1 John', 4, 19),
    ('Revelation', 3, 20),
    ('Psalms', 37, 4),
    ('Psalms', 100, 1),
    ('Genesis', 1, 1)
]

daily_verses = []
loaded_books = {}

for day in range(1, 367):
    ref_idx = (day - 1) % len(core_verses_refs)
    book_name, ch_num, v_num = core_verses_refs[ref_idx]
    b_meta = book_by_name[book_name]
    
    if book_name not in loaded_books:
        kjv_file_path = os.path.join(target_base, 'kjv', b_meta['kjvFile'])
        tel_file_path = os.path.join(target_base, 'telugu', b_meta['teluguFile'])
        with open(kjv_file_path, encoding='utf-8') as f:
            kjv_b = json.load(f)
        with open(tel_file_path, encoding='utf-8') as f:
            tel_b = json.load(f)
        loaded_books[book_name] = (kjv_b, tel_b)
    
    kjv_b, tel_b = loaded_books[book_name]
    
    kjv_ch = [c for c in kjv_b['chapters'] if str(c['chapter']) == str(ch_num)][0]
    kjv_v = [v for v in kjv_ch['verses'] if str(v['verse']) == str(v_num)][0]
    
    tel_ch = [c for c in tel_b['chapters'] if str(c['chapter']) == str(ch_num)][0]
    tel_v = [v for v in tel_ch['verses'] if str(v['verse']) == str(v_num)][0]
    
    daily_verses.append({
        'dayOfYear': day,
        'book': book_name,
        'bookSlug': b_meta['slug'],
        'teluguBook': b_meta['teluguName'],
        'chapter': ch_num,
        'verse': v_num,
        'referenceEn': f"{book_name} {ch_num}:{v_num}",
        'referenceTe': f"{b_meta['teluguName']} {ch_num}:{v_num}",
        'kjvText': kjv_v['text'],
        'teluguText': tel_v['text']
    })

out_path = os.path.join(target_base, 'daily-verses.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(daily_verses, f, indent=2, ensure_ascii=False)

print(f"Generated {len(daily_verses)} daily verses successfully.")
