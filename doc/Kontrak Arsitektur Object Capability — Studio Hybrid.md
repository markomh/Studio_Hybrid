# Kontrak Arsitektur Object Capability — Studio Hybrid

**Sumber:** `AUDIT_ARSITEKTUR_CONTROL_CAPABILITY.md` (audit forensik FloatingToolbar vs ContextInspector) **Cakupan:** `FloatingToolbar.tsx`, `ContextInspector.tsx`, `ElementRegistry.ts`, `CanvasWorkspace.tsx`, `App.tsx`, `src/types/index.ts`, `src/registry/types.ts` **Status:** Keputusan K-1 sampai K-4 terkonfirmasi; siap untuk Patch 1

---

## 1. Tujuan dan Ruang Lingkup

Kontrak ini mengubah temuan audit menjadi aturan yang mengikat bagi implementasi. Tujuannya empat hal:

1. Menghapus *capability leak*: kontrol milik satu tipe objek tidak boleh muncul pada tipe lain.
2. Menjadikan `ElementRegistry` satu-satunya sumber kebenaran atas kemampuan objek, sehingga UI berhenti menebak tipe lewat pencocokan string.
3. Menjamin hasil di kanvas sama dengan hasil ekspor PDF.
4. Menyiapkan slot ekstensi untuk Calendar, Tracker/Habit, Planner, Photo Editor, dan Shape tanpa mengubah komponen UI inti.

**Di luar cakupan:** perubahan skema data proyek yang tersimpan, redesain visual toolbar/inspector, dan implementasi tipe baru (Calendar, Tracker, Shape). Tipe baru hanya dicadangkan slotnya.

---

## 2. Ringkasan Temuan yang Menjadi Dasar Kontrak

| Kode | Prioritas | Temuan | Bukti |
| :-- | :-- | :-- | :-- |
| F-01 | P0 | Status solusi labirin terpisah dari skema. Kanvas membaca *local state*, PDF tidak merender garis solusi sama sekali. | `CanvasWorkspace.tsx` baris 102 dan 173; `ElementRegistry.ts` baris 266–270 dan `renderPdf` baris 296–347 |
| F-02 | P1 | `isVisual` menyamakan `image` dengan seluruh `puzzle`, sehingga kontrol warna dan tebal dinding labirin muncul pada stiker, Word Search, dan Sudoku. | `FloatingToolbar.tsx` baris 147 dan 371–450 |
| F-03 | P1 | Tombol Flip Horizontal muncul pada puzzle labirin, padahal generator dan renderer tidak mendukung cermin. | `FloatingToolbar.tsx` baris 452–464 |
| F-04 | P2 | Tombol regenerasi ada di toolbar dan inspector dengan label dan ikon berbeda. | Toolbar baris 360–369; Inspector baris 283–305 |
| F-05 | P2 | Belum ada tipe `shape`; slot fill dan stroke belum tersedia. | `src/types/index.ts` baris 100 |
| F-06 | P3 | Props longgar dan tidak terpakai. | `FloatingToolbar.tsx` baris 40 dan 42 |

---

## 3. Prinsip dan Invarian (Wajib Dipatuhi)

**I-1. Registry sebagai sumber kapabilitas.** Komponen UI menentukan kontrol yang tampil dari `ElementRegistry.get(type, subType).capabilities`, bukan dari kondisi `activeElement.type === '...'`.

**I-2. Aksi universal selalu ada di FloatingToolbar.** Lock/Unlock, Duplicate, Delete, dan Layer Reorder wajib tersedia di toolbar, karena `ContextInspector` di-unmount saat `focusMode === true` (`App.tsx` baris 1049 dan 1173) sedangkan toolbar tetap aktif.

**I-3. Satu jalur mutasi.** Semua perubahan elemen melewati handler kanonis di `App.tsx` (`handleUpdateCanvasElement`, `handleDeleteElement`, `handleDuplicateElement`, `handleReorderElement`, `handleToggleLockElement`) sehingga tercatat di `commandManagerRef` untuk Undo/Redo. Komponen UI tidak boleh memutasi state langsung.

**I-4. Tidak ada injeksi properti asing.** Mengubah kontrol pada satu tipe tidak boleh menulis properti milik tipe lain (contoh: `mazeConfig` ke elemen `image`).

**I-5. Satu sumber data per properti.** Setiap properti memiliki tepat satu lokasi kebenaran. Nilai turunan atau *local state* tidak boleh menimpa nilai pada elemen atau halaman.

