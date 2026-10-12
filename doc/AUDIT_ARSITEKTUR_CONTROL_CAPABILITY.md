# LAPORAN AUDIT FORENSIK ARSITEKTUR KONTROL & CAPABILITY
## FloatingToolbar vs ContextInspector: Pembagian Tanggung Jawab, Pola Kemampuan Objek, dan Kesiapan Ekstensibilitas

- **Dokumen:** `/doc/AUDIT_ARSITEKTUR_CONTROL_CAPABILITY.md`
- **Peran:** Senior Frontend Architect & UI/UX Auditor Studio Hybrid
- **Mode:** READ-ONLY (Tanpa modifikasi kode produksi atau perubahan skema)
- **Komponen Target:** `FloatingToolbar.tsx`, `ContextInspector.tsx`, `ElementRegistry.ts`, `CanvasWorkspace.tsx`, `App.tsx`, `src/types/index.ts`, `src/registry/types.ts`
- **Prinsip Arsitektur:** Business drives Decision, Decision drives Information, One Primary Decision Per Page, Exception Before Summary, Pencegahan Change Blindness, Anti Visual Noise, dan Zero Pill Discipline.

---

## 1. Ringkasan Kondisi Aktual

Penyelidikan forensik terhadap implementasi saat ini mengungkap temuan struktural penting:

### 1.1 Dikotomi Pendekatan UI (Declarative vs Hardcoded)
- **`ContextInspector.tsx` (Declarative & Schema-Driven):**
  Menggunakan `ElementRegistry.get(type, subType).propertySchema` untuk merender field konfigurasi secara dinamis melalui `DynamicPropertyField.tsx`. Inspeksi membaca langsung spesifikasi properti yang terdaftar.
- **`FloatingToolbar.tsx` (Imperatif & Hardcoded Type-Switching):**
  Pada baris 145–147:
  ```tsx
  const isText = activeElement.type === 'text';
  const isVisual = activeElement.type === 'puzzle' || activeElement.type === 'image';
  const isGroup = activeElement.type === 'group';
  ```
  Komponen ini tidak terhubung ke `ElementRegistry` dan tidak membaca kapabilitas objek secara deklaratif. Semua percabangan kontrol ditulis manual dengan kondisi tipe mentah.

### 1.2 Kebocoran Konteks Visual (Capability Leak)
- Variabel `isVisual` menyamakan elemen `image` (stiker, ikon, clipart) dengan `puzzle` (labirin).
- Pada `FloatingToolbar.tsx` baris 371–450, blok kontrol `wallColor` (swatch warna dinding) dan `wallThickness` (dropdown tebal dinding 1–4px) dirender tanpa memverifikasi apakah `subType === 'labirin'`.
- **Dampak Nyata:** Ketika pengguna memilih elemen stiker/gambar atau puzzle non-maze (seperti Word Search atau Sudoku), FloatingToolbar memunculkan color swatch warna dinding labirin dan selector ketebalan garis labirin.

### 1.3 Divergensi Status Solusi Labirin (Decoupled Solution State)
- Di `ElementRegistry.ts` (baris 266–270), properti `mazeConfig.showSolution` telah dideklarasikan dalam skema.
- Di `CanvasWorkspace.tsx` (baris 102), terdapat *local state* terpisah: `const [showSolution, setShowSolution] = useState(false);`.
- Canvas renderer (baris 173) hanya mengecek state lokal workspace `showSolution && mazeDataInstance.solutionPath` dan mengabaikan nilai `element.mazeConfig?.showSolution`.
- Pada `ElementRegistry.ts` fungsi `renderPdf` labirin (baris 296–347), garis solusi vektor sama sekali tidak dimasukkan ke dalam stream ekspor PDF, sehingga solusi di layar tidak konsisten dengan dokumen PDF yang dicetak.

### 1.4 Perilaku Focus Mode
- Di `App.tsx` (baris 1049 & 1173), saat `focusMode === true`, `LeftSidebar` dan `ContextInspector` di-unmount total dari DOM:
  ```tsx
  {!focusMode && <ContextInspector ... />}
  ```
- Sebaliknya, `CanvasWorkspace` dan `FloatingToolbar` tetap aktif dan dipertahankan di layar (baris 534–567).
- Konsekuensi arsitektur: Seluruh aksi kanonikal esensial (Lock/Unlock, Duplicate, Delete, Layer Reorder, dan Tipografi esensial) **wajib tetap tersedia di FloatingToolbar**, karena jika hanya ditaruh di Inspector, pengguna dalam Focus Mode akan kehilangan kemampuan manipulasi objek dasar.

