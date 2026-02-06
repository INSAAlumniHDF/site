// =======================
// UI HEADER / SIDEBAR / CALENDAR / CAROUSEL
// =======================
document.addEventListener('DOMContentLoaded', function () {
  // BURGER MENU
  const burgerBtn = document.getElementById('burger-btn');
  const sidebar = document.getElementById('mobile-sidebar');
  const closeBtn = document.getElementById('close-sidebar');

  if (burgerBtn && sidebar && closeBtn) {
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
  }

  // FULLCALENDAR
  // ==== Popup événements calendrier ====
  const body = document.body;

  // Overlay sombre
  const eventOverlay = document.createElement('div');
  eventOverlay.id = 'calendar-event-overlay';
  eventOverlay.className = 'calendar-event-overlay hidden';

  // Popup
  const eventPopup = document.createElement('div');
  eventPopup.id = 'calendar-event-popup';
  eventPopup.className = 'calendar-event-popup hidden';
  eventPopup.innerHTML = `
      <div class="calendar-event-popup-header">
        <span id="calendar-event-date"></span>
        <button type="button" id="calendar-event-close">&times;</button>
      </div>
      <div id="calendar-event-list"></div>
    `;

  body.appendChild(eventOverlay);
  body.appendChild(eventPopup);

  const popupDateEl = document.getElementById('calendar-event-date');
  const popupListEl = document.getElementById('calendar-event-list');
  const popupCloseBtn = document.getElementById('calendar-event-close');

  function closeEventPopup() {
    eventOverlay.classList.add('hidden');
    eventPopup.classList.add('hidden');
  }

  popupCloseBtn.addEventListener('click', closeEventPopup);
  eventOverlay.addEventListener('click', closeEventPopup);

  function openEventPopup(jsEvent, date, eventsForDay) {
    const label = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    popupDateEl.textContent = label;

    popupListEl.innerHTML = '';

    eventsForDay.forEach(ev => {
      const { location, description, time } = ev.extendedProps;
      const item = document.createElement('div');
      item.className = 'calendar-event-item';
      item.innerHTML = `
      <div class="event-title">${ev.title}</div>
      ${time ? `<div class="event-meta">${time}</div>` : ''}
      ${location ? `<div class="event-meta">${location}</div>` : ''}
      ${description ? `<div class="event-meta">${description}</div>` : ''}
    `;
      popupListEl.appendChild(item);
    });

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // ✅ MOBILE → popup centrée
      eventPopup.style.left = '50%';
      eventPopup.style.top = '50%';
      eventPopup.style.transform = 'translate(-50%, -50%)';
    } else {
      // 💻 DESKTOP → popup près du clic
      eventPopup.style.transform = 'none';

      const padding = 10;
      let x = jsEvent.clientX + padding;
      let y = jsEvent.clientY + padding;

      const popupRect = eventPopup.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (x + popupRect.width > vw) {
        x = vw - popupRect.width - padding;
      }
      if (y + popupRect.height > vh) {
        y = vh - popupRect.height - padding;
      }

      eventPopup.style.left = x + 'px';
      eventPopup.style.top = y + 'px';
    }

    eventOverlay.classList.remove('hidden');
    eventPopup.classList.remove('hidden');
  }



  const calendarEl = document.getElementById('calendar-full');
  if (calendarEl && window.FullCalendar) {
    const isMobile = window.innerWidth <= 768;

    const calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'fr',
      firstDay: 1,
      initialView: 'multiMonthYear',

      buttonText: {
        today: "Aujourd’hui",
        month: "Mois",
        multiMonthYear: "Année"
      },
      headerToolbar: isMobile
        ? { left: 'today', center: 'title', right: 'prev,next' }
        : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,multiMonthYear' },
      views: {
        multiMonthYear: {
          type: 'multiMonth',
          multiMonthMaxColumns: window.innerWidth <= 768 ? 1 : 4,
          multiMonthMinWidth: 0
        }
      },


      // ⬇️ IMPORTANT
      height: '80%',          // prend 100% de la hauteur du conteneur
      handleWindowResize: true, // adapte quand on redimensionne la fenêtre

      eventClick: function (info) {
        info.jsEvent.preventDefault();

        // 1) On essaye de récupérer la date de la case jour cliquée
        let clickedDateStr = null;
        const dayCell = info.el.closest('.fc-daygrid-day');
        if (dayCell && dayCell.dataset.date) {
          clickedDateStr = dayCell.dataset.date; // ex : "2025-06-14"
        } else {
          // fallback : au cas où, on retombe sur la date de début de l'évènement
          clickedDateStr = info.event.startStr.slice(0, 10);
        }

        // 2) On crée un objet Date propre à minuit pour éviter les décalages
        const clickedDate = new Date(clickedDateStr + 'T00:00:00');

        // 3) On cherche tous les évènements qui couvrent CE jour-là
        const eventsSameDay = calendar.getEvents().filter(ev => {
          if (!ev.start) return false;

          // Date du début (à minuit, sans heure)
          const start = new Date(
            ev.start.getFullYear(),
            ev.start.getMonth(),
            ev.start.getDate()
          );

          // Si pas de end → événement sur un jour
          if (!ev.end) {
            return clickedDate.getTime() === start.getTime();
          }

          // Si end existe → multi-jours, end est exclusif
          const end = new Date(
            ev.end.getFullYear(),
            ev.end.getMonth(),
            ev.end.getDate()
          );

          // couvre start <= jour < end
          return clickedDate >= start && clickedDate < end;
        });


        // 4) On ouvre la popup avec la "vraie" date cliquée
        openEventPopup(info.jsEvent, clickedDate, eventsSameDay);
      },


      events: [
        { title: 'AGO & Gala INSA HDF', start: '2026-03-28', location: 'Cité des congrès Valenciennes' },
        { title: 'Conférence métier', start: '2025-12-04', location: 'INSA HDF' },
        { title: 'Afterwork retrouvailles', start: '2025-10-15', location: 'Carpe diem Café, Paris 1er' },
        { title: '5 ans de l’INSA', start: '2025-09-25', location: 'INSA HDF' },
        { title: 'Symposium 2025', start: '2025-06-13', end: '2025-06-16', description: 'L’ingénieur face aux défis du 21e siècle', location: 'Lyon' },
        { title: 'Conférence Alumni', start: '2025-04-24', description: 'Rencontre avec nos Alumni', location: 'CLJ2 Amphi E7', time: '13h15' },
        { title: 'Gala INSA HDF', start: '2025-03-22', location: 'Cité des congrès Valenciennes' }
      ]
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
      if (creditBox) creditBox.innerHTML = `Crédit photo : <br>${credit}`;
    }

    if (slides.length) {
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
  }
});


