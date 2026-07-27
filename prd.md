# PRD — Pet Age Translator

## 1. Ringkasan Produk

**Nama:** Pet Age Translator
**Tipe:** Single-page widget, client-side, stateless
**Tujuan:** Mengonversi umur hewan peliharaan (dog, cat, rabbit, hamster, parrot) ke umur setara manusia menggunakan formula non-linear per spesies, lalu menampilkan label tahap kehidupan (life stage) dan kalimat flavour yang dipersonalisasi.

**Target pengguna:** Pemilik hewan peliharaan yang ingin tahu "umur manusia" hewannya secara cepat dan menghibur — bukan tools medis/veteriner.

**Non-goals:**
- Bukan aplikasi kesehatan hewan, tidak memberi saran veteriner
- Tidak menyimpan data pengguna (no login, no database, no localStorage antar sesi)
- Tidak mendukung spesies di luar 5 yang ditentukan di versi ini

---

## 2. User Flow

1. Pengguna membuka halaman → widget menampilkan state default (belum ada input, pet type default = Dog atau belum ada yang terpilih).
2. Pengguna memilih salah satu dari 5 tombol spesies.
3. Pengguna mengisi/mengubah angka umur pada input.
4. Sistem langsung (tanpa tombol submit) menghitung dan menampilkan:
   - Angka umur manusia setara
   - Label life-stage + badge warna/icon terkait
   - Kalimat flavour dinamis
5. Pengguna dapat mengganti spesies dan/atau umur kapan saja → hasil re-render instan.
6. Menutup/refresh halaman → semua state hilang (tidak ada yang disimpan).

---

## 3. Functional Requirements

### FR-1 — Species Selector
- Menyediakan 5 opsi: Dog, Cat, Rabbit, Hamster, Parrot.
- Hanya 1 spesies aktif pada satu waktu (single-select).
- Default state: tidak ada yang terpilih, ATAU salah satu terpilih default (Dog) — **keputusan produk: default ke Dog terpilih**, agar pengguna langsung melihat hasil tanpa perlu klik dua kali (pilih spesies + isi umur).
- Perubahan spesies memicu re-kalkulasi instan jika field umur sudah terisi.

### FR-2 — Age Input
- Input tipe number, menerima nilai desimal (contoh: 1.5 tahun) — **keputusan produk: dukung 1 desimal** agar lebih akurat untuk hewan kecil dengan siklus hidup pendek.
- Default value: kosong atau 1 (lihat FR-5 untuk empty state).
- Step buttons (+/-) mengubah nilai dengan increment 1 (atau 0.5 untuk hamster/rabbit — opsional, lihat §7 Open Questions).
- Validasi:
  - Nilai negatif → ditolak, input tidak berubah / reset ke 0.
  - Nilai 0 → valid, dianggap "baru lahir" (Newborn).
  - Nilai desimal absurd (contoh: 999) → dibatasi via `max` attribute sesuai lifespan wajar spesies terpilih (lihat FR-3 tabel batas).
  - Input non-numerik → dicegah oleh `type="number"`, tapi tetap divalidasi di JS untuk browser yang tidak strict.

### FR-3 — Formula Konversi (per spesies)

| Spesies | Formula | Batas umur wajar (max input) |
|---|---|---|
| Dog | Tahun 1 = 15, Tahun 2 = +9 (total 24), tahun ke-3 dst = +5/tahun | 25 tahun |
| Cat | Tahun 1 = 15, Tahun 2 = +9 (total 24), tahun ke-3 dst = +4/tahun | 25 tahun |
| Rabbit | Tahun 1 = 10, tahun ke-2 dst = +8/tahun | 12 tahun |
| Hamster | Tahun 1 = 20, tahun ke-2 dst = +18/tahun | 4 tahun |
| Parrot | Tahun 1 = 5, tahun ke-2 dst = +2.5/tahun | 80 tahun |

- Untuk nilai umur pecahan (contoh 2.5 tahun), interpolasi linear di antara dua titik tahun terdekat.
- Semua hasil dibulatkan ke bilangan bulat terdekat untuk tampilan (angka besar), tapi kalkulasi internal tetap pakai float agar transisi antar angka halus.

