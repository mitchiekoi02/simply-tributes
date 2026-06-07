fetch("data/site.json")
  .then(response => response.json())
  .then(data => {

    // =========================
    // THEME
    // =========================
    const root = document.documentElement;

    root.style.setProperty("--primary-color", data.theme.primaryColor);
    root.style.setProperty("--secondary-color", data.theme.secondaryColor);
    root.style.setProperty("--accent-color", data.theme.accentColor);

    document.body.style.fontFamily = data.theme.bodyFont;

    // =========================
    // HERO CONTENT
    // =========================
    document.getElementById("hero-image").src = data.hero.image;

    document.getElementById("hero-name").textContent = data.hero.name;
    document.getElementById("hero-degree").textContent = data.hero.degree;
    document.getElementById("hero-school").textContent = data.hero.school;
    document.getElementById("hero-year").textContent = data.hero.year;
    document.getElementById("hero-quote").textContent = data.hero.quote;

    // Fonts (important fix: safe checks)
    const nameEl = document.querySelector("#hero-name");
    const degreeEl = document.querySelector("#hero-degree");
    const schoolEl = document.querySelector("#hero-school");
    const quoteEl = document.querySelector("#hero-quote");

    if (nameEl) nameEl.style.fontFamily = data.theme.headingFont;
    if (degreeEl) degreeEl.style.fontFamily = data.theme.headingFont;
    if (schoolEl) schoolEl.style.fontFamily = data.theme.bodyFont;
    if (quoteEl) quoteEl.style.fontFamily = data.theme.bodyFont;

    // =========================
    // HERO BACKGROUND
    // =========================
    document.getElementById("hero").style.backgroundImage =
      `url(${data.hero.background})`;

  })
  .catch(error => {
    console.error("Error loading site.json:", error);
  });