**I-6. Paritas kanvas–PDF.** Apa yang tampil sebagai hasil pada kanvas (misalnya jalur solusi) harus muncul pula pada ekspor PDF dengan kondisi aktif yang sama.

**I-7. Disiplin visual.** Mengikuti prinsip arsitektur proyek: One Primary Decision Per Page, Exception Before Summary, Anti Visual Noise, Zero Pill Discipline. Toolbar hanya memuat aksi cepat; konfigurasi mendalam berada di Inspector.

---

## 4. Kontrak Tipe: `ObjectCapabilities`

Berkas: `src/registry/types.ts`.

```typescript
export type ControlZone = 'floating' | 'inspector' | 'both' | 'none';
export type ControlPriority = 'primary' | 'secondary' | 'advanced';

export interface ObjectCapabilities {
  // 1. Operasi kanonikal universal
  canLock: boolean;            // default: true
  canDuplicate: boolean;       // default: true
  canDelete: boolean;          // default: true
  canReorder: boolean;         // default: true (z-index front/back)
  canGroup: boolean;           // default: true

  // 2. Transformasi geometri
  canRotate: boolean;
  canFlipHorizontal: boolean;
  canAdjustOpacity: boolean;

  // 3. Tipografi
  hasTypography: boolean;

  // 4. Engine / generator prosedural
  hasProceduralEngine: boolean;
  engineActionLabel?: string;  // mis. "Acak Labirin"

  // 5. Presentasi styling khusus
  hasStrokeConfig?: boolean;
  hasFillConfig?: boolean;
  supportsSolutionKey?: boolean; // Labirin, Word Search, Sudoku, Worksheet
}
```

`ElementDefinition` memperoleh field `capabilities: ObjectCapabilities`. Selama masa migrasi (Patch 3 sampai Patch 4) field ini bersifat opsional, dan UI memakai nilai default aman bila belum diisi. Setelah Patch 4 selesai, field menjadi wajib.

`ControlZone` dan `ControlPriority` didefinisikan sebagai kosakata untuk penempatan kontrol per properti pada fase lanjutan. Keduanya belum dipakai oleh `ObjectCapabilities` pada kontrak ini dan tidak boleh dipakai UI sebelum ada kontrak lanjutan.

---

## 5. Kontrak Nilai Capability per Tipe

| Tipe / Sub-tipe | Lock | Dup | Del | Reorder | Group | Rotate | Flip H | Opacity | Tipografi | Engine | Aksi Engine | Stroke | Fill |
| :-- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-- | :-: | :-: |
| `text` | ya | ya | ya | ya | ya | ya | tidak | tidak | ya | tidak | — | tidak | tidak |
| `image` | ya | ya | ya | ya | ya | ya | ya | ya | tidak | tidak | — | tidak | tidak |
| `puzzle/labirin` | ya | ya | ya | ya | ya | tidak | tidak | tidak | tidak | ya | Acak Labirin | ya | tidak |
| `puzzle/word-search` | ya | ya | ya | ya | ya | tidak | tidak | tidak | tidak | ya | Acak Kisi | tidak | tidak |
| `puzzle/sudoku` | ya | ya | ya | ya | ya | tidak | tidak | tidak | tidak | ya | Generate Baru | tidak | tidak |
| `worksheet` | ya | ya | ya | ya | ya | tidak | tidak | tidak | tidak | ya | Acak Soal | tidak | tidak |
| `shape` *(dicadangkan)* | ya | ya | ya | ya | ya | ya | ya | ya | tidak | tidak | — | ya | ya |

**Catatan interpretasi:**

- `group` ditangani cabang tersendiri (Ungroup, serta Lock/Dup/Del/Z-Order atas seluruh anak) dan tidak memakai `ObjectCapabilities` pada fase ini. Implementasi saat ini dinilai bersih dan dipertahankan.
- Kolom `Opacity` untuk puzzle bernilai `tidak` mengikuti panduan audit ("false untuk Teks & Puzzle murni"). Konsekuensinya, stepper opacity yang kini tampil pada toolbar puzzle akan disembunyikan. Ditetapkan pada K-1 (bagian 11).
- Nilai `canRotate` untuk `image` mengikuti panduan audit. Inspector gambar saat ini belum memiliki slider rotasi; ditetapkan pada K-2 (bagian 11).
- Nilai `worksheet` ditetapkan pada K-3 (bagian 11). Audit awal hanya menyebut `worksheet` sebagai tipe yang perlu dideklarasikan, tanpa merinci kemampuannya.

---

## 6. Kontrak Presentasi: Toolbar vs Inspector