### 1.5 Integritas Kanonikal Aksi (Universal Actions)
- Aksi universal (`Delete`, `Duplicate`, `Lock/Unlock`, `Layer Order`) telah dikonsolidasikan ke handler `App.tsx` (`handleDeleteElement`, `handleDuplicateElement`, `handleUpdateCanvasElement`, `handleReorderElement`).
- Handler-handler ini otomatis merekam riwayat Undo/Redo melalui `commandManagerRef`.

---

## 2. Matriks Capability dan Presentasi Per Tipe Objek

| Tipe Objek & Sub-tipe | Capability Aktual | FloatingToolbar (In-situ Quick Actions) | ContextInspector (Deep Property Form) | Handler Kanonis | Sumber Data (Single Source of Truth) | Temuan & Anomali | Rekomendasi Arsitektural |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Text** (`type: 'text'`) | • Isi teks<br>• Font family<br>• Font size<br>• Weight / Style / Underline<br>• Alignment (L/C/R)<br>• Warna teks<br>• Rotasi<br>• Lock, Dup, Del, Z-Order | • Font family select<br>• Stepper font size (-, +)<br>• Color swatch teks<br>• Bold, Italic, Underline<br>• Text Align (L/C/R)<br>• Lock, Dup, Del, Z-Order | • TextArea isi konten<br>• Slider ukuran font<br>• Select alignment<br>• Select fontWeight<br>• Select fontStyle<br>• Color picker teks<br>• Slider rotasi (0–360°)<br>• Toggle lock | `handleUpdateElement`<br>`handleUpdateTextElement`<br>`handleDeleteElement`<br>`handleDuplicateElement`<br>`handleReorderElement` | `element.content`<br>`element.fontSize`<br>`element.fontFamily`<br>`element.color`<br>`element.textAlign`<br>`element.fontWeight`<br>`element.fontStyle`<br>`element.textDecoration` | Sempurna dan sinkron. Mutasi elemen tercatat ke undo/redo history. | Pertahankan pembagian: Toolbar untuk quick styling, Inspector untuk full editing (rotasi, validasi textarea). |
| **Image / Clipart** (`type: 'image'`) | • Simbol / Karakter gambar<br>• Opasitas (0.1–1.0)<br>• Flip Horizontal<br>• Lock, Dup, Del, Z-Order | • Tombol Acak *(Salah Sasaran)*<br>• Warna Dinding Labirin *(Salah Sasaran)*<br>• Ketebalan Dinding *(Salah Sasaran)*<br>• Flip Horizontal<br>• Stepper Opacity (🏁)<br>• Lock, Dup, Del, Z-Order | • Text input karakter/simbol<br>• Slider transparansi<br>• Toggle cermin horizontal<br>• Toggle lock | `handleUpdateElement`<br>`handleDeleteElement`<br>`handleDuplicateElement`<br>`handleReorderElement` | `element.content`<br>`element.opacity`<br>`element.flipHorizontal` | **P1 (Capability Leak):** Karena `isVisual`, gambar memunculkan kontrol warna dinding labirin dan tombol regenerasi labirin. | Pisahkan deklarasi visual: Image hanya mendapat Flip + Opacity + Lock/Dup/Del. Hapus kontrol labirin dari Image. |
| **Puzzle: Labirin** (`type: 'puzzle'`, `subType: 'labirin'`) | • Regenerasi struktur sel<br>• Algoritma maze<br>• Dimensi Grid (Rows/Cols)<br>• Warna Dinding & Tebal<br>• Solution toggle<br>• Lock, Dup, Del, Z-Order | • Tombol "Acak" (Regenerate)<br>• Swatch Warna Dinding<br>• Select Ketebalan Dinding<br>• Flip Horizontal *(Tidak Relevan)*<br>• Stepper Opacity<br>• Lock, Dup, Del, Z-Order | • Select algoritma<br>• Slider Rows & Cols (dengan constraint)<br>• Slider Ketebalan Dinding<br>• Toggle showSolution<br>• Tombol aksi buat labirin baru | `handleRegenerateMaze`<br>`handleUpdateCanvasElement`<br>`handleDeleteElement`<br>`handleDuplicateElement` | `element.mazeConfig`<br>*(fallback `page.mazeConfig`)* | 1. Flip horizontal tidak berpengaruh pada komputasi grid labirin.<br>2. Toggle showSolution di Inspector tidak tersambung ke preview kanvas. | Toolbar hanya menampilkan: [Acak], [Warna Dinding], [Tebal Dinding], [Lock], [Dup], [Del]. Sembunyikan Flip dari maze. |
| **Puzzle: Word Search** (`type: 'puzzle'`, `subType: 'word-search'`) | • Tema & daftar kata<br>• Grid size<br>• Aturan Diagonal & Reverse<br>• Regenerasi kisi huruf<br>• Lock, Dup, Del, Z-Order | • Menampilkan Warna Dinding & Tebal Dinding Labirin *(Salah Sasaran)*<br>• Tombol Acak<br>• Lock, Dup, Del, Z-Order | • Input Tema kata<br>• Slider Grid Size (validasi kata terpanjang)<br>• Toggle Allow Diagonal<br>• Toggle Allow Reverse<br>• Tombol aksi susun kata baru | `handleRegenerateWordSearch`<br>`handleUpdateWordSearchConfig`<br>`handleDeleteElement`<br>`handleDuplicateElement` | `page.wordSearchConfig`<br>`page.wordSearchGrid` | **P1 (Capability Leak):** Terkena `isVisual`, menampilkan kontrol warna dinding dan ketebalan garis labirin. | Toolbar hanya menampilkan: [Acak Kisi], [Lock], [Dup], [Del]. Sembunyikan kontrol labirin dari Word Search. |
| **Puzzle: Sudoku** (`type: 'puzzle'`, `subType: 'sudoku'`) | • Tingkat kesulitan (Clues count)<br>• Regenerasi angka papan<br>• Lock, Dup, Del, Z-Order | • Menampilkan Warna Dinding & Tebal Dinding Labirin *(Salah Sasaran)*<br>• Tombol Acak<br>• Lock, Dup, Del, Z-Order | • Select Tingkat Kesulitan (Easy, Medium, Hard)<br>• Tombol aksi buat papan angka baru | `handleRegenerateSudoku`<br>`handleUpdateSudokuConfig`<br>`handleDeleteElement`<br>`handleDuplicateElement` | `page.sudokuConfig`<br>`page.sudokuBoard` | **P1 (Capability Leak):** Sudoku menampilkan picker warna dinding labirin. | Toolbar hanya menampilkan: [Generate Baru], [Lock], [Dup], [Del]. Sembunyikan kontrol labirin dari Sudoku. |
| **Group Elemen** (`type: 'group'`) | • Ungroup<br>• Lock, Dup, Del seluruh anak<br>• Z-Order seluruh anak | • Tombol Pisahkan ({count})<br>• Lock, Dup, Del, Z-Order | • Hanya header aksi, tidak ada form properti | `handleUngroup`<br>`handleDeleteGroup`<br>`handleDuplicateGroup` | `element.childrenIds` | Bersih, presisi, mengelola relasi hierarki multi-elemen dengan aman. | Pertahankan implementasi kanonikal saat ini. |
| **Canvas Idle / No Selection** | • Format trim & bleed<br>• Margins / Gutter<br>• Recto/Verso spread<br>• Page border style<br>• Custom asset emoji | *Hidden (null)* | • Card Page Setup Dokumen (Trim, Bleed, Gutter, Button Modal)<br>• Card Konteks Lembar (Nomor, Recto/Verso, Sisi Jilid)<br>• Accordion Bingkai Lembar Halaman<br>• Maskot Halaman Aktif | `handleOpenPageSetup`<br>`handleUpdateBorderStyle` | `project.metadata`<br>`page.pageNumber`<br>`page.borderStyle`<br>`page.customAssetEmoji` | Mengikuti kaidah "One Primary Decision Per Page" & Contextual Scope. | Pertahankan: Toolbar tersembunyi saat tidak ada seleksi, Inspector menjadi pengatur lembar halaman. |

