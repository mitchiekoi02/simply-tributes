const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "YOUR_ANON_KEY"
);

/* =========================
   CURRENT SLUG
========================= */
const slug = new URLSearchParams(location.search).get("slug") || "demo";

let tributeId = null;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadTribute();
  document.getElementById("saveBtn").addEventListener("click", saveAll);
});

/* =========================
   LOAD EXISTING DATA
========================= */
async function loadTribute() {

  const { data } = await supabase
    .from("tributes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) return;

  tributeId = data.id;

  // HERO
  document.getElementById("name").value = data.hero?.name || "";
  document.getElementById("degree").value = data.hero?.degree || "";
  document.getElementById("school").value = data.hero?.school || "";
  document.getElementById("year").value = data.hero?.year || "";
  document.getElementById("quote").value = data.hero?.quote || "";

  // THEME
  document.getElementById("primaryColor").value = data.theme?.primaryColor || "#d4af37";
  document.getElementById("secondaryColor").value = data.theme?.secondaryColor || "#ffffff";
}

/* =========================
   UPLOAD HELPER
========================= */
async function upload(file, folder = "assets") {

  if (!file) return null;

  const fileName = `${folder}-${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("gallery")
    .upload(fileName, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabase.storage
    .from("gallery")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =========================
   SAVE EVERYTHING
========================= */
async function saveAll() {

  if (!tributeId) {
    alert("Tribute not found");
    return;
  }

  /* HERO */
  const heroImage = await upload(document.getElementById("heroImage").files[0], "hero");
  const bgImage = await upload(document.getElementById("bgImage").files[0], "bg");

  const hero = {
    name: document.getElementById("name").value,
    degree: document.getElementById("degree").value,
    school: document.getElementById("school").value,
    year: document.getElementById("year").value,
    quote: document.getElementById("quote").value,
    image: heroImage,
    background: bgImage
  };

  /* MUSIC */
  const musicFile = await upload(document.getElementById("musicUpload").files[0], "music");

  const music = musicFile ? {
    file: musicFile,
    loop: true,
    volume: 0.5
  } : null;

  /* THEME */
  const theme = {
    primaryColor: document.getElementById("primaryColor").value,
    secondaryColor: document.getElementById("secondaryColor").value
  };

  /* UPDATE DB */
  const { error } = await supabase
    .from("tributes")
    .update({
      hero,
      theme,
      music
    })
    .eq("id", tributeId);

  if (error) {
    console.error(error);
    alert("Save failed");
  } else {
    alert("Saved successfully ❤️");
  }

  /* GALLERY */
  const files = document.getElementById("galleryUpload").files;

  for (let file of files) {
    const url = await upload(file, "gallery");

    if (url) {
      await supabase.from("gallery").insert([{
        tribute_id: tributeId,
        image_url: url
      }]);
    }
  }

  alert("All changes saved 🎉");
}
