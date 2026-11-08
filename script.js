/* RAU Lab Store — static GitHub Pages edition */
"use strict";

const WHATSAPP_NUMBER = "6281234567890"; // Ganti jika nomor admin berubah
const CART_KEY = "rauLabCart";
const products = [
  { id:"original-clear", name:"RAU Lab Original Clear", variant:"Original Clear", price:35000, description:"Kilau bening untuk tampilan natural.", tag:"EVERYDAY ESSENTIAL", image:"original-clear.webp" },
  { id:"coffee-scrub", name:"RAU Lab Coffee Scrub", variant:"Coffee Scrub", price:36000, description:"Nuansa hangat untuk daily look.", tag:"WARM MOOD", image:"coffee-scrub.webp" },
  { id:"rose-pink", name:"RAU Lab Rose Pink", variant:"Rose Pink", price:37000, description:"Pink lembut yang manis dan fresh.", tag:"SOFT PINK", image:"rose-pink.webp" },
  { id:"peach-nude", name:"RAU Lab Peach Nude", variant:"Peach Nude", price:38000, description:"Peach nude untuk kesan effortless.", tag:"NUDE GLOW", image:"peach-nude.webp" },
  { id:"mint-fresh", name:"RAU Lab Mint Fresh", variant:"Mint Fresh", price:38000, description:"Pilihan clean untuk ritual harian.", tag:"FRESH PICK", image:"mint-fresh.webp" },
  { id:"honey-glow", name:"RAU Lab Honey Glow", variant:"Honey Glow", price:39000, description:"Sentuhan hangat dengan kilau lembut.", tag:"GOLDEN HOUR", image:"honey-glow.webp" },
  { id:"cherry-red", name:"RAU Lab Cherry Red", variant:"Cherry Red", price:40000, description:"Merah cerah untuk mood yang berani.", tag:"BOLD MOOD", image:"cherry-red.webp" },
  { id:"berry-plump", name:"RAU Lab Berry Plump", variant:"Berry Plump", price:41000, description:"Berry tone yang playful dan modern.", tag:"BERRY TONE", image:"berry-plump.webp" },
  { id:"golden-gleam", name:"RAU Lab Golden Gleam", variant:"Golden Gleam", price:43000, description:"Kilau ekstra untuk momen spesial.", tag:"SPECIAL GLOW", image:"golden-gleam.webp" }
];
// Supabase: isi URL project dan publishable/anon key dari Dashboard > Project Settings > API.
// JANGAN PERNAH memasukkan service_role/secret key ke website frontend.
const SUPABASE_URL = "https://aplilfjmzxyevsrvutsl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HxcMoNXJFwHUgS_Fix6jPg_SGoexQZR";
const publishedReviews = [];
let supabaseClient = null;
let reviewsChannel = null;
const $ = (selector) => document.querySelector(selector);
const rupiah = (amount) => new Intl.NumberFormat("id-ID", { style:"currency", currency:"IDR", maximumFractionDigits:0 }).format(amount);
const productGrid = $("#product-grid");
const cartItemsEl = $("#cart-items");
const cartDrawer = $("#cart-drawer");
const cartOverlay = $("#cart-overlay");
let cart = loadCart();

function loadCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(value) ? value.filter(x => products.some(p => p.id === x.id) && Number.isInteger(x.qty) && x.qty > 0) : [];
  } catch { return []; }
}
function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function getProduct(id) { return products.find(p => p.id === id); }
function totalQty() { return cart.reduce((sum, item) => sum + item.qty, 0); }
function totalPrice() { return cart.reduce((sum, item) => sum + getProduct(item.id).price * item.qty, 0); }
function toast(message) {
  const el = $("#toast"); if (!el) return;
  el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
}

