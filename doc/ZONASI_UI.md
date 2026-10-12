

Panduan Zonasi UI Studio Hybrid untuk Non-Desainer
Oct 12, 2026 · @markosaas
Setiap zona punya satu tugas: panel kiri menambah, floating bar mengubah cepat, Inspector mengatur detail, footer bernavigasi, header mengelola buku. Panduan ini berlaku untuk tampilan terakhir (halaman 51, elemen teks terpilih) dan mengikuti alur pengguna dari mulai sampai ekspor.
1. Pembagian tugas zona
Zona
Tugas tunggal
Pertanyaan pengguna yang dijawab
Panel kiri
Menambah
"Apa yang mau saya taruh di halaman ini?"
Floating bar
Mengubah objek terpilih dengan cepat
"Bagaimana membuat ini terlihat benar?"
Inspector kanan
Mengatur detail dan halaman
"Bagaimana mengaturnya dengan presisi?"
Footer
Bernavigasi dan melihat
"Saya di mana, dan bagaimana tampilannya?"
Header
Mengelola buku
"Bagaimana menyimpan, mengecek, dan mengeluarkan buku?"

Alur pengguna yang dilayani:
1. Mulai dan atur buku (ukuran, jumlah halaman).
2. Susun struktur halaman (judul, isi, kunci jawaban).
3. Isi halaman (puzzle, teks, gambar).
4. Rapikan.
5. Cek kesiapan cetak.
6. Ekspor dan unggah.
2. Floating bar: maksimal 6 kontrol
Yang tampil adalah hal yang dilakukan pada objek ini dalam 10 detik pertama. Sisanya masuk menu "•••" atau Inspector.
Objek
Tampil di bar
Pindah ke "•••" atau Inspector
Teks
Font, ukuran (-/+), warna, tebal, rata
Miring, garis bawah, kapital, spasi: Inspector
Puzzle (labirin, kisi, sudoku, worksheet)
Acak (tombol utama berwarna), tampilkan jawaban; labirin: warna dan tebal dinding
Algoritma, ukuran grid, kesulitan: Inspector
Gambar / clipart
Cermin, transparansi
Ukuran presisi, rotasi: Inspector
Shape (nanti)
Isi, garis, tebal garis
Radius, putus-putus: Inspector
Beberapa objek
Rata, Grup, jarak sama
Detail: Inspector
Semua objek
Kunci, duplikat, hapus, "•••" (urutan lapisan)
—
Perubahan dari kondisi sekarang:
• Grup hanya muncul saat seleksi lebih dari satu (temuan E-1).
• Pemformatan teks dipadatkan: tebal, miring, dan garis bawah tidak harus tiga tombol sejajar.
• Tombol aksi utama puzzle diberi warna berbeda agar langsung terlihat oleh orang baru.
3. Inspector kanan: detail dengan bahasa awam
Aturan:
1. Satu judul jelas di atas ("Teks", "Labirin", "Halaman 51").
2. Bagian Dasar terbuka, Lanjutan tertutup, sehingga pemula tidak melihat slider spasi huruf kecuali membukanya.
3. Label berbahasa sehari-hari ("Jarak antar baris", bukan "Line Height"), satuan sama dengan cetak (mm, pt), dan tombol Atur ulang per bagian.
4. Kontrol ganda (toolbar dan Inspector) harus sinkron seketika.
Kondisi
Isi Inspector
Tidak ada seleksi
Kartu Halaman: peran halaman (judul, isi, kunci jawaban), bingkai, ringkasan trim dan bleed. Kartu Kesiapan cetak (preflight) dengan daftar masalah yang bisa diklik
Teks
Dasar: isi teks, font, ukuran, warna, rata. Lanjutan: jarak baris, jarak huruf, kapital, rotasi
Puzzle
Dasar: jenis dan kesulitan, ukuran, jawaban. Lanjutan: algoritma, seed, ikon start/finish. Peringatan cetak muncul di sini
Gambar / Shape
Dasar: ukuran, posisi, transparansi. Lanjutan: rotasi, crop
Grup / banyak objek
Rata, distribusi, aksi massal
Lock, Duplikat, dan Hapus tidak diduplikasi di Inspector tanpa alasan; cukup di floating bar, kecuali saat Focus Mode menyembunyikan Inspector.
4. Panel kiri: menambah, urut sesuai alur kerja
Tab
Isi
Catatan
Template (baru)
Halaman judul, halaman puzzle + instruksi, halaman kunci jawaban
Titik mulai paling mudah bagi non-desainer; dampak terbesar pada kecepatan. Aturan template halaman versus objek: bagian 9
Elemen
Puzzle, Teks, Clipart, lalu Shape dan Unggahan
Tambahkan pencarian dan kategori "Paling sering"
Halaman
Thumbnail, urutan, duplikat, peran halaman
Halaman bermasalah diberi titik kuning
Bingkai
Bingkai dekoratif
Bisa digabung ke Elemen agar rail lebih ringkas
Layer (baru)
Daftar objek di halaman, kunci dan sembunyi
Perlu saat objek bertumpuk atau terkunci
Klik dan seret tetap tersedia, dan tooltip penjelasan pada item dipertahankan.
5. Footer: navigasi dan tampilan, bukan pengaturan
Footer tidak boleh meluap (temuan L-1): pakai ikon dan ringkasan.
Posisi
Isi
Kiri
Panah halaman, "51 / 51" dalam satu baris, chip peran halaman (Recto/Verso)
Tengah
Zoom (geser, persen), tombol Pas layar
Kanan
Ikon toggle Garis bantu dan Monokrom (dengan tooltip). Status kesiapan ("Siap cetak" atau "3 peringatan") yang bisa diklik untuk membuka Inspector
Mode Fokus tetap di header, dan preferensi tampilan yang jarang disentuh masuk menu "Tampilan".
6. Header: pengelolaan buku
Tampilkan nama buku, status simpan, Undo/Redo, Mode Fokus, Utilitas, dan Bagikan. Tambahkan satu tombol Ekspor/Terbitkan yang jelas sebagai tujuan akhir (membuka Download Center), karena sekarang tujuan itu tersembunyi di menu.
7. Hal yang membuat non-desainer berhasil
• Halaman kosong yang jujur: satu petunjuk saja ("Seret elemen dari kiri"), berupa overlay yang tidak ikut ekspor. Hapus placeholder ganda (temuan L-3).
• Langkah berikutnya: kartu kecil di Inspector saat tidak ada seleksi, misalnya "Tambah puzzle", "Atur halaman berikutnya", "Cek siap cetak".
• Peringatan dalam bahasa tindakan: bukan "Pelanggaran safe zone", tetapi "Teks ini terlalu dekat ke tepi, geser 3 mm ke dalam. [Perbaiki]".
• Satu cara utama untuk setiap aksi, cara lain hanya sebagai pintasan.
8. Urutan pengerjaan
1. Perbaikan footer dan Grup di floating bar (risiko rendah).
2. Struktur Inspector Dasar/Lanjutan dan bahasa label.
3. Overlay placeholder dan peringatan preflight.
4. Panel Template dan Layer.
Poin 1 dan 2 dapat menjadi kriteria penerimaan Patch 4 pada kontrak. Poin 3 dan 4 sebaiknya menjadi bagian baru di kontrak.
9. Ketahanan terhadap tipe baru (Calendar, Tracker, Planner, Notebook)
Zonasi tidak perlu didesain ulang saat tipe baru masuk; yang bertambah adalah isi tiap zona. Syaratnya, tipe baru tidak membawa komponen UI sendiri dan seluruh kontrolnya dideklarasikan lewat capabilities dan propertySchema di ElementRegistry.
Zona
Perubahan saat tipe baru masuk
Desain ulang?
Panel kiri
Kategori baru di tab Elemen dan isi baru di tab Template; pencarian dan "Paling sering" menjadi wajib
Tidak
Floating bar
Kontrol baru dari flag capabilities
Tidak
Inspector
Bagian baru dari propertySchema
Tidak
Footer dan header
Tidak ada
Tidak
Tiga tekanan yang harus diputuskan lebih dulu
1. Batas 6 kontrol di floating bar. Calendar dan Tracker punya banyak opsi cepat, sehingga ControlZone dan ControlPriority (ditunda pada K-4) menjadi kebutuhan nyata. Tanpa keduanya, penempatan kontrol diputuskan manual untuk setiap tipe.
2. Seleksi di dalam objek. Kalender dan tracker berisi sel, hari, dan kotak centang. Pola dua tingkat (objek, lalu isi objek) harus diputuskan sebelum tipe ini dibangun: Inspector menampilkan konteks "sel dalam objek", dan Esc naik satu tingkat. Ini satu-satunya hal yang menyentuh arsitektur seleksi, bukan hanya konfigurasi.
3. Template halaman versus objek. Lihat aturan di bawah.
Aturan template halaman versus objek
Template berarti dua hal berbeda dan keduanya dipisahkan sejak awal.

