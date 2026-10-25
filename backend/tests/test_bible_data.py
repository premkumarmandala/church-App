"""Validation test suite ensuring 100% integrity of Bible datasets."""
import json
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings


def test_books_metadata_integrity():
    """Verify books.json exists and has exactly 66 canonical books."""
    books_file = settings.DATA_DIR / "books.json"
    assert books_file.exists(), "books.json must exist in data directory"

    with open(books_file, "r", encoding="utf-8") as f:
        books = json.load(f)

    assert len(books) == 66, f"Expected 66 books, found {len(books)}"

    ot_books = [b for b in books if b.get("testament") == "OT"]
    nt_books = [b for b in books if b.get("testament") == "NT"]

    assert len(ot_books) == 39, f"Expected 39 OT books, found {len(ot_books)}"
    assert len(nt_books) == 27, f"Expected 27 NT books, found {len(nt_books)}"


def test_kjv_and_telugu_data_parity():
    """Verify every book has valid KJV and Telugu files, matching chapter & verse counts."""
    books_file = settings.DATA_DIR / "books.json"
    with open(books_file, "r", encoding="utf-8") as f:
        books = json.load(f)

    total_kjv_verses = 0
    total_telugu_verses = 0

    for b in books:
        kjv_path = settings.DATA_DIR / "kjv" / b["kjvFile"]
        tel_path = settings.DATA_DIR / "telugu" / b["teluguFile"]

        assert kjv_path.exists(), f"Missing KJV file: {kjv_path}"
        assert tel_path.exists(), f"Missing Telugu file: {tel_path}"

        with open(kjv_path, "r", encoding="utf-8") as kf:
            kjv_data = json.load(kf)
        with open(tel_path, "r", encoding="utf-8") as tf:
            tel_data = json.load(tf)

        kjv_chapters = kjv_data.get("chapters", [])
        tel_chapters = tel_data.get("chapters", [])

        assert len(kjv_chapters) == b["chaptersCount"], (
            f"{b['name']}: KJV chapters ({len(kjv_chapters)}) != expected ({b['chaptersCount']})"
        )
        assert len(kjv_chapters) == len(tel_chapters), (
            f"{b['name']}: Chapter parity mismatch KJV={len(kjv_chapters)}, Telugu={len(tel_chapters)}"
        )

        for c_idx in range(len(kjv_chapters)):
            k_verses = kjv_chapters[c_idx].get("verses", [])
            t_verses = tel_chapters[c_idx].get("verses", [])

            assert len(k_verses) == len(t_verses), (
                f"{b['name']} ch {c_idx+1}: Verse count mismatch KJV={len(k_verses)}, Telugu={len(t_verses)}"
            )

            total_kjv_verses += len(k_verses)
            total_telugu_verses += len(t_verses)

    assert total_kjv_verses == 31102, f"Expected 31,102 KJV verses, found {total_kjv_verses}"
    assert total_telugu_verses == 31102, f"Expected 31,102 Telugu verses, found {total_telugu_verses}"


def test_daily_verses_dataset():
    """Verify daily-verses.json contains entries for devotional reading."""
    daily_file = settings.DATA_DIR / "daily-verses.json"
    assert daily_file.exists(), "daily-verses.json must exist"

    with open(daily_file, "r", encoding="utf-8") as f:
        daily_verses = json.load(f)

    assert len(daily_verses) >= 365, f"Expected >=365 daily verses, found {len(daily_verses)}"

    first = daily_verses[0]
    assert "kjvText" in first and len(first["kjvText"]) > 0
    assert "teluguText" in first and len(first["teluguText"]) > 0
    assert "referenceEn" in first
    assert "referenceTe" in first
