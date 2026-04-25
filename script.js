/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          WAROENG DIGITAL — script.js (v3.0)                 ║
 * ║  Full-Stack Upgrade: Profit Tracking, Image Upload,         ║
 * ║  Inventory Management, Role-Based Portal, Camera API.       ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ARSITEKTUR localStorage (v3.0):
 * ┌─────────────────────────────────────────────────────────────┐
 * │  'wd_session'    → { role, username, namaLengkap }          │
 * │  'wd_produk'     → [{ id, nama, hargaBeli, hargaJual,       │
 * │                       stok, min, kat, emoji, gambar }]      │
 * │  'wd_kasbon'     → [{ id, nama, hp, jumlah, ket, ... }]     │
 * │  'wd_keuangan'   → { totalDana, omzet, laba, transaksi }    │
 * │  'wd_histori'    → [{ id, tanggal, items, total, laba }]    │
 * └─────────────────────────────────────────────────────────────┘
 *
 * KALKULASI LABA (Profit):
 * ─────────────────────────────────────────────────────────────
 * Omzet  = Σ (hargaJual × qty)       ← pendapatan kotor
 * HPP    = Σ (hargaBeli × qty)       ← Harga Pokok Penjualan
 * Laba   = Omzet − HPP               ← keuntungan bersih
 *
 * Contoh: Jual Indomie 3 pcs
 *   hargaJual = 3.500, hargaBeli = 2.200, qty = 3
 *   Omzet += 3.500 × 3 = 10.500
 *   HPP   += 2.200 × 3 = 6.600
 *   Laba  += 10.500 − 6.600 = 3.900
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

// ══════════════════════════════════════════════════════════════
// BAGIAN 1 — AKUN MOCK (Role-Based)
// ══════════════════════════════════════════════════════════════
const AKUN_MOCK = {
    owner:    { password: 'owner123',    role: 'owner',    namaLengkap: 'Bu Asih (Pemilik)',    redirect: 'main.html' },
    kasir:    { password: 'kasir123',    role: 'kasir',    namaLengkap: 'Budi (Kasir)',          redirect: 'clientShop.html' },
    customer: { password: 'pelanggan123',role: 'customer', namaLengkap: 'Pelanggan Setia',       redirect: 'clientShop.html' },
};

// ══════════════════════════════════════════════════════════════
// BAGIAN 2 — DATA SEED (v3.0: tambah hargaBeli per produk)
// ══════════════════════════════════════════════════════════════
const SEED_PRODUK = [
    { id:'p01', nama:'Indomie Goreng',     hargaBeli:2200,  hargaJual:3500,  stok:48,  min:10, kat:'Mie Instan', emoji:'🍜', terjual:120, gambar:null },
    { id:'p02', nama:'Beras Premium 5kg',  hargaBeli:58000, hargaJual:72000, stok:5,   min:8,  kat:'Sembako',    emoji:'🌾', terjual:34,  gambar:null },
    { id:'p03', nama:'Minyak Goreng 1L',   hargaBeli:14000, hargaJual:18500, stok:12,  min:6,  kat:'Sembako',    emoji:'🫙', terjual:55,  gambar:null },
    { id:'p04', nama:'Gula Pasir 1kg',     hargaBeli:12000, hargaJual:16000, stok:3,   min:5,  kat:'Sembako',    emoji:'🍚', terjual:88,  gambar:null },
    { id:'p05', nama:'Kopi Kapal Api',     hargaBeli:1800,  hargaJual:2500,  stok:60,  min:15, kat:'Minuman',    emoji:'☕', terjual:210, gambar:null },
    { id:'p06', nama:'Teh Botol Sosro',    hargaBeli:3500,  hargaJual:5500,  stok:24,  min:12, kat:'Minuman',    emoji:'🍵', terjual:95,  gambar:null },
    { id:'p07', nama:'Sabun Lifebuoy',     hargaBeli:3200,  hargaJual:5000,  stok:20,  min:8,  kat:'Kebersihan', emoji:'🧼', terjual:42,  gambar:null },
    { id:'p08', nama:'Sampo Pantene',      hargaBeli:900,   hargaJual:1500,  stok:80,  min:20, kat:'Kebersihan', emoji:'🧴', terjual:175, gambar:null },
    { id:'p09', nama:'Rokok Gudang Garam', hargaBeli:18000, hargaJual:23000, stok:15,  min:5,  kat:'Rokok',      emoji:'🚬', terjual:300, gambar:null },
    { id:'p10', nama:'Aqua 600ml',         hargaBeli:2500,  hargaJual:4000,  stok:2,   min:12, kat:'Minuman',    emoji:'💧', terjual:180, gambar:null },
    { id:'p11', nama:'Biskuit Roma',       hargaBeli:5000,  hargaJual:7500,  stok:18,  min:8,  kat:'Snack',      emoji:'🍪', terjual:63,  gambar:null },
    { id:'p12', nama:'Telur Ayam',         hargaBeli:1800,  hargaJual:2500,  stok:120, min:30, kat:'Sembako',    emoji:'🥚', terjual:400, gambar:null },
];

const SEED_KASBON = [
    { id:'k01', nama:'Pak Budi Santoso', hp:'6281234567890', jumlah:45000,  ket:'Indomie x5, Telur x3',    tanggal:'2025-07-10', status:'aktif', skor:72 },
    { id:'k02', nama:'Ibu Sari Dewi',    hp:'6289876543210', jumlah:120000, ket:'Beras 5kg, Minyak 1L',    tanggal:'2025-07-08', status:'aktif', skor:85 },
    { id:'k03', nama:'Mas Rizky',        hp:'6285551234567', jumlah:27500,  ket:'Rokok x1, Teh Botol x2', tanggal:'2025-07-12', status:'aktif', skor:60 },
    { id:'k04', nama:'Ibu Rina Marlina', hp:'6281122334455', jumlah:85000,  ket:'Sembako bulanan',          tanggal:'2025-07-05', status:'aktif', skor:91 },
];