// =======================
// OFFRES : Expiration + Filtres + Recherche + Compteurs
// =======================

// Sélecteurs de base
const searchInput = document.getElementById("search");
const filtersModal = document.getElementById("filtersModal");
const overlay = document.getElementById("overlay");
const openFilters = document.getElementById("openFilters");
const closeFilters = document.getElementById("closeFilters");
const resetFilters = document.getElementById("resetFilters");
const backToTop = document.getElementById("backToTop");
const filtersForm = document.getElementById("filtersForm");

// ====== EXPIRATION (6 mois) ======
const sixMonthsAgo = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
})();

function isExpired(card) {
  const dateAttr = card?.dataset?.date;
  if (!dateAttr) return false;
  return new Date(dateAttr) < sixMonthsAgo;
}

// Marque et cache définitivement les offres périmées au chargement
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.offer-card').forEach(card => {
    if (isExpired(card)) {
      card.dataset.expired = '1';
      card.style.display = 'none';
    }
  });

  // Génération initiale des filtres et compteurs uniquement depuis les offres actives
  generateFiltersFromActiveOffers();
  toggleNoResults();
  updateCounters();
});

// Utilise toujours la liste "active" (non périmée)
function getActiveOffers() {
  return Array.from(document.querySelectorAll('.offer-card')).filter(c => c.dataset.expired !== '1');
}

// Affiche / cache le message "Aucun résultat"
function toggleNoResults() {
  const noResults = document.getElementById('no-results-message');
  if (!noResults) return;
  const anyVisible = getActiveOffers().some(c => c.style.display !== 'none');
  noResults.style.display = anyVisible ? 'none' : 'block';
}

// =======================
// Modale filtres
// =======================
if (openFilters) {
  openFilters.addEventListener("click", () => {
    filtersModal.style.display = "block";
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
  });
}

function closeModal() {
  if (!filtersModal || !overlay) return;
  filtersModal.style.display = "none";
  overlay.style.display = "none";
  document.body.style.overflow = "";
}

if (closeFilters) closeFilters.addEventListener("click", closeModal);
if (overlay) overlay.addEventListener("click", closeModal);

// Recherche live
if (searchInput) {
  searchInput.addEventListener("input", () => {
    filterOffers();
  });
}

// Appliquer les filtres en direct quand une case est cochée/décochée
document.addEventListener("change", (e) => {
  if (e.target.classList?.contains("filter-location") || e.target.classList?.contains("filter-type")) {
    filterOffers();
  }
});

// Bouton "Appliquer les filtres" = juste fermer la modale
if (filtersForm) {
  filtersForm.addEventListener("submit", (e) => {
    e.preventDefault();
    closeModal();
  });
}

