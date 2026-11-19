// ====== PENGATURAN (silakan ubah) ======
const NOMOR_WA = "6282165032717";   // format internasional tanpa + atau 0 di depan
const PRODUK = [
  { id: "pepaya",   nama: "Pepaya",       harga: 15000, kat: "buah",  foto: "img/pepaya.jpeg",     warna: "#ffd2b0", ikon: "🥭", desc: "Irisan pepaya ranum, manis lembut dan dingin." },
  { id: "mangga",   nama: "Mangga",       harga: 15000, kat: "buah",  foto: "img/mangga.jpeg",     warna: "#fde68a", ikon: "🥭", desc: "Mangga muda kuning, asam segar dalam kuah manis." },
  { id: "kedondong",nama: "Kedondong",    harga: 15000, kat: "buah",  foto: "img/kedondong.jpeg",  warna: "#e6dc8a", ikon: "🍏", desc: "Kedondong renyah, manis dan bikin nagih." },
  { id: "nanas",    nama: "Nanas",        harga: 15000, kat: "buah",  foto: "img/nanas.jpeg",                   warna: "#fbe58a", ikon: "🍍", desc: "Nanas manis asam, juicy dan menyegarkan." },
  { id: "salak",    nama: "Salak",        harga: 15000, kat: "buah",  foto: "img/salak.jpeg",                   warna: "#e9cfa8", ikon: "🌰", desc: "Salak gurih-manis dengan sedikit sepat yang khas." },
  { id: "salak",    nama: "Pala",        harga: 15000, kat: "buah",  foto: "img/pala.jpeg",                   warna: "#e9cfa8", ikon: "🌰", desc: "Pala manis dengan sedikit rasa yang unik." },
  { id: "glugur",   nama: "Asam Glugur",  harga: 15000, kat: "buah",  foto: "img/asam_gelugur.jpeg",                   warna: "#f6b79c", ikon: "🍊", desc: "Asam glugur khas Medan, asamnya bikin melek." },
  { id: "kolang",   nama: "Kolang Kaling",harga: 15000, kat: "buah",  foto: "img/kolang-kaling.jpeg",                   warna: "#f2eee2", ikon: "🫧", desc: "Kolang-kaling kenyal dan enak." },
  { id: "rujak",    nama: "Rujak Serut",  harga: 15000, kat: "rujak", foto: "img/rujak-serut.jpeg",                   warna: "#f4a5a0", ikon: "🌶️", desc: "Buah serut dengan bumbu rujak pedas manis." }
];
// =======================================

const rp = n => "Rp" + n.toLocaleString("id-ID");
const $ = s => document.querySelector(s);
let cart = {};
try { cart = JSON.parse(localStorage.getItem("manisan-cart")) || {}; } catch (e) { cart = {}; }

const grid = $("#grid");
function renderMenu(filter = "semua") {
  grid.innerHTML = PRODUK.filter(p => filter === "semua" || p.kat === filter).map(p => `
    <article class="card">
      <div class="thumb" style="background:${p.warna}">
        ${p.foto ? `<img src="${p.foto}" alt="Manisan ${p.nama}" loading="lazy">` : `<span aria-hidden="true">${p.ikon}</span>`}
      </div>
      <div class="body">
        ${p.kat === "rujak" ? '<span class="tag">Pakai bumbu</span>' : ""}
        <h3>${p.nama}</h3>
        <p>${p.desc}</p>
        <div class="row">
          <div class="harga">${rp(p.harga)} <small>/ cup</small></div>
          <button class="btn" data-pesan="${p.id}">Pesan sekarang</button>
        </div>
      </div>
    </article>`).join("");
}

function save() { localStorage.setItem("manisan-cart", JSON.stringify(cart)); }
function count() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function total() { return Object.entries(cart).reduce((s, [id, q]) => s + PRODUK.find(p => p.id === id).harga * q, 0); }

function renderCart() {
  const ids = Object.keys(cart);
  $("#cartCount").textContent = count();
  $("#cartTotal").textContent = rp(total());
  $("#cartItems").innerHTML = ids.length ? ids.map(id => {
    const p = PRODUK.find(x => x.id === id), q = cart[id];
    return `<div class="item">
      <b>${p.nama}</b><span class="sub">${rp(p.harga * q)}</span>
      <div class="qty"><button data-min="${id}" aria-label="Kurangi">−</button><span>${q}</span><button data-plus="${id}" aria-label="Tambah">+</button></div>
      <button class="hapus" data-del="${id}">Hapus</button>
    </div>`;
  }).join("") : '<div class="empty">Keranjangmu masih kosong.<br>Pilih manisan dulu, ya.</div>';
  save();
}

let toastTimer;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
}
function openCart(open = true) {
  $("#drawer").classList.toggle("on", open);
  $("#overlay").classList.toggle("on", open);
  $("#drawer").setAttribute("aria-hidden", !open);
}
function add(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  const b = $(".cart-btn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
}

// Klik pada kartu menu
grid.addEventListener("click", e => {
  const id = e.target.dataset.pesan;
  if (!id) return;
  add(id);
  toast(PRODUK.find(p => p.id === id).nama + " masuk keranjang");
  openCart();
});

// Klik di dalam keranjang
$("#cartItems").addEventListener("click", e => {
  const d = e.target.dataset;
  if (d.plus) cart[d.plus]++;
  else if (d.min) { if (--cart[d.min] <= 0) delete cart[d.min]; }
  else if (d.del) delete cart[d.del];
  else return;
  renderCart();
});

$("#openCart").onclick = () => openCart();
$("#closeCart").onclick = () => openCart(false);
$("#overlay").onclick = () => openCart(false);
document.addEventListener("keydown", e => { if (e.key === "Escape") openCart(false); });
$("#clearCart").onclick = () => { cart = {}; renderCart(); toast("Keranjang dikosongkan"); };

// Kirim ke WhatsApp
$("#checkout").onclick = () => {
  if (!count()) return toast("Keranjang masih kosong");
  const nama = $("#nama").value.trim(), cat = $("#catatan").value.trim();
  let msg = "Halo Buk Mur, saya mau pesan manisan:\n\n";
  Object.entries(cart).forEach(([id, q]) => {
    const p = PRODUK.find(x => x.id === id);
    msg += `• ${p.nama} x${q} = ${rp(p.harga * q)}\n`;
  });
  msg += `\nTotal: ${rp(total())}`;
  if (cat) msg += `\nCatatan: ${cat}`;
  if (nama) msg += `\nAtas nama: ${nama}`;
  window.open(`https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(msg)}`, "_blank");
};

// Filter
$("#filters").addEventListener("click", e => {
  const f = e.target.dataset.f;
  if (!f) return;
  document.querySelectorAll("#filters button").forEach(b => b.classList.toggle("on", b === e.target));
  renderMenu(f);
});

// Menu mobile & bayangan navbar
const burger = $("#burger"), menuNav = $("#menuNav");
burger.onclick = () => {
  const o = menuNav.classList.toggle("open");
  burger.classList.toggle("open", o);
  burger.setAttribute("aria-expanded", o);
};
menuNav.addEventListener("click", () => { menuNav.classList.remove("open"); burger.classList.remove("open"); });
window.addEventListener("scroll", () => $("#nav").classList.toggle("scrolled", scrollY > 20));

// Tombol WhatsApp umum
const sapa = "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent("Halo Buk Mur, saya mau tanya manisan.");
$("#waHero").href = sapa; $("#waContact").href = sapa;
$("#yr").textContent = new Date().getFullYear();

renderMenu();
renderCart();
