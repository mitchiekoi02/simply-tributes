const root = document.documentElement;

// COLORS
root.style.setProperty("--primary-color", data.theme.primaryColor);
root.style.setProperty("--secondary-color", data.theme.secondaryColor);
root.style.setProperty("--accent-color", data.theme.accentColor);

// FONTS
document.body.style.fontFamily = data.theme.bodyFont;

document.querySelector("#hero-name").style.fontFamily = data.theme.headingFont;
document.querySelector("#hero-degree").style.fontFamily = data.theme.headingFont;
document.querySelector("#hero-school").style.fontFamily = data.theme.bodyFont;
document.querySelector("#hero-quote").style.fontFamily = data.theme.bodyFont;
