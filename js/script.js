
let audio = new Audio();
let isPlaying = false;

const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "YOUR_ANON_KEY"
);

const slug = new URLSearchParams(location.search).get("slug") || "demo";

/* LOAD */
async function loadTribute() {

  const { data } = await supabase
    .from("tributes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return;

  render(data);
  loadGallery(data.id);
  loadMessages(data.id);
}

/* RENDER */
function render(data) {

  if (data.hero) {
    hero-image.src = data.hero.image || "";
    hero-name.textContent = data.hero.name || "";
    hero-degree.textContent = data.hero.degree || "";
    hero-school.textContent = data.hero.school || "";
    hero-year.textContent = data.hero.year || "";
    hero-quote.textContent = data.hero.quote || "";

    if (data.hero.background) {
      hero.style.backgroundImage = `url(${data.hero.background})`;
    }
  }

  if (data.music?.file) {
    audio.src = data.music.file;
    music-control.classList.remove("hidden");
  }
}

/* GALLERY */
async function loadGallery(id) {

  const { data } = await supabase
    .from("gallery")
    .select("*")
    .eq("tribute_id", id);

  gallery-grid.innerHTML = "";

  (data || []).forEach(img => {
    const el = document.createElement("div");
    el.innerHTML = `<img src="${img.image_url}">`;

    el.onclick = () => {
      lightbox-img.src = img.image_url;
      lightbox.classList.remove("hidden");
    };

    gallery-grid.appendChild(el);
  });
}

/* MESSAGES */
async function loadMessages(id) {

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("tribute_id", id);

  messages-grid.innerHTML = "";

  (data || []).forEach(m => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${m.photo_url || ''}">
      <h3>${m.name}</h3>
      <p>${m.message}</p>
    `;
    messages-grid.appendChild(div);
  });
}

/* EVENTS */
document.addEventListener("DOMContentLoaded", () => {

  music-toggle.onclick = () => {
    if (!audio.src) return;
    isPlaying ? audio.pause() : audio.play();
    isPlaying = !isPlaying;
  };

  begin-btn.onclick = () =>
    gallery-section.scrollIntoView({ behavior: "smooth" });

  lightbox.onclick = () =>
    lightbox.classList.add("hidden");

  loadTribute();
});

/* SHARE */
function shareFB() {
  window.open(`https://facebook.com/sharer/sharer.php?u=${location.href}`);
}

function shareX() {
  window.open(`https://twitter.com/intent/tweet?url=${location.href}`);
}

function shareWA() {
  window.open(`https://wa.me/?text=${location.href}`);
}

function copyLink() {
  navigator.clipboard.writeText(location.href);
  alert("Copied!");
}
