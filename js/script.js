let audio = new Audio();
let isPlaying = false;

/* =========================
   SUPABASE SETUP
========================= */
const supabaseUrl = "https://gzcsahzxpohpuqwbigfn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBWc4ujWhIqydPZc";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* =========================
   GET SLUG FROM URL
========================= */
const params = new URLSearchParams(window.location.search);
const slug = params.get("slug") || "demo";

/* =========================
   LOAD TRIBUTE FROM CLOUD
========================= */
async function loadTribute() {

  const { data, error } = await supabase
    .from("tributes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("No tribute found:", error);
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

  /* GALLERY (from DB) */
  loadGallery(data.id);

  /* MESSAGES (from DB) */
  loadMessages(data.id);
}

/* =========================
   LOAD GALLERY
========================= */
async function loadGallery(tributeId) {

  const { data } = await supabase
    .from("gallery")
    .select("*")
    .eq("tribute_id", tributeId);

  const galleryGrid = document.getElementById("gallery-grid");
  galleryGrid.innerHTML = "";

  data?.forEach(item => {

    const div = document.createElement("div");
    div.classList.add("gallery-item");

    div.innerHTML = `<img src="${item.image_url}">`;

    div.addEventListener("click", () => {
      document.getElementById("lightbox-img").src = item.image_url;
      document.getElementById("lightbox").classList.remove("hidden");
    });

    galleryGrid.appendChild(div);
  });
}

/* =========================
   LOAD MESSAGES
========================= */
async function loadMessages(tributeId) {

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("tribute_id", tributeId);

  const messagesGrid = document.getElementById("messages-grid");
  messagesGrid.innerHTML = "";

  data?.forEach(msg => {

    const card = document.createElement("div");
    card.classList.add("message-card");

    card.innerHTML = `
      <img src="${msg.photo_url || ''}">
      <h3>${msg.name || ''}</h3>
      <p>${msg.message || ''}</p>
    `;

    messagesGrid.appendChild(card);
  });
}

/* =========================
   MUSIC TOGGLE
========================= */
document.addEventListener("DOMContentLoaded", () => {

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

  document.getElementById("begin-btn")?.addEventListener("click", () => {
    document.getElementById("gallery-section").scrollIntoView({
      behavior: "smooth"
    });
  });

  document.getElementById("lightbox")?.addEventListener("click", () => {
    document.getElementById("lightbox").classList.add("hidden");
  });

  /* START APP */
  loadTribute();
});