Template halaman
Objek hasil generator
Isi
Kumpulan objek yang ditata di satu halaman (judul, puzzle, instruksi)
Satu objek bertipe sendiri dengan engine (mis. calendar)
Sifat setelah disisipkan
Objek lepas yang bebas diedit satu per satu
Tetap satu objek yang diatur lewat Inspector
Tempat di UI
Tab Template (panel kiri)
Tab Elemen, kategori sesuai tipe
Pengaturan
Pilih peran halaman; tidak ada Inspector khusus
propertySchema tipe itu
Contoh
Halaman judul, halaman puzzle + instruksi, halaman kunci jawaban
Kalender bulanan, tracker kebiasaan, halaman planner
Aturan:
• Menyisipkan template halaman tidak boleh membuat tipe baru. Hasilnya hanya objek dari tipe yang sudah terdaftar, ditempatkan lewat handler kanonis, dan seluruhnya menjadi satu entri Undo.
• Template halaman tidak membawa data yang melekat pada halaman asalnya (nomor halaman, peran, seed puzzle); semuanya dihitung ulang pada halaman tujuan.
• Objek generator wajib terdaftar di registry dengan capabilities, propertySchema, dan renderPdf setara kanvas.
• Placeholder dalam template berupa overlay yang tidak ikut ekspor, dan ikut diperiksa preflight bila belum diganti.
• Template yang menyisipkan objek generator (mis. halaman planner berisi kalender) hanya merujuk tipe itu, tidak menyalin logikanya.
Aturan agar zonasi tetap stabil
• Tidak ada percabangan type === di UI; kontrol ditentukan flag capabilities.
• Aksi universal tetap di floating bar.
• Kontrol Dasar di Inspector maksimal sekitar 5; sisanya masuk Lanjutan.
• Setiap tipe baru lulus uji alih-seleksi bersama semua tipe lain.
• Satu aksi pengguna sama dengan satu entri Undo, termasuk penyisipan template.