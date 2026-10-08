// Everything that joins the chaos: all cards plus the section headings
const pieces = document.querySelectorAll('.card, .ticket, main h2:not(.card h2)');
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
  history.scrollRestoration = 'manual'; // don't jump back to where you were last time
  window.scrollTo(0, 0);                // always start the chaos at the top
  pieces.forEach(piece => piece.style.transition = 'none');
  
  makeChaos();
  document.body.offsetHeight; // makes the browser apply the pile instantly
  pieces.forEach(piece => piece.style.transition = '');
  autoFix = setTimeout(makeCalm, 7000);
}
// ===== Night mode =====
const themeToggle = document.querySelector('#theme-toggle');
const starsLayer = document.querySelector('#stars');

// Sprinkle 80 stars at random spots, sizes, and twinkle timings
for (let i = 0; i < 80; i++) {
  const star = document.createElement('span');
  star.className = 'star';
  const size = random(1, 3);
  star.style.width = size + 'px';
  star.style.height = size + 'px';
  star.style.left = random(0, 100) + '%';
  star.style.top = random(0, 100) + '%';
  star.style.animationDelay = random(0, 3) + 's';
  starsLayer.appendChild(star);
}

function setNight(on) {
  document.body.classList.toggle('night', on);
  themeToggle.textContent = on ? '☀' : '☾';
  try {
    localStorage.setItem('night', on ? 'yes' : 'no');
  } catch (e) {}
}

themeToggle.addEventListener('click', () => {
  setNight(!document.body.classList.contains('night'));
});

// Remember the visitor's choice from last time
try {
  if (localStorage.getItem('night') === 'yes') setNight(true);
} catch (e) {}


// ===== Ticket panel =====
const panel = document.querySelector('#ticket-panel');
const backdrop = document.querySelector('#panel-backdrop');
const panelBody = document.querySelector('#panel-body');
const panelId = document.querySelector('#panel-id');
const boardTip = document.querySelector('.board-tip');

function openTicket(ticket) {
  // Read everything we need from the ticket that was clicked
  const id = ticket.querySelector('.ticket-id').textContent;
  const title = ticket.querySelector('.ticket-title').textContent;
  const project = ticket.querySelector('.ticket-project').textContent;
  const status = ticket.closest('.column').querySelector('.column-head span').textContent;
  const details = ticket.querySelector('.ticket-details').innerHTML;
  const accent = ticket.style.getPropertyValue('--accent');

  // Fill the panel with it
  panelId.textContent = id;
  panel.style.setProperty('--accent', accent);
  panelBody.innerHTML = `
    <span class="panel-status">${status}</span>
    <h3 class="panel-title">${title}</h3>
    <p class="ticket-project">${project}</p>
    ${details}
  `;

  // Slide it in
  panel.classList.add('open');
  backdrop.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');

  // Check off the subtasks one by one
  panelBody.querySelectorAll('.subtasks li').forEach((item, i) => {
    setTimeout(() => item.classList.add('done'), 400 + i * 250);
  });

  // After the first open, the hint and the pulse aren't needed anymore
  boardTip.classList.add('gone');
  const pulsing = document.querySelector('.ticket.pulse');
  if (pulsing) pulsing.classList.remove('pulse');
}

function closeTicket() {
  panel.classList.remove('open');
  backdrop.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
}

// Every ticket except "Your team?" opens on click, or Enter for keyboard users
document.querySelectorAll('.ticket:not(.ticket-next)').forEach(ticket => {
  ticket.setAttribute('tabindex', '0');
  ticket.setAttribute('role', 'button');
  ticket.addEventListener('click', () => openTicket(ticket));
  ticket.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openTicket(ticket);
    }
  });
});

// Three ways to close: the X, clicking outside, or pressing Escape
document.querySelector('#panel-close').addEventListener('click', closeTicket);
backdrop.addEventListener('click', closeTicket);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeTicket();
});

// ===== Drag "Your team?" to kick off a project =====
const nextTicket = document.querySelector('#next-ticket');
const progressColumn = document.querySelector('#col-progress');

let dragging = false;
let moved = false;
let claimed = false;
let startX = 0;
let startY = 0;