### 6.1 Aturan pembagian

- **FloatingToolbar** memuat aksi cepat in-situ: aksi universal, styling cepat, dan satu aksi engine.
- **ContextInspector** memuat konfigurasi mendalam, input bebas, slider presisi, dan validasi (batas cetak, panjang kata terpanjang, constraint grid).
- Saat tidak ada seleksi, toolbar disembunyikan (`null`) dan Inspector menampilkan pengaturan lembar halaman (trim, bleed, gutter, recto/verso, bingkai).
- Satu aksi boleh muncul di kedua zona hanya bila fungsinya identik dan memanggil handler yang sama. Label dan ikon harus diseragamkan (F-04).

### 6.2 Matriks presentasi

| Tipe | FloatingToolbar | ContextInspector |
| :-- | :-- | :-- |
| **Text** | Font family, stepper ukuran, warna teks, Bold/Italic/Underline, Align, Lock, Dup, Del, Z-Order | Konten (TextArea), slider ukuran presisi, line height, rotasi 0–360°, validasi teks |
| **Image / Clipart** | Stepper opacity, Flip Horizontal, Lock, Dup, Del, Z-Order | Picker simbol/karakter, preset transparansi, ukuran dan batas cetak |
| **Labirin** | Acak Labirin, swatch warna dinding, select tebal dinding, Lock, Dup, Del, Z-Order | Algoritma, slider baris/kolom (dengan validasi batas cetak), toggle kunci jawaban |
| **Word Search** | Acak Kisi, Lock, Dup, Del, Z-Order | Tema dan daftar kata, ukuran kisi (validasi kata terpanjang), diagonal, terbalik |
| **Sudoku** | Generate Baru, Lock, Dup, Del, Z-Order | Tingkat kesulitan (Easy/Medium/Hard), jumlah givens, pengaturan cetak solusi |
| **Group** | Pisahkan ({count}), Lock, Dup, Del, Z-Order | Header aksi saja |
| **Calendar** *(baru)* | Stepper bulan/tahun, gaya grid, Lock, Dup, Del | Tahun, hari mulai (Senin/Ahad), font angka, hari libur dan catatan |
| **Tracker / Habit** *(baru)* | Frekuensi, warna garis, Lock, Dup, Del | Jumlah kolom, label kebiasaan, format kotak cek, padding |
| **Shape** *(baru)* | Fill, stroke color, stroke width, Lock, Dup, Del, Z-Order | Dimensi W/H, corner radius, rotasi, dashed/solid |

### 6.3 Aturan Focus Mode

Dalam Focus Mode pengguna wajib tetap dapat Lock/Unlock, Duplicate, Delete, mengubah Layer Order, dan mengedit tipografi esensial hanya dengan FloatingToolbar. Setiap perubahan yang memindahkan aksi-aksi ini keluar dari toolbar ditolak.

---

## 7. Kontrak Data dan Handler

### 7.1 Sumber kebenaran per properti

| Properti | Lokasi kebenaran | Handler kanonis |
| :-- | :-- | :-- |
| Teks (konten, font, warna, align, weight, style, decoration) | `element.*` | `handleUpdateElement`, `handleUpdateTextElement` |
| Image (konten, opacity, flip) | `element.content`, `element.opacity`, `element.flipHorizontal` | `handleUpdateElement` |
| Labirin | `element.mazeConfig` (fallback `page.mazeConfig`) | `handleRegenerateMaze`, `handleUpdateCanvasElement` |
| Word Search | `page.wordSearchConfig`, `page.wordSearchGrid` | `handleRegenerateWordSearch`, `handleUpdateWordSearchConfig` |
| Sudoku | `page.sudokuConfig`, `page.sudokuBoard` | `handleRegenerateSudoku`, `handleUpdateSudokuConfig` |
| Group | `element.childrenIds` | `handleUngroup`, `handleDeleteGroup`, `handleDuplicateGroup` |
| Setup dokumen dan lembar | `project.metadata`, `page.pageNumber`, `page.borderStyle`, `page.customAssetEmoji` | `handleOpenPageSetup`, `handleUpdateBorderStyle` |

### 7.2 Aturan status solusi labirin (menutup F-01)

1. Nilai efektif ditentukan dengan urutan: `element.mazeConfig.showSolution` → `page.mazeConfig.showSolution` → `false`.
2. `CanvasWorkspace` tidak boleh menyimpan `showSolution` sebagai *local state* yang berdiri sendiri. Kontrol pada status bar workspace menulis ke `mazeConfig.showSolution` lewat handler kanonis.
3. `renderPdf` labirin wajib menggambar `solutionPath` sebagai garis vektor bila nilai efektif `true`.
4. Toggle di Inspector, kontrol di workspace, tampilan kanvas, dan PDF harus selalu menunjukkan keadaan yang sama.

