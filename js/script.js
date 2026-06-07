let audio = new Audio();
let isPlaying = false;

fetch("data/site.json")
  .then(res => res.json())
  .then(data => {

    /* =========================
       THEME
    ========================= */
    const root = document.documentElement;

    root.style.setProperty("--primary-color", data.theme.primaryColor);
    root.style.setProperty("--secondary-color", data.theme.secondaryColor);
    root.style.setProperty("--accent-color", data.theme.accentColor);

    document.body.style.fontFamily = data.theme.bodyFont;

    /* =========================
       HERO
    ========================= */
    document.getElementById("hero-image").src = data.hero.image;
    document.getElementById("hero-name").textContent = data.hero.name;
    document.getElementById("hero-degree").textContent = data.hero.degree;
    document.getElementById("hero-school").textContent = data.hero.school;
    document.getElementById("hero-year").textContent = data.hero.year;
    document.getElementById("hero-quote").textContent = data.hero.quote;

    document.getElementById("hero").style.backgroundImage =
      `url(${data.hero.background})`;

    /* =========================
       MUSIC
    ========================= */
    if (data.music && data.music.file) {
      audio.src = data.music.file;
      audio.loop = data.music.loop;
      audio.volume = data.music.volume;

      document.getElementById("music-control").classList.remove("hidden");

      if (data.music.autoplay) {
        audio.play().catch(() => {});
        isPlaying = true;
      }
    }

    /* =========================
       GALLERY
    ========================= */
    const galleryGrid = document.getElementById("gallery-grid");

    if (data.gallery && galleryGrid) {
      data.gallery.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("gallery-item");

        div.innerHTML = `<img src="${item.src}" />`;

        div.addEventListener("click", () => {
          document.getElementById("lightbox-img").src = item.src;
          document.getElementById("lightbox").classList.remove("hidden");
        });

        galleryGrid.appendChild(div);
      });
    }

    /* =========================
       MESSAGES
    ========================= */
    const messagesGrid = document.getElementById("messages-grid");

    if (data.messages && messagesGrid) {
      data.messages.forEach(msg => {
        const card = document.createElement("div");
        card.classList.add("message-card");

        card.innerHTML = `
          <img src="${msg.photo}" />
          <h3>${msg.name}</h3>
          <p>${msg.message}</p>
        `;

        messagesGrid.appendChild(card);
      });
    }

    /* =========================
       LIGHTBOX CLOSE
    ========================= */
    document.getElementById("lightbox").addEventListener("click", () => {
      document.getElementById("lightbox").classList.add("hidden");
    });

  });


/* =========================
   MUSIC CONTROLS
========================= */
document.getElementById("music-toggle").addEventListener("click", () => {

  if (!audio.src) return;

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  } else {
    audio.play();
    isPlaying = true;
  }

});


document.getElementById("music-upload").addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (file) {
    const url = URL.createObjectURL(file);

    audio.src = url;
    audio.play();
    isPlaying = true;

    document.getElementById("music-control").classList.remove("hidden");
  }
});
