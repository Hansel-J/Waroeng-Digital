/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          WAROENG DIGITAL — script.js (v2.0)                 ║
 * ║  Otak utama aplikasi. Handles auth, POS, dashboard, data.   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * ARSITEKTUR localStorage:
 * ┌─────────────────────────────────────────────────────────────┐
 * │  'wd_session'    → Object { role, username, loginTime }     │
 * │  'wd_produk'     → Array  [ { id, nama, harga, stok, ... }] │
 * │  'wd_kasbon'     → Array  [ { id, nama, hp, jumlah, ... }]  │
 * │  'wd_keuangan'   → Object { totalDana, omzet, transaksi }   │
 * │  'wd_histori'    → Array  [ { id, tanggal, items, total }]  │
 * └─────────────────────────────────────────────────────────────┘
 */

'use strict';

// ══════════════════════════════════════════════════════════════
// BAGIAN 1 — AKUN MOCK (Role-Based Authentication)
// Dua akun: 'owner' untuk dashboard manajemen,
// 'kasir' untuk tampilan POS pelanggan.
// Dalam produksi nyata, ini diganti dengan server authentication.
// ══════════════════════════════════════════════════════════════

const AKUN_MOCK = {
    owner: { password: 'owner123', role: 'owner', namaLengkap: 'Bu Asih (Pemilik)', redirect: 'main.html' },
    kasir: { password: 'kasir123', role: 'kasir', namaLengkap: 'Budi (Kasir)',      redirect: 'clientShop.html' }
};

// ══════════════════════════════════════════════════════════════
// BAGIAN 2 — DATA SEED
// Hanya di-load SEKALI saat pertama buka aplikasi.
// ══════════════════════════════════════════════════════════════

const SEED_PRODUK = [
    { id:'p01', nama:'Indomie Goreng',     harga:3500,  stok:48,  min:10, kat:'Mie Instan', emoji:'🍜', terjual:120 },
    { id:'p02', nama:'Beras Premium 5kg',  harga:72000, stok:5,   min:8,  kat:'Sembako',    emoji:'🌾', terjual:34  },
    { id:'p03', nama:'Minyak Goreng 1L',   harga:18500, stok:12,  min:6,  kat:'Sembako',    emoji:'🫙', terjual:55  },
    { id:'p04', nama:'Gula Pasir 1kg',     harga:16000, stok:3,   min:5,  kat:'Sembako',    emoji:'🍚', terjual:88  },
    { id:'p05', nama:'Kopi Kapal Api',     harga:2500,  stok:60,  min:15, kat:'Minuman',    emoji:'☕', terjual:210 },
    { id:'p06', nama:'Teh Botol Sosro',    harga:5500,  stok:24,  min:12, kat:'Minuman',    emoji:'🍵', terjual:95  },
    { id:'p07', nama:'Sabun Lifebuoy',     harga:5000,  stok:20,  min:8,  kat:'Kebersihan', emoji:'🧼', terjual:42  },
    { id:'p08', nama:'Sampo Pantene',      harga:1500,  stok:80,  min:20, kat:'Kebersihan', emoji:'🧴', terjual:175 },
    { id:'p09', nama:'Rokok Gudang Garam', harga:23000, stok:15,  min:5,  kat:'Rokok',      emoji:'🚬', terjual:300 },
    { id:'p10', nama:'Aqua 600ml',         harga:4000,  stok:2,   min:12, kat:'Minuman',    emoji:'💧', terjual:180 },
    { id:'p11', nama:'Biskuit Roma',       harga:7500,  stok:18,  min:8,  kat:'Snack',      emoji:'🍪', terjual:63  },
    { id:'p12', nama:'Telur Ayam',         harga:2500,  stok:120, min:30, kat:'Sembako',    emoji:'🥚', terjual:400 },
];

