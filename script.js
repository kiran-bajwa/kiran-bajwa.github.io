// Grab the things we need from the page
const cards = document.querySelectorAll('.card');
const button = document.querySelector('#fix-button');
const status = document.querySelector('#status');

let isChaos = false;
let autoFix;

// Picks a random number between min and max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Scatter every card: shift it a bit and tilt it
function makeChaos() {
  cards.forEach(card => {
    const x = random(-60, 60);
    const y = random(-40, 40);
    const tilt = random(-12, 12);
    card.style.transitionDelay = '0s';
    card.style.transform = `translate(${x}px, ${y}px) rotate(${tilt}deg)`;
  });
  document.body.classList.add('chaos');
  status.textContent = 'System status: chaos';
  button.textContent = 'Let me fix that';
  isChaos = true;
}

// Snap every card back into place, one after another
function makeCalm() {
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.05}s`;
    card.style.transform = '';
  });
  document.body.classList.remove('chaos');
  status.textContent = 'All systems operational';
  button.textContent = 'Bring back the chaos';
  isChaos = false;

  // Clear the delays afterwards so hover stays snappy
  setTimeout(() => {
    cards.forEach(card => card.style.transitionDelay = '');
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

// On page load: start in chaos, then fix itself after 3 seconds.
// Skipped for people who've asked their device to reduce motion.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  makeChaos();
  autoFix = setTimeout(makeCalm, 3000);
}