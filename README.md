# 🎓 NusaSkill Interactive LMS

NusaSkill adalah platform *Learning Management System* (LMS) Serverless yang dirancang untuk lembaga kursus komputer digital. Menggunakan arsitektur modern tanpa server backend tradisional, aplikasi ini memanfaatkan **HTML/CSS/JS (Front-End)** dan **Google Apps Script & Google Sheets (Back-End & Database)**.

## 🚀 Fitur Utama
- **Sistem Pendaftaran Berbayar:** Integrasi pembayaran via DANA & verifikasi admin via WhatsApp.
- **Role-Based Access Control:** Pemisahan dashboard antara Peserta dan Instruktur.
- **Katalog Kursus Berjenjang:** Kurikulum terstruktur (Basic, Intermediate, Advance).
- **Penilaian Terpusat:** Instruktur dapat memberikan nilai (0-100) dan *feedback* langsung dari panel admin.
- **Auto-Generate Certificate:** Peserta yang lulus (Nilai >= 80) dapat mengunduh Sertifikat PDF otomatis.

## 🛠️ Teknologi yang Digunakan
- **Front-End:** HTML5, CSS3, Vanilla JavaScript.
- **Back-End:** Google Apps Script (REST API).
- **Database:** Google Sheets.
- **Hosting:** GitHub Pages.

## 📂 Cara Instalasi (Deployment)
1. *Clone* repository ini ke lokal komputer Anda.
2. Buat file Google Sheets dengan tab: `Users`, `Courses`, `Submissions`, `Certificates`.
3. Pasang kode `Code.gs` (ada di folder `backend_backup`) ke Google Apps Script (Ekstensi > Apps Script).
4. *Deploy* script sebagai *Web App* (Akses: Anyone).
5. Salin URL Web App tersebut dan tempelkan pada variabel `SCRIPT_URL` di dalam file `.html`.
6. *Push* kode ke GitHub dan aktifkan **GitHub Pages**.

© 2026 NusaSkill EdTech.
