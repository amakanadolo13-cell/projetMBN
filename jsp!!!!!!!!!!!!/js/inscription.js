const form = document.getElementById("registerForm");
const message = document.getElementById("message");

const nom = document.getElementById("nom");
const prenom = document.getElementById("prenom");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirm = document.getElementById("confirm");

const inputs = [nom, prenom, email, password, confirm];

form.addEventListener("submit", e => {
  e.preventDefault();

  message.style.display = "none";
  inputs.forEach(i => i.classList.remove("error"));

  let valid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      input.classList.add("error");
      valid = false;
    }
  });

  if (!valid) {
    message.textContent = "Tous les champs sont obligatoires";
    message.className = "message error";
    message.style.display = "block";
    return;
  }

  if (password.value !== confirm.value) {
    password.classList.add("error");
    confirm.classList.add("error");
    message.textContent = "Les mots de passe ne correspondent pas";
    message.className = "message error";
    message.style.display = "block";
    return;
  }


  message.textContent = "Inscription réussie";
  message.className = "message success";
  message.style.display = "block";
message.textContent = "Inscription réussie. Connectez-vous pour continuer.";

  setTimeout(() => {
    window.location.href = "connexion.html";
  }, 1000);
});
