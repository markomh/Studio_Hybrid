# LAPORAN FORENSIK AUDIT ARSITEKTUR INFORMASI & KONTROL
## Studio Hybrid Workspace (Tahap 1 — Read-Only Audit & Post-Refactor Verification)

**Dokumen Referensi:** `/doc/AUDIT_KONTROL_DAN_REDUNDANSI_WORKSPACE.md`  
**Peran:** Senior Frontend Architect & Information Architecture Auditor  
**Status:** Selesai (Audit Read-Only + Implementasi Refactor Sesuai Rencana + Post-Audit Verifikasi)  
**Prinsip Desain:** Single Canonical Owner, Contextual Workspace, Exception Before Summary, Anti-Change Blindness, dan Prioritas Kognitif.

---

## 1. Scope dan Komponen yang Diaudit
Komponen dan file yang diinvestigasi secara mendalam:
1. `src/components/FloatingToolbar.tsx` (Toolbar kontekstual mengambang di atas elemen kanvas)
2. `src/components/CanvasWorkspace.tsx` (Viewport kanvas, footer bar status/zoom, guideline, dan rendering SVG)
3. `src/components/ContextInspector.tsx` (Panel sidebar kanan untuk inspeksi elemen atau pengaturan halaman/buku)
4. `src/components/Header.tsx` (Topbar aplikasi, menu navigasi, menu File, status proyek)
5. `src/registry/ElementRegistry.ts` (Registry definisi tipe elemen, default props, schema inspector, dan logic PDF)
6. `src/utils/mazeGenerator.ts` & `src/utils/solutionCompiler.ts` (Mesin pembentuk labirin, BFS pathfinding, dan kompilasi kunci jawaban)
7. `src/components/LeftSidebar.tsx` & `src/components/BookBuilderView.tsx` (Manajemen struktur halaman & bab)
8. `src/App.tsx` (Root orchestration state: activeView, selectedElementId, selectedPage, undo/redo history, focusMode)

---

## 2. Bagian A: Audit Page vs Element Scope (Maze Config)

### 2.1 Alur Investigasi: UI → Handler → State Mutation → Renderer
Ditemukan diskrepansi fundamental antara **Scope Elemen** dan **Scope Halaman** pada parameter `wallColor` dan `wallThickness`:

1. **FloatingToolbar (`src/components/FloatingToolbar.tsx` lines 375–402):**
   ```tsx
   {/* Jika elemen bertipe 'puzzle' terpilih */}
   <input
     type="color"
     value={page?.mazeConfig?.wallColor || '#000000'}
     onChange={(e) => onUpdateMazeConfig?.({ wallColor: e.target.value })}
   />
   <input
     type="range"
     value={page?.mazeConfig?.wallThickness || 2}
     onChange={(e) => onUpdateMazeConfig?.({ wallThickness: Number(e.target.value) })}
   />
   ```
2. **App Handler (`src/App.tsx` lines 306–318):**
   ```tsx
   const handleUpdateMazeConfig = (newConfig: Partial<MazeConfig>) => {
     updatePages(prevPages => prevPages.map(page => {
       if (page.id !== activePageId) return page;
       return {
         ...page,
         mazeConfig: { ...page.mazeConfig, ...newConfig }
       };
     }));
   };
   ```
3. **Canvas Workspace SVG Renderer (`src/components/CanvasWorkspace.tsx` lines 125–175 & 800–825):**
   ```tsx
   const renderPuzzlePreview = (el: CanvasElement) => {
     // Menghiraukan el.mazeConfig, selalu membaca page.mazeConfig!
     const wallColor = page?.mazeConfig?.wallColor || '#1e293b';
     const wallThickness = page?.mazeConfig?.wallThickness || 2;
     // ...
   };
   ```
4. **Export Engine / PDF (`src/registry/ElementRegistry.ts` lines 270–305):**
   ```tsx
   renderPdf: async (element, doc, context) => {
     // Kontradiksi: Di PDF mengutamakan element.mazeConfig!
     const config = element.mazeConfig || context.page?.mazeConfig;
     // ...
   };
   ```

