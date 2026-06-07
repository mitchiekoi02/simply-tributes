const supabase = window.supabase.createClient(
  "https://gzcsahzxpohpuqwbigfn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Y3NhaHp4cG9ocHVxd2JpZ2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzQ4NjcsImV4cCI6MjA5NjM1MDg2N30.RlKKTSZQ-GXVZtg8yG_AdnWtWI2EBWc4ujWhIqydPZc"
);

/* =========================
   SIGN UP
========================= */
async function signup() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Account created ❤️");
}

/* =========================
   LOGIN
========================= */
async function login() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Logged in 🚀");
  window.location.href = "dashboard.html";
}