const SEED_KASBON = [
    { id:'k01', nama:'Pak Budi Santoso', hp:'6281234567890', jumlah:45000,  ket:'Indomie x5, Telur x3',    tanggal:'2025-07-10', status:'aktif', skor:72 },
    { id:'k02', nama:'Ibu Sari Dewi',    hp:'6289876543210', jumlah:120000, ket:'Beras 5kg, Minyak 1L',    tanggal:'2025-07-08', status:'aktif', skor:85 },
    { id:'k03', nama:'Mas Rizky',        hp:'6285551234567', jumlah:27500,  ket:'Rokok x1, Teh Botol x2', tanggal:'2025-07-12', status:'aktif', skor:60 },
    { id:'k04', nama:'Ibu Rina Marlina', hp:'6281122334455', jumlah:85000,  ket:'Sembako bulanan',          tanggal:'2025-07-05', status:'aktif', skor:91 },
];

const SEED_KEUANGAN = {
    namaToko:'Warung Bu Asih', totalDana:2500000,
    omzetBulan:1875000, totalTransaksi:47, targetOmzet:5000000
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

/** Toast notification */
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

/**
 * Animasi stagger — elemen muncul berurutan dengan delay.
 * Membuat halaman terasa hidup tanpa perlu JS animation library.
 */
function animateStagger(selector, delayMs = 60) {
    document.querySelectorAll(selector).forEach((el, i) => {
        el.style.cssText = `opacity:0;transform:translateY(18px);transition:opacity .4s ease ${i*delayMs}ms,transform .4s ease ${i*delayMs}ms`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.opacity = '1'; el.style.transform = 'translateY(0)';
        }));
    });
}

/**
 * Animasi counter angka dari 0 ke target.
 * Prinsip: easing cubic-out supaya akhirnya terasa "mendarat" dengan mulus.
 */
