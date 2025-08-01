document.addEventListener('DOMContentLoaded', function () {
  // ========== BURGER MENU / SIDEBAR MOBILE ==========

  const burgerBtn = document.getElementById('burger-btn');
  const sidebar = document.getElementById('mobile-sidebar');
  const closeBtn = document.getElementById('close-sidebar');

  burgerBtn.addEventListener('click', () => {
    sidebar.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    sidebar.classList.add('hidden');
  });

  // Optional: fermer la sidebar si clic en dehors (overlay non géré ici, mais si tu ajoutes, c'est top)
  document.addEventListener('click', (e) => {
    if (
      !sidebar.classList.contains('hidden') && 
      !sidebar.contains(e.target) && 
      e.target !== burgerBtn
    ) {
      sidebar.classList.add('hidden');
    }
  });

  // ========== FULLCALENDAR (si utilisé sur la page) ==========
  const calendarEl = document.getElementById('calendar-full');
  if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'fr',
      firstDay: 1,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },
      nowIndicator: true,
      events: [
        {
          title: 'Symposium 2025',
          start: '2025-06-13',
          end: '2025-06-16',
          description: 'L’ingénieur face aux défis du 21e siècle',
          location: 'Lyon',
        },
        {
          title: 'Conférence Alumni',
          start: '2025-04-24',
          description: 'Rencontre avec nos Alumni Khalil, Martin et Cléo',
          location: 'CLJ2 Amphi E7',
          time: '13h15'
        },
        {
          title: 'Gala INSA HDF',
          start: '2025-03-22',
          location: 'Cité des congrès Valenciennes',
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

    // Gestion de la fermeture de la pop-up calendrier
    const closeCalendarPopup = document.getElementById('popup-close');
    if (closeCalendarPopup) {
      closeCalendarPopup.addEventListener('click', () => {
        document.getElementById('event-popup').classList.add('hidden');
      });
    }
  }
});