### FR-4 — Life Stage Mapping
Berdasarkan hasil umur manusia setara (bukan umur asli hewan):

| Rentang umur manusia | Life Stage | Grup Warna |
|---|---|---|
| 0–2 | Newborn | Young (hijau) |
| 3–12 | Toddler | Young (hijau) |
| 13–19 | Teenager | Mid (terracotta) |
| 20–34 | Young Adult | Mid (terracotta) |
| 35–54 | Middle-Aged | Mid (terracotta) |
| 55–74 | Senior | Senior (biru slate) |
| 75+ | Elder | Senior (biru slate) |

### FR-5 — Empty / Default State
- Saat pertama kali load, field umur kosong (bukan 0) → tampilkan placeholder pesan ramah, contoh: *"Masukkan umur untuk melihat hasilnya"*, angka hero tidak ditampilkan (atau ditampilkan sebagai dash `—`).
- Begitu pengguna mengetik angka valid pertama, area hasil muncul dengan animasi staggered (lihat design.md §7).

### FR-6 — Flavour Sentence
- Template dinamis: `"Your {age}-year-old {species} is basically a {humanAge}-year-old human — {stagePhrase}"`.
- `stagePhrase` adalah frasa pendek unik per life-stage (bukan cuma mengulang nama stage), contoh:
  - Newborn → "still figuring out the world!"
  - Toddler → "curious and full of energy!"
  - Teenager → "testing all the boundaries!"
  - Young Adult → "peak adulting!"
  - Middle-Aged → "wise and settled!"
  - Senior → "earned every gray hair!"
  - Elder → "a true legend!"
- Kalimat harus tetap gramatikal untuk edge case umur 0 dan 1 (contoh: "3-year-old" vs "1-year-old" — hindari "1-years-old").

### FR-7 — Statelessness
- Tidak ada penyimpanan data ke localStorage, sessionStorage, cookie, atau backend.
- Refresh halaman = kembali ke state default sepenuhnya.
- Tidak ada tracking/analytics personal (jika ada analytics agregat, harus anonim dan disebutkan — di luar scope versi ini, default: tidak ada analytics sama sekali).

---

## 4. Non-Functional Requirements

### NFR-1 — Performance
- Kalkulasi dan re-render harus terjadi dalam <16ms (1 frame) agar terasa instan; animasi count-up terpisah dari kalkulasi (kalkulasi instan, animasi visual saja yang butuh waktu 400-700ms).
- Tidak ada network request untuk fungsi inti (semua logika di client-side, murni JS).

### NFR-2 — Accessibility
- Semua tombol species selector memiliki `aria-label` (contoh: "Select Dog") dan `aria-pressed` state.
- Input umur memiliki `<label>` yang terasosiasi (bukan hanya placeholder).
- Kontras warna teks vs background minimal memenuhi WCAG AA (4.5:1 untuk teks normal).
- Tap target minimal 44x44px (sudah tercakup di design.md §8).
- Hasil (result region) menggunakan `aria-live="polite"` agar screen reader membacakan perubahan hasil tanpa perlu fokus manual.
- Semua interaksi bisa dilakukan via keyboard (tab ke species button → Enter/Space untuk pilih; tab ke input → panah atas/bawah untuk stepper jika didukung native).

### NFR-3 — Responsiveness
- Berfungsi baik di viewport 320px (mobile kecil) hingga desktop besar tanpa horizontal scroll.
- Detail responsive mengikuti design.md §8.

### NFR-4 — Browser Compatibility
- Berjalan baik di 2 versi terakhir Chrome, Firefox, Safari, Edge (evergreen browsers).
- Tidak bergantung pada fitur experimental/belum stabil.

### NFR-5 — Security & Hygiene
- Input umur di-sanitize sebelum digunakan dalam template string (hindari injection jika suatu saat kalimat flavour di-render sebagai HTML — gunakan textContent/React text node, bukan `dangerouslySetInnerHTML` atau `innerHTML` langsung dari input pengguna).
- Tidak ada dependency eksternal yang tidak perlu (minimalkan attack surface — idealnya zero-dependency atau dependency minimal untuk animasi).

