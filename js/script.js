
let audio = new Audio();
let isPlaying = false;

/* =========================
   SUPABASE CONFIG
========================= */
const supabaseUrl = "https://gzcsahzxpohpuqwbigfn.supabase.co";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY"; // keep yours here

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* =========================
   UPLOAD HELPERS (GUEST IMAGES)
========================= */
async function uploadGuestImage(file) {

  if (!file) return null;

  const fileName = `guest-${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("gallery")
    .upload(fileName, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabase.storage
    .from("gallery")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =========================
   GET SLUG
========================= */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "demo";

/* =========================
   LOAD TRIBUTE
========================= */
async function loadTribute() {

  const { data, error } = await supabase
    .from("tributes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Tribute not found:", error);
    return;
  }

  renderTribute(data);
}

/* =========================
   RENDER TRIBUTE
========================= */
function renderTribute(data) {

  const root = document.documentElement;

  /* THEME */
  if (data.theme) {
    root.style.setProperty("--primary-color", data.theme.primaryColor);
    root.style.setProperty("--secondary-color", data.theme.secondaryColor);
    root.style.setProperty("--accent-color", data.theme.accentColor);

    document.body.style.fontFamily = data.theme.bodyFont || "Poppins";
  }

  /* HERO */
  if (data.hero) {
    document.getElementById("hero-image").src = data.hero.image || "";
    document.getElementById("hero-name").textContent = data.hero.name || "";
    document.getElementById("hero-degree").textContent = data.hero.degree || "";
    document.getElementById("hero-school").textContent = data.hero.school || "";
    document.getElementById("hero-year").textContent = data.hero.year || "";
    document.getElementById("hero-quote").textContent = data.hero.quote || "";

    document.getElementById("hero").style.backgroundImage =
      `url(${data.hero.background})`;
  }

  /* MUSIC */
  if (data.music?.file) {
    audio.src = data.music.file;
    audio.loop = data.music.loop ?? true;
    audio.volume = data.music.volume ?? 0.5;

    document.getElementById("music-control").classList.remove("hidden");
  }

  loadGallery(data.id);
  loadMessages(data.id);
}

/* =========================
   GALLERY
========================= */
async function loadGallery(tributeId) {

  const { data } = await supabase
    .from("gallery")
    .select("*")
    .eq("tribute_id", tributeId);

  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";

  data?.forEach(item => {

    const div = document.createElement("div");
    div.classList.add("gallery-item");

    div.innerHTML = `<img src="${item.image_url}">`;

    div.addEventListener("click", () => {
      document.getElementById("lightbox-img").src = item.image_url;
      document.getElementById("lightbox").classList.remove("hidden");
    });

    grid.appendChild(div);
  });
}

/* =========================
   MESSAGES
========================= */
async function loadMessages(tributeId) {

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("tribute_id", tributeId);

  const grid = document.getElementById("messages-grid");
  grid.innerHTML = "";

  data?.forEach(msg => {

    const card = document.createElement("div");
    card.classList.add("message-card");

    card.innerHTML = `
      <img src="${msg.photo_url || ''}">
      <h3>${msg.name || ''}</h3>
      <p>${msg.message || ''}</p>
    `;

    grid.appendChild(card);
  });
}

/* =========================
   GUEST MESSAGE SUBMIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

  /* BEGIN BUTTON */
  document.getElementById("begin-btn")?.addEventListener("click", () => {
    document.getElementById("gallery-section").scrollIntoView({
      behavior: "smooth"
    });
  });

  /* LIGHTBOX */
  document.getElementById("lightbox")?.addEventListener("click", () => {
    document.getElementById("lightbox").classList.add("hidden");
  });

  /* MUSIC TOGGLE */
  document.getElementById("music-toggle")?.addEventListener("click", () => {
    if (!audio.src) return;

    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play().catch(() => {});
      isPlaying = true;
    }
  });

  /* SUBMIT MESSAGE */
  document.getElementById("submit-message")?.addEventListener("click", async () => {

    const name = document.getElementById("guest-name").value;
    const message = document.getElementById("guest-message").value;
    const file = document.getElementById("guest-photo").files[0];

    if (!name || !message) {
      alert("Please fill name and message");
      return;
    }

    const photo_url = await uploadGuestImage(file);

    const { data: tribute } = await supabase
      .from("tributes")
      .select("id")
      .eq("slug", slug)
      .single();

    await supabase.from("messages").insert([{
      tribute_id: tribute.id,
      name,
      message,
      photo_url
    }]);

    loadMessages(tribute.id);

    document.getElementById("guest-name").value = "";
    document.getElementById("guest-message").value = "";
    document.getElementById("guest-photo").value = "";
  });

  /* START */
  loadTribute();
});

/* =========================
   SHARE FUNCTIONS
========================= */
function shareFB() {
  const url = window.location.href;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
}

function shareX() {
  const url = window.location.href;
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`);
}

function shareWA() {
  const url = window.location.href;
  window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
}
