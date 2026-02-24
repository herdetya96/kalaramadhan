

## Plan: Migrate Quran Page to equran.id API v2 as Single Data Source

### Current State
The app makes **3 parallel API calls** per surah and **2+N calls** per juz:
- `api.alquran.cloud/v1/surah` -- surah list
- `api.alquran.cloud/v1/surah/{n}` -- Arabic text
- `api.alquran.cloud/v1/surah/{n}/id.indonesian` -- Indonesian translation
- `equran.id/api/v2/surat/{n}` -- transliteration only

### After Migration
**1 call** per surah, **1 call** for surah list:
- `equran.id/api/v2/surat` -- surah list (all 114)
- `equran.id/api/v2/surat/{n}` -- Arabic + translation + transliteration + audio in one response

### Changes in `src/pages/Quran.tsx`

**1. Update `Surah` interface** to match equran.id fields (`nomor`, `nama`, `namaLatin`, `jumlahAyat`, `tempatTurun`, `arti`)

**2. Update surah list fetch** (line 218): Replace `api.alquran.cloud/v1/surah` with `equran.id/api/v2/surat`, mapping response fields to the existing interface shape

**3. Update `loadSurah` function** (lines 229-273): Replace 3 parallel `Promise.all` calls with a single `fetch('https://equran.id/api/v2/surat/{n}')`. Map `teksArab` to `text`, `teksIndonesia` to `translation`, `teksLatin` to `transliteration`

**4. Update `loadJuz` function** (lines 280-330): Replace `api.alquran.cloud/v1/juz` calls. Since equran.id has no juz endpoint, load each surah in the juz range individually from equran.id and slice ayahs based on `JUZ_DATA` boundaries. This is already partially done (equran.id calls per surah), just remove the alquran.cloud juz calls

**5. Clear stale cache**: Add a migration key (`kala_quran_v2_migrated`) check on mount. If not set, clear old cache keys (`kala_quran_surahs`, `kala_quran_surah_*`) so fresh equran.id data is fetched

**6. Bismillah stripping**: The `stripBismillahFromAyah` function should still work since equran.id `teksArab` uses standard Arabic Unicode, but will need testing since the text encoding may differ slightly from alquran.cloud

### Data Mapping Reference

```text
equran.id v2 Surah List    →  App Interface
─────────────────────────────────────────
nomor                      →  number
nama                       →  name
namaLatin                  →  englishName
arti                       →  englishNameTranslation
jumlahAyat                 →  numberOfAyahs
tempatTurun                →  revelationType

equran.id v2 Ayat          →  App Interface
─────────────────────────────────────────
nomorAyat                  →  numberInSurah
teksArab                   →  text
teksIndonesia              →  translation
teksLatin                  →  transliteration
```

### Benefits
- 3x fewer network requests per surah view
- Single consistent data source
- Audio URLs available per ayat (ready for future audio feature)
- More up-to-date Indonesian translation text

### Risk
- Bismillah stripping regex may need adjustment for equran.id's text encoding (different diacritics than alquran.cloud's `quran-uthmani` edition)
- Juz mode becomes slightly more complex (multiple surah fetches instead of single juz endpoint)

### Files Modified
- `src/pages/Quran.tsx` -- all API calls, interfaces, data mapping, cache migration

