# Pet Age Translator — Design Specification

## 1. Konsep & Arah Desain

**Nama produk:** Pet Age Translator
**Tagline:** "How old is your pet, really?"

**Big idea:** Widget ini bukan kalkulator kering. Ini dibuat terasa seperti membuka "kartu identitas" hewan peliharaan — hangat, personal, sedikit editorial (seperti majalah gaya hidup), bukan seperti dashboard SaaS generik.

**Yang membuat desain generik terlihat generik (dihindari):**
- Card putih polos di tengah background gelap/gradient ungu-biru default AI tools
- Icon emoji atau flat-illustration berwarna-warni tanpa sistem
- Semua tombol sama besar, sama warna, tanpa hierarki fokus
- Font default (Inter/Roboto) tanpa karakter
- Shadow abu-abu generik, border-radius seragam 8px di semua elemen

**Arah yang diambil sebagai gantinya:** *"Warm Field Journal"* — seolah widget ini adalah halaman dari jurnal dokter hewan yang didesain ulang secara modern: kertas hangat, tinta gelap, satu warna aksen berani, tipografi dengan karakter (serif untuk angka besar + sans untuk UI), dan elemen digambar tangan-tipis (bukan flat generik).

---

## 2. Sistem Warna

Bukan palet pastel generik — pakai kontras warna yang lebih berani dan personal.

| Token | Hex | Penggunaan |
|---|---|---|
| `--bg-paper` | `#F6F1E7` | Background utama, seperti kertas krem tua |
| `--bg-paper-shade` | `#EDE4D3` | Gradient halus di background, tekstur kertas |
| `--ink` | `#22201D` | Teks utama, hampir hitam kehangatan |
| `--ink-soft` | `#6B6459` | Teks sekunder |
| `--accent-primary` | `#C1442D` | Warna aksen utama — terracotta/rust merah bata, bukan merah generik |
| `--accent-primary-dark` | `#9C3520` | Hover/pressed state |
| `--stage-young` | `#4A7A63` | Grup life-stage muda (hijau hutan tua) |
| `--stage-mid` | `#C1442D` | Grup life-stage tengah (pakai accent primary) |
| `--stage-senior` | `#3D5A73` | Grup life-stage senior (biru slate gelap) |
| `--line` | `#D8CDB8` | Border/divider, warna garis kertas |

Catatan: hindari warna neon/pastel cerah khas "AI generated". Semua warna di-desaturasi sedikit (agak muted) supaya terasa dicetak, bukan digital murni.

---

## 3. Tipografi

- **Angka hasil (hero number):** `Fraunces` (serif variable font, optical size besar, italic-capable) — ukuran 88–96px di desktop, 64px di mobile. Ini satu-satunya elemen serif di halaman → jadi fokus visual yang kuat.
- **Judul & label UI:** `Space Grotesk` — sans-serif dengan karakter sedikit teknis/editorial, bukan generik seperti Inter.
- **Body/flavour text:** `Newsreader` italic untuk kalimat flavour (terasa seperti kutipan jurnal), `Space Grotesk` regular untuk label kecil.

Skala tipografi (rem, base 16px):
```
--text-xs: 0.75rem    (label kecil, footer)
--text-sm: 0.875rem   (label input)
--text-base: 1rem     (body)
--text-lg: 1.25rem    (flavour sentence)
--text-hero: 5.5rem   (angka hasil, desktop)
--text-hero-mobile: 3.5rem
```

---

## 4. Layout & Struktur

Single page, tidak ada card kotak dengan shadow generik. Sebagai gantinya: **panel dengan border tipis bertekstur** seperti kartu indeks/kartu perpustakaan lama.

```
┌─────────────────────────────────────────┐
│  ● PET AGE TRANSLATOR         (eyebrow)  │
│                                           │
│  Pilih hewan peliharaanmu                │
│  [🐾][🐾][🐾][🐾][🐾]  ← selector icon    │
│   Dog Cat Rbt Hms Prt                    │
│  ─────────────────────────────           │
│                                           │
│      Umurnya berapa tahun?               │
│         ⌐  3  ⌐   (stepper, underline)   │
│                                           │
│  · · · · · · · · · · · · (dotted rule)   │
│                                           │
│           26                             │
│        human years                       │
│                                           │
│      [ ◈ Young Adult ]  ← pill badge     │
│                                           │
│   "Umur 3 tahun kelincimu setara         │
│    26 tahun manusia — usia paling        │
│    produktif!"                           │
│                                           │
│  Hanya untuk hiburan. Tidak disimpan.    │
└─────────────────────────────────────────┘
```

