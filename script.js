// Everything that joins the chaos: all cards plus the section headings
const pieces = document.querySelectorAll('.card, main h2:not(.card h2)');
const button = document.querySelector('#fix-button');
const status = document.querySelector('#status');

let isChaos = false;
let autoFix;

// Picks a random number between min and max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Throw every piece into a wild heap across the screen
function makeChaos() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  pieces.forEach(piece => {
    // Where is this piece right now, and how big is it?
    const rect = piece.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Pick a random spot anywhere on the visible screen
    const targetX = random(screenWidth * 0.12, screenWidth * 0.88);
    const targetY = random(screenHeight * 0.12, screenHeight * 0.88);

    // Shrink everything to a similar size, so big cards don't hide small ones
    const targetWidth = random(0.3, 0.5) * Math.min(screenWidth, 1000);
    const size = Math.min(targetWidth / rect.width, 1);

    const tilt = random(-35, 35);

    piece.style.transitionDelay = '0s';
    piece.style.zIndex = Math.floor(random(1, 50));
    piece.style.transform =
      `translate(${targetX - centerX}px, ${targetY - centerY}px) rotate(${tilt}deg) scale(${size})`;
  });

  document.body.classList.add('chaos');
  status.textContent = 'System status: chaos';
  button.textContent = 'Let me fix that';
  isChaos = true;
}

// Send every piece home, one after another
function makeCalm() {
  pieces.forEach((piece, i) => {
    piece.style.transitionDelay = `${i * 0.05}s`;
    piece.style.transform = '';
  });

  document.body.classList.remove('chaos');
  status.textContent = 'All systems operational';
  button.textContent = 'Bring back the chaos';
  isChaos = false;

  // Tidy up once everything has landed
  setTimeout(() => {
    pieces.forEach(piece => {
      piece.style.transitionDelay = '';
      piece.style.zIndex = '';
    });
  }, 1500);
}

// The button toggles between the two states
button.addEventListener('click', () => {
  clearTimeout(autoFix);
  if (isChaos) {
    makeCalm();
  } else {
    makeChaos();
  }
});

// On page load: start already in a pile, then fix itself after 4 seconds
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  pieces.forEach(piece => piece.style.transition = 'none');
  makeChaos();
  document.body.offsetHeight; // makes the browser apply the pile instantly
  pieces.forEach(piece => piece.style.transition = '');
  autoFix = setTimeout(makeCalm, 4000);
}