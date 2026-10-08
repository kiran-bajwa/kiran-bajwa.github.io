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

// Pile every card into a messy heap in the middle of the screen
function makeChaos() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  cards.forEach(card => {
    // Where is this card right now?
    const rect = card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    // Pick a random spot in the visible part of the screen
    const targetX = random(screenWidth * 0.25, screenWidth * 0.75);
    const targetY = random(screenHeight * 0.2, screenHeight * 0.6);

    // How far does it need to travel to get there?
    const moveX = targetX - cardCenterX;
    const moveY = targetY - cardCenterY;

    const tilt = random(-25, 25);
    const size = random(0.6, 0.85);

    card.style.transitionDelay = '0s';
    card.style.zIndex = Math.floor(random(1, 20));
    card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${tilt}deg) scale(${size})`;
  });

  document.body.classList.add('chaos');
  status.textContent = 'System status: chaos';
  button.textContent = 'Let me fix that';
  isChaos = true;
}

// Send every card home, one after another
func