### NFR-6 — Maintainability
- Formula konversi dan tabel life-stage disimpan sebagai data terpisah (config object/JSON), bukan hardcoded di dalam JSX/logic rendering — memudahkan penambahan spesies baru di masa depan.
- Komponen dipecah logis: `SpeciesSelector`, `AgeInput`, `ResultDisplay`, `LifeStageBadge`, `FlavourText` (jika pakai React) — bukan satu blok monolitik.

---

## 5. Edge Cases & Perilaku Off-Happy-Path

| Skenario | Perilaku yang diharapkan |
|---|---|
| Umur = 0 | Tampilkan hasil untuk Newborn, kalimat tetap gramatikal ("0-year-old") |
| Umur kosong (dihapus setelah diisi) | Kembali ke empty state (FR-5), bukan menampilkan hasil terakhir atau error |
| Umur negatif (diketik manual via keyboard, browser tidak strict) | Ditolak, clamp ke 0 |
| Umur melebihi batas wajar spesies (lihat FR-3) | Input di-clamp ke max, atau tampilkan pesan halus "That's older than most {species}s live!" tanpa mengganggu UX |
| Ganti spesies saat umur sudah melebihi batas wajar spesies baru (contoh: umur 20 di-input saat Dog, lalu pindah ke Hamster yang max 4 tahun) | Nilai di-clamp otomatis ke max spesies baru, field ter-update, hasil re-kalkulasi dengan nilai yang sudah di-clamp |
| Input desimal ekstrem (contoh: 1.9999) | Dibulatkan wajar saat interpolasi, hasil akhir tetap dibulatkan ke integer untuk tampilan |
| Resize browser saat hasil sedang tampil | Layout tetap utuh, tidak ada elemen terpotong, animasi tidak retrigger tanpa alasan |
| Pengguna klik spesies yang sama 2x | Tidak ada efek tambahan/toggle-off; tetap terpilih |
| JavaScript disabled | Di luar scope (widget ini murni client-side interaktif; tampilkan `<noscript>` fallback pesan singkat jika diperlukan) |

---

## 6. Acceptance Criteria

- [ ] Semua 5 spesies dapat dipilih dan menghasilkan kalkulasi berbeda sesuai formula FR-3
- [ ] Perubahan umur meng-update hasil secara instan tanpa perlu tombol submit
- [ ] Semua 7 life-stage dapat muncul sesuai rentang yang benar dan diuji dengan nilai batas (contoh: tepat di angka 2, 3, 12, 13, dst.)
- [ ] Kalimat flavour selalu gramatikal untuk semua kombinasi spesies + umur 0 s/d batas maksimal
- [ ] Tidak ada data yang tersisa setelah reload halaman (no localStorage/cookie check via devtools)
- [ ] Tidak ada emoji dalam DOM (semua icon adalah SVG/line-icon sesuai design.md)
- [ ] Widget dapat dioperasikan penuh via keyboard
- [ ] Kontras warna lolos cek WCAG AA
- [ ] Tidak ada horizontal scroll di viewport 320px–1920px
- [ ] Edge case di §5 sudah ditangani dan diuji manual

---

## 7. Open Questions (untuk keputusan lanjutan sebelum/selama implementasi)

1. Apakah step increment untuk hamster/rabbit perlu 0.5 (karena lifespan pendek), atau tetap 1 untuk semua spesies demi konsistensi UI?
2. Apakah perlu menampilkan umur asli hewan di dekat hasil (contoh: "3 tahun rabbit" sebagai reminder), atau cukup di kalimat flavour saja?
3. Apakah widget perlu mode "reset" eksplisit (tombol clear), atau cukup mengandalkan pengguna menghapus manual isi input?

Keputusan default (jika tidak dibahas lebih lanjut): step increment = 1 untuk semua spesies (konsistensi > presisi), umur asli hanya muncul di flavour text, tidak ada tombol reset terpisah (mengurangi elemen UI, sudah cukup dengan menghapus/mengubah input).

---

## 8. Out of Scope (versi ini)

- Multi-bahasa (UI hanya Bahasa Inggris sesuai brief awal)
- Penyimpanan riwayat perhitungan
- Spesies tambahan di luar 5 yang ditentukan
- Mode gelap (dark mode) — bisa jadi enhancement terpisah
- Backend/API — seluruh logika berjalan di client