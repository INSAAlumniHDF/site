document.addEventListener('DOMContentLoaded', function () {
  // BURGER MENU
  const burgerBtn = document.getElementById('burger-btn');
  const sidebar = document.getElementById('mobile-sidebar');
  const closeBtn = document.getElementById('close-sidebar');

  burgerBtn.addEventListener('click', () => sidebar.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => sidebar.classList.add('hidden'));

  document.addEventListener('click', (e) => {
    if (!sidebar.classList.contains('hidden') && !sidebar.contains(e.target) && e.target !== burgerBtn) {
      sidebar.classList.add('hidden');
    }
  });


  document.querySelectorAll('.submenu-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const submenu = button.nextElementSibling;
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', !isExpanded);
      submenu.style.display = isExpanded ? 'none' : 'flex';
    });
  });

  // FULLCALENDAR
  const calendarEl = document.getElementById('calendar-full');
  if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'fr',
      firstDay: 1,
      headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
      nowIndicator: true,
      events: [
        { title: 'Symposium 2025', start: '2025-06-13', end: '2025-06-16', description: 'L’ingénieur face aux défis du 21e siècle', location: 'Lyon' },
        { title: 'Conférence Alumni', start: '2025-04-24', description: 'Rencontre avec nos Alumni Khalil, Martin et Cléo', location: 'CLJ2 Amphi E7', time: '13h15' },
        { title: 'Gala INSA HDF', start: '2025-03-22', location: 'Cité des congrès Valenciennes' }
      ],
    });
    calendar.render();
  }

  // CARROUSEL
  const track = document.querySelector(".carousel-track");
  if (track) {
    const slides = Array.from(track.children);
    const nextButton = document.querySelector(".next");
    const prevButton = document.querySelector(".prev");
    const creditBox = document.querySelector(".hover-message");

    let currentIndex = 0;

    function updateSlide(index) {
      const slideWidth = slides[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${index * slideWidth}px)`;

      // Crédit dynamique
      const credit = slides[index].getAttribute("data-credit") || "";
      creditBox.innerHTML = `Crédit photo : <br>${credit}`;
    }

    updateSlide(currentIndex);

    nextButton?.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateSlide(currentIndex);
    });

    prevButton?.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateSlide(currentIndex);
    });

    // Resize handler pour s’assurer que le slide reste aligné si fenêtre redimensionnée
    window.addEventListener("resize", () => {
      updateSlide(currentIndex);
    });
  }
});



const searchInput = document.getElementById("search");
const offers = document.querySelectorAll(".offer-card");
const filtersModal = document.getElementById("filtersModal");
const overlay = document.getElementById("overlay");
const openFilters = document.getElementById("openFilters");
const closeFilters = document.getElementById("closeFilters");
const resetFilters = document.getElementById("resetFilters");
const backToTop = document.getElementById("backToTop");
const filtersForm = document.getElementById("filtersForm");

// Affichage de la modale
openFilters.addEventListener("click", () => {
  filtersModal.style.display = "block";
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
});

// Fermer la modale
function closeModal() {
  filtersModal.style.display = "none";
  overlay.style.display = "none";
  document.body.style.overflow = "";
}

closeFilters.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

// Recherche live
searchInput.addEventListener("input", () => {
  filterOffers();
});

// Appliquer les filtres en direct quand une case est cochée/décochée
document.addEventListener("change", (e) => {
  if (e.target.classList.contains("filter-location") || e.target.classList.contains("filter-type")) {
    filterOffers();
  }
});

// Bouton "Appliquer les filtres" = juste fermer la modale
filtersForm.addEventListener("submit", (e) => {
  e.preventDefault();
  closeModal();
});

// Réinitialiser
resetFilters.addEventListener("click", () => {
  document.querySelectorAll("#filtersModal input[type=checkbox]").forEach(cb => cb.checked = false);
  searchInput.value = "";
  offers.forEach(offer => offer.style.display = "block");
  updateCounters();
});

// Fonction de tri / filtrage
function filterOffers() {
  const searchText = searchInput.value.toLowerCase();
  const selectedLocations = Array.from(document.querySelectorAll(".filter-location:checked")).map(i => i.value);
  const selectedTypes = Array.from(document.querySelectorAll(".filter-type:checked")).map(i => i.value);

  offers.forEach(offer => {
    const title = offer.querySelector("h3").textContent.toLowerCase();
    const location = offer.dataset.location;
    const type = offer.dataset.type;

    const matchesSearch = title.includes(searchText);
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(location);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(type);

    if (matchesSearch && matchesLocation && matchesType) {
      offer.style.display = "block";
    } else {
      offer.style.display = "none";
    }
  });

  updateCounters();
}

// Scroll top
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Génération dynamique des filtres + compteurs au chargement
window.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.offer-card');

  // --- Génération Lieux ---
  const lieuxMap = new Map();
  cards.forEach(card => {
    const lieu = card.dataset.location;
    if (lieu) {
      lieuxMap.set(lieu, (lieuxMap.get(lieu) || 0) + 1);
    }
  });

  const lieuFilterGroup = document.querySelectorAll('.filter-group')[0];
  lieuFilterGroup.innerHTML = "<strong>Lieux : </strong>";

  [...lieuxMap.entries()].sort().forEach(([lieu, count]) => {
    const label = document.createElement("label");
    label.setAttribute('data-location', lieu);
    label.innerHTML = `
      <input type="checkbox" value="${lieu}" class="filter-location" />
      ${lieu} (<span class="lieu-count">${count}</span>)
    `;
    lieuFilterGroup.appendChild(label);
  });

  // --- Génération Types ---
  const typesMap = new Map();
  cards.forEach(card => {
    const type = card.dataset.type;
    if (type) {
      typesMap.set(type, (typesMap.get(type) || 0) + 1);
    }
  });

  const typeFilterGroup = document.querySelectorAll('.filter-group')[1];
  typeFilterGroup.innerHTML = "<strong>Types :</strong>";

  [...typesMap.entries()].sort().forEach(([type, count]) => {
    const label = document.createElement("label");
    label.setAttribute('data-type', type);
    label.innerHTML = `
      <input type="checkbox" value="${type}" class="filter-type" />
      ${type} (<span class="type-count">${count}</span>)
    `;
    typeFilterGroup.appendChild(label);
  });

  updateCounters();
});

// ✅ Mise à jour des compteurs en logique croisée
function updateCounters() {
  const allOffers = Array.from(offers);

  const selectedLocations = Array.from(document.querySelectorAll(".filter-location:checked")).map(i => i.value);
  const selectedTypes = Array.from(document.querySelectorAll(".filter-type:checked")).map(i => i.value);

  const locationLabels = document.querySelectorAll('label[data-location]');
  const typeLabels = document.querySelectorAll('label[data-type]');

  // Types → dépend uniquement des lieux sélectionnés (ou tout si aucun lieu)
  typeLabels.forEach(label => {
    const type = label.getAttribute('data-type');
    const count = allOffers.filter(o =>
      (selectedLocations.length === 0 || selectedLocations.includes(o.dataset.location)) &&
      o.dataset.type === type
    ).length;
    label.querySelector('.type-count').textContent = count;
  });

  // Lieux → dépend uniquement des types sélectionnés (ou tout si aucun type)
  locationLabels.forEach(label => {
    const lieu = label.getAttribute('data-location');
    const count = allOffers.filter(o =>
      (selectedTypes.length === 0 || selectedTypes.includes(o.dataset.type)) &&
      o.dataset.location === lieu
    ).length;
    label.querySelector('.lieu-count').textContent = count;
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    
    // Détecte quand un nouveau SW est en train d'être installé
    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing;

      newSW.addEventListener('statechange', () => {
        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
          // Nouveau SW prêt, afficher le bouton à l'utilisateur
          const btn = document.createElement('button');
          btn.textContent = "Mettre à jour l'appli";
          btn.style.position = 'fixed';
          btn.style.bottom = '20px';
          btn.style.right = '20px';
          btn.style.padding = '10px 15px';
          btn.style.background = '#ff4081';
          btn.style.color = '#fff';
          btn.style.border = 'none';
          btn.style.borderRadius = '5px';
          btn.style.cursor = 'pointer';
          document.body.appendChild(btn);

          btn.addEventListener('click', () => {
            // Envoie un message au SW pour activer immédiatement le nouveau cache
            newSW.postMessage({ action: 'skipWaiting' });

            // Recharge la page après un petit délai
            setTimeout(() => location.reload(), 500);
          });
        }
      });
    });

  }).catch(err => console.log('SW registration failed:', err));
}
