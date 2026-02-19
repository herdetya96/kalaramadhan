
# Bookmark Ayat / Last Read Marker

## Overview
Add the ability for users to tap on any ayah card to mark it as their "last read" bookmark. This saves the exact surah and ayah number so they can continue reading from that specific verse later.

## How It Works
1. **Tap an ayah card** -- a small bookmark icon appears on the marked ayah, and a toast notification confirms "Terakhir dibaca disimpan"
2. **Only one bookmark at a time** -- tapping a new ayah replaces the previous bookmark
3. **"Lanjut Membaca" card updated** -- the card on the surah list screen now shows both the surah name AND the specific ayah number (e.g., "Surah Al-Baqarah, Ayat 142")
4. **Auto-scroll on resume** -- when the user taps "Lanjut Membaca", the page loads the surah and automatically scrolls to the bookmarked ayah

## Visual Design
- The bookmarked ayah card gets a subtle green left border to distinguish it
- A small Bookmark icon appears next to the ayah number badge
- The ayah number badge background changes to green (#38CA5E) with white text for the marked ayah
- A sonner toast confirms the action

## Technical Details

### Storage
- Reuse existing `kala_quran_progress` localStorage key
- Update `saveQuranProgress` to always save the specific ayah number (currently it hardcodes `1`)
- The progress object stays `{ lastSurah: number, lastAyah: number }`

### Changes to `src/pages/Quran.tsx`
1. Add `Bookmark` icon import from lucide-react
2. Add state `bookmarkedAyah` initialized from `getQuranProgress()` to track the currently marked ayah
3. Add `handleBookmark(surahNum, ayahNum)` function that calls `saveQuranProgress` and updates state
4. Make each ayah card clickable -- on tap, call `handleBookmark`
5. Conditionally style the bookmarked ayah (green border + bookmark icon + green badge)
6. Update the "Lanjut Membaca" card subtitle to show "Surah X, Ayat Y"
7. After loading a surah, use `setTimeout` + `scrollIntoView` to scroll to the bookmarked ayah (using a ref or element ID)
8. Add `id={`ayah-${ayah.numberInSurah}`}` to each ayah card for scroll targeting

### Toast
- Import `toast` from `sonner` to show a brief confirmation message when bookmarking