function renderProducts() {
  productGrid.innerHTML = products.map((p, i) => `
    <article class="product-card" style="--card-index:${i}">
      <a class="product-image-wrap" href="#kontak" aria-label="Tanya tentang ${p.name}">
        <img class="product-image" src="${p.image}" alt="Inspirasi tampilan ${p.variant}" loading="lazy" onerror="this.src='https://placehold.co/700x875/f0eae4/77736c?text=RAU+Lab'" />
        <span class="product-tag">${p.tag}</span><span class="product-number">0${i+1}</span>
      </a>
      <div class="product-info">
        <div><h3 class="product-name">${p.name}</h3><p class="product-description">${p.description}</p></div>
        <button class="add-button" data-add="${p.id}" aria-label="Tambah ${p.name} ke keranjang">+</button>
      </div>
      <p class="product-price">${rupiah(p.price)}</p>
    </article>`).join("");
}
function renderCart() {
  $("#cart-count").textContent = totalQty();
  $("#cart-total").textContent = rupiah(totalPrice());
  $("#checkout-total").textContent = rupiah(totalPrice());
  if (!cart.length) { cartItemsEl.innerHTML = '<div class="cart-empty"><span>♡</span><p>Keranjangmu masih kosong.</p><a href="#katalog" class="text-xs underline" id="empty-shop-link">Temukan lip mood kamu</a></div>'; return; }
  cartItemsEl.innerHTML = cart.map(item => {
    const p = getProduct(item.id);
    return `<article class="cart-line"><img src="${p.image}" alt="${p.name}"/><div class="cart-line-copy"><h3 class="cart-line-title">${p.name}</h3><p>${rupiah(p.price)}</p><div class="qty-control"><button data-qty="-1" data-id="${p.id}" aria-label="Kurangi">−</button><span>${item.qty}</span><button data-qty="1" data-id="${p.id}" aria-label="Tambah">+</button><button class="remove-button" data-remove="${p.id}">Hapus</button></div></div><strong>${rupiah(p.price * item.qty)}</strong></article>`;
  }).join("");
}
function addToCart(id) {
  const found = cart.find(x => x.id === id); if (found) found.qty++; else cart.push({id, qty:1});
  saveCart(); renderCart(); toast("Ditambahkan ke keranjang ♡");
}
function changeQty(id, amount) {
  const item = cart.find(x => x.id === id); if (!item) return;
  item.qty += amount; if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart(); renderCart();
}
function openCart() {
  cartOverlay.classList.remove("hidden"); requestAnimationFrame(() => cartOverlay.classList.add("visible"));
  cartDrawer.classList.add("open"); cartDrawer.setAttribute("aria-hidden", "false"); document.body.classList.add("overflow-hidden");
}
function closeCart() {
  cartDrawer.classList.remove("open"); cartOverlay.classList.remove("visible"); cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overflow-hidden"); setTimeout(() => cartOverlay.classList.add("hidden"), 260);
}
function openCheckout() {
  if (!cart.length) { toast("Keranjang masih kosong"); return; }
  closeCart(); $("#checkout").classList.remove("hidden"); document.body.classList.add("overflow-hidden"); window.scrollTo({top:0, behavior:"smooth"});
}
function closeCheckout() { $("#checkout").classList.add("hidden"); document.body.classList.remove("overflow-hidden"); }
function orderMessage(data) {
  const lines = cart.map((item, i) => { const p = getProduct(item.id); return `${i+1}. ${p.name}\n   ${item.qty} x ${rupiah(p.price)} = ${rupiah(p.price * item.qty)}`; });
  return ["Halo RAU Lab! Saya ingin memesan:", "", ...lines, "", `*TOTAL: ${rupiah(totalPrice())}*`, "", "*DETAIL PENERIMA*", `Nama: ${data.name}`, `No. WhatsApp: ${data.phone}`, `Alamat: ${data.address}`, `Catatan: ${data.note || "-"}`, "", "Mohon konfirmasi pesanan dan ongkos kirim. Terima kasih!"].join("\n");
}

function initReviews() {
  const productSelect = $("#review-product"); const filter = $("#review-filter");
  if (productSelect) products.forEach(p => productSelect.add(new Option(p.variant, p.variant)));
  if (filter) products.forEach(p => filter.add(new Option(p.variant, p.variant)));

  const configured = window.supabase &&
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PASTE_YOUR") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes("PASTE_YOUR");

  if (!configured) {
    setReviewMessage("Hubungkan Supabase terlebih dahulu dengan mengisi URL project dan publishable/anon key di script.js.");
    $("#review-submit").disabled = true;
    $("#review-submit").classList.add("opacity-50", "cursor-not-allowed");
    renderReviews();
    return;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  loadReviews();
  reviewsChannel = supabaseClient
    .channel("rau-lab-public-reviews")
    .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => loadReviews())
    .subscribe();
}

function setReviewMessage(message, isError = false) {
  const el = $("#review-form-message");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("text-red-700", isError);
  el.classList.toggle("text-rau-muted", !isError);
}

async function loadReviews() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient
    .from("reviews")
    .select("id, name, product, rating, comment, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    setReviewMessage("Belum bisa memuat ulasan. Periksa konfigurasi Supabase dan kebijakan database.", true);
    console.error("Supabase load reviews:", error.message);
    return;
  }
  publishedReviews.splice(0, publishedReviews.length, ...(data || []));
  renderReviews();
}

