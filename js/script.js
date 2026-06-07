let audio = new Audio();
let isPlaying = false;

/* =========================
   SUPABASE INIT
========================= */
const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBcW4ujWhIqydPZc"
);

/* =========================
   STATE
========================= */
const slug = new URLSearchParams(location.search).get("slug") || "demo";
let tributeId = null;

/* =========================
   DOM HELPER
========================= */
const $ = (id) => document.getElementById(id);

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  setupEvents();
  await loadTribute();
});

/* =========================
   LOAD TRIBUTE
========================= */
async function loadTribute() {
  try {
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

    renderTribute(data);
    await loadGallery(tributeId);
    await loadMessages(tributeId);

    subscribeMessages(tributeId);

  } catch (err) {
    console.error("Load error:", err);
  }
}

/* =========================
   RENDER TRIBUTE
========================= */
function renderTribute(data) {
  if (data.hero) {
    const heroImg = $("hero-image");
    const hero = $("hero");

    if (heroImg) heroImg.src = data.hero.image || "";
    $("hero-name") && ($("hero-name").textContent = data.hero.name || "");
    $("hero-degree") && ($("hero-degree").textContent = data.hero.degree || "");
    $("hero-school") && ($("hero-school").textContent = data.hero.school || "");
    $("hero-year") && ($("hero-year").textContent = data.hero.year || "");
    $("hero-quote") && ($("hero-quote").textContent = data.hero.quote || "");

    if (hero && data.hero.background) {
      hero.style.backgroundImage = `url(${data.hero.background})`;
    }
  }

  if (data.music?.file) {
    audio.src = data.music.file;
    audio.loop = true;

    $("music-control")?.classList.remove("hidden");
  }
}

/* =========================
   GALLERY
========================= */
async function loadGallery(id) {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .eq("tribute_id", id);

  if (error) {
    console.error("Gallery error:", error);
    return;
  }

  const grid = $("gallery-grid");
  if (!grid) return;

  grid.innerHTML = "";

  (data || []).forEach((img) => {
    const el = document.createElement("div");
    el.className = "gallery-item";

    el.innerHTML = `<img src="${img.image_url}" loading="lazy" />`;

    el.onclick = () => {
      const lightboxImg = $("lightbox-img");
      const lightbox = $("lightbox");

      if (lightboxImg && lightbox) {
        lightboxImg.src = img.image_url;
        lightbox.classList.remove("hidden");
      }
    };

    grid.appendChild(el);
  });
}

/* =========================
   MESSAGES
========================= */
async function loadMessages(id) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("tribute_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Messages error:", error);
    return;
  }

  const grid = $("messages-grid");
  if (!grid) return;

  grid.innerHTML = "";
  (data || []).forEach(renderMessage);
}

/* =========================
   REALTIME (SAFE)
========================= */
function subscribeMessages(id) {
  const channel = supabase.channel("messages-live");

  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `tribute_id=eq.${id}`
    },
    (payload) => {
      if (payload?.new) renderMessage(payload.new, true);
    }
  );

  channel.subscribe();
}

/* =========================
   RENDER MESSAGE
========================= */
function renderMessage(m, prepend = false) {
  const grid = $("messages-grid");
  if (!grid) return;

  const div = document.createElement("div");
  div.className = "message-card";

  div.innerHTML = `
    ${m.photo_url ? `<img src="${m.photo_url}" loading="lazy" />` : ""}
    <h3>${m.name || ""}</h3>
    <p>${m.message || ""}</p>
  `;

  prepend ? grid.prepend(div) : grid.appendChild(div);
}

/* =========================
   UPLOAD IMAGE
========================= */
async function uploadGuestImage(file) {
  if (!file) return null;

  try {
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

  } catch (err) {
    console.error("Upload crash:", err);
    return null;
  }
}

/* =========================
   EVENTS
========================= */
function setupEvents() {

  $("music-toggle")?.addEventListener("click", async () => {
    if (!audio.src) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }

      isPlaying = !isPlaying;
    } catch (err) {
      console.warn("Audio blocked by browser:", err);
    }
  });

  $("begin-btn")?.addEventListener("click", () => {
    $("gallery-section")?.scrollIntoView({ behavior: "smooth" });
  });

  $("lightbox")?.addEventListener("click", () => {
    $("lightbox")?.classList.add("hidden");
  });

  $("submit-message")?.addEventListener("click", async () => {

    const name = $("guest-name")?.value?.trim();
    const message = $("guest-message")?.value?.trim();
    const file = $("guest-photo")?.files?.[0];

    if (!name || !message) {
      alert("Please fill in name and message");
      return;
    }

    const photo_url = await uploadGuestImage(file);

    const { error } = await supabase.from("messages").insert([
      {
        tribute_id: tributeId,
        name,
        message,
        photo_url
      }
    ]);

    if (error) {
      console.error(error);
      alert("Failed to send message");
      return;
    }

    $("guest-name").value = "";
    $("guest-message").value = "";
    $("guest-photo").value = "";

    alert("Message sent ❤️ (live for everyone)");
  });
}

/* =========================
   SHARE SYSTEM
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
  alert("Link copied ❤️");
}
