document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar-full');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'fr',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    nowIndicator: true,
    events: [
      {
        title: 'Conférence Alumni',
        start: '2025-08-10',
        description: 'Présentation de parcours d’anciens',
        location: 'Amphi 3',
        time: '13h30 - 15h30'
      },
      {
        title: 'Soirée Réseautage',
        start: '2025-08-20',
        description: 'Rencontre entre anciens et étudiants',
        location: 'Hall CLJ3',
        time: '18h00 - 21h00'
      },
      {
        title: 'Assemblée Générale',
        start: '2025-09-05',
        description: 'Bilan, élection et projets à venir',
        location: 'Salle conseil',
        time: '17h00 - 19h00'
      }
    ],
    eventClick: function (info) {
      const popup = document.getElementById('event-popup');
      const titleEl = document.getElementById('popup-title');
      const dateEl = document.getElementById('popup-date');
      const descEl = document.getElementById('popup-description');

      titleEl.textContent = info.event.title;
      dateEl.textContent = `📅 ${info.event.start.toLocaleDateString('fr-FR')}`;
      descEl.innerHTML = `
        ${info.event.extendedProps.description || ''}
        <br>📍 ${info.event.extendedProps.location || ''}
        <br>🕒 ${info.event.extendedProps.time || ''}
      `;

      popup.classList.remove('hidden');
    }
  });

  calendar.render();

  // Gestion fermeture de la bulle
  const closeBtn = document.getElementById('popup-close');
  closeBtn.addEventListener('click', () => {
    document.getElementById('event-popup').classList.add('hidden');
  });
});
