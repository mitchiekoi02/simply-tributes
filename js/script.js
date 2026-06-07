let audio = new Audio();
let isPlaying = false;

const supabaseUrl = "https://gzcsahzxpohpuqwbigfn.supabase.co";
const supabaseKey = "YOUR_ANON_KEY";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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

  if (error || !data) return;

  renderTribute(data);
  loadGallery(data.id);
  loadMessages(data.id);
}

/* =========================
   RENDER
========================= */
function renderTribute(data) {

  const root = document.documentElement;

  if (data.theme) {
    root.style.setProperty("--primary-color", data.theme.primaryColor);
    root.style.setProperty("--secondary-color", data.theme.secondaryColor);
    root.style.setProperty("--accent-color", data.theme.accentColor);

    document.body.style.fontFamily = data.theme.bodyFont || "Poppins";
  }

  if (data.hero) {
    document.getElementById("hero-image").src = data.hero.image || "";
    document.getElementById("hero-name").textContent = data.hero.name || "";
    document.getElementById("hero-degree").textContent = data.hero.degree || "";
    document.getElementById("hero-school").textContent = data.hero.school || "";
    document.getElementById("hero-year").textContent = data.hero.year || "";
    document.getElementById("hero-quote").textContent = data.hero.quote || "";

    if (data.hero.background) {
      document.getElementById("hero").style.backgroundImage =
        `url(${data.hero.background})`;
    }
  }

  if (data.music?.file) {
    audio.src = data.music.file;
    audio.loop = data.music.loop ?? true;
    audio.volume = data.music.volume ?? 0.5;

    document.getElementById("music-control").classList.remove("hidden");
  }
}

/* =========================
   GALLERY
========================= */
async function loadGallery(id) {

  const { data } = await supabase
    .from("gallery")
    .select("*")
    .eq("tribute_id", id);

  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";

  (data || []).forEach(item => {

    const div = document.createElement("div");
    div.className = "gallery-item";

    div.innerHTML = `<img src="${item.image_url}">`;

    div.onclick = () => {
      document.getElementById("lightbox-img").src = item.image_url;
      document.getElementById("lightbox").classList.remove("hidden");
    };

    grid.appendChild(div);
  });
}

/* =========================
   MESSAGES
========================= */
async function loadMessages(id) {

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("tribute_id", id);

  const grid = document.getElementById("messages-grid");
  grid.innerHTML = "";

  (data || []).forEach(msg => {

    const card = document.createElement("div");
    card.className = "message-card";

    card.innerHTML = `
      <img src="${msg.photo_url || ''}">
      <h3>${msg.name || ''}</h3>
      <p>${msg.message || ''}</p>
    `;

    grid.appendChild(card);
  });
}

/* =========================
   EVENTS
========================= */
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("music-toggle")?.addEventListener("click", async () => {

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

  loadTribute();
});