**Container:** max-width 460px, padding 40px (desktop) / 24px (mobile), border 1px solid `--line`, border-radius 20px (bukan 8px generik — sudut lebih besar terasa lebih "buatan tangan lembut"), background `--bg-paper` dengan sedikit noise texture (bisa pakai SVG noise filter halus, opacity 3-4%).

**Tidak pakai drop-shadow standar** — pakai *offset border ganda* (double-line frame), contoh: outer border 1px `--line`, inner offset 6px dengan border tipis lagi warna `--accent-primary` opacity rendah. Ini menciptakan efek "kartu dicetak" bukan efek "card mengambang" generik.

---

## 5. Komponen Detail

### 5.1 Species Selector
- 5 tombol berbentuk **stempel bulat** (bukan pill kotak): lingkaran diameter 56px (mobile: 48px), border 1.5px `--ink`, icon di tengah berupa line-icon custom (lihat §6).
- State default: background transparan, icon warna `--ink-soft`.
- State selected: background `--accent-primary`, icon putih, muncul **garis bawah pendek** (seperti coretan pensil) di bawah lingkaran sebagai penanda tambahan (bukan cuma ganti warna — supaya lebih personal/hand-drawn feel).
- Label nama spesies muncul di bawah HANYA untuk yang selected, dengan animasi fade+slide up.
- Transisi antar state: 200ms ease-out, sedikit scale (0.96 → 1.04 → 1.0) untuk efek "tap yang memuaskan".

### 5.2 Age Input
- Bukan boxed input — garis bawah saja (underline style), angka besar center-aligned, font `Space Grotesk` medium, ukuran 2rem.
- Stepper +/- berupa tanda kurung sudut tipis `⌐` `⌐` (bukan icon plus/minus generik), bisa juga custom SVG bracket, diletakkan kiri-kanan angka dengan jarak cukup agar tidak terlihat sesak.
- Label "years" kecil di bawah dengan letter-spacing lebar, uppercase, warna `--ink-soft`.
- Focus state: garis bawah berubah warna jadi `--accent-primary`, tebal dari 1px → 2px dengan transisi halus.

### 5.3 Divider
- Bukan garis solid horizontal biasa — pakai **dotted rule** dengan spacing tidak seragam (radius dot bervariasi 1-2px) untuk kesan "digambar", lebar penuh container, margin vertikal 24px.

### 5.4 Result Display
- Angka hero: font Fraunces, weight 500, warna `--ink`, dengan count-up animation (ease-out, durasi 500-700ms, easing seperti odometer — bukan linear).
- Saat angka berubah, tampilkan **micro-underline sapuan** (garis tipis `--accent-primary` yang muncul lalu memudar di bawah angka) sebagai penekanan transisi, bukan sekadar fade angka.
- Label "human years" kecil, uppercase, letter-spacing 0.1em, warna `--ink-soft`, jarak rapat ke angka (8px) supaya terasa satu kesatuan.

### 5.5 Life-Stage Badge
- Bentuk pill asimetris sedikit (border-radius kiri-kanan tidak identik, misal 18px/22px) — detail kecil yang menghindari kesan "generated perfectly symmetric".
- Isi: icon kecil + teks nama stage, warna badge mengikuti grup (`--stage-young` / `--stage-mid` / `--stage-senior`).
- Mapping 7 stage ke 3 grup warna (supaya sistem warna tetap terbatas & kohesif, bukan 7 warna berbeda):
  - Newborn, Toddler → `--stage-young` (hijau hutan)
  - Teenager, Young Adult, Middle-Aged → `--stage-mid` (terracotta)
  - Senior, Elder → `--stage-senior` (biru slate)
- Transisi antar badge: cross-fade warna + icon swap dengan sedikit rotate-in (8deg → 0deg) pada icon, durasi 300ms.

### 5.6 Flavour Sentence
- Font `Newsreader` italic, ukuran `--text-lg`, warna `--ink-soft`, max-width 32ch supaya line-length nyaman dibaca, center-aligned.
- Muncul dengan fade+slide up 150ms setelah badge muncul (staggered animation, bukan semua elemen muncul bersamaan — ini penting untuk kesan "dirancang", bukan "di-render sekaligus").

### 5.7 Footer
- Teks kecil `--text-xs`, warna `--ink-soft`, opacity 70%, center-aligned, margin-top 32px.

---

## 6. Sistem Ikon

**Aturan tegas: tidak ada emoji.** Semua ikon adalah custom line-icon, stroke-width konsisten 1.5px, style "sketch-line" (ujung garis sedikit membulat, bukan tajam sempurna — seperti digambar dengan pena tinta tipis).