// Réinitialiser (sans réafficher les périmées)
if (resetFilters) {
  resetFilters.addEventListener("click", () => {
    document.querySelectorAll("#filtersModal input[type=checkbox]").forEach(cb => cb.checked = false);
    if (searchInput) searchInput.value = "";
    getActiveOffers().forEach(offer => offer.style.display = "block");
    toggleNoResults();
    updateCounters();
  });
}

// Fonction de tri / filtrage (uniquement sur offres actives)
function filterOffers() {
  const searchText = (searchInput?.value || "").toLowerCase();
  const selectedLocations = Array.from(document.querySelectorAll(".filter-location:checked")).map(i => i.value);
  const selectedTypes = Array.from(document.querySelectorAll(".filter-type:checked")).map(i => i.value);

  getActiveOffers().forEach(offer => {
    const title = offer.querySelector("h3")?.textContent.toLowerCase() || "";
    const location = offer.dataset.location || "";
    const type = offer.dataset.type || "";

    const matchesSearch = title.includes(searchText);
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(location);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(type);

    offer.style.display = (matchesSearch && matchesLocation && matchesType) ? "block" : "none";
  });

  toggleNoResults();
  updateCounters();
}

// Génération dynamique des filtres à partir des offres **actives**
function generateFiltersFromActiveOffers() {
  const cards = getActiveOffers();

  // --- Génération Lieux ---
  const lieuxMap = new Map();
  cards.forEach(card => {
    const lieu = card.dataset.location;
    if (lieu) {
      lieuxMap.set(lieu, (lieuxMap.get(lieu) || 0) + 1);
    }
  });

  const groups = document.querySelectorAll('.filter-group');
  const lieuFilterGroup = groups?.[0];
  if (lieuFilterGroup) {
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
  }

  // --- Génération Types ---
  const typesMap = new Map();
  cards.forEach(card => {
    const type = card.dataset.type;
    if (type) {
      typesMap.set(type, (typesMap.get(type) || 0) + 1);
    }
  });

  const typeFilterGroup = groups?.[1];
  if (typeFilterGroup) {
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
  }
}

// ✅ Mise à jour des compteurs en logique croisée (uniquement offres actives)
function updateCounters() {
  const allOffers = getActiveOffers();

  const selectedLocations = Array.from(document.querySelectorAll(".filter-location:checked")).map(i => i.value);
  const selectedTypes = Array.from(document.querySelectorAll(".filter-type:checked")).map(i => i.value);

  const locationLabels = document.querySelectorAll('label[data-location]');
  const typeLabels = document.querySelectorAll('label[data-type]');

  // Types → dépend des lieux sélectionnés
  typeLabels.forEach(label => {
    const type = label.getAttribute('data-type');
    const count = allOffers.filter(o =>
      (selectedLocations.length === 0 || selectedLocations.includes(o.dataset.location)) &&
      o.dataset.type === type
    ).length;
    const span = label.querySelector('.type-count');
    if (span) span.textContent = count;
  });

  // Lieux → dépend des types sélectionnés
  locationLabels.forEach(label => {
    const lieu = label.getAttribute('data-location');
    const count = allOffers.filter(o =>
      (selectedTypes.length === 0 || selectedTypes.includes(o.dataset.type)) &&
      o.dataset.location === lieu
    ).length;
    const span = label.querySelector('.lieu-count');
    if (span) span.textContent = count;
  });
}


// =======================
// Back to top
// =======================
if (backToTop) {
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
}


// =======================
// Service Worker : bouton "Mettre à jour l'appli" si nouveau SW
// =======================
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