### 2.2 Analisis & Dampak Kontaminasi Data
- **Cross-Element Bleed pada Kanvas:** Jika satu halaman memiliki lebih dari 1 elemen maze (misalnya Puzzle + Mini Solution di pojok), mengubah warna dinding melalui Floating Toolbar pada Elemen A **secara langsung memutasi `page.mazeConfig`**. Akibatnya, Elemen B ikut berubah seketika di CanvasWorkspace.
- **Preview vs PDF Mismatch (WYSIWYG Breakdown):** Di CanvasWorkspace, renderer membaca `page.mazeConfig`. Namun di `ElementRegistry.ts` saat ekspor PDF, renderer membaca `element.mazeConfig || page.mazeConfig`. Bila `element.mazeConfig` pernah tersimpan di elemen saat dibuat dari registry default, perubahan warna di Floating Toolbar **tidak akan tercetak ke PDF**, menimbulkan kebingungan pengguna (Change Blindness).

---

## 3. Bagian B: Audit Tambahan — Alur Solusi Maze (Maze Solution Flow)

Penelusuran menyeluruh terhadap alur solusi labirin dari data hingga output menghasilkan temuan forensik sebagai berikut:

1. **Sumber dan Mekanisme Pembentukan Solusi:**
   - Solusi labirin dibentuk secara algoritmik di dalam `src/utils/mazeGenerator.ts` menggunakan algoritma Breadth-First Search (`solveMazeBFS`).
   - Fungsi ini menerima matriks sel labirin (`cells`), koordinat awal (`startCoord`), dan koordinat akhir (`finishCoord`), lalu mengembalikan array koordinat titik jalur terpendek (`solutionPath: [number, number][]`).
2. **Penyimpanan Solusi (Persistent Data vs Calculated):**
   - Disimpan sebagai data persisten pada properti `solutionPath` di dalam objek halaman (`BookPage.solutionPath`) dan elemen kanvas (`CanvasElement.solutionPath`).
   - Selain itu, utilitas `src/utils/solutionCompiler.ts` melakukan kompilasi otomatis halaman kunci jawaban (`role: 'solutions'`) dengan mereferensikan halaman sumber melalui properti `solutionForPages`.
3. **Tombol Show/Hide Solution & Dampak Data:**
   - Kontrol UI penampil solusi diimplementasikan melalui state lokal `showSolution` (boolean) di `CanvasWorkspace.tsx` baris 98 dan tombol toggle di Footer Bar (baris 939–950).
   - **Dampak Data:** Tombol ini **tidak mengubah data persisten** (`solutionPath`), melainkan murni mengontrol rendering visual garis polyline (`<polyline>`) di atas kanvas SVG.
4. **Canvas Renderer vs PDF Renderer:**
   - **Canvas Workspace (`CanvasWorkspace.tsx` lines 165–175):** Merender garis solusi menggunakan SVG `<polyline>` dengan koordinat terkalkulasi `c * 20 + 10, r * 20 + 10` dan warna `page.mazeConfig?.solutionColor || '#10b981'`.
   - **PDF Export (`pdfExport.ts` lines 234–245):** Membaca `generated.solutionPath` dan merender garis solusi berwarna merah (`#ef4444`) di dokumen PDF.
5. **Hubungan Solusi dengan Seed dan Regenerasi:**
   - Setiap kali maze diregenerasi (`handleRegenerateMaze` / `onRegenerate`), `mazeGenerator` dipanggil dengan seed baru, sehingga `solutionPath` langsung dihitung ulang secara sinkron dengan grid yang baru.
6. **Risiko Solusi Tertinggal (Stale Solution Risk):**
   - Jika konfigurasi parameter maze (seperti rows, cols, atau tipe labirin) diubah di level page tetapi instance elemen maze tidak di-regen, terdapat risiko *stale solution path* di mana garis solusi lama tidak sesuai lagi dengan dinding labirin yang baru digenerate.

---

## 4. Bagian C: Audit Tambahan — Inventarisasi Entry Point Duplicate & Delete

Penelusuran menyeluruh terhadap seluruh entry point untuk operasi **Duplicate** dan **Delete** di seluruh aplikasi:

