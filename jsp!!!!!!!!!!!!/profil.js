const modal = document.getElementById("modal");
const btnEdit = document.getElementById("btn-edit");
const closeBtn = document.querySelector(".close");

const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const ecoleEl = document.getElementById("ecole");
const formationEl = document.getElementById("formation");
const niveauEl = document.getElementById("niveau");
const campusEl = document.getElementById("campus");

const inputName = document.getElementById("inputName");
const inputEmail = document.getElementById("inputEmail");
const inputEcole = document.getElementById("inputEcole");
const inputFormation = document.getElementById("inputFormation");
const inputNiveau = document.getElementById("inputNiveau");
const inputCampus = document.getElementById("inputCampus");

/* OUVERTURE MODAL */
btnEdit.addEventListener("click", () => {
  modal.style.display = "flex";

  inputName.value = nameEl.innerText;
  inputEmail.value = emailEl.innerText;
  inputEcole.value = ecoleEl.innerText;
  inputFormation.value = formationEl.innerText;
  inputNiveau.value = niveauEl.innerText;
  inputCampus.value = campusEl.innerText;
});

/* FERMETURE */
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === modal) modal.style.display = "none";
});

/* ENREGISTRER */
document.getElementById("editForm").addEventListener("submit", e => {
  e.preventDefault();

  nameEl.innerText = inputName.value;
  emailEl.innerText = inputEmail.value;
  ecoleEl.innerText = inputEcole.value;
  formationEl.innerText = inputFormation.value;
  niveauEl.innerText = inputNiveau.value;
  campusEl.innerText = inputCampus.value;

  modal.style.display = "none";
});