// Is the pointer currently over the In progress column?
function overColumn(x, y) {
  const r = progressColumn.getBoundingClientRect();
  return x > r.left && x < r.right && y > r.top && y < r.bottom;
}

// The panel that opens once the ticket is picked up
function openKickoff() {
  panelId.textContent = 'KB-09';
  panel.style.setProperty('--accent', 'var(--pine)');
  panelBody.innerHTML = `
    <span class="panel-status">in progress</span>
    <h3 class="panel-title">Kick off a project with Kiran</h3>
    <p class="ticket-project">Status: excited</p>
    <p class="label">next steps</p>
    <ul class="kickoff-links">
      <li><a href="mailto:kiranbajwa@live.ca?subject=Let's%20kick%20off%20a%20project"><i class="ti ti-mail"></i> Say hi: kiranbajwa@live.ca</a></li>
      <li><a href="https://linkedin.com/in/kiranbajwa" target="_blank" rel="noopener"><i class="ti ti-brand-linkedin"></i> Connect on LinkedIn</a></li>
      <li><a href="kiran-bajwa-resume.pdf" download><i class="ti ti-download"></i> Download my resume</a></li>
    </ul>
  `;
  panel.classList.add('open');
  backdrop.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  boardTip.classList.add('gone');
}

// A little confetti burst at a spot on the screen
function confetti(x, y) {
  const colors = ['#0F6E56', '#D4537E', '#FAC775', '#7F77DD', '#D85A30'];
  for (let i = 0; i < 34; i++) {
    const bit = document.createElement('span');
    bit.className = 'confetti';
    bit.style.background = colors[i % colors.length];
    bit.style.left = x + 'px';
    bit.style.top = y + 'px';
    document.body.appendChild(bit);
    const angle = random(0, Math.PI * 2);
    const distance = random(60, 170);
    bit.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance + 80}px) rotate(${random(0, 540)}deg)`, opacity: 0 }
    ], { duration: 1200, easing: 'cubic-bezier(.2, .8, .3, 1)' }).onfinish = () => bit.remove();
  }
}

// Move the ticket into In progress and celebrate
function claimTicket(x, y) {
  claimed = true;
  nextTicket.style.transform = '';
  progressColumn.insertBefore(nextTicket, progressColumn.children[1]);
  nextTicket.classList.add('claimed');
  nextTicket.querySelector('.drag-hint').textContent = 'kicked off';
  document.querySelector('#next-status').textContent = 'Assigned to Kiran. Let\'s go.';
  document.querySelector('#count-progress').textContent = '3';
  document.querySelector('#count-next').textContent = '0';
  confetti(x, y);
  setTimeout(openKickoff, 600);
}

nextTicket.addEventListener('pointerdown', e => {
  if (claimed) {
    openKickoff();
    return;
  }
  if (isChaos) return;
  dragging = true;
  moved = false;
  startX = e.clientX;
  startY = e.clientY;
  nextTicket.setPointerCapture(e.pointerId);
  nextTicket.style.transition = 'none';
  nextTicket.classList.add('dragging');
});

nextTicket.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
  nextTicket.style.transform = `translate(${dx}px, ${dy}px) rotate(-4deg)`;
  progressColumn.classList.toggle('drop-ready', overColumn(e.clientX, e.clientY));
});

nextTicket.addEventListener('pointerup', e => {
  if (!dragging) return;
  dragging = false;
  nextTicket.classList.remove('dragging');
  progressColumn.classList.remove('drop-ready');
  nextTicket.style.transition = '';

  // A tap (no real movement) or a drop on In progress both claim it
  if (!moved || overColumn(e.clientX, e.clientY)) {
    claimTicket(e.clientX, e.clientY);
  } else {
    nextTicket.style.transform = ''; // dropped elsewhere: spring back home
  }
});

// Keyboard users: Enter picks it up too
nextTicket.setAttribute('tabindex', '0');
nextTicket.setAttribute('role', 'button');
nextTicket.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  if (claimed) {
    openKickoff();
  } else {
    const r = nextTicket.getBoundingClientRect();
    claimTicket(r.left + r.width / 2, r.top + 20);
  }
});