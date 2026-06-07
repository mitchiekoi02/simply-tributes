const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBWc4ujWhIqydPZc"
);

let currentEdit = null;
let siteData = {};

/* UPLOAD */
async function upload(bucket, file) {

  const name = Date.now() + file.name;

  await supabase.storage.from(bucket).upload(name, file);

  return supabase.storage.from(bucket).getPublicUrl(name).data.publicUrl;
}

/* LOAD LIST */
async function loadMyTributes() {

  const { data } = await supabase.from("tributes").select("*");

  my-tributes-grid.innerHTML = "";

  (data || []).forEach(t => {

    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${t.hero?.name || "Untitled"}</h3>
      <button onclick="edit('${t.id}')">Edit</button>
    `;

    my-tributes-grid.appendChild(div);
  });
}

/* EDIT */
async function edit(id) {

  const { data } = await supabase
    .from("tributes")
    .select("*")
    .eq("id", id)
    .single();

  currentEdit = id;
  siteData = data;

  heroName.value = data.hero?.name || "";
  heroDegree.value = data.hero?.degree || "";
  heroSchool.value = data.hero?.school || "";
  heroYear.value = data.hero?.year || "";
  heroQuote.value = data.hero?.quote || "";
}

/* SAVE */
async function saveData() {

  const heroImage = heroImage.files[0]
    ? await upload("hero", heroImage.files[0])
    : siteData.hero?.image;

  const bg = bgImage.files[0]
    ? await upload("hero", bgImage.files[0])
    : siteData.hero?.background;

  const payload = {
    hero: {
      name: heroName.value,
      degree: heroDegree.value,
      school: heroSchool.value,
      year: heroYear.value,
      quote: heroQuote.value,
      image: heroImage,
      background: bg
    }
  };

  if (currentEdit) {

    await supabase.from("tributes")
      .update(payload)
      .eq("id", currentEdit);

  } else {

    const slug = heroName.value.toLowerCase().replaceAll(" ","-") + "-" + Date.now();

    await supabase.from("tributes").insert([{ ...payload, slug }]);
  }

  loadMyTributes();
}

/* INIT */
document.addEventListener("DOMContentLoaded", loadMyTributes);