---

## 3. Audit Duplikasi Aksi & Rantai Eksekusi

### 3.1 Aksi Universal: Lock, Duplicate, Delete, Layer Reorder
- **FloatingToolbar:**
  - `Lock`: Memanggil `onToggleLock(activeElement.id)` $\rightarrow$ `App.tsx` `handleToggleLockElement` $\rightarrow$ memutasi `element.locked` via Command Manager.
  - `Duplicate`: Memanggil `onDuplicateElement(activeElement.id)` $\rightarrow$ `App.tsx` `handleDuplicateElement` $\rightarrow$ membuat klon dengan offset `+20px` dan ID baru melalui Command Manager.
  - `Delete`: Memanggil `onDeleteElement(activeElement.id)` $\rightarrow$ `App.tsx` `handleDeleteElement` $\rightarrow$ menghapus elemen dan membersihkan seleksi melalui Command Manager.
  - `Reorder (Bring Forward / Send Backward)`: Memanggil `onReorderElement(activeElement.id, direction)` $\rightarrow$ memutasi urutan elemen di `page.elements`.
- **ContextInspector:**
  - Menampilkan toggle lock pada header inspektor dan tombol aksi jika relevan. Seluruhnya memanggil fungsi yang sama yang diteruskan dari `App.tsx`.