Rekomendasi: buat sendiri sebagai inline SVG (bukan icon library generik seperti Font Awesome default), supaya style tetap unik dan konsisten. Basis bentuk: outline kepala hewan, sangat minimal (5-8 stroke path per icon).

**Icon spesies (bentuk kepala, minimal):**
- Dog → outline kepala dengan telinga terkulai
- Cat → outline kepala segitiga dengan telinga runcing + 2 garis kumis tipis
- Rabbit → outline kepala dengan 2 telinga panjang tegak
- Hamster → outline kepala bulat kecil, tanpa telinga menonjol
- Parrot → outline kepala dengan paruh melengkung

**Icon life-stage (abstrak, bukan literal):**
- Newborn → titik kecil dengan 3 garis pancar pendek (seperti kuncup)
- Toddler → dua persegi kecil bertumpuk (blok susun)
- Teenager → garis zigzag energik pendek
- Young Adult → panah diagonal ke atas
- Middle-Aged → garis horizontal dengan lingkaran kecil di tengah (seperti cangkir dari atas)
- Senior → garis lengkung horizon dengan setengah lingkaran
- Elder → bentuk daun/laurel sederhana, 2 goresan melengkung

---

## 7. Motion & Micro-interaction

Prinsip: animasi tidak serentak, staggered, dan easing custom (bukan default ease-in-out linear semua elemen).

| Elemen | Trigger | Animasi |
|---|---|---|
| Species button | Klik | Scale bounce 0.96→1.04→1.0, 250ms |
| Species button | Selected | Underline coret muncul, width 0→100%, 200ms delay 100ms |
| Age input | Ubah nilai | Angka lama fade+slide out atas, angka baru slide in dari bawah, 200ms |
| Result number | Ubah nilai | Count-up animasi (bukan langsung ganti angka), 600ms ease-out |
| Result number | Muncul pertama | Underline sapuan muncul-hilang di bawah angka, 400ms |
| Badge | Ganti stage | Cross-fade warna + icon rotate-in 8deg→0deg, 300ms |
| Flavour text | Setelah badge | Fade + translateY(8px→0), delay 150ms dari badge |
| Seluruh hasil | Input pertama kali diisi | Staggered reveal: angka → label → badge → flavour, masing-masing delay +80ms |

---

## 8. Responsive Behavior

- **Desktop (≥768px):** container 460px center, padding 40px, angka hero 96px.
- **Mobile (<768px):** container full-width dengan margin 16px, padding 24px, angka hero 64px, species selector tetap 1 baris (icon diperkecil ke 44px, cukup untuk touch target dengan sedikit gap 8px).
- Semua tap target minimal 44x44px sesuai standar aksesibilitas mobile.
- Font scaling pakai `clamp()` agar transisi antar breakpoint halus, bukan patah di breakpoint tertentu.

---

## 9. Formula Konversi (referensi implementasi, bukan bagian visual tapi penting untuk fungsi)

| Spesies | Formula |
|---|---|
| Dog | Tahun 1 = 15, Tahun 2 = +9 (total 24), tahun berikutnya +5/tahun |
| Cat | Tahun 1 = 15, Tahun 2 = +9 (total 24), tahun berikutnya +4/tahun |
| Rabbit | Tahun 1 = 10, tahun berikutnya +8/tahun (lifespan lebih pendek, skala dipercepat) |
| Hamster | Tahun 1 = 20, tahun berikutnya +18/tahun (lifespan sangat pendek ~2-3 tahun) |
| Parrot | Tahun 1 = 5, tahun berikutnya +2.5/tahun (lifespan panjang, skala diperlambat) |

**Life-stage mapping (berdasarkan human-year hasil, berlaku sama untuk semua spesies setelah konversi):**
- 0–2 → Newborn
- 3–12 → Toddler
- 13–19 → Teenager
- 20–34 → Young Adult
- 35–54 → Middle-Aged
- 55–74 → Senior
- 75+ → Elder

---

## 10. Ringkasan Prinsip Anti-Generik

Checklist singkat untuk memvalidasi hasil desain/kode akhir tidak terasa "AI-generated default":

- [ ] Tidak ada emoji di manapun
- [ ] Tidak ada card putih polos dengan drop-shadow abu-abu standar
- [ ] Tidak ada border-radius seragam 8px/12px di semua elemen (variasikan)
- [ ] Font bukan Inter/Roboto/Arial default
- [ ] Palet warna maksimal 4-5 hue, tidak rainbow
- [ ] Animasi staggered, bukan semua elemen muncul/berubah bersamaan
- [ ] Ada minimal 1 elemen "signature detail" yang bukan hasil template (contoh: underline coretan, dotted rule tidak seragam, double-border frame)