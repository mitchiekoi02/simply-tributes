
const supabaseUrl = "https://gzcsahzxpohpuqwbigfn.supabase.co";
const supabaseKey = "YOUR_ANON_KEY";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let siteData = JSON.parse(localStorage.getItem("siteData")) || {};

/* =========================
   HELPERS
========================= */
async function uploadFile(bucket, file) {

  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/* =========================
   SAVE TRIBUTE (CLOUD)
========================= */
async function saveData() {

  const heroFile = document.getElementById("heroImage")?.files?.[0];
  const bgFile = document.getElementById("bgImage")?.files?.[0];
  const musicFile = document.getElementById("musicUpload")?.files?.[0];
  const galleryFiles = document.getElementById("galleryUpload")?.files || [];

  let heroImageUrl = siteData.hero?.image || null;
  let bgUrl = siteData.hero?.background || null;
  let musicUrl = siteData.music?.file || null;

  if (heroFile) heroImageUrl = await uploadFile("hero", heroFile);
  if (bgFile) bgUrl = await uploadFile("hero", bgFile);
  if (musicFile) musicUrl = await uploadFile("music", musicFile);

  const slug =
    (siteData.hero?.name || "tribute")
      .toLowerCase()
      .replaceAll(" ", "-") +
    "-" +
    Math.floor(Math.random() * 9999);

  const payload = {
    slug,

    hero: {
      ...siteData.hero,
      image: heroImageUrl,
      background: bgUrl
    },

    theme: siteData.theme,
    music: {
      file: musicUrl,
      loop: true,
      volume: 0.5
    }
  };

  const { data, error } = await supabase
    .from("tributes")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Save failed");
    return;
  }

  const tributeId = data.id;

  /* =========================
     UPLOAD GALLERY
  ========================= */
  for (let file of galleryFiles) {
    const url = await uploadFile("gallery", file);

    await supabase.from("gallery").insert([
      {
        tribute_id: tributeId,
        image_url: url
      }
    ]);
  }

  alert("🎉 Tribute Created!\n\nLink:\n" +
    window.location.origin + "/index.html?slug=" + slug);
}