- **Kesimpulan Verifikasi:** Aksi universal telah menggunakan implementasi kanonikal tunggal di `App.tsx`. Tidak ditemukan duplikasi logika lokal atau bypass Command Manager.

---

## 4. Daftar Masalah Berdasarkan Prioritas

### Kategori P0: Risiko Integritas Data atau Hasil Ekspor
1. **Divergensi Status Solusi Labirin Canvas vs PDF:**
   - **Bukti:** `CanvasWorkspace.tsx` baris 102 (`const [showSolution, setShowSolution] = useState(false)`) & baris 173 (`showSolution && mazeDataInstance.solutionPath`). Sebaliknya, `ElementRegistry.ts` baris 266–270 mendefinisikan `mazeConfig.showSolution`, namun fungsi `renderPdf` (baris 296–347) sama sekali tidak merender `solutionPath` pada stream dokumen PDF.
   - **Dampak:** Pengguna mengaktifkan kunci jawaban pada kanvas, tetapi hasil ekspor PDF tetap berupa labirin kosong tanpa garis rute penyelesaian.

### Kategori P1: Inkonsistensi Aksi atau Capability Leak
1. **Kebocoran Kontrol Dinding Labirin ke Gambar dan Non-Maze Puzzle:**
   - **Bukti:** `FloatingToolbar.tsx` baris 147:
     ```tsx
     const isVisual = activeElement.type === 'puzzle' || activeElement.type === 'image';
     ```
     dan baris 371–450: Blok kontrol `wallColor` dan `wallThickness` dirender tanpa memvalidasi `subType === 'labirin'`.
   - **Dampak:** Stiker/clipart gambar, Word Search, dan Sudoku memunculkan color picker dinding labirin dan selector ketebalan garis 1–4px. Jika diubah, properti `mazeConfig` yang tidak relevan akan disuntikkan ke dalam objek elemen tersebut.
2. **Kontrol Flip Horizontal pada Elemen Puzzle Labirin:**
   - **Bukti:** `FloatingToolbar.tsx` baris 452–464: Tombol Flip muncul pada seluruh `isVisual`, termasuk puzzle labirin, sedangkan generator dan renderer labirin tidak mendukung transformasi cermin horizontal secara semantik.

### Kategori P2: Visual Noise dan Inkonsistensi UX
1. **Redundansi Tombol Regenerasi Puzzle:**
   - **Bukti:** Tombol "Acak" berada di FloatingToolbar (baris 360–369) DAN di ContextInspector (baris 283–305).
   - **Evaluasi:** Duplikasi ini dapat diterima secara fungsional (*in-situ quick action* vs *deep config*), namun pelabelan dan ikonografinya berbeda ("Acak" ikon RefreshCw vs "Acak Ulang Labirin Baru" tombol solid lebar).
2. **Ketiadaan Tipe Objek Shape:**
   - **Bukti:** `src/types/index.ts` baris 100 mendefinisikan `CanvasElementType = 'text' | 'puzzle' | 'group' | 'image'`. Belum ada tipe shape di `ElementRegistry.ts`, sehingga jika ditambahkan shape di masa depan, sistem belum memiliki slot kapabilitas fill dan stroke.

### Kategori P3: Dead Code dan Perapian Nonfungsional
1. **Unused / Loose Props pada FloatingToolbar:**
   - **Bukti:** `FloatingToolbar.tsx` baris 40 (`onSelectElement?: (id: string | null) => void;`) dan baris 42 (`onUpdateTextElement?: (update: Partial<any>) => void;`). Keduanya redundan karena pembaruan teks telah ditangani secara penuh oleh `onUpdateElement(activeElement.id, ...)`.

---

## 5. Rekomendasi Kontrak Kanonis (Object Capability Contract)

Untuk mempersiapkan sistem terhadap ekspansi fitur baru (**Kalender**, **Photo Editor**, **Tracker**, **Planner**, **Shape**), arsitektur Studio Hybrid membutuhkan satu kontrak formal di `src/registry/types.ts`:

```typescript
export type ControlZone = 'floating' | 'inspector' | 'both' | 'none';
export type ControlPriority = 'primary' | 'secondary' | 'advanced';

export interface ObjectCapabilities {
  // 1. Operasi Kanonikal Universal
  canLock: boolean;           // Default: true
  canDuplicate: boolean;      // Default: true
  canDelete: boolean;         // Default: true
  canReorder: boolean;        // Default: true (Z-index front/back)
  canGroup: boolean;          // Default: true

  // 2. Transformasi Geometri
  canRotate: boolean;         // true untuk Text, Shape, Clipart; false untuk Maze/Sudoku grid
  canFlipHorizontal: boolean; // true untuk Clipart & Shape; false untuk Text, Maze, Sudoku
  canAdjustOpacity: boolean;  // true untuk Clipart & Shape; false untuk Teks & Puzzle murni

  // 3. Tipografi
  hasTypography: boolean;     // true untuk Text, Calendar Header; false untuk Graphics murni

  // 4. Engine & Generator Prosedural
  hasProceduralEngine: boolean; // true untuk Maze, WordSearch, Sudoku, Calendar, Tracker
  engineActionLabel?: string;   // e.g. "Acak Labirin", "Regenerate Grid", "Bulan Baru"

  // 5. Presentasi Styling Khusus
  hasStrokeConfig?: boolean;    // true untuk Maze, Shape
  hasFillConfig?: boolean;      // true untuk Shape
}
```

### Matriks Presentasi Kontrak

| Tipe Objek | FloatingToolbar (Aksi In-situ Cepat) | ContextInspector (Panel Properti Lengkap) | Justifikasi Arsitektur |
| :--- | :--- | :--- | :--- |
| **Text** | Font Family, Stepper Size, Text Color, Bold/Italic/Underline, Align, Lock, Dup, Del, Z-Order | Konten TextArea, Slider Size presisi, Detail Line Height, Slider Rotasi, Validasi Teks | Pengguna membutuhkan format teks cepat saat mendesain layout kanvas. Rotasi dan karakter panjang diatur di Inspector. |
| **Image / Clipart** | Opacity Stepper, Flip Horizontal, Lock, Dup, Del, Z-Order | Picker Simbol/Karakter, Preset Transparansi presisi, Pengaturan Ukuran & Batas Cetak | Bersih dari kontrol dinding labirin. Ringkas dan fokus pada aspek grafis. |
| **Maze (Labirin)** | Tombol Acak Jalur, Warna Dinding Swatch, Ketebalan Dinding Select, Lock, Dup, Del, Z-Order | Pilihan Algoritma, Slider Baris/Kolom dengan validasi batas cetak, Kunci Jawaban Toggle | Algoritma dan grid memerlukan validasi berat di Inspector; warna dan tebal dinding adalah preferensi visual cepat di toolbar. |
| **Word Search** | Tombol Acak Penempatan, Lock, Dup, Del, Z-Order | Input Tema Kata, Daftar Kata, Ukuran Kisi Huruf, Aturan Diagonal & Terbalik | Menghilangkan kebocoran kontrol labirin dari puzzle kata. |
| **Sudoku** | Tombol Generate Baru, Lock, Dup, Del, Z-Order | Tingkat Kesulitan (Easy, Medium, Hard), Jumlah Givens, Pengaturan Cetak Solusi | Hanya aksi acak esensial di floating toolbar. |
| **Calendar (Baru)** | Ganti Bulan/Tahun Stepper, Gaya Grid (Minimal/Box), Lock, Dup, Del | Konfigurasi Tahun, Mulai Hari (Senin/Ahad), Font Angka, Hari Libur/Catatan Khusus | Floating toolbar untuk navigasi bulan; Inspector untuk konfigurasi struktur tanggal. |
| **Tracker / Habit (Baru)** | Pilihan Frekuensi (Harian/Mingguan), Ganti Warna Garis, Lock, Dup, Del | Jumlah Kolom, Label Kebiasaan, Format Kotak Cek (Lingkaran/Kotak/Garis), Padding | Sesuai kapabilitas tracker tanpa mengganggu kanvas. |
| **Shape (Baru)** | Fill Color Swatch, Stroke Color, Stroke Width, Lock, Dup, Del, Z-Order | Dimensi presisi (W/H), Corner Radius Slider, Rotasi Slider, Dashed/Solid Stroke | Standar grafis vektor studio. |