function animateCounter(elId, target, isRupiah) {
    const el = document.getElementById(elId);
    if (!el) return;
    const dur = 900, t0 = performance.now();
    const step = now => {
        const p = Math.min((now - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3); // cubic ease-out
        el.textContent = isRupiah ? rp(Math.round(e * target)) : Math.round(e * target).toLocaleString('id-ID');
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 4 — AUTHENTICATION
//
// Alur Role-Based System:
// 1. User isi form → cek username & password vs AKUN_MOCK
// 2. Cocok → buat object sesi → simpan ke localStorage 'wd_session'
// 3. Redirect ke halaman sesuai role (owner→main, kasir→clientShop)
// 4. Setiap halaman protected panggil checkAuth() di DOMContentLoaded
//    → tidak ada sesi valid → redirect login otomatis
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
    if (role && sesi.role !== role) {
        window.location.href = AKUN_MOCK[sesi.username]?.redirect || 'login.html';
        return null;
    }
    return sesi;
}

function logout() {
    localStorage.removeItem('wd_session');
    window.location.href = 'login.html';
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 5 — HALAMAN LOGIN
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

    const tp = document.getElementById('toggle-pass');
    const ip = document.getElementById('input-pass');
    tp?.addEventListener('click', () => {
        const show = ip.type === 'password';
        ip.type = show ? 'text' : 'password';
        tp.textContent = show ? '🙈' : '👁';
    });
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 6 — DASHBOARD OWNER (main.html)
// ══════════════════════════════════════════════════════════════

function initDashboard() {
    const sesi = checkAuth('owner');
    if (!sesi) return;
    initData();
    setText('nav-user', sesi.namaLengkap);
    document.getElementById('btn-logout')?.addEventListener('click', logout);
    renderKeuangan(); renderStokAlert(); renderKasbon(); renderGrafik();
    animateStagger('.dash-card', 90);
}

function renderKeuangan() {
    const k = getData('wd_keuangan');
    const totalKasbon = getData('wd_kasbon').filter(x => x.status === 'aktif').reduce((s,x) => s + x.jumlah, 0);
    setText('dash-nama-toko', k.namaToko);
    animateCounter('val-dana',      k.totalDana,       true);
    animateCounter('val-omzet',     k.omzetBulan,      true);
    animateCounter('val-transaksi', k.totalTransaksi,  false);
    animateCounter('val-kasbon',    totalKasbon,       true);

    // Progress bar target omzet
    const pct = Math.min((k.omzetBulan / k.targetOmzet) * 100, 100);
    setTimeout(() => {
        const bar = document.getElementById('omzet-bar');
        if (bar) bar.style.width = pct.toFixed(1) + '%';
        setText('omzet-pct', pct.toFixed(0) + '% dari target ' + rp(k.targetOmzet));
    }, 350);
}

function renderStokAlert() {
    const kritis = getData('wd_produk').filter(p => p.stok <= p.min);
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

/**
 * Render daftar kasbon + Credit Score widget.
 * Fitur "Credit Readiness" dari Business Plan:
 * data transaksi dikonversi ke skor kepercayaan pelanggan.
 */
function renderKasbon() {
    const aktif = getData('wd_kasbon').filter(k => k.status === 'aktif');
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
// BAGIAN 7 — HALAMAN POS / KASIR (clientShop.html)
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
    renderFilter(); renderProduk();
    bindCheckout();
    animateStagger('.produk-card', 45);
}

function renderFilter() {
    const produk = getData('wd_produk');
    const cats = ['Semua', ...new Set(produk.map(p => p.kat))];
    const cont = document.getElementById('filter-wrap');
    if (!cont) return;
    cont.innerHTML = cats.map(c => `<button class="filter-chip${c===filterAktif?' aktif':''}" onclick="setFilter('${c}')">${c}</button>`).join('');
}

function setFilter(kat) {
    filterAktif = kat; renderFilter(); renderProduk(); animateStagger('.produk-card', 35);
}

function renderProduk() {
    const produk = getData('wd_produk');
    const cont = document.getElementById('produk-grid');
    if (!cont) return;
    const list = filterAktif === 'Semua' ? produk : produk.filter(p => p.kat === filterAktif);
    if (!list.length) { cont.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span>🔍</span><p>Tidak ada produk</p></div>`; return; }

    cont.innerHTML = list.map((p, i) => {
        const habis = p.stok <= 0;
        const rendah = !habis && p.stok <= p.min;
        const qty = cart[p.id]?.jumlah || 0;
        return `
        <div class="produk-card${habis?' card-habis':''}${qty>0?' card-incart':''}" data-id="${p.id}" onclick="tapProduk('${p.id}')">
            ${rendah ? `<div class="produk-ribbon">⚠ Stok Tipis</div>` : ''}
            ${habis  ? `<div class="produk-ribbon ribbon-habis">Habis</div>` : ''}
            <div class="produk-top">
                <span class="produk-emoji">${p.emoji}</span>
                ${qty > 0 ? `<span class="produk-qty-badge">${qty}</span>` : ''}
            </div>
            <p class="produk-nama">${p.nama}</p>
            <p class="produk-kat">${p.kat}</p>
            <div class="produk-bottom">
                <span class="produk-harga">${rp(p.harga)}</span>
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
    if (delta > 0 && cart[id] && cart[id].jumlah === produk.stok && produk.stok > 0) toast('Stok maksimal!','info');

    // Update qty display tanpa re-render seluruh grid
    const qty = cart[id]?.jumlah || 0;
    const elQty  = document.getElementById(`qty-${id}`);
    const elCtrl = document.getElementById(`qty-ctrl-${id}`);
    const card   = document.querySelector(`[data-id="${id}"]`);
    if (elQty) elQty.textContent = qty;
    if (elCtrl) elCtrl.classList.toggle('visible', qty > 0);
    if (card) {
        card.classList.toggle('card-incart', qty > 0);
        // Update badge qty di pojok kartu
        let badge = card.querySelector('.produk-qty-badge');
        if (qty > 0) {
            if (!badge) { badge = document.createElement('span'); badge.className = 'produk-qty-badge'; card.querySelector('.produk-top').appendChild(badge); }
            badge.textContent = qty;
        } else if (badge) badge.remove();
    }
    updateCartBar();
}

function updateCartBar() {
    const totalItem  = Object.values(cart).reduce((s,x)=>s+x.jumlah,0);
    const totalHarga = Object.values(cart).reduce((s,x)=>s+x.jumlah*x.produk.harga,0);
    const bar = document.getElementById('cart-bar');
    if (!bar) return;
    bar.classList.toggle('show', totalItem > 0);
    setText('cart-count', `${totalItem} item`);
    setText('cart-total', rp(totalHarga));
}

function hitungTotal() { return Object.values(cart).reduce((s,x)=>s+x.jumlah*x.produk.harga,0); }

function bindCheckout() {
    document.getElementById('btn-buka-checkout')?.addEventListener('click', bukaCheckout);
    document.getElementById('btn-tutup-modal')?.addEventListener('click', tutupCheckout);
    document.getElementById('btn-bayar-tunai')?.addEventListener('click', ()=>bayar('Tunai'));
    document.getElementById('btn-bayar-kasbon')?.addEventListener('click', ()=>bayar('Kasbon'));
    document.getElementById('modal-overlay')?.addEventListener('click', e => { if (e.target.id==='modal-overlay') tutupCheckout(); });
}

function bukaCheckout() {
    if (!Object.keys(cart).length) { toast('Keranjang kosong!','error'); return; }
    // Render isi modal
    const list = document.getElementById('modal-item-list');
    if (list) list.innerHTML = Object.values(cart).map(x=>`
        <div class="modal-item-row">
            <span>${x.produk.emoji}</span>
            <div class="modal-item-info"><strong>${x.produk.nama}</strong><small>${rp(x.produk.harga)} × ${x.jumlah}</small></div>
            <span class="modal-subtotal">${rp(x.produk.harga*x.jumlah)}</span>
        </div>`).join('');
    setText('modal-total', rp(hitungTotal()));
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

    if (metode === 'Kasbon') {
        const nama = prompt('Nama pelanggan kasbon:');
        if (!nama?.trim()) { toast('Nama harus diisi!','error'); return; }
        const hp  = prompt('Nomor WhatsApp (contoh: 6281234567890):') || '';
        const ket = Object.values(cart).map(x=>`${x.produk.nama} x${x.jumlah}`).join(', ');
        const kb  = getData('wd_kasbon');
        kb.push({ id:'k'+Date.now(), nama:nama.trim(), hp:hp.trim(), jumlah:total, ket, tanggal:new Date().toISOString().split('T')[0], status:'aktif', skor:Math.floor(Math.random()*40)+50 });
        setData('wd_kasbon', kb);
        toast(`📝 Kasbon ${nama.trim()} (${rp(total)}) dicatat!`, 'info');
    } else {
        const k = getData('wd_keuangan');
        k.totalDana += total; k.omzetBulan += total; k.totalTransaksi += 1;
        setData('wd_keuangan', k);
        setText('kasir-saldo', rp(k.totalDana));
        toast(`✅ ${rp(total)} berhasil diterima!`, 'sukses');
    }

    // Kurangi stok
    const produk = getData('wd_produk');
    Object.values(cart).forEach(item => {
        const idx = produk.findIndex(p => p.id === item.produk.id);
        if (idx !== -1) produk[idx].stok -= item.jumlah;
    });
    setData('wd_produk', produk);

    // Histori
    const h = getData('wd_histori') || [];
    h.unshift({ id:'tr'+Date.now(), metode, tanggal:new Date().toISOString(), items:Object.values(cart).map(x=>({nama:x.produk.nama,jumlah:x.jumlah,harga:x.produk.harga})), total });
    setData('wd_histori', h);

    cart = {};
    tutupCheckout(); renderProduk(); updateCartBar(); animateStagger('.produk-card', 40);
}

// ══════════════════════════════════════════════════════════════
// BAGIAN 8 — DEV TOOLS
// ══════════════════════════════════════════════════════════════
function resetSemuaData() {
    ['wd_produk','wd_kasbon','wd_keuangan','wd_histori','wd_session'].forEach(k=>localStorage.removeItem(k));
    location.reload();
}

window.waroengDigital = { reset: resetSemuaData, getData, setData };
window.tandaiLunas  = tandaiLunas;
window.tapProduk    = tapProduk;
window.ubahCart     = ubahCart;
window.setFilter    = setFilter;
window.bukaCheckout = bukaCheckout;
window.tutupCheckout= tutupCheckout;
window.bayar        = bayar;
window.logout       = logout;
window.initLogin    = initLogin;
window.initDashboard= initDashboard;
window.initKasir    = initKasir;
