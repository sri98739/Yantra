// Shared Yantra branding: SVG gradients, the animated logo panel and the small logo mark.

const DEFS = `
<svg class="svg-defs" aria-hidden="true">
  <defs>
    <linearGradient id="markGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset=".45" stop-color="#818cf8"/>
      <stop offset=".75" stop-color="#c084fc"/>
      <stop offset="1" stop-color="#f472b6"/>
      <animateTransform attributeName="gradientTransform" type="rotate"
        values="0 .5 .5; 360 .5 .5" dur="8s" repeatCount="indefinite"/>
    </linearGradient>
    <linearGradient id="innerGrad" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f0abfc"/>
      <stop offset="1" stop-color="#60a5fa"/>
    </linearGradient>
    <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#38bdf8" stop-opacity="0"/>
      <stop offset=".25" stop-color="#7dd3fc"/>
      <stop offset=".6" stop-color="#c084fc"/>
      <stop offset=".85" stop-color="#f472b6"/>
      <stop offset="1" stop-color="#f472b6" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glowGrad">
      <stop offset="0" stop-color="#8b5cf6" stop-opacity=".75"/>
      <stop offset=".5" stop-color="#6366f1" stop-opacity=".25"/>
      <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orbGrad" cx=".35" cy=".3" r=".75">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".35" stop-color="#c4b5fd"/>
      <stop offset="1" stop-color="#6d28d9"/>
    </radialGradient>
    <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <path id="orbitA" d="M15,150 a185,58 0 1,0 370,0 a185,58 0 1,0 -370,0"/>
    <path id="orbitB" d="M45,150 a155,42 0 1,0 310,0 a155,42 0 1,0 -310,0"/>
  </defs>
</svg>`;

export const LOGO_MARK = `
<svg class="brand-logo" viewBox="112 58 176 152" aria-label="Yantra logo">
  <path d="M200,72 L270,193 L130,193 Z" fill="none" stroke="url(#markGrad)" stroke-width="28" stroke-linejoin="round"/>
  <path d="M221,170 L200,133 L179,170 L209,170" fill="none" stroke="url(#innerGrad)" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`;

const sparkle = (x, y, s, delay) =>
  `<path class="sparkle" style="animation-delay:${delay}s" transform="translate(${x} ${y}) scale(${s})" d="M0,-8 l2,6 6,2 -6,2 -2,6 -2,-6 -6,-2 6,-2z"/>`;

const HERO = `
<svg viewBox="0 40 400 230" role="img" aria-label="Animated Yantra logo">
  <g class="orbits" filter="url(#softGlow)">
    <g transform="rotate(-14 200 150)">
      <use href="#orbitA" fill="none" stroke="url(#orbitGrad)" stroke-width="1.6" opacity=".55"/>
    </g>
    <g transform="rotate(9 200 150)">
      <use href="#orbitB" fill="none" stroke="url(#orbitGrad)" stroke-width="1.2" opacity=".35"/>
    </g>
  </g>

  <ellipse class="mark-glow" cx="200" cy="150" rx="120" ry="100" fill="url(#glowGrad)"/>
  <g class="mark" filter="url(#neon)">
    <path class="mark-band" pathLength="100" d="M200,72 L270,193 L130,193 Z"
          fill="none" stroke="url(#markGrad)" stroke-width="28" stroke-linejoin="round"/>
    <path class="mark-inner" pathLength="100" d="M221,170 L200,133 L179,170 L209,170"
          fill="none" stroke="url(#innerGrad)" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>
    <path class="mark-shine" pathLength="100" d="M200,72 L270,193 L130,193 Z"
          fill="none" stroke="#ffffff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
  </g>

  <g class="orbits" filter="url(#softGlow)">
    <g transform="rotate(-14 200 150)">
      <path d="M15,150 a185,58 0 0,0 370,0" fill="none" stroke="url(#orbitGrad)" stroke-width="2.4"/>
      <circle r="9" fill="url(#orbGrad)">
        <animateMotion dur="11s" repeatCount="indefinite"><mpath href="#orbitA"/></animateMotion>
      </circle>
      <circle r="5" fill="url(#orbGrad)">
        <animateMotion dur="11s" begin="-5.5s" repeatCount="indefinite"><mpath href="#orbitA"/></animateMotion>
      </circle>
      <circle r="2.5" fill="#f9a8d4">
        <animateMotion dur="11s" begin="-2s" repeatCount="indefinite"><mpath href="#orbitA"/></animateMotion>
      </circle>
    </g>
    <g transform="rotate(9 200 150)">
      <circle r="6" fill="url(#orbGrad)">
        <animateMotion dur="8s" begin="-3s" repeatCount="indefinite"><mpath href="#orbitB"/></animateMotion>
      </circle>
      <circle r="2" fill="#7dd3fc">
        <animateMotion dur="8s" begin="-6s" repeatCount="indefinite"><mpath href="#orbitB"/></animateMotion>
      </circle>
    </g>
  </g>

  <g fill="#e0e7ff">
    ${sparkle(88, 90, 1, 0)}${sparkle(318, 98, .75, 1.1)}${sparkle(302, 232, 1, 2)}
    ${sparkle(110, 238, .75, .6)}${sparkle(248, 64, .6, 1.6)}
  </g>
</svg>`;

const ICONS = {
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5c2.4.2 4 1.9 4.5 4.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
};
export const icon = name =>
  `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

export const FEATURES = [
  ["bolt", "Build Projects", "From idea to reality"],
  ["people", "Join Community", "Learn &amp; grow together"],
  ["gear", "Access Tools", "Modern &amp; powerful"],
  ["rocket", "Create Impact", "For a better tomorrow"],
];

export function injectDefs() {
  if (!document.getElementById("markGrad")) document.body.insertAdjacentHTML("afterbegin", DEFS);
}

export function addStars(container, count = 60) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement("i");
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
    s.style.animationDuration = (3 + Math.random() * 4).toFixed(2) + "s";
    container.appendChild(s);
  }
}

export function respectReducedMotion() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("svg").forEach(svg => svg.pauseAnimations?.());
  }
}

// Renders the full left-hand brand panel into `el`.
export function renderBrand(el, { headline = 'Build smarter.<br/><span>Engineer the future.</span>', copy } = {}) {
  injectDefs();
  el.innerHTML = `
    <div class="stars"></div>
    <a class="brand-head" href="index.html">
      ${LOGO_MARK}
      <div>
        <div class="wordmark">Yantra</div>
        <div class="tagline">Ideas<b>✦</b>Tools<b>✦</b>Impact</div>
      </div>
    </a>
    <div class="hero">${HERO}</div>
    <div class="brand-copy">
      <h1>${headline}</h1>
      <p>${copy || "Join Yantra and get access to tools, projects and a community of makers turning ideas into working machines."}</p>
    </div>
    <ul class="features">
      ${FEATURES.map(([i, t, s]) => `<li><div class="icon">${icon(i)}</div><strong>${t}</strong><small>${s}</small></li>`).join("")}
    </ul>`;
  addStars(el.querySelector(".stars"));
  respectReducedMotion();
}
