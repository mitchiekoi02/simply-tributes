/* =========================
   SUPABASE
========================= */
const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBWc4ujWhIqydPZc"
);

const grid = document.getElementById("grid");

/* =========================
   LOAD MARKETPLACE
========================= */
async function loadTemplates() {

  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  grid.innerHTML = "";

  (data || []).forEach(template => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${template.preview_image || ""}" alt="">
      <h3>${template.title}</h3>

      <p>
        ${template.description || ""}
      </p>

      <p class="price">
        ${
         
