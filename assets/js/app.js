/* =========================================================
   MASTER JAVASCRIPT - NUSASKILL LMS
   ========================================================= */

// GANTI DENGAN URL DEPLOY APPS SCRIPT ANDA
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
                    let waText = `Halo Admin, saya ingin konfirmasi pembayaran NusaSkill.%0A%0ANama: ${nama}%0AProgram: ${level}%0ATanggal: ${tgl}%0A%0A(Lampirkan bukti transfer di sini)`;
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
                                <span class="badge">${course.level} - ${course.bulan}</span>
                                <h3 style="margin: 10px 0;">${course.judul}</h3>
                                <p style="color: #7f8c8d; font-size: 14px; margin: 0;">Instruktur: ${course.instruktur}</p>
                                <button class="btn-masuk" onclick="window.location.href='course.html?id=${course.id}&title=${encodeURIComponent(course.judul)}&link=${encodeURIComponent(course.link)}'">Masuk Kelas</button>
                            </div>
                        `;
                    });
                } else {
                    courseContainer.innerHTML = "<p>Modul belum tersedia.</p>";
                }
            }).catch(e => {
                document.getElementById('loadingMsg').innerText = "Gagal memuat modul.";
            });
    }

    // --------------------------------------------------
    // 4. LOGIKA HALAMAN COURSE (course.html)
    // --------------------------------------------------
    const taskForm = document.getElementById("taskForm");
    if (taskForm) {
        if (!user) return window.location.href = "index.html";

        const urlParams = new URLSearchParams(window.location.search);
        document.getElementById("courseTitle").innerText = urlParams.get('title') || "Materi Kelas";
        document.getElementById("courseLink").href = urlParams.get('link') || "#";

        taskForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const btn = document.getElementById("submitBtn");
            const msg = document.getElementById("msg");
            btn.innerText = "Mengirim...";

            try {
                let response = await fetch(SCRIPT_URL, { 
                    method: "POST", 
                    body: JSON.stringify({
                        action: "submitTask",
                        userId: user.id,
                        courseId: urlParams.get('id'),
                        linkTugas: document.getElementById("linkTugas").value
                    }) 
                });
                await response.json();
                msg.style.color = "green";
                msg.innerText = "Tugas berhasil dikirim! Silakan cek halaman Nilai.";
                btn.innerText = "Kirim Tugas";
                taskForm.reset();
            } catch (error) {
                msg.style.color = "red";
                msg.innerText = "Gagal mengirim tugas.";
                btn.innerText = "Kirim Tugas";
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
                    let statusClass = "menunggu", statusText = "Menunggu";
                    let nilaiAngka = parseInt(sub.nilai);

                    if (!isNaN(nilaiAngka)) {
                        if (nilaiAngka >= 80) { statusClass = "lulus"; statusText = "Lulus"; hasPassed = true; }
                        else { statusClass = "gagal"; statusText = "Revisi"; }
                    }

                    tbody.innerHTML += `
                        <tr>
                            <td>${sub.courseId}</td>
                            <td><a href="${sub.link}" target="_blank">Lihat Tugas</a></td>
                            <td><strong>${sub.nilai}</strong></td>
                            <td>${sub.feedback}</td>
                            <td><span class="status ${statusClass}">${statusText}</span></td>
                        </tr>
                    `;
                });

                if(hasPassed) certBox.style.display = "block";
            }).catch(e => {
                document.getElementById("tableBody").innerHTML = "<tr><td colspan='5' style='text-align:center; color:red;'>Gagal memuat data.</td></tr>";
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
                    btn.style.backgroundColor = "#95a5a6";
                }
            } catch (e) {
                alert("Gagal menyimpan data.");
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
                            <td><a href="${sub.linkTugas}" target="_blank" style="color:#3498db;">Buka Tugas</a></td>
                            <td><input type="number" id="nilai_${sub.subId}" class="input-nilai" value="${sub.nilai === 'Belum Dinilai' ? '' : sub.nilai}"></td>
                            <td><input type="text" id="feedback_${sub.subId}" class="input-feedback" value="${sub.feedback === 'Belum ada feedback' ? '' : sub.feedback}"></td>
                            <td><button class="btn-save" onclick="saveGrade('${sub.subId}')">Simpan</button></td>
                        </tr>
                    `;
                });
            }).catch(e => {
                gradingBody.innerHTML = "<tr><td colspan='7' style='text-align:center; color:red;'>Gagal memuat database.</td></tr>";
            });
    }

});
