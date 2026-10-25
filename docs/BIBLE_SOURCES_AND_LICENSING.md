# Bible Sources, Translation Identity, and Licensing Documentation

## 1. Overview
This church website Bible feature provides dual-translation Scripture access in **English (King James Version - KJV)** and **Telugu (పరిశుద్ధ గ్రంథము - The Holy Bible in Telugu)**.

All Bible data is stored locally in `bible-data/` and all Bible functionality is isolated in the dedicated `bible/` module.

---

## 2. Source Repositories & Provenance

### 2.1 English Bible (King James Version)
- **Source Repository**: [https://github.com/aruljohn/Bible-kjv](https://github.com/aruljohn/Bible-kjv)
- **Curator / Author**: Arul John (Copyright © 2019 Arul John)
- **License**: MIT License (Permissive open-source license permitting copying, modification, merging, publishing, distributing, and commercial use with attribution).
- **Textual Origin**: The King James Version (Authorized Version) originally completed in 1611. In the public domain globally (Crown copyright in the UK applies only to reproduction within the UK).
- **Structure**: 66 individual book JSON files plus `Books.json`.

### 2.2 Telugu Bible (పరిశుద్ధ గ్రంథము)
- **Source Repository**: [https://github.com/aruljohn/Bible-telugu](https://github.com/aruljohn/Bible-telugu)
- **Curator / Author**: Arul John (Copyright © 2021 Arul John)
- **License**: MIT License (Permissive open-source license permitting copying, modification, merging, publishing, distributing, and commercial use with attribution).
- **Translation Identity**: Standard Protestant Telugu Bible (పరిశుద్ధ గ్రంథము), historically translated by Benjamin Schultze, John Gordon, Edward Pritchett, Benjamin Hay, and the British and Foreign Bible Society / Bible Society of India (BSI).
- **Unicode Support**: Complete Telugu Unicode script (`U+0C00` to `U+0C7F`) covering all consonants, independent vowels, matras, virama, and complex conjuncts (వత్తులు).
- **Structure**: 66 individual book JSON files plus `Books.json`.

---

## 3. Data Integrity & Validation Report

An automated validation suite was executed across all books, chapters, and verses (`test/validate-bible-data.js`).

| Metric | English KJV | Telugu Bible | Status |
|---|---|---|---|
| **Canonical Books** | 66 (39 OT, 27 NT) | 66 (39 OT, 27 NT) | 100% Parity |
| **Total Chapters** | 1,189 | 1,189 | 100% Parity |
| **Total Verses** | 31,102 | 31,102 | 100% Parity |
| **Old Testament Verses** | 23,145 | 23,145 | 100% Parity |
| **New Testament Verses** | 7,957 | 7,957 | 100% Parity |
| **Encoding** | UTF-8 | UTF-8 (Telugu Script) | Clean |

### Transcription Anomaly Detected & Resolved
During automated validation, verse `2 Chronicles 35:27` in the raw repository was flagged as having empty text because verses 26 and 27 were concatenated together in verse 26's slot with a delimiter character (`ఒ`).
- **Resolution**: Without inventing any words or altering translation meaning, the existing text in verse 26 was cleanly separated at the delimiter:
  - **Verse 26**: `​యోషీయా చేసిన యితర కార్యములన్నిటిని గూర్చియు, యెహోవా ధర్మ శాస్త్రవిధుల ననుసరించి అతడు చూపిన భయభక్తులను గూర్చియు,`
  - **Verse 27**: `అతడు చేసిన సమస్త క్రియలను గూర్చియు ఇశ్రాయేలు యూదారాజుల గ్రంథమందు వ్రాయబడి యున్నది.`
- Following this adjustment, all 31,102 verses in both translations are 100% populated and verified.

---

## 4. Licenses

### MIT License for aruljohn/Bible-kjv
```
MIT License

Copyright (c) 2019 Arul John

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### MIT License for aruljohn/Bible-telugu
```
MIT License

Copyright (c) 2021 Arul John

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 5. Offline Reading & Privacy Policy
- **No User Account Requirement**: Bible bookmarks and reading progress are stored locally on the user's client device using `localStorage` and `IndexedDB`.
- **Offline Storage**: The Service Worker caches application assets and requested Bible book data in Cache API (`church-bible-v1`), enabling offline Scripture reading, book navigation, and offline search.