### 7.3 Aksi universal

Implementasi saat ini sudah memenuhi kontrak: toolbar dan inspector memanggil fungsi yang sama dari `App.tsx`, mutasi tercatat di Command Manager, dan tidak ditemukan duplikasi logika atau *bypass*. Kondisi ini adalah garis dasar yang tidak boleh mundur.

---

## 8. Kontrak Pekerjaan (Patch)

Patch dikerjakan berurutan. Patch berikutnya tidak dimulai sebelum Patch sebelumnya lulus semua tes wajibnya.

### Patch 1 — Eliminasi capability leak di FloatingToolbar (F-02, F-03)

- **File:** `src/components/FloatingToolbar.tsx`
- **Lingkup:**
  1. Pisahkan `isImage = activeElement.type === 'image'` dari `isVisual`.
  2. Batasi kontrol `wallColor` dan `wallThickness` pada `type === 'puzzle' && subType === 'labirin'`.
  3. Sembunyikan Flip Horizontal dari labirin, Word Search, dan Sudoku.
- **Risiko regresi:** sangat rendah (tidak menyentuh model data).
- **Kriteria penerimaan:**
  - Elemen gambar tidak menampilkan warna atau ketebalan dinding.
  - Word Search dan Sudoku tidak menampilkan kontrol labirin.
  - Labirin tetap menampilkan dan menjalankan kontrol dinding dengan benar.
  - Mengubah kontrol pada satu tipe tidak menambah properti `mazeConfig` pada tipe lain.

### Patch 2 — Sinkronisasi status solusi labirin (F-01)

- **File:** `src/components/CanvasWorkspace.tsx`, `src/registry/ElementRegistry.ts`
- **Lingkup:** terapkan aturan pada bagian 7.2: sumber kebenaran kanvas menjadi `element?.mazeConfig?.showSolution ?? page.mazeConfig?.showSolution ?? false`, dan implementasikan rendering `solutionPath` pada `renderPdf` labirin.
- **Risiko regresi:** rendah.
- **Kriteria penerimaan:**
  - Toggle di Inspector atau status bar workspace menampilkan garis solusi secara konsisten di kanvas.
  - Ekspor PDF dengan toggle aktif memuat garis solusi; dengan toggle mati PDF tetap berupa labirin kosong.
  - Perubahan toggle dapat di-undo dan di-redo.

### Patch 3 — Perluasan skema kapabilitas (aditif)

- **File:** `src/registry/types.ts`, `src/registry/ElementRegistry.ts`
- **Lingkup:** tambahkan `ObjectCapabilities` (bagian 4) dan field `capabilities` opsional pada `ElementDefinition`. Isi nilai untuk `text`, `image`, `labirin`, `word-search`, `sudoku`, dan `worksheet` sesuai bagian 5.
- **Risiko regresi:** nol (non-breaking).
- **Kriteria penerimaan:** `npm run lint` dan `compile_applet` (`tsc --noEmit`) lulus tanpa error.

### Patch 4 — Integrasi FloatingToolbar dengan capabilities

- **File:** `src/components/FloatingToolbar.tsx`
- **Lingkup:** ambil definisi lewat `ElementRegistry.get(activeElement.type, activeElement.subType)` dan render kontrol berdasarkan flag `capabilities`. Hapus percabangan `isText`, `isVisual`, dan `isGroup` untuk kontrol yang kini ditentukan flag. Seragamkan label dan ikon tombol engine dengan Inspector (F-04). Jadikan `capabilities` wajib pada `ElementDefinition`.
- **Risiko regresi:** sedang (seluruh interaksi klik perlu diverifikasi).
- **Kriteria penerimaan:** seluruh tes pada bagian 10 lulus untuk Text, Image, Labirin, Word Search, Sudoku, dan Group.

### Patch 5 — Perapian (F-06, opsional)

- **File:** `src/components/FloatingToolbar.tsx`
- **Lingkup:** hapus props `onSelectElement` dan `onUpdateTextElement` bila terbukti tidak terpakai (pembaruan teks sudah lewat `onUpdateElement`). Verifikasi tidak ada pemanggil sebelum menghapus.
- **Risiko regresi:** sangat rendah.

---

