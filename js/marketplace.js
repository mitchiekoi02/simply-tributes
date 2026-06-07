const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBWc4ujWhIqydPZc"
);

const grid = document.getElementById("grid");

/* =========================
   LOAD APPROVED TEMPLATES
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

  (data || []).forEach(t => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${t.preview_image || ''}">
      <h3>${t.title}</h3>
      <p>${t.description || ''}</p>
      <p>₱${t.price || 0}</p>
      <button onclick='useTemplate("${t.id}")'>Use this template</button>
    `;

    grid.appendChild(card);
  });
}

/* =========================
   APPLY TEMPLATE
========================= */
async function useTemplate(templateId) {

  const slug = prompt("Enter your tribute slug:");

  if (!slug) return;

  // 1. Get template
  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (!template) return alert("Template not found");

  // 2. Get tribute
  const { data: tribute } = await supabase
    .from("tributes")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!tribute) return alert("Tribute not found");

  // 3. APPLY CONFIG TO TRIBUTE
  const { error } = await supabase
    .from("tributes")
    .update({
      theme: template.config?.theme || {},
      music: template.config?.music || null
    })
    .eq("id", tribute.id);

  if (error) {
    console.error(error);
    alert("Failed to apply template");
    return;
  }

  alert("Template applied successfully ❤️");
  window.location.href = `index.html?slug=${slug}`;
}

/* INIT */
loadTemplates();