function renderReviews() {
  const list = $("#review-list"); if (!list) return;
  const selected = $("#review-filter")?.value || "";
  const reviews = publishedReviews.filter(r => !selected || r.product === selected);
  list.replaceChildren();
  if (!reviews.length) {
    const empty = document.createElement("div"); empty.className = "review-empty";
    empty.textContent = "Belum ada ulasan untuk pilihan ini. Jadilah yang pertama berbagi pengalaman!";
    list.append(empty);
  } else reviews.forEach(r => {
    const card = document.createElement("article"); card.className = "live-review-card";
    const top = document.createElement("div"); top.className = "review-card-top";
    const author = document.createElement("strong"); author.textContent = r.name;
    const stars = document.createElement("span"); stars.className = "live-review-stars"; stars.textContent = "★".repeat(r.rating) + "☆".repeat(5-r.rating);
    const product = document.createElement("p"); product.className = "live-review-meta"; product.textContent = r.product;
    const comment = document.createElement("p"); comment.className = "live-review-comment"; comment.textContent = `“${r.comment}”`;
    const date = document.createElement("p"); date.className = "live-review-meta";
    date.textContent = r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" }) : "";
    top.append(author, stars); card.append(top, product, comment, date); list.append(card);
  });
  const count = reviews.length; const average = count ? reviews.reduce((sum,r) => sum + Number(r.rating), 0) / count : 0;
  $("#review-average").textContent = count ? average.toFixed(1) : "—";
  $("#review-average-stars").textContent = count ? "★".repeat(Math.round(average)) + "☆".repeat(5-Math.round(average)) : "☆☆☆☆☆";
  $("#review-count").textContent = `${count} ulasan${selected ? " untuk " + selected : " ditampilkan"}`;
}

async function sendReviewToSupabase(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setReviewMessage("Supabase belum dikonfigurasi. Isi URL project dan public key di script.js.", true);
    return;
  }
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = String(data.get("reviewName") || "").trim();
  const product = String(data.get("reviewProduct") || "");
  const rating = Number(data.get("reviewRating"));
  const comment = String(data.get("reviewComment") || "").trim();
  if (name.length < 2 || name.length > 50 || !products.some(p => p.variant === product) || !Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 5 || comment.length > 600) {
    setReviewMessage("Periksa kembali nama, produk, rating, dan ulasan (5–600 karakter).", true);
    return;
  }
  const button = $("#review-submit");
  button.disabled = true; button.textContent = "Mengirim ulasan…";
  setReviewMessage("Mengirim ulasan ke RAU Lab…");
  const { error } = await supabaseClient.from("reviews").insert([{ name, product, rating, comment }]);
  button.disabled = false; button.innerHTML = 'Publikasikan ulasan <span>↗</span>';
  if (error) {
    console.error("Supabase insert review:", error.message);
    setReviewMessage("Ulasan belum berhasil dikirim. Coba lagi beberapa saat lagi.", true);
    return;
  }
  form.reset();
  setReviewMessage("Terima kasih! Ulasanmu sudah dipublikasikan dan akan tampil untuk semua pengunjung.");
  await loadReviews();
}

productGrid.addEventListener("click", e => { const btn = e.target.closest("[data-add]"); if (btn) { e.preventDefault(); addToCart(btn.dataset.add); } });
cartItemsEl.addEventListener("click", e => {
  const q = e.target.closest("[data-qty]"); const r = e.target.closest("[data-remove]");
  if (q) changeQty(q.dataset.id, Number(q.dataset.qty));
  if (r) { cart = cart.filter(x => x.id !== r.dataset.remove); saveCart(); renderCart(); toast("Produk dihapus"); }
});
$("#cart-open").addEventListener("click", openCart); $("#cart-close").addEventListener("click", closeCart); cartOverlay.addEventListener("click", closeCart);
$("#checkout-scroll").addEventListener("click", openCheckout); $("#checkout-close").addEventListener("click", closeCheckout);
$("#checkout-form").addEventListener("submit", e => {
  e.preventDefault(); if (!cart.length) return toast("Keranjang masih kosong");
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage(data))}`, "_blank", "noopener,noreferrer");
});
$("#review-form")?.addEventListener("submit", sendReviewToSupabase);
$("#review-filter")?.addEventListener("change", renderReviews);
$("#mobile-menu-button").addEventListener("click", () => {
  const nav = $("#mobile-nav"); const expanded = $("#mobile-menu-button").getAttribute("aria-expanded") === "true";
  nav.classList.toggle("hidden", expanded); $("#mobile-menu-button").setAttribute("aria-expanded", String(!expanded));
});
$("#mobile-nav").addEventListener("click", e => { if (e.target.closest("a")) { $("#mobile-nav").classList.add("hidden"); $("#mobile-menu-button").setAttribute("aria-expanded", "false"); } });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); closeCheckout(); } });
$("#year").textContent = new Date().getFullYear();
renderProducts(); renderCart(); initReviews();