---

## 6. Urutan Implementasi Paling Aman (Safe Migration Sequence)

### Patch 1: Eliminasi Capability Leak pada `FloatingToolbar.tsx`
- **Akar Masalah:** Logika `isVisual` menyamakan elemen `image` dan seluruh sub-tipe `puzzle` dengan maze, menyebabkan kontrol dinding labirin muncul pada stiker dan puzzle non-maze.
- **File Terdampak:** `/src/components/FloatingToolbar.tsx`
- **Batas Perubahan:**
  1. Pisahkan `isImage = activeElement.type === 'image'`.
  2. Jadikan kontrol dinding eksklusif untuk `activeElement.type === 'puzzle' && activeElement.subType === 'labirin'`.
  3. Sembunyikan `FlipHorizontal` dari puzzle labirin, word search, dan sudoku.
- **Risiko Regresi:** Sangat rendah (tidak menyentuh model data).
- **Tes Wajib Lulus:** Klik elemen gambar $\rightarrow$ pastikan warna dinding labirin tidak muncul. Klik Maze $\rightarrow$ pastikan kontrol dinding tetap berfungsi normal.

### Patch 2: Sinkronisasi Status Solusi Labirin (Canvas & Registry)
- **Akar Masalah:** Local state `showSolution` di `CanvasWorkspace` terisolasi dari skema `mazeConfig.showSolution` di `ElementRegistry`.
- **File Terdampak:** `/src/components/CanvasWorkspace.tsx`, `/src/registry/ElementRegistry.ts`
- **Batas Perubahan:** Jadikan `element?.mazeConfig?.showSolution ?? page.mazeConfig?.showSolution ?? showSolution` sebagai sumber kebenaran kanvas, dan implementasikan rendering jalur solusi pada `renderPdf` labirin di `ElementRegistry.ts`.
- **Risiko Regresi:** Rendah.
- **Tes Wajib Lulus:** Toggle kunci jawaban di Inspector atau Workspace status bar $\rightarrow$ garis solusi tampil konsisten di kanvas dan hasil cetak PDF.

### Patch 3: Perluasan Skema Kapabilitas ke `ElementRegistry.ts`
- **Akar Masalah:** `ElementDefinition` belum memuat deklarasi `capabilities`, sehingga komponen UI harus menebak tipe elemen menggunakan string matching.
- **File Terdampak:** `/src/registry/types.ts`, `/src/registry/ElementRegistry.ts`
- **Batas Perubahan:** Tambahkan interface opsional `capabilities: ObjectCapabilities` pada `ElementDefinition`. Deklarasikan kapabilitas default untuk `text`, `image`, `labirin`, `word-search`, `sudoku`, dan `worksheet`.
- **Risiko Regresi:** Nol (bersifat aditif dan non-breaking).
- **Tes Wajib Lulus:** `npm run lint` & `compile_applet` sukses tanpa error.

### Patch 4: Integrasi FloatingToolbar dengan Registry Capabilities
- **Akar Masalah:** `FloatingToolbar` hardcoded tanpa memanfaatkan `ElementRegistry`.
- **File Terdampak:** `/src/components/FloatingToolbar.tsx`
- **Batas Perubahan:** Ambil definisi elemen melalui `ElementRegistry.get(activeElement.type, activeElement.subType)`. Render kontrol kontekstual berdasarkan flags `definition.capabilities`.
- **Risiko Regresi:** Sedang (perlu verifikasi seluruh interaksi klik).
- **Tes Wajib Lulus:** Verifikasi interaksi Text, Image, Maze, Word Search, Sudoku, dan Group di kanvas.

---

## 7. Verifikasi & Mekanisme Pengujian

1. **Linter & Typecheck:** Menjalankan `tsc --noEmit` via `compile_applet` untuk menjamin konsistensi kontrak tipe TypeScript.
2. **Focus Mode Usability Test:** Aktifkan Focus Mode (tekan Tab atau tombol Focus Mode di header), lalu verifikasi bahwa FloatingToolbar tetap dapat mengunci, menduplikasi, menghapus, mengubah z-order, dan mengedit tipografi elemen tanpa kehadiran ContextInspector.
3. **Multi-Object Switching Test:** Pilih elemen secara bergantian (Teks $\rightarrow$ Gambar $\rightarrow$ Labirin $\rightarrow$ Sudoku) dan pastikan UI FloatingToolbar berubah seketika tanpa *state bleed* atau kebocoran properti.