document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("current-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});


(function () {
  // Inject header au tout début du body
  const headerHtml = `
  <header class="header">
    <!-- Burger bouton à gauche -->
    <button class="burger" id="burger-btn" aria-label="Ouvrir le menu">☰</button>

    <div class="logo-text">
      <a href="index.html"><img src="img/logo.png" alt="Logo" /></a>
      <a href="index.html">
        <h1>INSA Alumni HDF</h1>
      </a>
    </div>

    <nav class="navbar">
      <ul class="menu">
        <li class="has-submenu">
          <a href="Présentation.html">L'association <span class="arrow-down">&#9662;</span></a>
          <ul class="submenu">
            <li><a href="Présentation.html">Présentation</a></li>
            <li><a href="Adhérer.html">Adhérer</a></li>
            <li><a href="Evenements.html">Nos évènements</a></li>
            <li><a href="Calendrier.html">Calendrier</a></li>
          </ul>
        </li>
        <li><a href="GR.html">INSA GR</a></li>
        <li><a href="INSA-Alumni.html">INSA Alumni</a></li>
      </ul>
    </nav>
    <div class="header-right-link">
      <a href="Trouver-une-opportunité.html">
        Trouver une opportunité
      </a>
    </div>
  </header>

  <!-- SIDEBAR MOBILE -->
  <aside id="mobile-sidebar" class="mobile-sidebar hidden" role="dialog" aria-modal="true"
    aria-labelledby="sidebar-title">
    <button id="close-sidebar" aria-label="Fermer le menu">×</button>
    <nav>
      <ul class="menu-sidebar">
        <li class="mobile-has-submenu">
          <button class="submenu-toggle" aria-expanded="false">
            L'association <span class="arrow-down">&#9662;</span>
          </button>
          <ul class="mobile-submenu">
            <li><a href="Présentation.html">Présentation</a></li>
            <li><a href="Adhérer.html">Adhérer</a></li>
            <li><a href="Evenements.html">Nos évènements</a></li>
            <li><a href="Calendrier.html">Calendrier</a></li>
          </ul>
        </li>
        <li><a href="GR.html">INSA GR</a></li>
        <li><a href="INSA-Alumni.html">INSA Alumni</a></li>
      </ul>
      <hr class="sidebar-separator">
      <div class="mobile-sidebar-extra-link">
        <a href="Trouver-une-opportunité.html">
          Trouver une opportunité </i>
        </a>
      </div>
    </nav>
  </aside>
  `;

  document.body.insertAdjacentHTML("afterbegin", headerHtml);

  // Inject footer à la fin du body
  const footerHtml = `
  <footer class="footer" id="footer">
    <div class="footer-columns">
      <div class="footer-column footer-useful-links">
        <h3>Liens utiles</h3>
        <ul class="quick-links">
          <li>
            <a href="Trouver-une-opportunité.html" rel="noopener noreferrer">Offres
              d’emploi &
              stages </a>
          </li>
          <li>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfxGEc7arcG3aekH0IiOLiSq1oMoYx-lIHZT48l2l9HxPFFJQ/viewform"
              target="_blank" rel="noopener noreferrer">Devenir intervenant </a><i
              class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </li>
          <li>
            <a href="https://drive.google.com/file/d/11RBr33yMGlCbAgaVTE_A6GHjOkR57iiC/view" target="_blank"
              rel="noopener noreferrer">Tout savoir
              sur les cotisations </a><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </li>
          <li>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSfKmM85k6LLKfK3tEFJEltQL6tbxKUpLgEWTbkPMbF5dQPhdQ/viewform"
              target="_blank" rel="noopener noreferrer">Proposer une offre </a><i
              class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
          </li>
        </ul>
      </div>
      <div class="footer-column footer-info">
        <h3>Nos réseaux - Contacts</h3>
        <ul class="footer-links">
          <li>
            <a href="https://www.instagram.com/insa_alumni_hdf" target="_blank" rel="noopener noreferrer">
              Instagram <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></a></i>
          </li>
          <li>
            <a href="https://www.facebook.com/insaalumnihdf" target="_blank" rel="noopener noreferrer">
              Facebook
              <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></a></i>
          </li>
          <li>
            <a href="https://www.linkedin.com/company/98692419/" target="_blank" rel="noopener noreferrer">
              LinkedIn <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></a></i>
          </li>
          <li>
            <a href="mailto:insalumnihdf@gmail.com" target="_blank" rel="noopener noreferrer"> Email <i
                class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></a></i>
          </li>
        </ul>
      </div>
      <div class="footer-column footer-useful-links">
        <h3>INSA Alumni</h3>
        <ul class="footer-links">
          <li>
            <a href="INSA-Alumni.html">Qu'est ce qu'INSA Alumni ?</a>
          </li>
          <li>
            <a href="GR.html">Les INSA GR</a>
          </li>
          <li>
            <a href="https://www.insa-alumni.org" target="_blank" rel="noopener noreferrer"> Le site INSA
              Alumni
              <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></a></i>
          </li>
          <li>
            <a href="https://www.insa-hautsdefrance.fr/" target="_blank" rel="noopener noreferrer"> Le site
              de
              l'INSA
              HDF <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></a></i>
          </li>
        </ul>
      </div>
      <div class="footer-column footer-useful-links">
        <h3>A propos du site</h3>
        <ul class="footer-links">
          <li>
            <a href="Mentions-légales.html"> Mentions légales</a></i>
          </li>
        </ul>
      </div>
    </div>
    <p class="copyright">
      © 2025-<span id="current-year"></span> INSA Alumni Hauts-de-France - Tous droits réservés
    </p>
  </footer>
  `;

  document.body.insertAdjacentHTML("beforeend", footerHtml);
})();
