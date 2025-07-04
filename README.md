# NoctuaNovel

![image](https://github.com/user-attachments/assets/144c8923-3d60-4e95-94c9-87d1579c56a3)

![image](https://github.com/user-attachments/assets/87299d67-8660-47e8-8318-9bb1a80771de)

![image](https://github.com/user-attachments/assets/32846021-ef4e-4637-b5c1-0f92bc109f88)


\<p align="center"\>
Aplikasi web modern untuk membaca novel yang dibangun dengan Next.js dan didukung oleh API web scraping kustom. Proyek ini memungkinkan pengguna untuk menelusuri, mencari, dan membaca berbagai novel yang bersumber dari web dengan antarmuka yang bersih dan responsif.
\</p\>

## ✨ Fitur Utama

  - **Browse Novel**: Menampilkan novel berdasarkan rilisan terbaru, pilihan editor, dan rekomendasi.
  - **Pencarian Lanjutan**: Mencari novel berdasarkan judul dengan antarmuka yang dinamis.
  - **Halaman Detail**: Tampilan informasi lengkap novel, termasuk sinopsis, genre, status, dan daftar chapter.
  - **Halaman Baca Imersif**: Pengalaman membaca yang fokus dengan opsi untuk menyesuaikan ukuran font.
  - **Autentikasi Pengguna**: Sistem login dan registrasi yang aman menggunakan Clerk.
  - **Desain Responsif**: Tampilan yang optimal di berbagai perangkat, dari desktop hingga mobile.

## 🛠️ Teknologi yang Digunakan

Proyek ini dibagi menjadi dua bagian utama: frontend (aplikasi web) dan backend (API).

**Frontend:**

  * **Framework**: [Next.js](https://nextjs.org/) (App Router)
  * **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
  * **Styling**: [Tailwind CSS](https://tailwindcss.com/)
  * **Komponen UI**: [shadcn/ui](https://ui.shadcn.com/)
  * **Autentikasi**: [Clerk](https://clerk.com/)
  * **Icons**: [Lucide React](https://lucide.dev/)

**Backend:**

  * **Framework**: [Flask](https://flask.palletsprojects.com/) (Python)
  * **Web Scraping**: [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/) & [Requests](https://requests.readthedocs.io/en/latest/)

## 🚀 Memulai Proyek

Untuk menjalankan proyek ini secara lokal, Anda perlu menyiapkan backend (API) dan frontend (Next.js) secara terpisah.

### Prasyarat

  - Node.js (v18.17 atau lebih baru)
  - Python (v3.8 atau lebih baru) & pip

### 1\. Instalasi Backend (Flask API)

API ini bertanggung jawab untuk melakukan scraping data novel.

```bash
# 1. Clone repository ini
git clone https://github.com/SahrulRamadhanHardiansyah/novel-api

# 2. Masuk ke folder backend
cd novel-api

# 3. Buat dan aktifkan virtual environment (direkomendasikan)
python -m venv venv
source venv/bin/activate  # Untuk MacOS/Linux
# atau
.\venv\Scripts\activate  # Untuk Windows

# 4. Instal semua library yang dibutuhkan
# Jika Anda belum punya requirements.txt, buat dengan: pip freeze > requirements.txt
pip install -r requirements.txt

# 5. Jalankan server Flask
# Port default adalah 5001
python app.py
```

### 2\. Instalasi Frontend (Next.js App)

Aplikasi web utama yang akan diakses oleh pengguna.

```bash
# 1. Clone repository ini
git clone https://github.com/SahrulRamadhanHardiansyah/noctua-novel

# 2. Buka terminal baru dan masuk ke folder frontend
cd noctua-novel

# 3. Instal semua dependencies
npm install

# 4. Buat file environment variable
# Salin dari .env.example dan ganti isinya dengan kunci Anda
cp .env.example .env.local

# 5. Isi file .env.local dengan kunci dari Clerk dan URL API Anda
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# 6. Jalankan server development Next.js
npm run dev
```

Sekarang, buka `http://localhost:3000` di browser Anda untuk melihat aplikasinya.

## 📝 To-Do / Rencana Fitur

Proyek ini masih dalam tahap pengembangan. Berikut adalah beberapa fitur yang direncanakan untuk ditambahkan di masa depan:

  - [ ] **Sistem Favorit/Bookmark**: Kemampuan bagi pengguna untuk menyimpan novel favorit mereka.
  - [ ] **Fitur Komentar**: Menambahkan bagian komentar di setiap halaman detail novel.
  - [ ] **Riwayat Baca**: Melacak chapter terakhir yang dibaca oleh pengguna.
  - [ ] **Paginasi**: Menambahkan navigasi halaman untuk daftar novel yang panjang.

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.
