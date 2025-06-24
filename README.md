# SIAKAD - Sistem Informasi Akademik

SIAKAD adalah sistem informasi akademik berbasis web yang dirancang untuk mengelola data akademik perguruan tinggi. Sistem ini mendukung tiga jenis pengguna: Admin, Dosen, dan Mahasiswa dengan fitur-fitur yang berbeda untuk masing-masing role.

## 🎯 Fitur Utama

### 👨‍💼 Admin
- Manajemen data dosen
- Manajemen data mahasiswa
- Manajemen mata kuliah
- Manajemen ruang kuliah
- Manajemen jadwal kuliah
- Manajemen KRS (Kartu Rencana Studi)
- Manajemen presensi
- Manajemen pengampu mata kuliah
- Manajemen golongan dosen

### 👨‍🏫 Dosen
- Melihat jadwal mengajar
- Mengelola presensi mahasiswa
- Melihat data mata kuliah yang diampu
- Melihat daftar mahasiswa per mata kuliah

### 👨‍🎓 Mahasiswa
- Melihat jadwal kuliah
- Mengisi KRS
- Melihat presensi
- Melihat nilai (jika tersedia)

## 🛠️ Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
- **Backend**: PHP
- **Database**: MySQL/MariaDB
- **Server**: XAMPP (Apache + MySQL + PHP)
- **Icons**: Font Awesome
- **Charts**: Chart.js

## 📋 Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:

- [XAMPP](https://www.apachefriends.org/download.html) (versi terbaru)
- Web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Cara Instalasi

1. **Clone atau download repository ini**
   ```bash
   git clone [https://github.com/HakimIqbal/Ujikom-Sistem-Informasi-Akademik.git]
   # atau download sebagai ZIP dan extract
   ```

2. **Pindahkan folder ke direktori htdocs XAMPP**
   ```
   C:\xampp\htdocs\ (Windows)
   /Applications/XAMPP/xamppfiles/htdocs/ (macOS)
   /opt/lampp/htdocs/ (Linux)
   ```

3. **Jalankan XAMPP**
   - Buka XAMPP Control Panel
   - Start Apache dan MySQL

4. **Import database**
   - Buka phpMyAdmin: `http://localhost/phpmyadmin`
   - Buat database baru dengan nama `siakad_db`
   - Import file `siakad_db.sql`

5. **Akses aplikasi**
   - Buka browser dan akses: `http://localhost/Ujikom-Sistem-Informasi-Akademik`

## 👤 Akun Default

### Admin
- **Username**: `admin`
- **Password**: `admin`

### Mahasiswa
- **Username**: `11220001`
- **Password**: `mhs`

### Dosen
- **Username**: `D002`
- **Password**: `dsn`

## 📁 Struktur Database

Aplikasi menggunakan database MySQL dengan tabel-tabel berikut:

- `users` - Data pengguna dan autentikasi
- `mahasiswa` - Data mahasiswa
- `dosen` - Data dosen
- `matakuliah` - Data mata kuliah
- `ruang` - Data ruang kuliah
- `jadwal_kuliah` - Jadwal perkuliahan
- `krs` - Kartu Rencana Studi
- `presensi` - Data kehadiran mahasiswa
- `pengampu` - Data pengampu mata kuliah
- `golongan` - Golongan dosen

## 🔧 API Endpoints

Sistem menyediakan API endpoints berikut:

- `api/login.php` - Autentikasi pengguna
- `api/mahasiswa.php` - CRUD data mahasiswa
- `api/dosen.php` - CRUD data dosen
- `api/matakuliah.php` - CRUD data mata kuliah
- `api/ruang.php` - CRUD data ruang
- `api/jadwal_kuliah.php` - CRUD jadwal kuliah
- `api/krs.php` - CRUD KRS
- `api/presensi.php` - CRUD presensi
- `api/pengampu.php` - CRUD pengampu
- `api/golongan.php` - CRUD golongan

## 🔒 Keamanan

- Autentikasi berbasis role (Admin, Dosen, Mahasiswa)
- Validasi input pada sisi client dan server
- Sanitasi data untuk mencegah SQL injection
- Session management untuk menjaga keamanan

## 🐛 Troubleshooting

### Masalah Umum

1. **Aplikasi tidak bisa diakses**
   - Pastikan XAMPP sudah running
   - Cek apakah Apache dan MySQL sudah start
   - Pastikan file berada di folder `htdocs`

2. **Database connection error**
   - Pastikan MySQL sudah running
   - Cek konfigurasi database di `api/db.php`
   - Pastikan database `siakad_db` sudah dibuat

3. **Login tidak berhasil**
   - Pastikan menggunakan username dan password yang benar
   - Cek apakah data user sudah ada di database

---

**Note**: Project ini dibuat untuk tujuan pembelajaran dan demonstrasi. Untuk penggunaan production, disarankan untuk menambahkan fitur keamanan yang lebih robust.
