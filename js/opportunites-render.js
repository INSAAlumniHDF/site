
(function () {
  const listEl = document.getElementById("offers");
  const data = window.OPPORTUNITES || [];
  if (!listEl || !Array.isArray(data)) return;

  // Vide le contenu statique puis recrée les mêmes cartes
  listEl.innerHTML = "";

  function shortCity(full) {
    if (!full) return "";
    // on prend avant " (" ou avant "," pour coller à l'affichage ancien (ex: "Mons (Ghlin)..." -> "Mons")
    return String(full).split(" (")[0].split(",")[0];
  }

  data.forEach(o => {
    const card = document.createElement("div");
    card.className = "offer-card";
    card.dataset.location = shortCity(o.location); // pour coller au data-location historique (ex: "Mons")
    card.dataset.type = o.type || "";
    card.dataset.date = o.date || "";

    const cityForText = shortCity(o.location);
    const href = `opportunite.html?id=${encodeURIComponent(o.id)}`;

    card.innerHTML = `
    <h3>${o.title}</h3>
    <p>${cityForText} - ${o.type || ""}</p>
    <p>${o.company || ""}</p>
    <a href="${href}">Consulter
      l'annonce</a>
    `;
    listEl.appendChild(card);
  });
})();

