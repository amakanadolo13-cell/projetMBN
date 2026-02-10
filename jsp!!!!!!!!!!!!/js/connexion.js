const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");

form.addEventListener("submit", e => {
  e.preventDefault();
  message.style.display = "none";
  email.classList.remove("error");
  password.classList.remove("error");

  if(!email.value.trim() || !password.value.trim()){
    message.textContent = "Tous les champs sont obligatoires";
    message.className = "message error";
    message.style.display = "block";
    if(!email.value) email.classList.add("error");
    if(!password.value) password.classList.add("error");
    return;
  }

  message.textContent = "Connexion réussie";
  message.className = "message success";
  message.style.display = "block";

  setTimeout(()=>{
    window.location.href = "accueil.html";
  }, 900);
});
