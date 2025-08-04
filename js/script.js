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
