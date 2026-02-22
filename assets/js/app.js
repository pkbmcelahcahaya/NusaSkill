/* =========================================================
   MASTER JAVASCRIPT - NUSASKILL LMS
   ========================================================= */

// URL DEPLOY APPS SCRIPT ANDA
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz9qgmLdUnj6-4UfhNHnlqPKVC42NVVdmDWmGdbVHTIlJVedJKQtQbWQ3NF0CSkB9t_RA/exec";

// Fungsi Logout Global
function logout() {
    localStorage.removeItem("userLMS");
    window.location.href = "index.html";
}

// Menunggu seluruh elemen HTML selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
    
    const user = JSON.parse(localStorage.getItem("userLMS"));

    // --------------------------------------------------
    // 1. LOGIKA HALAMAN LOGIN (index.html)
    // --------------------------------------------------
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        // Jika sudah login, langsung lempar ke dashboard
        if(user) {
            window.location.href = user.role === "Instruktur" ? "instructor.html" : "dashboard.html";
        }

        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const btn = document.getElementById("loginBtn");
            const msg = document.getElementById("loginMsg");
            btn.innerText = "Memeriksa...";
            msg.innerText = "";

            try {
                let response = await fetch(SCRIPT_URL, { 
                    method: "POST", 
                    body: JSON.stringify({
                        action: "login",
                        email: document.getElementById("email").value,
                        password: document.getElementById("password").value
                    }) 
                });
                let result = await response.json();

                if (result.status === "success") {
                    localStorage.setItem("userLMS", JSON.stringify(result.userData));
                    msg.style.color = "green";
                    msg.innerText = "Login sukses! Mengalihkan...";
                    window.location.href = result.userData.role === "Instruktur" ? "instructor.html" : "dashboard.html";
                } else {
                    msg.style.color = "red";
                    msg.innerText = result.message;
                    btn.innerText = "Login";
                }
            } catch (error) {
                msg.style.color = "red";
                msg.innerText = "Terjadi kesalahan sistem.";
                btn.innerText = "Login";
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

            try {
                let response = await fetch(SCRIPT_URL, { 
                    method: "POST", 
                    body: JSON.stringify({
                        action: "register",
                        nama: nama,
                        email: document.getElementById("regEmail").value,
                        password: document.getElementById("regPass").value,
                        noHp: document.getElementById("regHp").value,
                        level: level,
                        durasi: document.getElementById("regDurasi").value
                    }) 
                });
                let result = await response.json();

                if (result.status === "success") {
                    regForm.style.display = "none";
                    document.getElementById("paymentArea").style.display = "block";
                    let tgl = new Date().toLocaleDateString('id-ID');
                    let waText = `Halo Admin, saya ingin konfirmasi pendaftaran NusaSkill.%0A%0ANama: ${nama}%0AProgram: ${level}%0ATanggal: ${tgl}%0A%0A(Lampirkan bukti transfer di sini)`;
                    document.getElementById("waLink").href = `https://wa.me/6281223546686?text=${waText}`;
                } else {
                    msg.style.color = "red";
                    msg.innerText = result.message;
                    btn.innerText = "Daftar & Lanjut Pembayaran";
                }
            } catch (error) {
                msg.style.color = "red";
                msg.innerText = "Koneksi gagal. Coba lagi.";
                btn.innerText = "Daftar & Lanjut Pembayaran";
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

        fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "getCourses" }) })
            .then(res => res.json())
            .then(result => {
                document.getElementById('loadingMsg').style.display = 'none';
                if (result.status === "success" && result.data.length > 0) {
                    result.data.forEach(course => {
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
                    courseContainer.innerHTML = "<p>Modul belum tersedia di database Anda.</p>";
                }
            }).catch(e => {
                document.getElementById('loadingMsg').innerText = "Gagal memuat modul dari server.";
            });
    }

    // --------------------------------------------------
    // 4. LOGIKA HALAMAN COURSE (course.html) DENGAN PENGUNCIAN KETAT
    // --------------------------------------------------
    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
        if (!user) return window.location.href = "index.html";

        const urlParams = new URLSearchParams(window.location.search);
        const modId = urlParams.get('id'); // Contoh: CRS-001
        
        // --- 1. PEMETAAN LEVEL MODUL ---
        const courseLevelMap = {
            "CRS-001": "Basic",
            "CRS-002": "Basic",
            "CRS-003": "Intermediate",
            "CRS-004": "Intermediate",
            "CRS-005": "Advance",
            "CRS-006": "Advance"
        };
        
        // --- 2. SISTEM KEAMANAN (VALIDASI KETAT) ---
        const levelPeserta = user.level;
        const levelModul = courseLevelMap[modId];
        let isAllowed = false;

        if (user.role === "Instruktur") {
            isAllowed = true; // Instruktur bebas ke mana saja
        } else if (levelModul === levelPeserta) {
            isAllowed = true; // Peserta hanya boleh akses levelnya sendiri
        }

        if (!isAllowed) {
            alert(`🔒 Akses Ditolak! Anda terdaftar di paket ${levelPeserta}. Anda tidak memiliki izin untuk mengakses materi ${levelModul || 'ini'}.`);
            window.location.href = "dashboard.html";
            return; // Hentikan script di sini
        }
        // --- AKHIR SISTEM KEAMANAN ---

        document.getElementById("courseTitle").innerText = urlParams.get('title') || "Materi Kelas";
        
        // Atur link Buka Modul berdasarkan CRS-ID yang baru
        const btnMateri = document.getElementById("courseLink");
        if(modId === "CRS-001") btnMateri.href = "modul1.html";
        else if(modId === "CRS-002") btnMateri.href = "modul2.html";
        else if(modId === "CRS-003") btnMateri.href = "modul3.html";
        else if(modId === "CRS-004") btnMateri.href = "modul4.html";
        else if(modId === "CRS-005") btnMateri.href = "modul5.html";
        else if(modId === "CRS-006") btnMateri.href = "modul6.html";
        else btnMateri.href = urlParams.get('link') || "#";

        taskForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const btn = document.getElementById("submitBtn");
            const msg = document.getElementById("msg");
            
            const pilihanMinggu = document.getElementById("pilihanMinggu") ? document.getElementById("pilihanMinggu").value : "Tugas Akhir";
            const linkTugas = document.getElementById("linkTugas").value;

            btn.innerText = "Mengirim...";
            btn.style.backgroundColor = "#f39c12";

            try {
                let response = await fetch(SCRIPT_URL, { 
                    method: "POST", 
                    body: JSON.stringify({
                        action: "submitTask",
                        userId: user.id, 
                        courseId: modId,
                        kategoriTugas: pilihanMinggu, 
                        linkTugas: linkTugas
                    }) 
                });
                await response.json();
                
                msg.style.color = "green";
                msg.innerText = "✅ Tugas berhasil dikirim! Silakan cek halaman Nilai.";
                btn.innerText = "Tugas Terkirim";
                btn.style.backgroundColor = "#2ecc71";
                taskForm.reset();
            } catch (error) {
                msg.style.color = "red";
                msg.innerText = "❌ Gagal mengirim tugas.";
                btn.innerText = "Kirim Tugas";
                btn.style.backgroundColor = "var(--primary-color)";
            }
        });
    }

    // --------------------------------------------------
    // 5. LOGIKA HALAMAN PROGRESS/RAPOT (progress.html)
    // --------------------------------------------------
    const certBox = document.getElementById("certBox");
    if (certBox) {
        if (!user) return window.location.href = "index.html";
        
        fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "getProgress", userId: user.id }) })
            .then(res => res.json())
            .then(result => {
                const tbody = document.getElementById("tableBody");
                tbody.innerHTML = "";
                let hasPassed = false;

                if (result.submissions.length === 0) {
                    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Belum ada tugas yang dikumpulkan.</td></tr>";
                    return;
                }

                result.submissions.forEach(sub => {
                    let statusColor = "orange";
                    let statusText = "Menunggu";
                    let nilaiAngka = parseInt(sub.nilai);

                    if (!isNaN(nilaiAngka)) {
                        if (nilaiAngka >= 80) { 
                            statusColor = "green"; 
                            statusText = "Lulus"; 
                            hasPassed = true; 
                        } else { 
                            statusColor = "red"; 
                            statusText = "Revisi"; 
                        }
                    }

                    tbody.innerHTML += `
                        <tr>
                            <td>${sub.courseId}</td>
                            <td><a href="${sub.link}" target="_blank" style="color:blue;">Lihat Tugas</a></td>
                            <td><strong style="color:${statusColor};">${sub.nilai}</strong></td>
                            <td>${sub.feedback}</td>
                            <td><span style="color:white; background:${statusColor}; padding:3px 8px; border-radius:3px; font-size:12px;">${statusText}</span></td>
                        </tr>
                    `;
                });

                if(hasPassed) certBox.style.display = "block";
            }).catch(e => {
                document.getElementById("tableBody").innerHTML = "<tr><td colspan='5' style='text-align:center; color:red;'>Gagal memuat data rapor.</td></tr>";
            });
    }

    // --------------------------------------------------
    // 6. LOGIKA HALAMAN INSTRUKTUR (instructor.html)
    // --------------------------------------------------
    const gradingBody = document.getElementById("gradingBody");
    if (gradingBody) {
        if (!user || user.role !== "Instruktur") {
            alert("Akses Ditolak! Anda bukan Instruktur.");
            window.location.href = "index.html";
        }

        // Globalisasi fungsi agar bisa dipanggil tombol (onclick)
        window.saveGrade = async function(subId) {
            const btn = event.target;
            const nilai = document.getElementById("nilai_" + subId).value;
            const feedback = document.getElementById("feedback_" + subId).value;
            
            if(nilai === "" || feedback === "") return alert("Nilai dan Feedback harus diisi!");
            btn.innerText = "...";

            try {
                let response = await fetch(SCRIPT_URL, {
                    method: "POST",
                    body: JSON.stringify({ action: "updateGrade", subId: subId, nilai: nilai, feedback: feedback })
                });
                let result = await response.json();
                
                if(result.status === "success") {
                    btn.innerText = "Tersimpan ✔";
                    btn.style.backgroundColor = "#2ecc71";
                }
            } catch (e) {
                alert("Gagal menyimpan data ke database.");
                btn.innerText = "Simpan";
            }
        };

        fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify({ action: "getAllSubmissions" }) })
            .then(res => res.json())
            .then(result => {
                gradingBody.innerHTML = "";
                if(result.data.length === 0) {
                    gradingBody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Belum ada tugas yang masuk.</td></tr>";
                    return;
                }
                result.data.forEach(sub => {
                    gradingBody.innerHTML += `
                        <tr>
                            <td>${sub.subId}</td>
                            <td>${sub.userId}</td>
                            <td>${sub.courseId}</td>
                            <td><a href="${sub.linkTugas}" target="_blank" style="color:#3498db; font-weight:bold;">Buka Tugas</a></td>
                            <td><input type="number" id="nilai_${sub.subId}" value="${sub.nilai === 'Belum Dinilai' ? '' : sub.nilai}" style="width:70px; padding:5px;"></td>
                            <td><input type="text" id="feedback_${sub.subId}" value="${sub.feedback === 'Belum ada feedback' ? '' : sub.feedback}" style="padding:5px; width:90%;"></td>
                            <td><button onclick="saveGrade('${sub.subId}')" style="background:var(--primary-color); color:white; border:none; padding:8px 12px; border-radius:3px; cursor:pointer;">Simpan</button></td>
                        </tr>
                    `;
                });
            }).catch(e => {
                gradingBody.innerHTML = "<tr><td colspan='7' style='text-align:center; color:red;'>Gagal memuat database antrean tugas.</td></tr>";
            });
    }
// --------------------------------------------------
    // 7. FOOTER OTOMATIS (LPK Alpha Beta)
    // --------------------------------------------------
    const footerElem = document.createElement("footer");
    
    // Anda bisa menyesuaikan teksnya di sini
    footerElem.innerHTML = `&copy; ${new Date().getFullYear()} LPK Alpha Beta. Semua Hak Dilindungi.`;
    
    // Gaya (Style) untuk footer agar rapi
    footerElem.style.textAlign = "center";
    footerElem.style.padding = "20px";
    footerElem.style.marginTop = "50px";
    footerElem.style.backgroundColor = "#2c3e50"; // Warna background gelap
    footerElem.style.color = "#ecf0f1"; // Warna teks putih/terang
    footerElem.style.fontSize = "14px";
    footerElem.style.width = "100%";
    footerElem.style.bottom = "0";

    // Menambahkan footer ke bagian paling bawah dari body HTML
    document.body.appendChild(footerElem);
});