const SEED_KEUANGAN = {
    namaToko:'Warung Bu Asih', totalDana:2500000,
    omzetBulan:1875000, labaBulan:642000, totalTransaksi:47, targetOmzet:5000000
};

// ══════════════════════════════════════════════════════════════
// BAGIAN 3 — HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════
function getData(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function rp(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
function tgl(str) {
    const B = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const d = new Date(str); return `${d.getDate()} ${B[d.getMonth()]} ${d.getFullYear()}`;
}
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

function initData() {
    if (!getData('wd_produk'))   setData('wd_produk',   SEED_PRODUK);
    if (!getData('wd_kasbon'))   setData('wd_kasbon',   SEED_KASBON);
    if (!getData('wd_keuangan')) setData('wd_keuangan', SEED_KEUANGAN);
    if (!getData('wd_histori'))  setData('wd_histori',  []);
}

function toast(pesan, tipe = 'info') {
    let wrap = document.getElementById('toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toast-wrap'; document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = `wd-toast toast-${tipe}`;
    const icons = { sukses:'✓', error:'✕', info:'ℹ' };
    el.innerHTML = `<span class="toast-icon">${icons[tipe]||'ℹ'}</span><span>${pesan}</span>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 3200);
}

function animateStagger(selector, delayMs = 60) {
    document.querySelectorAll(selector).forEach((el, i) => {
        el.style.cssText = `opacity:0;transform:translateY(18px);transition:opacity .4s ease ${i*delayMs}ms,transform .4s ease ${i*delayMs}ms`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.opacity = '1'; el.style.transform = 'translateY(0)';
        }));
    });
}

function animateCounter(elId, target, isRupiah) {
    const el = document.getElementById(elId);
    if (!el) return;
    const dur = 900, t0 = performance.now();
    const step = now => {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = isRupiah ? rp(Math.round(e * target)) : Math.round(e * target).toLocaleString('id-ID');
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 4 — IMAGE PROCESSING (Base64)
// ══════════════════════════════════════════════════════════════
/**
 * Proses gambar dari File → Base64 string.
 *
 * Cara kerja FileReader API:
 * 1. User pilih file dari input[type=file]
 * 2. FileReader.readAsDataURL() membaca file sebagai DataURL
 * 3. DataURL format: "data:image/jpeg;base64,/9j/4AAQ..."
 * 4. String ini disimpan langsung di localStorage (tidak perlu server)
 *
 * CATATAN UKURAN: Gambar di-resize ke max 400px sebelum disimpan
 * untuk menghemat localStorage quota (biasanya 5-10MB per domain).
 */
function prosesGambarFile(file, callback) {
    if (!file || !file.type.startsWith('image/')) {
        toast('File harus berupa gambar!', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        // Resize gambar menggunakan canvas untuk hemat storage
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX = 400; // max dimensi dalam px
            let w = img.width, h = img.height;

            // Kalkulasi rasio proporsional agar gambar tidak gepeng
            if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
            else        { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }

            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);

            // Konversi ke JPEG 80% quality → ukuran kecil tapi tetap bagus
            const base64 = canvas.toDataURL('image/jpeg', 0.80);
            callback(base64);
        };
        img.src = e.target.result;
    };
    reader.onerror = () => toast('Gagal membaca file!', 'error');
    reader.readAsDataURL(file);
}

/**
 * Capture dari kamera menggunakan MediaDevices API.
 *
 * Cara kerja:
 * 1. navigator.mediaDevices.getUserMedia({ video: true }) → minta izin kamera
 * 2. Stream video ditampilkan di elemen <video>
 * 3. Saat user klik "Ambil Foto": gambar di-capture ke <canvas>
 * 4. canvas.toDataURL() → Base64 string → disimpan ke localStorage
 *
 * CATATAN: Butuh HTTPS atau localhost agar browser mengizinkan akses kamera.
 */
let kameraStream = null;

function bukaKamera(videoEl, canvasEl, onCapture) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast('Kamera tidak didukung di browser ini!', 'error');
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            kameraStream = stream;
            videoEl.srcObject = stream;
            videoEl.play();
            videoEl.style.display = 'block';
            if (canvasEl) canvasEl.style.display = 'none';
        })
        .catch(err => {
            console.warn('Kamera error:', err);
            toast('Gagal akses kamera. Pastikan izin diberikan.', 'error');
        });
}

function ambilFotoKamera(videoEl, canvasEl, callback) {
    if (!kameraStream) return;
    const ctx = canvasEl.getContext('2d');
    canvasEl.width  = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0);
    const base64 = canvasEl.toDataURL('image/jpeg', 0.80);
    tutupKamera(videoEl);
    canvasEl.style.display = 'block';
    videoEl.style.display  = 'none';
    callback(base64);
}

function tutupKamera(videoEl) {
    if (kameraStream) {
        kameraStream.getTracks().forEach(t => t.stop());
        kameraStream = null;
    }
    if (videoEl) videoEl.srcObject = null;
}

/** Render preview gambar produk — emoji sebagai fallback */
function renderGambarProduk(gambar, emoji, size = '2rem') {
    if (gambar) {
        return `<img src="${gambar}" class="produk-img" style="width:${size};height:${size};object-fit:cover;border-radius:8px;" onerror="this.style.display='none';this.nextSibling.style.display='block'">
                <span class="produk-emoji" style="display:none;font-size:${size}">${emoji}</span>`;
    }
    return `<span class="produk-emoji" style="font-size:${size}">${emoji}</span>`;
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 5 — KALKULASI PROFIT
// ══════════════════════════════════════════════════════════════
/**
 * Hitung laba dari array items transaksi.
 *
 * FORMULA:
 *   Untuk setiap item dalam keranjang:
 *     omzetItem  = hargaJual × qty
 *     hppItem    = hargaBeli × qty
 *     labaItem   = omzetItem − hppItem
 *
 *   Total laba transaksi = Σ labaItem
 *
 * Mengapa penting?
 * Banyak pemilik warung tidak tahu profit sesungguhnya karena
 * hanya melihat uang masuk (omzet), bukan dikurangi modal (HPP).
 * Fitur ini menampilkan LABA BERSIH yang sesungguhnya.
 */
function hitungLabaKeranjang(cartObj) {
    let omzet = 0, hpp = 0;
    Object.values(cartObj).forEach(item => {
        const hJual = item.produk.hargaJual || item.produk.harga || 0;
        const hBeli = item.produk.hargaBeli || 0;
        omzet += hJual * item.jumlah;
        hpp   += hBeli * item.jumlah;
    });
    return { omzet, hpp, laba: omzet - hpp };
}

/** Hitung margin % per produk */
function hitungMargin(hargaBeli, hargaJual) {
    if (!hargaJual || hargaJual === 0) return 0;
    return ((hargaJual - hargaBeli) / hargaJual * 100).toFixed(1);
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 6 — AUTHENTICATION
// ══════════════════════════════════════════════════════════════
function prosesLogin(e) {
    e.preventDefault();
    const username = document.getElementById('input-user').value.trim().toLowerCase();
    const password = document.getElementById('input-pass').value;
    const btn = document.getElementById('btn-login');
    const errEl = document.getElementById('login-error');

    btn.classList.add('loading'); btn.disabled = true;
    errEl.classList.remove('show');

    setTimeout(() => {
        const akun = AKUN_MOCK[username];
        if (!akun || akun.password !== password) {
            btn.classList.remove('loading'); btn.disabled = false;
            errEl.classList.add('show');
            const card = document.querySelector('.login-card');
            if (card) { card.classList.add('shake'); setTimeout(() => card.classList.remove('shake'), 500); }
            return;
        }
        setData('wd_session', { role: akun.role, username, namaLengkap: akun.namaLengkap, loginTime: Date.now() });
        btn.textContent = 'Berhasil! ✓';
        btn.classList.remove('loading'); btn.classList.add('btn-sukses');
        setTimeout(() => { window.location.href = akun.redirect; }, 600);
    }, 400);
}

function checkAuth(role) {
    const sesi = getData('wd_session');
    if (!sesi) { window.location.href = 'login.html'; return null; }
    if (role && !role.includes(sesi.role)) {
        window.location.href = AKUN_MOCK[sesi.username]?.redirect || 'login.html';
        return null;
    }
    return sesi;
}

function logout() {
    tutupKamera(document.getElementById('kamera-video'));
    localStorage.removeItem('wd_session');
    window.location.href = 'login.html';
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 7 — HALAMAN LOGIN
// ══════════════════════════════════════════════════════════════
function initLogin() {
    const sesi = getData('wd_session');
    if (sesi) { window.location.href = AKUN_MOCK[sesi.username]?.redirect || 'main.html'; return; }

    document.getElementById('login-form')?.addEventListener('submit', prosesLogin);

    document.getElementById('demo-owner')?.addEventListener('click', () => {
        document.getElementById('input-user').value = 'owner';
        document.getElementById('input-pass').value = 'owner123';
        document.getElementById('login-error').classList.remove('show');
    });
    document.getElementById('demo-kasir')?.addEventListener('click', () => {
        document.getElementById('input-user').value = 'kasir';
        document.getElementById('input-pass').value = 'kasir123';
        document.getElementById('login-error').classList.remove('show');
    });
    document.getElementById('demo-customer')?.addEventListener('click', () => {
        document.getElementById('input-user').value = 'customer';
        document.getElementById('input-pass').value = 'pelanggan123';
        document.getElementById('login-error').classList.remove('show');
    });

    const tp = document.getElementById('toggle-pass');
    const ip = document.getElementById('input-pass');
    tp?.addEventListener('click', () => {
        const show = ip.type === 'password';
        ip.type = show ? 'text' : 'password';
        tp.textContent = show ? '🙈' : '👁';
    });
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 8 — DASHBOARD OWNER (main.html)
// ══════════════════════════════════════════════════════════════
function initDashboard() {
    const sesi = checkAuth(['owner']);
    if (!sesi) return;
    initData();
    setText('nav-user', sesi.namaLengkap);
    const k = getData('wd_keuangan');
    setText('dash-nama-toko', k.namaToko);

    document.getElementById('btn-logout')?.addEventListener('click', logout);

    // Tab navigation untuk dashboard
    document.querySelectorAll('.dash-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            document.querySelectorAll('.dash-tab').forEach(b => b.classList.remove('tab-aktif'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('panel-aktif'));
            btn.classList.add('tab-aktif');
            document.getElementById('tab-' + target)?.classList.add('panel-aktif');
        });
    });

    renderKeuangan();
    renderStokAlert();
    renderKasbon();
    renderGrafik();
    renderInventarisList();
    animateStagger('.dash-card', 90);
}

function renderKeuangan() {
    const k = getData('wd_keuangan');
    const totalKasbon = (getData('wd_kasbon') || []).filter(x => x.status === 'aktif').reduce((s,x) => s + x.jumlah, 0);

    animateCounter('val-dana',      k.totalDana,      true);
    animateCounter('val-omzet',     k.omzetBulan,     true);
    animateCounter('val-laba',      k.labaBulan || 0, true);
    animateCounter('val-transaksi', k.totalTransaksi, false);
    animateCounter('val-kasbon',    totalKasbon,      true);

    const pct = Math.min((k.omzetBulan / k.targetOmzet) * 100, 100);
    setTimeout(() => {
        const bar = document.getElementById('omzet-bar');
        if (bar) bar.style.width = pct.toFixed(1) + '%';
        setText('omzet-pct', pct.toFixed(0) + '% dari target ' + rp(k.targetOmzet));
    }, 350);
}

function renderStokAlert() {
    const kritis = (getData('wd_produk') || []).filter(p => p.stok <= p.min);
    const cont = document.getElementById('stok-alert-list');
    if (!cont) return;
    setText('stok-badge', kritis.length);
    if (!kritis.length) {
        cont.innerHTML = `<div class="empty-state"><span>✅</span><p>Semua stok aman!</p></div>`;
        return;
    }
    cont.innerHTML = kritis.map((p, i) => {
        const pct = p.min ? Math.round((p.stok / p.min) * 100) : 0;
        const habis = p.stok === 0;
        return `
        <div class="stok-row fade-in" style="animation-delay:${i*60}ms">
            <span class="stok-emoji">${p.emoji}</span>
            <div class="stok-info">
                <strong>${p.nama}</strong>
                <div class="stok-bar-track"><div class="stok-bar-fill ${habis?'fill-habis':'fill-rendah'}" style="width:${pct}%"></div></div>
            </div>
            <div class="stok-right">
                <span class="stok-chip ${habis?'chip-habis':'chip-rendah'}">${habis?'❌ HABIS':'⚠ '+p.stok+' sisa'}</span>
                <small style="color:var(--text-muted)">Min ${p.min}</small>
            </div>
        </div>`;
    }).join('');
}

function renderKasbon() {
    const aktif = (getData('wd_kasbon') || []).filter(k => k.status === 'aktif');
    const cont = document.getElementById('kasbon-list');
    if (!cont) return;
    if (!aktif.length) {
        cont.innerHTML = `<div class="empty-state"><span>🎉</span><p>Tidak ada kasbon aktif!</p></div>`;
        return;
    }
    cont.innerHTML = aktif.map((k, i) => {
        const skorKls = k.skor >= 80 ? 'skor-baik' : k.skor >= 60 ? 'skor-sedang' : 'skor-buruk';
        const skorTxt = k.skor >= 80 ? 'Baik' : k.skor >= 60 ? 'Cukup' : 'Berisiko';
        const pesan = encodeURIComponent(`Halo Kak ${k.nama}, mengingatkan kasbon ${rp(k.jumlah)} untuk: ${k.ket}. Mohon segera dilunasi ya. Terima kasih 🙏`);
        return `
        <div class="kasbon-card dash-card" style="animation-delay:${i*70}ms">
            <div class="kasbon-avatar">${k.nama.charAt(0).toUpperCase()}</div>
            <div class="kasbon-body">
                <div class="kasbon-top">
                    <strong>${k.nama}</strong>
                    <span class="kasbon-jumlah">${rp(k.jumlah)}</span>
                </div>
                <small class="text-muted">📅 ${tgl(k.tanggal)} · ${k.ket}</small>
                <div class="kasbon-footer">
                    <div class="credit-badge ${skorKls}">
                        <span class="credit-num">${k.skor}</span>
                        <span class="credit-lbl">Kredit: ${skorTxt}</span>
                    </div>
                    <div class="kasbon-aksi">
                        <a href="https://wa.me/${k.hp}?text=${pesan}" target="_blank" class="btn-wa">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Tagih WA
                        </a>
                        <button class="btn-lunas" onclick="tandaiLunas('${k.id}')">✓ Lunas</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function renderGrafik() {
    const cont = document.getElementById('grafik-container');
    if (!cont) return;
    const data = [145,220,180,310,250,195,280];
    const hari = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    const max  = Math.max(...data);
    cont.innerHTML = `<div class="bar-chart">
        ${data.map((v,i) => `
        <div class="bar-col">
            <div class="bar-track"><div class="bar-fill ${i===6?'bar-today':''}" style="height:${(v/max)*100}%;animation-delay:${i*80}ms" title="${v}k"></div></div>
            <span class="bar-label">${hari[i]}</span>
        </div>`).join('')}
    </div>`;
}

function tandaiLunas(id) {
    if (!confirm('Tandai kasbon ini sebagai LUNAS?')) return;
    const kasbon = getData('wd_kasbon');
    const idx = kasbon.findIndex(k => k.id === id);
    if (idx === -1) return;
    const k = getData('wd_keuangan');
    k.totalDana += kasbon[idx].jumlah;
    setData('wd_keuangan', k);
    kasbon[idx].status = 'lunas';
    setData('wd_kasbon', kasbon);
    renderKeuangan(); renderKasbon();
    toast(`✅ Kasbon ${kasbon[idx].nama} lunas!`, 'sukses');
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 9 — INVENTORY MANAGEMENT (Owner only)
// ══════════════════════════════════════════════════════════════

let produkEditId = null; // null = mode tambah, ada nilai = mode edit
let gambarBaru   = null; // Base64 gambar yang baru diproses

/** Render tabel daftar produk di halaman inventory admin */
function renderInventarisList() {
    const produk = getData('wd_produk') || [];
    const cont = document.getElementById('inv-list');
    if (!cont) return;

    if (!produk.length) {
        cont.innerHTML = `<div class="empty-state"><span>📦</span><p>Belum ada produk. Tambah sekarang!</p></div>`;
        return;
    }

    cont.innerHTML = `
    <div class="inv-table-wrap">
        <table class="inv-table">
            <thead>
                <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Harga Beli</th>
                    <th>Harga Jual</th>
                    <th>Margin</th>
                    <th>Stok</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${produk.map(p => {
                    const margin = hitungMargin(p.hargaBeli, p.hargaJual);
                    const habis  = p.stok === 0;
                    const rendah = !habis && p.stok <= p.min;
                    const statusKls = habis ? 'status-habis' : rendah ? 'status-rendah' : 'status-aman';
                    const statusTxt = habis ? 'Habis' : rendah ? 'Tipis' : 'Aman';
                    return `
                    <tr>
                        <td>
                            <div class="inv-produk-cell">
                                ${p.gambar
                                    ? `<img src="${p.gambar}" class="inv-thumb" alt="${p.nama}">`
                                    : `<span class="inv-emoji">${p.emoji}</span>`
                                }
                                <span class="inv-nama">${p.nama}</span>
                            </div>
                        </td>
                        <td><span class="kat-chip">${p.kat}</span></td>
                        <td class="td-num">${rp(p.hargaBeli)}</td>
                        <td class="td-num text-accent">${rp(p.hargaJual)}</td>
                        <td class="td-num ${margin >= 20 ? 'text-accent' : 'text-warn'}">${margin}%</td>
                        <td>
                            <div class="stok-inline-edit">
                                <button class="btn-stok-dec" onclick="ubahStokLangsung('${p.id}', -1)">−</button>
                                <span id="stok-display-${p.id}">${p.stok}</span>
                                <button class="btn-stok-inc" onclick="ubahStokLangsung('${p.id}', 1)">+</button>
                            </div>
                        </td>
                        <td><span class="status-chip ${statusKls}">${statusTxt}</span></td>
                        <td>
                            <div class="inv-aksi">
                                <button class="btn-edit-produk" onclick="bukaFormEdit('${p.id}')">✏</button>
                                <button class="btn-hapus-produk" onclick="hapusProduk('${p.id}')">🗑</button>
                            </div>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}

/** Ubah stok langsung dari tabel tanpa buka form */
function ubahStokLangsung(id, delta) {
    const produk = getData('wd_produk');
    const idx = produk.findIndex(p => p.id === id);
    if (idx === -1) return;
    produk[idx].stok = Math.max(0, produk[idx].stok + delta);
    setData('wd_produk', produk);
    const el = document.getElementById(`stok-display-${id}`);
    if (el) el.textContent = produk[idx].stok;
    renderStokAlert();
}

/** Buka form tambah produk (kosong) */
function bukaFormTambah() {
    produkEditId = null;
    gambarBaru   = null;
    tutupKamera(document.getElementById('kamera-video'));
    resetFormProduk();
    document.getElementById('form-produk-title').textContent = '➕ Tambah Produk Baru';
    document.getElementById('form-produk-overlay').classList.add('show');
}

/** Buka form edit produk (isi dengan data yang ada) */
function bukaFormEdit(id) {
    const produk = getData('wd_produk');
    const p = produk.find(x => x.id === id);
    if (!p) return;
    produkEditId = id;
    gambarBaru   = null;
    tutupKamera(document.getElementById('kamera-video'));

    document.getElementById('form-produk-title').textContent = '✏ Edit Produk';
    document.getElementById('fp-nama').value      = p.nama;
    document.getElementById('fp-kategori').value  = p.kat;
    document.getElementById('fp-emoji').value     = p.emoji;
    document.getElementById('fp-harga-beli').value= p.hargaBeli;
    document.getElementById('fp-harga-jual').value= p.hargaJual;
    document.getElementById('fp-stok').value      = p.stok;
    document.getElementById('fp-min-stok').value  = p.min;

    // Tampilkan preview gambar yang sudah ada
    const preview = document.getElementById('gambar-preview');
    if (p.gambar) {
        preview.src = p.gambar;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }

    hitungPreviewMargin();
    document.getElementById('form-produk-overlay').classList.add('show');
}

function tutupFormProduk() {
    tutupKamera(document.getElementById('kamera-video'));
    document.getElementById('form-produk-overlay').classList.remove('show');
}

function resetFormProduk() {
    document.getElementById('fp-nama').value       = '';
    document.getElementById('fp-kategori').value   = '';
    document.getElementById('fp-emoji').value      = '📦';
    document.getElementById('fp-harga-beli').value = '';
    document.getElementById('fp-harga-jual').value = '';
    document.getElementById('fp-stok').value       = '';
    document.getElementById('fp-min-stok').value   = '5';
    const preview = document.getElementById('gambar-preview');
    if (preview) preview.style.display = 'none';
    document.getElementById('margin-preview').textContent = '';
}

function hitungPreviewMargin() {
    const beli = parseFloat(document.getElementById('fp-harga-beli').value) || 0;
    const jual = parseFloat(document.getElementById('fp-harga-jual').value) || 0;
    const el = document.getElementById('margin-preview');
    if (!el) return;
    if (beli > 0 && jual > 0) {
        const margin = ((jual - beli) / jual * 100).toFixed(1);
        const laba   = jual - beli;
        el.textContent = `Margin: ${margin}% · Laba per unit: ${rp(laba)}`;
        el.style.color = margin >= 20 ? 'var(--accent)' : margin > 0 ? 'var(--warning)' : 'var(--danger)';
    } else {
        el.textContent = '';
    }
}

function simpanProduk() {
    const nama     = document.getElementById('fp-nama').value.trim();
    const kat      = document.getElementById('fp-kategori').value.trim();
    const emoji    = document.getElementById('fp-emoji').value.trim() || '📦';
    const hargaBeli= parseInt(document.getElementById('fp-harga-beli').value) || 0;
    const hargaJual= parseInt(document.getElementById('fp-harga-jual').value) || 0;
    const stok     = parseInt(document.getElementById('fp-stok').value) || 0;
    const min      = parseInt(document.getElementById('fp-min-stok').value) || 5;

    if (!nama || !kat || !hargaJual) {
        toast('Nama, kategori, dan harga jual wajib diisi!', 'error');
        return;
    }
    if (hargaBeli > hargaJual) {
        if (!confirm('Harga beli lebih besar dari harga jual — produk ini merugi. Lanjutkan?')) return;
    }

    const produk = getData('wd_produk') || [];

    if (produkEditId) {
        // MODE EDIT: update produk yang sudah ada
        const idx = produk.findIndex(p => p.id === produkEditId);
        if (idx === -1) { toast('Produk tidak ditemukan!', 'error'); return; }
        const existing = produk[idx];
        produk[idx] = { ...existing, nama, kat, emoji, hargaBeli, hargaJual, stok, min,
                        gambar: gambarBaru !== null ? gambarBaru : existing.gambar };
        toast(`✅ Produk "${nama}" berhasil diupdate!`, 'sukses');
    } else {
        // MODE TAMBAH: buat produk baru
        produk.push({
            id: 'p' + Date.now(), nama, kat, emoji, hargaBeli, hargaJual,
            stok, min, terjual: 0, gambar: gambarBaru
        });
        toast(`✅ Produk "${nama}" berhasil ditambahkan!`, 'sukses');
    }

    setData('wd_produk', produk);
    tutupFormProduk();
    renderInventarisList();
    renderStokAlert();
}

function hapusProduk(id) {
    const produk = getData('wd_produk');
    const p = produk.find(x => x.id === id);
    if (!p || !confirm(`Hapus produk "${p.nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setData('wd_produk', produk.filter(x => x.id !== id));
    renderInventarisList();
    renderStokAlert();
    toast(`🗑 Produk "${p.nama}" dihapus.`, 'info');
}

/** Inisialisasi event listener untuk form produk */
function initFormProduk() {
    // Preview margin real-time
    document.getElementById('fp-harga-beli')?.addEventListener('input', hitungPreviewMargin);
    document.getElementById('fp-harga-jual')?.addEventListener('input', hitungPreviewMargin);

    // Upload file gambar
    const inputFile = document.getElementById('fp-gambar-file');
    inputFile?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        prosesGambarFile(file, (base64) => {
            gambarBaru = base64;
            const preview = document.getElementById('gambar-preview');
            preview.src = base64;
            preview.style.display = 'block';
            toast('✅ Gambar berhasil dimuat!', 'sukses');
        });
    });

    // Tombol buka kamera
    document.getElementById('btn-buka-kamera')?.addEventListener('click', () => {
        const videoEl  = document.getElementById('kamera-video');
        const canvasEl = document.getElementById('kamera-canvas');
        if (!videoEl || !canvasEl) return;
        bukaKamera(videoEl, canvasEl, () => {});
    });

    // Tombol ambil foto
    document.getElementById('btn-ambil-foto')?.addEventListener('click', () => {
        const videoEl  = document.getElementById('kamera-video');
        const canvasEl = document.getElementById('kamera-canvas');
        if (!videoEl || !canvasEl) return;
        ambilFotoKamera(videoEl, canvasEl, (base64) => {
            gambarBaru = base64;
            const preview = document.getElementById('gambar-preview');
            preview.src = base64;
            preview.style.display = 'block';
            toast('✅ Foto berhasil diambil!', 'sukses');
        });
    });

    // Hapus gambar
    document.getElementById('btn-hapus-gambar')?.addEventListener('click', () => {
        gambarBaru = null;
        const preview = document.getElementById('gambar-preview');
        if (preview) preview.style.display = 'none';
        if (document.getElementById('fp-gambar-file')) document.getElementById('fp-gambar-file').value = '';
    });

    // Tutup overlay klik di luar
    document.getElementById('form-produk-overlay')?.addEventListener('click', e => {
        if (e.target.id === 'form-produk-overlay') tutupFormProduk();
    });
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 10 — HALAMAN POS / KASIR & CUSTOMER PORTAL
// ══════════════════════════════════════════════════════════════
let cart = {};
let filterAktif = 'Semua';

function initKasir() {
    const sesi = getData('wd_session');
    if (!sesi) { window.location.href = 'login.html'; return; }
    initData();
    const k = getData('wd_keuangan');
    setText('kasir-toko', k.namaToko);
    setText('kasir-saldo', rp(k.totalDana));
    setText('kasir-user', sesi.namaLengkap);
    document.getElementById('btn-logout-kasir')?.addEventListener('click', logout);

    // Bedakan tampilan berdasarkan role
    if (sesi.role === 'customer') {
        initCustomerPortal(sesi);
    } else {
        // Owner atau Kasir = mode POS
        initPosMode();
    }
}

function initCustomerPortal(sesi) {
    // Sembunyikan cart bar dan kasir controls
    document.getElementById('cart-bar')?.style.setProperty('display', 'none');
    document.querySelector('.kasir-mode-badge')?.style.setProperty('display', 'none');

    // Tampilkan badge customer
    const badge = document.querySelector('.kasir-mode-badge');
    if (badge) { badge.textContent = '🛍 Katalog Belanja'; badge.style.display = 'block'; }

    renderFilter();
    renderProdukCustomer();

    // Tampilkan kasbon milik customer ini
    renderKasbonCustomer(sesi.namaLengkap);
    animateStagger('.produk-card', 45);
}

function initPosMode() {
    renderFilter();
    renderProduk();
    bindCheckout();
    animateStagger('.produk-card', 45);
}

/** Render katalog produk untuk customer (tanpa cart, dengan tombol pesan WA) */
function renderProdukCustomer() {
    const produk = getData('wd_produk') || [];
    const cont = document.getElementById('produk-grid');
    if (!cont) return;
    const list = filterAktif === 'Semua' ? produk : produk.filter(p => p.kat === filterAktif);

    cont.innerHTML = list.map((p, i) => {
        const habis = p.stok <= 0;
        const k = getData('wd_keuangan');
        const waMsg = encodeURIComponent(`Halo Warung ${k.namaToko}, saya mau pesan:\n- ${p.nama}\nHarga: ${rp(p.hargaJual)}\n\nTolong dikonfirmasi ya 🙏`);
        return `
        <div class="produk-card${habis?' card-habis':''}" style="cursor:default">
            ${habis ? `<div class="produk-ribbon ribbon-habis">Habis</div>` : ''}
            <div class="produk-top">
                <div style="font-size:2.2rem">
                    ${renderGambarProduk(p.gambar, p.emoji, '2.2rem')}
                </div>
            </div>
            <p class="produk-nama">${p.nama}</p>
            <p class="produk-kat">${p.kat}</p>
            <div class="produk-bottom">
                <span class="produk-harga">${rp(p.hargaJual)}</span>
                <span class="produk-stok ${p.stok<=p.min?'text-warn':''}">${habis?'Habis':'Stok '+p.stok}</span>
            </div>
            ${!habis ? `<a href="https://wa.me/?text=${waMsg}" target="_blank" class="btn-pesan-wa">📱 Pesan via WA</a>` : ''}
        </div>`;
    }).join('');
}

/** Tampilkan kasbon milik customer ini */
function renderKasbonCustomer(namaLengkap) {
    const cont = document.getElementById('kasbon-customer');
    if (!cont) return;
    const semua = getData('wd_kasbon') || [];
    const milik = semua.filter(k => k.status === 'aktif' &&
        k.nama.toLowerCase().includes(namaLengkap.split(' ')[0].toLowerCase()));
    if (!milik.length) {
        cont.innerHTML = `<div class="empty-state"><span>✅</span><p>Tidak ada kasbon aktif.</p></div>`;
        return;
    }
    cont.innerHTML = milik.map(k => `
        <div class="kasbon-customer-card">
            <div>
                <strong>${k.ket}</strong>
                <small class="text-muted"> · ${tgl(k.tanggal)}</small>
            </div>
            <span class="kasbon-jumlah">${rp(k.jumlah)}</span>
        </div>
    `).join('');
}

function renderFilter() {
    const produk = getData('wd_produk') || [];
    const cats = ['Semua', ...new Set(produk.map(p => p.kat))];
    const cont = document.getElementById('filter-wrap');
    if (!cont) return;
    cont.innerHTML = cats.map(c => `<button class="filter-chip${c===filterAktif?' aktif':''}" onclick="setFilter('${c}')">${c}</button>`).join('');
}

function setFilter(kat) {
    filterAktif = kat;
    renderFilter();
    const sesi = getData('wd_session');
    if (sesi?.role === 'customer') renderProdukCustomer();
    else renderProduk();
    animateStagger('.produk-card', 35);
}

function renderProduk() {
    const produk = getData('wd_produk') || [];
    const cont = document.getElementById('produk-grid');
    if (!cont) return;
    const list = filterAktif === 'Semua' ? produk : produk.filter(p => p.kat === filterAktif);
    if (!list.length) { cont.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span>🔍</span><p>Tidak ada produk</p></div>`; return; }

    cont.innerHTML = list.map((p, i) => {
        const habis  = p.stok <= 0;
        const rendah = !habis && p.stok <= p.min;
        const qty    = cart[p.id]?.jumlah || 0;
        return `
        <div class="produk-card${habis?' card-habis':''}${qty>0?' card-incart':''}" data-id="${p.id}" onclick="tapProduk('${p.id}')">
            ${rendah ? `<div class="produk-ribbon">⚠ Stok Tipis</div>` : ''}
            ${habis  ? `<div class="produk-ribbon ribbon-habis">Habis</div>` : ''}
            <div class="produk-top">
                <div class="produk-img-wrap">
                    ${renderGambarProduk(p.gambar, p.emoji, '2.2rem')}
                </div>
                ${qty > 0 ? `<span class="produk-qty-badge">${qty}</span>` : ''}
            </div>
            <p class="produk-nama">${p.nama}</p>
            <p class="produk-kat">${p.kat}</p>
            <div class="produk-bottom">
                <span class="produk-harga">${rp(p.hargaJual || p.harga)}</span>
                <span class="produk-stok${rendah?' text-warn':habis?' text-danger':''}">Stok ${p.stok}</span>
            </div>
            <div class="produk-qty-ctrl${qty>0?' visible':''}" id="qty-ctrl-${p.id}" onclick="event.stopPropagation()">
                <button class="btn-qty" onclick="ubahCart('${p.id}',-1)">−</button>
                <span id="qty-${p.id}">${qty}</span>
                <button class="btn-qty" onclick="ubahCart('${p.id}',1)">+</button>
            </div>
        </div>`;
    }).join('');
}

function tapProduk(id) {
    const produk = getData('wd_produk').find(p => p.id === id);
    if (!produk || produk.stok <= 0) { if (produk?.stok <= 0) toast('Stok habis!','error'); return; }
    ubahCart(id, 1);
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) { card.classList.add('pop'); setTimeout(()=>card.classList.remove('pop'),300); }
}

function ubahCart(id, delta) {
    const produk = getData('wd_produk').find(p => p.id === id);
    if (!produk) return;
    if (!cart[id]) cart[id] = { produk, jumlah: 0 };
    cart[id].jumlah = Math.max(0, Math.min(cart[id].jumlah + delta, produk.stok));
    if (cart[id].jumlah === 0) delete cart[id];

    const qty    = cart[id]?.jumlah || 0;
    const elQty  = document.getElementById(`qty-${id}`);
    const elCtrl = document.getElementById(`qty-ctrl-${id}`);
    const card   = document.querySelector(`[data-id="${id}"]`);
    if (elQty) elQty.textContent = qty;
    if (elCtrl) elCtrl.classList.toggle('visible', qty > 0);
    if (card) {
        card.classList.toggle('card-incart', qty > 0);
        let badge = card.querySelector('.produk-qty-badge');
        if (qty > 0) {
            if (!badge) { badge = document.createElement('span'); badge.className = 'produk-qty-badge'; card.querySelector('.produk-top').appendChild(badge); }
            badge.textContent = qty;
        } else if (badge) badge.remove();
    }
    updateCartBar();
}

function updateCartBar() {
    const totalItem  = Object.values(cart).reduce((s,x) => s+x.jumlah, 0);
    const totalHarga = Object.values(cart).reduce((s,x) => s+x.jumlah*(x.produk.hargaJual||x.produk.harga), 0);
    const bar = document.getElementById('cart-bar');
    if (!bar) return;
    bar.classList.toggle('show', totalItem > 0);
    setText('cart-count', `${totalItem} item`);
    setText('cart-total', rp(totalHarga));
}

function hitungTotal() {
    return Object.values(cart).reduce((s,x) => s+x.jumlah*(x.produk.hargaJual||x.produk.harga), 0);
}

function bindCheckout() {
    document.getElementById('btn-buka-checkout')?.addEventListener('click', bukaCheckout);
    document.getElementById('btn-tutup-modal')?.addEventListener('click', tutupCheckout);
    document.getElementById('btn-bayar-tunai')?.addEventListener('click', ()=>bayar('Tunai'));
    document.getElementById('btn-bayar-kasbon')?.addEventListener('click', ()=>bayar('Kasbon'));
    document.getElementById('modal-overlay')?.addEventListener('click', e => { if (e.target.id==='modal-overlay') tutupCheckout(); });
}

function bukaCheckout() {
    if (!Object.keys(cart).length) { toast('Keranjang kosong!','error'); return; }
    const list = document.getElementById('modal-item-list');
    const { laba } = hitungLabaKeranjang(cart);

    if (list) list.innerHTML = Object.values(cart).map(x => {
        const hJual = x.produk.hargaJual || x.produk.harga;
        return `
        <div class="modal-item-row">
            <span>${x.produk.emoji}</span>
            <div class="modal-item-info"><strong>${x.produk.nama}</strong><small>${rp(hJual)} × ${x.jumlah}</small></div>
            <span class="modal-subtotal">${rp(hJual*x.jumlah)}</span>
        </div>`;
    }).join('');

    setText('modal-total', rp(hitungTotal()));

    // Tampilkan estimasi laba transaksi ini
    const labaEl = document.getElementById('modal-laba-estimasi');
    if (labaEl) labaEl.textContent = `Estimasi Laba: ${rp(laba)}`;

    document.getElementById('modal-overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function tutupCheckout() {
    document.getElementById('modal-overlay')?.classList.remove('show');
    document.body.style.overflow = '';
}

function bayar(metode) {
    const total = hitungTotal();
    if (!total) return;

    // ── Kalkulasi profit transaksi ──
    // Ini adalah inti dari fitur tracking laba.
    // Kita hitung omzet dan HPP dari setiap item di keranjang.
    const { omzet, hpp, laba } = hitungLabaKeranjang(cart);

    if (metode === 'Kasbon') {
        const nama = prompt('Nama pelanggan kasbon:');
        if (!nama?.trim()) { toast('Nama harus diisi!', 'error'); return; }
        const hp  = prompt('Nomor WhatsApp (contoh: 6281234567890):') || '';
        const ket = Object.values(cart).map(x=>`${x.produk.nama} x${x.jumlah}`).join(', ');
        const kb  = getData('wd_kasbon');
        kb.push({ id:'k'+Date.now(), nama:nama.trim(), hp:hp.trim(), jumlah:total, ket, tanggal:new Date().toISOString().split('T')[0], status:'aktif', skor:Math.floor(Math.random()*40)+50 });
        setData('wd_kasbon', kb);
        toast(`📝 Kasbon ${nama.trim()} (${rp(total)}) dicatat!`, 'info');
    } else {
        // Pembayaran tunai — update keuangan termasuk laba
        const k = getData('wd_keuangan');
        k.totalDana      += total;
        k.omzetBulan     += omzet;
        k.labaBulan      = (k.labaBulan || 0) + laba; // kumulasi laba bulan ini
        k.totalTransaksi += 1;
        setData('wd_keuangan', k);
        setText('kasir-saldo', rp(k.totalDana));
        toast(`✅ ${rp(total)} · Laba: ${rp(laba)}`, 'sukses');
    }

    // Kurangi stok
    const produk = getData('wd_produk');
    Object.values(cart).forEach(item => {
        const idx = produk.findIndex(p => p.id === item.produk.id);
        if (idx !== -1) {
            produk[idx].stok    -= item.jumlah;
            produk[idx].terjual = (produk[idx].terjual || 0) + item.jumlah;
        }
    });
    setData('wd_produk', produk);

    // Simpan histori transaksi
    const h = getData('wd_histori') || [];
    h.unshift({
        id:'tr'+Date.now(), metode, tanggal:new Date().toISOString(),
        items: Object.values(cart).map(x=>({ nama:x.produk.nama, jumlah:x.jumlah, hargaJual:x.produk.hargaJual||x.produk.harga, hargaBeli:x.produk.hargaBeli||0 })),
        total, omzet, hpp, laba
    });
    setData('wd_histori', h);

    cart = {};
    tutupCheckout(); renderProduk(); updateCartBar(); animateStagger('.produk-card', 40);
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 11 — DEV TOOLS
// ══════════════════════════════════════════════════════════════
function resetSemuaData() {
    ['wd_produk','wd_kasbon','wd_keuangan','wd_histori','wd_session'].forEach(k=>localStorage.removeItem(k));
    location.reload();
}

// Expose ke window
window.waroengDigital    = { reset: resetSemuaData, getData, setData };
window.tandaiLunas       = tandaiLunas;
window.tapProduk         = tapProduk;
window.ubahCart          = ubahCart;
window.setFilter         = setFilter;
window.bukaCheckout      = bukaCheckout;
window.tutupCheckout     = tutupCheckout;
window.bayar             = bayar;
window.logout            = logout;
window.initLogin         = initLogin;
window.initDashboard     = initDashboard;
window.initKasir         = initKasir;
window.bukaFormTambah    = bukaFormTambah;
window.bukaFormEdit      = bukaFormEdit;
window.tutupFormProduk   = tutupFormProduk;
window.simpanProduk      = simpanProduk;
window.hapusProduk       = hapusProduk;
window.ubahStokLangsung  = ubahStokLangsung;
window.initFormProduk    = initFormProduk;