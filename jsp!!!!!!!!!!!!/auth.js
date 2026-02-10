function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
  document.querySelectorAll(".tabs button")[0].classList.add("active");
  document.querySelectorAll(".tabs button")[1].classList.remove("active");
}

function showRegister() {
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.querySelectorAll(".tabs button")[1].classList.add("active");
  document.querySelectorAll(".tabs button")[0].classList.remove("active");
}

// INSCRIPTION
document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const user = {
    name: name.value,
    email: registerEmail.value,
    password: registerPassword.value
  };

  localStorage.setItem("mbnUser", JSON.stringify(user));
  document.getElementById("registerSuccess").innerText = "Inscription réussie !";
});

// CONNEXION
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const storedUser = JSON.parse(localStorage.getItem("mbnUser"));

  if (
    storedUser &&
    loginEmail.value === storedUser.email &&
    loginPassword.value === storedUser.password
  ) {
    window.location.href = "accueil.html";
  } else {
    document.getElementById("loginError").innerText = "Identifiants incorrects";
  }
});