## 9. Aturan Penambahan Tipe Objek Baru

Setiap tipe baru (Calendar, Tracker, Planner, Photo Editor, Shape) hanya diterima bila memenuhi seluruh butir berikut:

1. Mendaftar di `ElementRegistry` dengan `propertySchema` dan `capabilities` lengkap.
2. Menambah nilai pada `CanvasElementType` di `src/types/index.ts` tanpa mengubah komponen toolbar atau inspector selain lewat deklarasi registry.
3. Memakai handler kanonis untuk aksi universal dan engine; tidak membuat jalur mutasi baru di luar Command Manager.
4. Menyediakan `renderPdf` yang paritas dengan tampilan kanvas.
5. Mendeklarasikan baris barunya pada matriks bagian 5 dan 6.2.
6. Lulus uji alih-seleksi (bagian 10, T-4) bersama seluruh tipe yang sudah ada.

---

## 10. Verifikasi dan Pengujian Wajib

| ID | Uji | Hasil yang diharapkan |
| :-- | :-- | :-- |
| T-1 | `tsc --noEmit` lewat `compile_applet` dan `npm run lint` | Tanpa error |
| T-2 | Focus Mode: aktifkan lewat Tab atau tombol header, lalu uji Lock, Duplicate, Delete, Z-Order, dan tipografi tanpa Inspector | Seluruh aksi berfungsi dari FloatingToolbar |
| T-3 | Paritas solusi: aktifkan kunci jawaban, bandingkan kanvas dan PDF | Garis solusi tampil konsisten di keduanya |
| T-4 | Alih-seleksi berurutan: Teks → Gambar → Labirin → Word Search → Sudoku → Group | Toolbar berubah seketika; tidak ada *state bleed* atau kebocoran properti |
| T-5 | Undo/Redo atas aksi universal, regenerasi engine, dan toggle solusi | Setiap aksi tercatat dan dapat dibatalkan |
| T-6 | Inspeksi data: ubah kontrol pada Gambar, Word Search, dan Sudoku | Tidak ada properti `mazeConfig` baru pada elemen tersebut |

---

## 11. Keputusan Terkonfirmasi

Keempat keputusan yang semula terbuka telah dikonfirmasi dan berlaku sebagai ketetapan kontrak. Asumsi sementara pada draf sebelumnya menjadi final tanpa perubahan nilai.

| ID | Keputusan | Ketetapan | Penempatan |
| :-- | :-- | :-- | :-- |
| K-1 | Stepper opacity pada puzzle dihapus | `canAdjustOpacity = false` untuk Labirin, Word Search, dan Sudoku. Puzzle cetak harus berkontras penuh, dan opacity mencuri fokus dari keputusan primer toolbar. | Toolbar: stepper opacity hanya untuk `image` dan `shape`. |
| K-2 | Gambar memperoleh slider rotasi | `canRotate = true` untuk `image`. Dikerjakan setelah Patch 3 dan 4. | Inspector, accordion "Transformasi" (slider dan input derajat). Toolbar tetap: Flip, Opacity, Z-Order, Lock, Dup, Del. |
| K-3 | Worksheet sepenuhnya engine-driven | Tanpa rotasi, flip, opacity, dan tipografi. Memiliki engine dan dukungan kunci jawaban. | Toolbar: Acak Soal, Lock, Dup, Del, Z-Order. Inspector: rentang angka dan format baris/kolom. |
| K-4 | `ControlZone` dan `ControlPriority` ditunda | Dideklarasikan di `types.ts`, belum dipakai UI. Patch 1 sampai 4 memakai flag boolean. | `src/registry/types.ts`; implementasi bertahap pada kontrak lanjutan. |

Penyelarasan nama flag: dokumen keputusan memakai `canFlip`, `canFormatTypography`, `hasEngineGenerator`, dan `hasWallStyle`. Kontrak ini tetap memakai nama pada bagian 4, yaitu `canFlipHorizontal`, `hasTypography`, `hasProceduralEngine`, dan `hasStrokeConfig` (kontrol dinding labirin). Flag baru `supportsSolutionKey` ditambahkan ke antarmuka, bernilai `true` untuk Labirin, Word Search, Sudoku, dan Worksheet. Patch 3 dan 4 memakai nama kontrak.

---

## 12. Ketentuan Perubahan Kontrak

Perubahan atas invarian (bagian 3), nilai capability (bagian 5), atau urutan patch (bagian 8) harus dicatat sebagai revisi pada dokumen ini beserta alasannya, dan disetujui sebelum implementasinya digabungkan.
