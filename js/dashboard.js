const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBWc4ujWhIqydPZc"
);

/* =========================
   CURRENT SLUG
========================= */
const slug = new URLSearchParams(location.search).get("slug") || "demo";

let tributeId = null;

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadTribute();

  const saveBtn = document.getElementById("saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveAll);
  }
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
    console.error("Failed to load tribute:", error);
    alert("Tribute not found");
    return;
  }

  tributeId = data.id;

  /* HERO FIELDS */
  document.getElementById("name").value = data.hero?.name || "";
  document.getElementById("degree").value = data.hero?.degree || "";
  document.getElementById("school").value = data.hero?.school || "";
  document.getElementById("year").value = data.hero?.year || "";
  document.getElementById("quote").value = data.hero?.quote || "";

  /* THEME */
  document.getElementById("primaryColor").value =
    data.theme?.primaryColor || "#d4af37";

  document.getElementById("secondaryColor").value =
    data.theme?.secondaryColor || "#ffffff";
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
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("gallery")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =========================
   SAVE ALL CHANGES
========================= */
async function saveAll() {

  if (!tributeId) {
    alert("Tribute not loaded");
    return;
  }

  try {

    /* =========================
       HERO UPLOADS
    ========================= */
    const heroFile = document.getElementById("heroImage").files[0];
    const bgFile = document.getElementById("bgImage").files[0];

    const heroImage = heroFile ? await upload(heroFile, "hero") : null;
    const bgImage = bgFile ? await upload(bgFile, "bg") : null;

    const hero = {
      name: document.getElementById("name").value,
      degree: document.getElementById("degree").value,
      school: document.getElementById("school").value,
      year: document.getElementById("year").value,
      quote: document.getElementById("quote").value,
      ...(heroImage && { image: heroImage }),
      ...(bgImage && { background: bgImage })
    };

    /* =========================
       MUSIC UPLOAD
    ========================= */
    const musicFile = document.getElementById("musicUpload").files[0];

    const musicUrl = musicFile
      ? await upload(musicFile, "music")
      : null;

    const music = musicUrl
      ? {
          file: musicUrl,
          loop: true,
          volume: 0.5
        }
      : null;

    /* =========================
       THEME
    ========================= */
    const theme = {
      primaryColor: document.getElementById("primaryColor").value,
      secondaryColor: document.getElementById("secondaryColor").value
    };

    /* =========================
       UPDATE TRIBUTE
    ========================= */
    const { error: updateError } = await supabase
      .from("tributes")
      .update({
        hero,
        theme,
        music
      })
      .eq("id", tributeId);

    if (updateError) {
      console.error(updateError);
      alert("Failed to save tribute");
      return;
    }

    /* =========================
       GALLERY UPLOADS
    ========================= */
    const galleryFiles =
      document.getElementById("galleryUpload").files;

    if (galleryFiles?.length) {
      for (const file of galleryFiles) {

        const url = await upload(file, "gallery");

        if (url) {
          await supabase.from("gallery").insert([{
            tribute_id: tributeId,
            image_url: url
          }]);
        }
      }
    }

    alert("Saved successfully ❤️");

  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Something went wrong");
  }
}
