document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar-full');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'fr',
    firstDay: 1, // Commence la semaine le lundi
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

  // Gestion fermeture de la bulle
  const closeBtn = document.getElementById('popup-close');
  closeBtn.addEventListener('click', () => {
    document.getElementById('event-popup').classList.add('hidden');
  });
});