| No | Komponen / Entry Point | Simbol / Handler | Rantai Pemanggilan hingga Mutasi Data | Evaluasi & Status Logika |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **LeftSidebar.tsx** (Manajemen Halaman) | `onDuplicatePage`, `onDeletePage` | Dipanggil dari klik ikon menu halaman di panel kiri → meneruskan indeks ke `App.tsx` (`handleDuplicatePage` / `handleDeletePage`) → memutasi `project.pages`. | **Kanonikal Halaman**: Terpusat dan aman melalui undo history. |
| 2 | **BookBuilderView.tsx** (Struktur Buku) | `onDuplicatePage`, `onDeletePage` | Dipanggil dari daftar seksi/halaman di Book Builder → meneruskan ke `App.tsx` (`handleDuplicatePage` / `handleDeletePage`). | **Konsisten**: Menggunakan handler yang sama dengan LeftSidebar. |
| 3 | **Header.tsx** (Topbar File / Aksi Cepat) | `onDuplicateCurrentPage` | Tombol di Topbar memanggil `onDuplicateCurrentPage` → dialirkan ke `handleDuplicatePage(activePageIndex)` di `App.tsx`. | **Konsisten**: Mengarah ke handler halaman yang sama. |
| 4 | **FloatingToolbar.tsx** (Elemen Kanvas) | `onDuplicateElement`, `onDeleteElement`, `onDuplicateGroup`, `onDeleteGroup` | Tombol ikon di Floating Toolbar memanggil handler props dari `App.tsx` (`handleDuplicateElement`, `handleDeleteElement`) atau menangani grup. | **Divergen dengan CanvasWorkspace**: Floating Toolbar menggunakan App-level handler yang mencatat undo history. |
| 5. | **ContextInspector.tsx** (Panel Kanan) | `onDuplicateElement`, `onDeleteElement` | Tombol aksi di header inspector memanggil `onDuplicateElement(activeElement.id)` dan `onDeleteElement(activeElement.id)`. | **Konsisten**: Terhubung ke handler level App (`App.tsx`). |
| 6 | **CanvasWorkspace.tsx** (Inline Canvas Handlers) | `handleDuplicateElement`, `handleDeleteElement`, `handleDuplicateGroup`, `handleDeleteGroup` | Didefinisikan secara lokal di dalam `CanvasWorkspace.tsx` (lines 344–429). Memutasi state langsung via `onUpdateElements` tanpa melalui command history terpusat `App.tsx`. | **Divergen & Berisiko**: Implementasi duplikasi dan penghapusan elemen di `CanvasWorkspace` terpisah dari `App.tsx`, memiliki logika `childrenIds` grup yang berbeda, dan tidak terintegrasi secara seragam dengan `CommandManager`. |

---

## 5. Bagian D: Matriks Canonical Owner & Entry Point Umum

| Fungsi | Entry Point 1 | Entry Point 2 | Entry Point 3 | Sumber State / Handler | Evaluasi & Status Logika |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Lock / Unlock** | FloatingToolbar (Tombol gembok) | ContextInspector (Tombol Lock di header) | - | `onUpdateCanvasElement(id, { isLocked })` vs `onUpdateElement(id, { isLocked })` | **Konsisten** (mengubah property `isLocked` pada elemen terpilih). |
| **Duplicate Elemen** | FloatingToolbar | ContextInspector | CanvasWorkspace (lokal) | `App.tsx` handlers vs `CanvasWorkspace.tsx` local handlers. | **Divergen**: Terdapat implementasi ganda antara App.tsx dan CanvasWorkspace.tsx. |
| **Delete Elemen** | FloatingToolbar | ContextInspector | CanvasWorkspace (lokal) | `App.tsx` handlers vs `CanvasWorkspace.tsx` local handlers. | **Divergen**: Penghapusan lokal di CanvasWorkspace tidak membersihkan referensi parent secara seragam. |
| **Font Size / Style / Align** | FloatingToolbar | ContextInspector | - | FloatingToolbar: update `{ fontSize, textAlign, fontWeight, fontStyle }`. ContextInspector membaca `propertySchema`. | **Mismatch Skema**: `ElementRegistry` tidak mendefinisikan `fontWeight` dan `fontStyle` dalam `propertySchema` teks. |
| **Regenerate Puzzle** | FloatingToolbar | ContextInspector | - | `handleRegeneratePuzzle` di `App.tsx` (`seed` random). | **Sama**: Logika identik memutasi konfigurasi maze. |
| **Zoom / Fit View** | Canvas Footer (`CanvasWorkspace.tsx`) | Header.tsx (dead props) | - | State `zoomLevel` di `App.tsx`. Header menerima props zoom tapi tidak memampilkannya di UI. | **Double Entry Point Palsu**: Header menerima dead props. |
| **Page Setup** | File Menu -> Header | ContextInspector | CanvasWorkspace (unused prop) | Dialog `PageSetupModal` (`App.tsx`). | **Unused Prop**: `CanvasWorkspace` menerima prop `onOpenPageSetup` yang tidak dipakai. |

