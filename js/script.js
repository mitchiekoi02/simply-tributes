let audio = new Audio();
let isPlaying = false;

/* =========================
   SUPABASE INIT
========================= */
const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBWc4ujWhIqydPZc"
);

/* =========================
   STATE
========================= */
const slug = new URLSearchParams(location.search).get("slug") || "demo";
let tributeId = null;

/* =========================
   HELPERS
========================= */
const $ = (id) => document.getElementById(id);

/* =========================
   INIT APP
========================= */
document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  loadTribute();
});

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

  tributeId = data.id;

  render(data);
  loadGallery(tributeId);
  loadMessages(tributeId);
  subscribeMessages(tributeId); // 🔥 REALTIME
}

/* =========================
   RENDER TRIBUTE
========================= */
function render(data) {

  if (data.hero) {
    $("hero-image").src = data.hero.image || "";
    $("hero-name").textContent = data.hero.name || "";
    $("hero-degree").textContent = data.hero.degree || "";
    $("hero-school").textContent = data.hero.school || "";
    $("hero-year").textContent = data.hero.year || "";
    $("hero-quote").textContent = data.hero.quote || "";

    if (data.hero.background) {
      $("hero").style.backgroundImage = `url(${data.hero.background})`;
    }
  }

  if (data.music?.file) {
    audio.src = data.music.file;
    $("music-control")?.classList.remove("hidden");
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

  const grid = $("gallery-grid");
  grid.innerHTML = "";

  (data || []).forEach(img => {

    const el = document.createElement("div");
    el.className = "gallery-item";

    el.innerHTML = `<img src="${img.image_url}">`;

    el.onclick = () => {
      $("lightbox-img").src = img.image_url;
      $("lightbox").classList.remove("hidden");
    };

    grid.appendChild(el);
  });
}

/* =========================
   MESSAGES (INITIAL LOAD)
========================= */
async function loadMessages(id) {

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("tribute_id", id)
    .order("created_at", { ascending: true });

  const grid = $("messages-grid");
  grid.innerHTML = "";

  (data || []).forEach(renderMessage);
}

/* =========================
   REALTIME MESSAGES
========================= */
function subscribeMessages(id) {

  supabase
    .channel("messages-live")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `tribute_id=eq.${id}`
      },
      (payload) => {
        renderMessage(payload.new, true);
      }
    )
    .subscribe();
}

/* =========================
   RENDER SINGLE MESSAGE
========================= */
function renderMessage(m, prepend = false) {

  const grid = $("messages-grid");

  const div = document.createElement("div");
  div.className = "message-card";

  div.innerHTML = `
    ${m.photo_url ? `<img src="${m.photo_url}">` : ""}
    <h3>${m.name || ""}</h3>
    <p>${m.message || ""}</p>
  `;

  if (prepend) {
    grid.prepend(div);
  } else {
    grid.appendChild(div);
  }
}

/* =========================
   UPLOAD IMAGE (GUESTS)
========================= */
async function uploadGuestImage(file) {

  if (!file) return null;

  const fileName = `guest-${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("gallery")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("gallery")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =========================
   EVENTS
========================= */
function setupEvents() {

  $("music-toggle")?.addEventListener("click", () => {
    if (!audio.src) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }

    isPlaying = !isPlaying;
  });

  $("begin-btn")?.addEventListener("click", () => {
    $("gallery-section").scrollIntoView({ behavior: "smooth" });
  });

  $("lightbox")?.addEventListener("click", () => {
    $("lightbox").classList.add("hidden");
  });

  /* =========================
     GUEST MESSAGE SUBMIT
  ========================= */
  $("submit-message")?.addEventListener("click", async () => {

    const name = $("guest-name").value;
    const message = $("guest-message").value;
    const file = $("guest-photo").files[0];

    if (!name || !message) {
      alert("Please fill in name and message");
      return;
    }

    const photo_url = await uploadGuestImage(file);

    await supabase.from("messages").insert([{
      tribute_id: tributeId,
      name,
      message,
      photo_url
    }]);

    $("guest-name").value = "";
    $("guest-message").value = "";
    $("guest-photo").value = "";

    alert("Message sent ❤️ (appears live for everyone)");
  });
}

/* =========================
   SHARE SYSTEM (VIRAL)
========================= */
function shareFB() {
  const url = encodeURIComponent(location.href);
  window.open(`https://facebook.com/sharer/sharer.php?u=${url}`);
}

function shareX() {
  const url = encodeURIComponent(location.href);
  window.open(`https://twitter.com/intent/tweet?text=Join this tribute ❤️&url=${url}`);
}

function shareWA() {
  const url = encodeURIComponent(location.href);
  window.open(`https://wa.me/?text=Join this tribute ❤️ ${url}`);
}

function copyLink() {
  navigator.clipboard.writeText(location.href);
  alert("Link copied ❤️ Share it!");
}
