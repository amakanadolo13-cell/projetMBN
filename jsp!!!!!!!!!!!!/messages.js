const conversations = {
  mmboussi: {
    name: "M.MBOUSSI",
    avatar: "https://i.pinimg.com/736x/0a/19/7e/0a197ef908d97424b1e18b9b52552eb5.jpg",
    messages: [
      { text: "Bonjour, vous êtes disponible ?", type: "received" },
      { text: "Oui bien sûr", type: "sent" },
      { text: "Parfait, on se voit à 14h", type: "received" }
    ]
  },
  ketsia: {
    name: "Ketsia.C",
    avatar: "https://i.pinimg.com/1200x/9d/7f/cd/9d7fcd869c90540afb95b5f0d9b0508c.jpg",
    messages: [
      { text: "Merci pour ton aide", type: "received" },
      { text: "Avec plaisir 😊", type: "sent" }
    ]
  },
  aty: {
    name: "M.ATY",
    avatar: "https://i.pinimg.com/736x/aa/2f/a1/aa2fa1e0011e89985c448b1b34c964e9.jpg",
    messages: [
      { text: "Le projet est validé", type: "received" },
      { text: "Merci beaucoup", type: "sent" }
    ]
  },
  sofia: {
    name: "Sofia",
    avatar: "https://i.pinimg.com/736x/f2/63/37/f26337907cce687a3fbfed7f13651975.jpg",
    messages: [
      { text: "Une nouvelle offre est disponible", type: "received" },
      { text: "Je vais regarder", type: "sent" }
    ]
  }
};

let currentChat = "mmboussi";

const chatBody = document.getElementById("chatBody");
const chatName = document.getElementById("chatName");
const chatAvatar = document.getElementById("chatAvatar");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

/* AFFICHER UNE DISCUSSION */
function loadChat(user) {
  currentChat = user;
  chatBody.innerHTML = "";

  chatName.innerText = conversations[user].name;
  chatAvatar.src = conversations[user].avatar;

  conversations[user].messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = `msg ${msg.type}`;
    div.innerText = msg.text;
    chatBody.appendChild(div);
  });

  chatBody.scrollTop = chatBody.scrollHeight;
}

/* CLICK SUR CONVERSATION */
document.querySelectorAll(".dm-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".dm-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    loadChat(item.dataset.user);
  });
});

/* ENVOYER MESSAGE */
chatForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  conversations[currentChat].messages.push({ text, type: "sent" });
  loadChat(currentChat);
  chatInput.value = "";
});

/* CHAT PAR DÉFAUT */
loadChat(currentChat);
