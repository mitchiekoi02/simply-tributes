const supabaseUrl = "https://gzcsahzxpohpuqwbigfn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBWc4ujWhIqydPZc";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* =========================
   LOAD EXISTING DATA
========================= */
let siteData = JSON.parse(localStorage.getItem("siteData")) || {};

/* =========================
   SAVE FUNCTION
========================= */
function saveData() {
  localStorage.setItem("siteData", JSON.stringify(siteData));
  alert("Saved! Open index.html to see changes.");
}

/* =========================
   HERO FIELDS
========================= */
document.getElementById("name").addEventListener("input", e => {
  siteData.hero = siteData.hero || {};
  siteData.hero.name = e.target.value;
});

document.getElementById("degree").addEventListener("input", e => {
  siteData.hero.degree = e.target.value;
});

document.getElementById("school").addEventListener("input", e => {
  siteData.hero.school = e.target.value;
});

document.getElementById("year").addEventListener("input", e => {
  siteData.hero.year = e.target.value;
});

document.getElementById("quote").addEventListener("input", e => {
  siteData.hero.quote = e.target.value;
});

/* =========================
   IMAGE UPLOADS
========================= */
document.getElementById("heroImage").addEventListener("change", e => {
  const file = e.target.files[0];
  siteData.hero.image = URL.createObjectURL(file);
});

document.getElementById("bgImage").addEventListener("change", e => {
  const file = e.target.files[0];
  siteData.hero.background = URL.createObjectURL(file);
});

/* =========================
   MUSIC UPLOAD
========================= */
document.getElementById("musicUpload").addEventListener("change", e => {
  const file = e.target.files[0];

  siteData.music = siteData.music || {};
  siteData.music.file = URL.createObjectURL(file);
});

/* =========================
   THEME
========================= */
document.getElementById("primaryColor").addEventListener("input", e => {
  siteData.theme = siteData.theme || {};
  siteData.theme.primaryColor = e.target.value;
});

document.getElementById("secondaryColor").addEventListener("input", e => {
  siteData.theme.secondaryColor = e.target.value;
});

/* =========================
   SAVE BUTTON
========================= */
document.getElementById("saveBtn").addEventListener("click", saveData);
