let audio = new Audio();
let isPlaying = false;

/* =========================
   LOAD DATA (JSON + optional localStorage override)
========================= */
fetch("data/site.json")
  .then(res => res.json())
  .then(baseData => {

    let savedData = JSON.parse(localStorage.getItem("siteData")) || {};

    // Merge (dashboard overrides base JSON)
    const data = {
      ...baseData,
      ...savedData,
      hero: { ...baseData.hero, ...(savedData.hero || {}) },
      theme: { ...baseData.theme, ...(savedData.theme || {}) },
      music: { ...baseData.music, ...(savedData.music || {}) },
      gallery: savedData.gallery || baseData.gallery,
      messages: savedData.messages || baseData.messages
    };

    const root = document.documentElement;

    /* =========================
       THEME
    ========================= */
    if (data.theme) {
      root.style.setProperty("--primary-color", data.theme.primaryColor);
      root.style.setProperty("--secondary-color", data.theme.secondaryColor);
      root.style.setProperty("--accent-color", data.theme.accentColor);

      document.body.style.fontFamily = data.theme.bodyFont || "Poppins";
    }

    /* =========================
       HERO
    ========================= */
    const heroImg = document.getElementById("hero-image");
    const heroName = document.getElementById("hero-name");
    const heroDegree = document.getElementById("hero-degree");
    const heroSchool = document.getElementById("hero-school");
    const heroYear = document.getElementById("hero-year");
    const heroQuote = document.getElementById("hero-quote");
    const heroSection = document.getElementById("hero");

    if (data.hero) {
      if (heroImg) heroImg.src = data.hero.image || "";
      if (heroName) heroName.textContent = data.hero.name || "";
      if (heroDegree) heroDegree.textContent = data.hero.degree || "";
      if (heroSchool) heroSchool.textContent = data.hero.school || "";
      if (heroYear) heroYear.textContent = data.hero.year || "";
      if (heroQuote) heroQuote.textContent = data.hero.quote || "";

      if (heroSection && data.hero.background) {
        heroSection.style.backgroundImage = `url(${data.hero.background})`;
      }
    }

    /* =========================
       MUSIC INIT
    ========================= */
    const musicControl = document.getElementById("music-control");

    if (data.music && data.music.file) {
      audio.src = data.music.file;
      audio.loop = data.music.loop ?? true;
      audio.volume = data.music.volume ?? 0.5;

      if (musicControl) {
        musicControl.classList.remove("hidden");
      }
    }

    /* =========================
       GALLERY
    ========================= */
    const galleryGrid = document.getElementById("gallery-grid");

    if (galleryGrid && data.gallery) {
      data.gallery.forEach(item => {

        const div = document.createElement("div");
        div.classList.add("gallery-item");

        div.innerHTML = `<img src="${item.src}" alt="gallery">`;

        div.addEventListener("click", () => {
          const lightbox = document.getElementById("lightbox");
          const lightboxImg = document.getElementById("lightbox-img");

          if (lightbox && lightboxImg) {
            lightboxImg.src = item.src;
            lightbox.classList.remove("hidden");
          }
        });

        galleryGrid.appendChild(div);
      });
    }

    /* =========================
       MESSAGES
    ========================= */
    const messagesGrid = document.getElementById("messages-grid");

    if (messagesGrid && data.messages) {
      data.messages.forEach(msg => {

        const card = document.createElement("div");
        card.classList.add("message-card");

        card.innerHTML = `
          <img src="${msg.photo || ''}" alt="message">
          <h3>${msg.name || ''}</h3>
          <p>${msg.message || ''}</p>
        `;

        messagesGrid.appendChild(card);
      });
    }

  })
  .catch(err => {
    console.error("Failed to load site data:", err);
  });


/* =========================
   MUSIC TOGGLE
========================= */
document.addEventListener("DOMContentLoaded", () => {

  const toggleBtn = document.getElementById("music-toggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {

      if (!audio.src) return;

      if (isPlaying) {
        audio.pause();
        isPlaying = false;
      } else {
        audio.play().catch(() => {});
        isPlaying = true;
      }
    });
  }

});


/* =========================
   MUSIC UPLOAD
========================= */
document.getElementById("music-upload")?.addEventListener("change", (e) => {

  const file = e.target.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  audio.src = url;
  audio.play().catch(() => {});

  isPlaying = true;

  const musicControl = document.getElementById("music-control");
  if (musicControl) {
    musicControl.classList.remove("hidden");
  }

});


/* =========================
   LIGHTBOX CLOSE
========================= */
document.getElementById("lightbox")?.addEventListener("click", () => {
  document.getElementById("lightbox")?.classList.add("hidden");
});


/* =========================
   BEGIN JOURNEY SCROLL
========================= */
document.getElementById("begin-btn")?.addEventListener("click", () => {
  document.getElementById("gallery-section")?.scrollIntoView({
    behavior: "smooth"
  });
});