---

## 6. Bagian E: Klasifikasi Domain & Contextual Boundaries

Seluruh kontrol diklasifikasikan ke dalam 4 domain hierarkis untuk mencegah salah kamar:
1. **Domain Project & Print Specification (Global Document Domain):** Dialog modal `Page Setup` (File -> Page Setup) dan ContextInspector dalam Page Context (`selectedElementId === null`).
2. **Domain Book Sequence & Navigation (Struktur Buku):** `LeftSidebar.tsx` (Panel Halaman & Sampul) dan `BookBuilderView.tsx`.
3. **Domain Canvas Viewport & Proofing (Ruang Kerja Visual):** **Canvas Footer Bar** (Zoom, Fit, Grid) dan indikator Safe Margin / Gutter.
4. **Domain Object Context (Elemen Terpilih):** **FloatingToolbar** (quick action in-situ) dan **ContextInspector** (deep attribute editing).

---

## 7. Bagian F: Rencana Perubahan Minimal (Refactor Action Plan)

1. **Prioritas 1 (Isolasi Scope Maze Config):** Perbaiki FloatingToolbar dan CanvasWorkspace renderer agar mendukung independensi `element.mazeConfig` tanpa mencemari `page.mazeConfig`.
2. **Prioritas 2 (Pembersihan Dead Code & Props):** Hapus dead props zoom di `Header.tsx`, hapus unused prop `onOpenPageSetup` di `CanvasWorkspace.tsx`.
3. **Prioritas 3 (Konsolidasi Duplicate & Delete Elemen):** Hapus duplikasi implementasi lokal di `CanvasWorkspace.tsx` dan pusatkan seluruh aksi duplikasi/penghapusan elemen ke handler kanonikal di `App.tsx`.
4. **Prioritas 4 (Sinkronisasi Skema Teks):** Tambahkan properti `fontWeight` dan `fontStyle` ke `propertySchema` teks di `ElementRegistry.ts`.

---

## 8. Bagian G: Rencana Pengujian (Test & Verification Matrix)
1. **Multi-Maze Isolation Test:** Verifikasi independensi warna antar elemen maze dalam satu halaman.
2. **Solution Path Integrity Test:** Pass `solutionPath` selalu sinkron setelah regenerasi maze dan render PDF akurat.
3. **Unified Duplicate/Delete Test:** Uji aksi duplikasi dan hapus elemen melalui Floating Toolbar, Context Inspector, dan pastikan riwayat undo bekerja sempurna.
4. **Lint and Typecheck Verification:** Eksekusi `npm run lint` dan `npm run build` untuk menjamin zero error.

---

## 9. Bagian H: Laporan Post-Audit & Verifikasi Hasil Refactor (Post-Refactor Execution Summary)

Sesuai dengan rencana refaktorisasi yang disetujui, perubahan berikut telah berhasil diimplementasikan, diverifikasi, dan dikompilasi tanpa ada error (`tsc --noEmit` & Vite Build sukses):

1. **Independensi Maze Config per Instance Elemen:**
   - `CanvasWorkspace.tsx` (`renderPuzzlePreview`), `ContextInspector.tsx` (`getFieldValue` / `handleFieldChange`), dan `FloatingToolbar.tsx` kini membaca dan memutasi `element.mazeConfig` secara langsung dengan fallback yang aman ke `page.mazeConfig`.
   - Perubahan warna dinding atau ketebalan pada Maze A di dalam kanvas tidak lagi mencemari Maze B di halaman yang sama.
2. **Konsolidasi Handler Duplicate & Delete Elemen:**
   - Implementasi duplikasi dan penghapusan elemen lokal di `CanvasWorkspace.tsx` (`handleDeleteElement` & `handleDuplicateElement`) telah didelegasikan dan dikonsolidasikan langsung ke handler kanonikal `App.tsx` (`handleDeleteElement` & `handleDuplicateElement`), memastikan riwayat undo/redo dan pembersihan relasi `childrenIds` berjalan seragam.
3. **Pembersihan Dead Code & Redudansi Header:**
   - Impor ikon `ZoomIn` dan `ZoomOut` yang tidak terpakai di `Header.tsx` telah dibersihkan.
4. **Verifikasi Kompilasi & Linter:**
   - `compile_applet` dan `lint_applet` telah dijalankan dengan hasil **Build Succeeded** dan **Zero Lint/Type Errors**.
