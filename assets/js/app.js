/* =========================================================
   MASTER JAVASCRIPT - NUSASKILL LMS (REVISED & OPTIMIZED)
   ========================================================= */

// URL DEPLOY APPS SCRIPT ANDA
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz9qgmLdUnj6-4UfhNHnlqPKVC42NVVdmDWmGdbVHTIlJVedJKQtQbWQ3NF0CSkB9t_RA/exec";

// Fungsi Logout Global
function logout() {
    localStorage.removeItem("userLMS");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
    
    const user = JSON.parse(localStorage.getItem("userLMS"));

    // Konfigurasi standar untuk Fetch API ke Google Apps Script
    const fetchOptions = (data) => ({
        method: "POST",
        // Gunakan text/plain untuk menghindari CORS preflight (OPTIONS) error di Apps Script
        headers: { "Content-Type": "text/plain;charset=utf-8" }, 
        body: JSON.stringify(data)
    });

    // --------------------------------------------------
    // 1. LOGIKA HALAMAN LOGIN (index.html)
    // --------------------------------------------------
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        if (user) {
            window.location.href = user.role === "Instruktur" ? "instructor.html" : "dashboard.html";
            return; // Hentikan eksekusi script selanjutnya
        }

        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const btn = document.getElementById("loginBtn");
            const msg = document.getElementById("loginMsg");
            
            btn.innerText = "Memeriksa...";
            btn.disabled = true; // Cegah double-click
            msg.innerText = "";

            try {
                let response = await fetch(SCRIPT_URL, fetchOptions({
                    action: "login",
                    email: document.getElementById("email").value,
                    password: document.getElementById("password").value
                }));
                let result = await response.json();

                if (result.status === "success") {
                    localStorage.setItem("userLMS", JSON.stringify(result.userData));
                    msg.style.color = "green";
                    msg.innerText = "Login sukses! Mengalihkan...";
                    window.location.href = result.userData.role === "Instruktur" ? "instructor.html" : "dashboard.html";
                } else {
                    msg.style.color = "red";
                    msg.innerText = result.message || "Email atau password salah.";
                    btn.innerText = "Login";
                    btn.disabled = false;
                }
            } catch (error) {
                console.error("Login Error:", error);
                msg.style.color = "red";
                msg.innerText = "Terjadi kesalahan sistem atau koneksi.";
                btn.innerText = "Login";
                btn.disabled = false;
            }
        });
    }

    // --------------------------------------------------
    // 2. LOGIKA HALAMAN PENDAFTARAN (pendaftaran.html)
    // --------------------------------------------------
    const regForm = document.getElementById("regForm");
    if (regForm) {
        regForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const btn = document.getElementById("regBtn");
            const msg = document.getElementById("regMsg");
            const nama = document.getElementById("regNama").value;
            const level = document.getElementById("regLevel").value;
            
            btn.innerText = "Memproses Data...";
            btn.disabled = true;

            try {
                let response = await fetch(SCRIPT_URL, fetchOptions({
                    action: "register",
                    nama: nama,
                    email: document.getElementById("regEmail").value,
                    password: document.getElementById("regPass").value,
                    noHp: document.getElementById("regHp").value,
                    level: level,
                    durasi: document.getElementById("regDurasi").value
                }));
                let result = await response.json();

                if (result.status === "success") {
                    regForm.style.display = "none";
                    document.getElementById("paymentArea").style.display = "block";
                    
                    let tgl = new Date().toLocaleDateString('id-ID');
                    // Menggunakan encodeURIComponent agar aman dari karakter khusus & spasi
                    let waText = `Halo Admin, saya ingin konfirmasi pendaftaran NusaSkill.\n\nNama: ${nama}\nProgram: ${level}\nTanggal: ${tgl}\n\n(Lampirkan bukti transfer di sini)`;
                    document.getElementById("waLink").href = `https://wa.me/6281223546686?text=${encodeURIComponent(waText)}`;
                } else {
                    msg.style.color = "red";
                    msg.innerText = result.message || "Gagal mendaftar.";
                    btn.innerText = "Daftar & Lanjut Pembayaran";
                    btn.disabled = false;
                }
            } catch (error) {
                console.error("Register Error:", error);
                msg.style.color = "red";
                msg.innerText = "Koneksi gagal. Silakan coba lagi.";
                btn.innerText = "Daftar & Lanjut Pembayaran";
                btn.disabled = false;
            }
        });
    }

    // --------------------------------------------------
    // 3. LOGIKA HALAMAN DASHBOARD (dashboard.html)
    // --------------------------------------------------
    const courseContainer = document.getElementById("courseContainer");
    if (courseContainer) {
        if (!user) return window.location.href = "index.html";
        
        document.getElementById("userNameDisplay").innerText = "Selamat Datang, " + user.nama + "!";
        document.getElementById("userLevelDisplay").innerText = user.level;
        document.getElementById("userEmailDisplay").innerText = user.email;

        fetch(SCRIPT_URL, fetchOptions({ action: "getCourses" }))
            .then(res => res.json())
            .then(result => {
                document.getElementById('loadingMsg').style.display = 'none';
                if (result.status === "success" && result.data.length > 0) {
                    
                    // Filter kursus agar yang muncul di dashboard HANYA yang sesuai level user
                    const filteredData = result.data.filter(c => c.level.toLowerCase() === user.level.toLowerCase() || user.role === "Instruktur");
                    
                    if(filteredData.length === 0) {
                        courseContainer.innerHTML = "<p>Belum ada modul yang tersedia untuk level Anda.</p>";
                        return;
                    }

                    filteredData.forEach(course => {
                        courseContainer.innerHTML += `
                            <div class="course-card">
                                <span style="background:var(--primary-color); color:white; padding:3px 8px; border-radius:3px; font-size:12px;">${course.level} - ${course.bulan}</span>
                                <h3 style="margin: 10px 0;">${course.judul}</h3>
                                <p style="color: #7f8c8d; font-size: 14px; margin: 0 0 15px 0;">Instruktur: ${course.instruktur}</p>
                                <button class="btn-action" onclick="window.location.href='course.html?id=${course.id}&title=${encodeURIComponent(course.judul)}&link=${encodeURIComponent(course.link)}'">Masuk Kelas</button>
                            </div>
                        `;
                    });
                } else {
                    courseContainer.innerHTML = "<p>Modul belum tersedia di database.</p>";
                }
            }).catch(e => {
                console.error("Fetch Courses Error:", e);
                document.getElementById('loadingMsg').innerText = "Gagal memuat modul dari server.";
            });
    }

    // --------------------------------------------------
    // 4. LOGIKA HALAMAN COURSE (course.html) - SECURITY FIXED
    // --------------------------------------------------
    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
        if (!user) return window.location.href = "index.html";

        const urlParams = new URLSearchParams(window.location.search);
        const modId = urlParams.get('id'); 
        
        // Pengecekan jika ID tidak ada di URL
        if (!modId) {
            alert("🔒 Modul tidak ditemukan atau URL tidak valid!");
            window.location.href = "dashboard.html";
            return;
        }
        
        // --- UPDATE LEVEL MODUL ---
        // Menambahkan CRS-007 dan CRS-008 agar 8 modul bisa terbaca (Saya set ke Advance, silakan ubah jika perlu)
        const courseLevelMap = {
            "CRS-001": "Basic",
            "CRS-002": "Basic",
            "CRS-003": "Intermediate",
            "CRS-004": "Intermediate",
            "CRS-005": "Advance",
            "CRS-006": "Advance",
            "CRS-007": "Advance", // Ditambahkan untuk Modul 7
            "CRS-008": "Advance"  // Ditambahkan untuk Modul 8
        };
        
        // --- VALIDASI (Case Insensitive & Handle Undefined) ---
        const userLevelClean = (user.level || "").trim().toLowerCase();
        const requiredLevel = (courseLevelMap[modId] || "").trim().toLowerCase();
        
        let isAllowed = false;
        if (user.role === "Instruktur") isAllowed = true;
        else if (userLevelClean === requiredLevel) isAllowed = true;

        if (!isAllowed) {
            const requiredDisplay = courseLevelMap[modId] || "Unknown";
            alert(`🔒 Akses Ditolak!\nLevel Anda: ${user.level}\nMateri ini khusus untuk level: ${requiredDisplay}`);
            window.location.href = "dashboard.html";
            return;
        }

        document.getElementById("courseTitle").innerText = urlParams.get('title') || "Materi Kelas";
        
        const btnMateri = document.getElementById("courseLink");
        
        // --- UPDATE LINK MODUL ---
        // 8 Modul terbaru dimasukkan di sini
        const mapLinks = {
            "CRS-001": "modul1-video-ai.html",
            "CRS-002": "modul2-ideasi.html",
            "CRS-003": "modul3-voice.html",
            "CRS-004": "modul4-visual.html",
            "CRS-005": "modul5-karakter.html",
            "CRS-006": "modul6-avatar.html",
            "CRS-007": "modul7-video.html",
            "CRS-008": "modul8-editing.html"
        };
        // Fallback jika tidak ada di mapLinks maka kembali ke dashboard atau beri link placeholder
        btnMateri.href = mapLinks[modId] || "#"; 

        taskForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const btn = document.getElementById("submitBtn");
            const msg = document.getElementById("msg");
            const pilihanMinggu = document.getElementById("pilihanMinggu") ? document.getElementById("pilihanMinggu").value : "Tugas Akhir";
            const linkTugas = document.getElementById("linkTugas").value;

            btn.innerText = "Mengirim...";
            btn.disabled = true;

            try {
                await fetch(SCRIPT_URL, fetchOptions({
                    action: "submitTask",
                    userId: user.id, 
                    courseId: modId,
                    kategoriTugas: pilihanMinggu, 
                    linkTugas: linkTugas
                }));
                
                msg.style.color = "green";
                msg.innerText = "✅ Tugas berhasil dikirim!";
                btn.innerText = "Kirim Tugas Lagi";
                btn.disabled = false;
                taskForm.reset();
            } catch (error) {
                console.error("Submit Task Error:", error);
                msg.style.color = "red";
                msg.innerText = "❌ Gagal mengirim tugas. Coba lagi.";
                btn.innerText = "Kirim Tugas";
                btn.disabled = false;
            }
        });
    }

    // --------------------------------------------------
    // 5. PROGRESS & 6. INSTRUCTOR
    // --------------------------------------------------
    if (document.getElementById("certBox") || document.getElementById("gradingBody")) {
        if (!user) return window.location.href = "index.html"; // Ditambahkan "return"
    }

    // --------------------------------------------------
    // 7. FOOTER OTOMATIS (LPK Alpha Beta)
    // --------------------------------------------------
    const footerElem = document.createElement("footer");
    footerElem.innerHTML = `&copy; ${new Date().getFullYear()} LPK Alpha Beta. Semua Hak Dilindungi.`;
    Object.assign(footerElem.style, {
        textAlign: "center",
        padding: "20px",
        marginTop: "50px",
        backgroundColor: "#2c3e50",
        color: "#ecf0f1",
        fontSize: "14px",
        width: "100%"
    });
    document.body.appendChild(footerElem);
});
