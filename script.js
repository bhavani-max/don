/* ============================================================
   Birthday Surprise — script.js
   ✨ Magical Edition
   • Fireflies (always-on ambient glow particles)
   • Confetti burst on load + gentle rain
   • Hero slideshow (auto + manual)
   • Wish Lantern (full-screen night sky experience)
   • Photo star-burst when story rows scroll in
   • Interactive cake
   • Cursor sparkles
   • Rotating page title
============================================================ */

const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const rand    = (a, b) => Math.random() * (b - a) + a;
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const pick    = (arr)  => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════
// 1. FIREFLIES  — gentle golden orbs drifting on their own canvas
// ═══════════════════════════════════════════════════════════
(function initFireflies() {
  const cv  = $('#firefly-canvas');
  const ctx = cv.getContext('2d');
  const flies = [];
  const COUNT = 38;

  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  resize(); addEventListener('resize', resize);

  class Fly {
    constructor() { this.reset(); }
    reset() {
      this.x    = rand(0, innerWidth);
      this.y    = rand(0, innerHeight);
      this.r    = rand(1.5, 3.5);
      this.vx   = rand(-.4, .4);
      this.vy   = rand(-.5, .3);
      this.life = 0;
      this.maxLife = rand(120, 280);
      this.hue  = rand(45, 65); // gold-yellow range
    }
    draw() {
      const t     = this.life / this.maxLife;
      const alpha = t < .2 ? t / .2 : t > .8 ? (1 - t) / .2 : 1;
      ctx.save();
      ctx.globalAlpha = alpha * .85;
      // outer soft glow
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 5);
      g.addColorStop(0, `hsla(${this.hue},100%,80%,1)`);
      g.addColorStop(.4, `hsla(${this.hue},100%,60%,.4)`);
      g.addColorStop(1, `hsla(${this.hue},100%,40%,0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      // bright core
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.hue},100%,92%)`;
      ctx.fill();
      ctx.restore();
    }
    update() {
      this.x += this.vx + Math.sin(this.life * .04) * .3;
      this.y += this.vy + Math.cos(this.life * .03) * .3;
      this.life++;
      if (this.life >= this.maxLife) this.reset();
    }
  }

  for (let i = 0; i < COUNT; i++) {
    const f = new Fly();
    f.life = randInt(0, f.maxLife); // stagger start
    flies.push(f);
  }

  (function loop() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    flies.forEach(f => { f.update(); f.draw(); });
    requestAnimationFrame(loop);
  })();
})();


// ═══════════════════════════════════════════════════════════
// 2. CONFETTI  — burst on load + gentle rain
// ═══════════════════════════════════════════════════════════
const confCv  = $('#confetti-canvas');
const confCtx = confCv.getContext('2d');
let   pieces  = [];

const COLORS = ['#ff6eb4','#a855f7','#fbbf24','#34d399','#60a5fa','#f472b6','#d8b4fe','#fff'];
const SHAPES = ['circle','rect','star'];

function confResize() { confCv.width = innerWidth; confCv.height = innerHeight; }
confResize(); addEventListener('resize', confResize);

class Piece {
  constructor(burst = false) {
    this.x     = burst ? rand(innerWidth*.2, innerWidth*.8) : rand(0, innerWidth);
    this.y     = burst ? rand(-50, innerHeight*.4)         : rand(-80, -10);
    this.size  = rand(6, 14);
    this.color = pick(COLORS);
    this.shape = pick(SHAPES);
    this.vx    = rand(-2.5, 2.5);
    this.vy    = rand(1.8, 4.5);
    this.vr    = rand(-.12, .12);
    this.angle = rand(0, Math.PI * 2);
    this.alpha = 1;
    this.fade  = rand(.004, .010);
  }
  draw() {
    confCtx.save();
    confCtx.globalAlpha = this.alpha;
    confCtx.fillStyle   = this.color;
    confCtx.translate(this.x, this.y);
    confCtx.rotate(this.angle);
    if (this.shape === 'circle') {
      confCtx.beginPath(); confCtx.arc(0,0,this.size/2,0,Math.PI*2); confCtx.fill();
    } else if (this.shape === 'rect') {
      confCtx.fillRect(-this.size/2, -this.size/4, this.size, this.size/2);
    } else {
      confCtx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r   = i%2===0 ? this.size/2 : this.size/5;
        const ang = (Math.PI/5)*i - Math.PI/2;
        confCtx.lineTo(Math.cos(ang)*r, Math.sin(ang)*r);
      }
      confCtx.closePath(); confCtx.fill();
    }
    confCtx.restore();
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.angle += this.vr; this.vy += .06;
    this.alpha -= this.fade;
  }
  isDead() { return this.alpha <= 0 || this.y > innerHeight + 20; }
}

function spawnBurst(n = 160) { for (let i=0;i<n;i++) pieces.push(new Piece(true)); }

(function confLoop() {
  confCtx.clearRect(0, 0, confCv.width, confCv.height);
  pieces = pieces.filter(p => !p.isDead());
  pieces.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(confLoop);
})();

spawnBurst(180);
setInterval(() => { if (pieces.length < 60) pieces.push(new Piece(false)); }, 320);


// ═══════════════════════════════════════════════════════════
// 3. HERO SLIDESHOW
// ═══════════════════════════════════════════════════════════
const slides    = $$('.slide');
const dots      = $$('.dot');
const slidePrev = $('#slide-prev');
const slideNext = $('#slide-next');
let   current   = 0;
let   slideTimer;

function goToSlide(idx) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (idx + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
}
function nextSlide() { goToSlide(current + 1); }
function prevSlide() { goToSlide(current - 1); }
function resetTimer() { clearInterval(slideTimer); slideTimer = setInterval(nextSlide, 3800); }

slideNext.addEventListener('click', () => { nextSlide(); resetTimer(); });
slidePrev.addEventListener('click', () => { prevSlide(); resetTimer(); });
dots.forEach(d => d.addEventListener('click', () => { goToSlide(+d.dataset.idx); resetTimer(); }));

// Touch swipe on slideshow
(function(){
  const fr = $('.slideshow-frame'); let sx = 0;
  fr.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive:true });
  fr.addEventListener('touchend',   e => {
    const d = sx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) { d>0 ? nextSlide() : prevSlide(); resetTimer(); }
  });
})();
resetTimer();


// ═══════════════════════════════════════════════════════════
// 4. ✨ WISH LANTERN — 3-phase flight: rise → pause → fly away
// ═══════════════════════════════════════════════════════════
const overlay    = $('#lantern-overlay');
const lanternWr  = $('#lantern-wrap');
const scroll     = $('#lantern-scroll');
const sky        = $('#lantern-sky');
const sfWrap     = $('#sky-fireflies');
const triggerBtn = $('#lantern-trigger-btn');
const closeBtn   = $('#lantern-close');

// Build twinkling star field
function buildStars(n = 120) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'sky-star';
    s.style.cssText = `
      left:${rand(0,100)}%;top:${rand(0,100)}%;
      --dur:${rand(1.5,4)}s;animation-delay:${rand(0,3)}s;
      width:${rand(1,3)}px;height:${rand(1,3)}px;opacity:${rand(.1,.5)};`;
    sky.appendChild(s);
  }
}

// Build sky fireflies
function buildSkyFireflies(n = 22) {
  for (let i = 0; i < n; i++) {
    const f = document.createElement('div');
    f.className = 'sky-fly';
    f.style.cssText = `
      left:${rand(5,95)}%;top:${rand(10,90)}%;
      --dur:${rand(3,7)}s;--delay:-${rand(0,5)}s;
      --x1:${rand(-80,80)}px;--y1:${rand(-80,80)}px;
      --x2:${rand(-80,80)}px;--y2:${rand(-80,80)}px;
      --x3:${rand(-80,80)}px;--y3:${rand(-80,80)}px;`;
    sfWrap.appendChild(f);
  }
}

buildStars();
buildSkyFireflies();

let lanternOpen = false;

// -- Lantern trail particles (golden sparks left behind as it flies) --
function spawnLanternTrail() {
  const rect   = lanternWr.getBoundingClientRect();
  const cx     = rect.left + rect.width  / 2;
  const cy     = rect.top  + rect.height / 2;
  const count  = 6;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.textContent = pick(['✦','·','✧','°','★']);
    const tx = rand(-40, 40);
    const ty = rand(20, 80);
    p.style.cssText = `
      position:fixed;left:${cx + rand(-20,20)}px;top:${cy + rand(-10,10)}px;
      font-size:${rand(.5,1)}rem;color:#fbbf24;pointer-events:none;
      z-index:10001;user-select:none;text-shadow:0 0 6px #fbbf24;
      animation:trailFade ${rand(.6,1.2)}s ease-out forwards;
      --tx:${tx}px;--ty:${ty}px;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1300);
  }
}

// Inject trail keyframe once
const trailSt = document.createElement('style');
trailSt.textContent = `
  @keyframes trailFade {
    0%  { opacity:1; transform:translate(0,0) scale(1); }
    100%{ opacity:0; transform:translate(var(--tx),var(--ty)) scale(.2); }
  }`;
document.head.appendChild(trailSt);

// -- 3-phase flight controller --
function launchLantern() {
  const vh       = innerHeight;
  const RISE_MS  = 3000;
  const PAUSE_MS = 2200;
  const FLY_MS   = 2600;

  // Reset to starting position — below screen
  lanternWr.style.transition = 'none';
  lanternWr.style.bottom     = '-320px';
  lanternWr.style.opacity    = '0';
  lanternWr.style.transform  = 'translateX(-50%)';
  void lanternWr.offsetWidth; // force reflow

  // ── Phase 1: Rise to middle of screen ──
  // "middle of screen" means bottom = vh/2 (element bottom edge at viewport centre)
  const midBottom = Math.round(vh * 0.38); // sits nicely in upper-centre
  lanternWr.classList.add('rising');
  lanternWr.style.transition = `bottom ${RISE_MS}ms cubic-bezier(.2,.6,.35,1),
                                  opacity 500ms ease`;
  lanternWr.style.bottom  = midBottom + 'px';
  lanternWr.style.opacity = '1';

  let trailInterval = setInterval(spawnLanternTrail, 110);

  // ── Phase 2: Pause & sway, unfurl scroll ──
  setTimeout(() => {
    clearInterval(trailInterval);
    lanternWr.classList.remove('rising');
    lanternWr.classList.add('sway');

    // Unfurl the wish scroll after a short beat
    setTimeout(() => {
      scroll.classList.add('unrolled');
      spawnBurst(100);
    }, 500);

    // ── Phase 3: Fly all the way up and off screen ──
    setTimeout(() => {
      lanternWr.classList.remove('sway');
      lanternWr.classList.add('flying');

      trailInterval = setInterval(spawnLanternTrail, 70);

      // Drift slightly sideways for realism
      const driftX = rand(-50, 50);
      lanternWr.style.transition = `bottom ${FLY_MS}ms cubic-bezier(.4,0,.15,1),
                                     opacity 800ms ease ${FLY_MS * 0.55}ms,
                                     transform ${FLY_MS}ms ease`;
      lanternWr.style.bottom    = (vh + 400) + 'px'; // flies past top of screen
      lanternWr.style.opacity   = '0';
      lanternWr.style.transform = `translateX(calc(-50% + ${driftX}px)) rotate(${rand(-8,8)}deg)`;

      setTimeout(() => {
        clearInterval(trailInterval);
        // Keep scroll visible, fire big confetti
        spawnBurst(200);
        setTimeout(() => spawnBurst(150), 400);
      }, FLY_MS * 0.65);

    }, PAUSE_MS);

  }, RISE_MS + 80);
}

function openLantern() {
  if (lanternOpen) return;
  lanternOpen = true;
  document.body.style.overflow = 'hidden';
  overlay.classList.add('open');
  spawnBurst(60);
  // Small delay so overlay fades in first
  setTimeout(launchLantern, 500);
}

function closeLantern() {
  lanternOpen = false;
  scroll.classList.remove('unrolled');
  overlay.classList.remove('open');
  document.body.style.overflow = '';

  // Full reset for re-open
  setTimeout(() => {
    lanternWr.classList.remove('sway', 'rising', 'flying');
    lanternWr.style.transition = 'none';
    lanternWr.style.bottom     = '-320px';
    lanternWr.style.opacity    = '0';
    lanternWr.style.transform  = 'translateX(-50%)';
  }, 600);
}

triggerBtn.addEventListener('click', openLantern);
closeBtn.addEventListener('click', closeLantern);
overlay.addEventListener('click', e => { if (e.target === overlay) closeLantern(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && lanternOpen) closeLantern(); });


// ═══════════════════════════════════════════════════════════
// 5. PHOTO STAR-BURST on story row scroll-in
// ═══════════════════════════════════════════════════════════
const BURST_EMOJIS = ['✨','⭐','💫','🌟','🌸','💖','✦','❋'];

function triggerPhotoBurst(imgWrap) {
  const burst = document.createElement('div');
  burst.className = 'photo-burst';
  imgWrap.appendChild(burst);

  const count = 14;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'burst-star';
    star.textContent = pick(BURST_EMOJIS);
    const angle  = (i / count) * 360;
    const dist   = rand(70, 130);
    const tx = Math.cos(angle * Math.PI / 180) * dist;
    const ty = Math.sin(angle * Math.PI / 180) * dist;
    star.style.cssText = `
      left: 50%; top: 50%;
      margin-left: -10px; margin-top: -10px;
      --tx: ${tx}px; --ty: ${ty}px;
      animation-delay: ${rand(0, .3)}s;
      animation-duration: ${rand(.8, 1.2)}s;
      font-size: ${rand(.9, 1.5)}rem;
    `;
    burst.appendChild(star);
  }
  setTimeout(() => burst.remove(), 1600);
}

// ═══════════════════════════════════════════════════════════
// 6. SCROLL REVEAL — cards + story rows (with photo burst)
// ═══════════════════════════════════════════════════════════
function observeReveal(selector, onVisible) {
  $$(selector).forEach(el => {
    const obs = new IntersectionObserver(([entry], o) => {
      if (entry.isIntersecting) {
        el.classList.add('visible');
        if (onVisible) onVisible(el);
        o.disconnect();
      }
    }, { threshold: 0.15 });
    obs.observe(el);
  });
}

observeReveal('.card');
observeReveal('.story-row', (row) => {
  // small delay so the fade-in starts first, then burst pops
  setTimeout(() => {
    const imgWrap = row.querySelector('.story-img-wrap');
    if (imgWrap) triggerPhotoBurst(imgWrap);
  }, 500);
});


// ═══════════════════════════════════════════════════════════
// 7. LIGHTBOX
// ═══════════════════════════════════════════════════════════
const lightbox  = $('#lightbox');
const lbImg     = $('#lb-img');
const lbCaption = $('#lb-caption');
const lbClose   = $('#lb-close');
const lbPrev    = $('#lb-prev');
const lbNext    = $('#lb-next');

const GALLERY_IMGS = [
  { src: 'pictures/Gemini_Generated_Image_hn2ia3hn2ia3hn2i.png',  caption: 'Absolutely stunning \u2728' },
  { src: 'pictures/WhatsApp Image 2026-10-02 at 1.56.28 PM.jpeg', caption: 'That smile says it all \uD83E\uDD0D' },
  { src: 'pictures/Gemini_Generated_Image_qmc85sqmc85sqmc8.png',  caption: 'Elegance personified \u2B50' },
  { src: 'pictures/Gemini_Generated_Image_o76a42o76a42o76a.png',  caption: 'Blessed & beautiful \uD83C\uDF38' },
  { src: 'pictures/Gemini_Generated_Image_gxmgqgxmgqgxmgqg.png', caption: 'Rocking every look \uD83D\uDCAB' },
  { src: 'pictures/Gemini_Generated_Image_dtrei0dtrei0dtre.png',  caption: 'Living her best life \uD83D\uDC99' },
];

let lbCurrent = 0;

function openLightbox(idx) {
  lbCurrent = idx;
  lbImg.src = GALLERY_IMGS[idx].src;
  lbCaption.textContent = GALLERY_IMGS[idx].caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  spawnBurst(40);
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
function lbNavigate(dir) {
  lbCurrent = (lbCurrent + dir + GALLERY_IMGS.length) % GALLERY_IMGS.length;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = GALLERY_IMGS[lbCurrent].src;
    lbCaption.textContent = GALLERY_IMGS[lbCurrent].caption;
    lbImg.style.transition = 'opacity .35s';
    lbImg.style.opacity = '1';
  }, 200);
}

// Story images open lightbox
$$('.story-img-wrap img').forEach((img, idx) => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => openLightbox(idx));
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click',  () => lbNavigate(-1));
lbNext.addEventListener('click',  () => lbNavigate(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowRight') lbNavigate(1);
  if (e.key === 'ArrowLeft')  lbNavigate(-1);
});
(function(){
  let sx = 0;
  lightbox.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive:true });
  lightbox.addEventListener('touchend',   e => {
    const d = sx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) lbNavigate(d > 0 ? 1 : -1);
  });
})();


// ═══════════════════════════════════════════════════════════
// 8. INTERACTIVE CAKE
// ═══════════════════════════════════════════════════════════
const cake        = $('#cake');
const cakeHint    = $('#cake-hint');
const wishGranted = $('#wish-granted');
const flames      = [1,2,3].map(i => $(`#f${i}`));
let candlesOut = 0, allOut = false, clickCount = 0, clickTimer;

function blowCandle(f) {
  if (f.classList.contains('out')) return;
  f.classList.add('out'); candlesOut++; spawnBurst(40);
  if (candlesOut === flames.length && !allOut) {
    allOut = true;
    cakeHint.textContent = '\uD83C\uDF89 You blew them all out!';
    wishGranted.classList.remove('hidden');
    setTimeout(() => spawnBurst(250), 200);
    setTimeout(() => spawnBurst(200), 700);
  }
}
cake.addEventListener('click', () => {
  const rem = flames.filter(f => !f.classList.contains('out'));
  if (rem.length) blowCandle(rem[0]);
  clickCount++;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    if (clickCount >= 3) flames.forEach(f => blowCandle(f));
    clickCount = 0;
  }, 400);
});


// ═══════════════════════════════════════════════════════════
// 9. CURSOR SPARKLES
// ═══════════════════════════════════════════════════════════
const SPARKLES = ['\u2728','\u2B50','\uD83D\uDCAB','\uD83C\uDF1F','\u2736'];
const sparkSt = document.createElement('style');
sparkSt.textContent = `
  @keyframes sparkFade {
    0%  { opacity:1; transform:scale(1) translateY(0);      }
    100%{ opacity:0; transform:scale(.3) translateY(-28px); }
  }`;
document.head.appendChild(sparkSt);

document.addEventListener('mousemove', e => {
  if (Math.random() > .22) return;
  const sp = document.createElement('span');
  sp.textContent = pick(SPARKLES);
  sp.style.cssText = `position:fixed;left:${e.clientX-10}px;top:${e.clientY-10}px;
    font-size:${rand(.9,1.6)}rem;pointer-events:none;z-index:9999;user-select:none;
    animation:sparkFade .9s ease forwards;`;
  document.body.appendChild(sp);
  setTimeout(() => sp.remove(), 950);
});


// ═══════════════════════════════════════════════════════════
// 10. FLOATING MUSIC NOTES
// ═══════════════════════════════════════════════════════════
const NOTES = ['\uD83C\uDFB5','\uD83C\uDFB6','\uD83C\uDFBC','\u266A','\u266B'];
const noteSt = document.createElement('style');
noteSt.textContent = `
  @keyframes noteFloat {
    0%  { transform:translateY(0) rotate(0deg);    opacity:0; }
    15% { opacity:.8; }
    80% { opacity:.6; }
    100%{ transform:translateY(-90vh) rotate(25deg); opacity:0; }
  }`;
document.head.appendChild(noteSt);
setInterval(() => {
  const n = document.createElement('span');
  n.textContent = pick(NOTES);
  n.style.cssText = `position:fixed;left:${rand(5,95)}vw;bottom:-2rem;
    font-size:${rand(1.2,2.2)}rem;opacity:0;z-index:5;pointer-events:none;user-select:none;
    animation:noteFloat ${rand(4,7)}s ease-in forwards;`;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 7500);
}, 1800);


// ═══════════════════════════════════════════════════════════
// 11. ROTATING PAGE TITLE
// ═══════════════════════════════════════════════════════════
const titles = [
  '\uD83C\uDF82 Happy Birthday Ojeswi!',
  '\uD83C\uDF89 Make a Wish!',
  '\uD83D\uDC96 You are so loved!',
  '\uD83C\uDF1F Today is YOUR day!',
  '\u2728 Celebrate YOU!',
  '\uD83C\uDF38 Shine bright, Ojeswi!',
  '\uD83FA4 Your lantern is waiting...',
];
let titleIdx = 0;
setInterval(() => {
  titleIdx = (titleIdx + 1) % titles.length;
  document.title = titles[titleIdx];
}, 2500);


// ═══════════════════════════════════════════════════════════
// 12. 🎵 MUSIC PLAYER
// ═══════════════════════════════════════════════════════════
(function initMusic() {
  const audio     = $('#bg-music');
  const btn       = $('#music-btn');
  const icon      = $('#music-icon');
  const label     = $('#music-label');
  let   playing   = false;

  // Start at low volume and fade in gently
  audio.volume = 0;

  function fadeIn(target = 0.55, duration = 2000) {
    const steps    = 40;
    const interval = duration / steps;
    const increment = target / steps;
    let current = 0;
    const t = setInterval(() => {
      current += increment;
      audio.volume = Math.min(current, target);
      if (current >= target) clearInterval(t);
    }, interval);
  }

  function fadeOut(duration = 1200) {
    const steps    = 30;
    const interval = duration / steps;
    const decrement = audio.volume / steps;
    const t = setInterval(() => {
      audio.volume = Math.max(0, audio.volume - decrement);
      if (audio.volume <= 0) { audio.pause(); clearInterval(t); }
    }, interval);
  }

  function setPlaying(state) {
    playing = state;
    if (state) {
      btn.classList.add('playing');
      icon.textContent = '🎶';
      label.textContent = 'Now Playing';
    } else {
      btn.classList.remove('playing');
      icon.textContent = '🎵';
      label.textContent = 'Play Music';
    }
  }

  btn.addEventListener('click', () => {
    if (!playing) {
      audio.play().then(() => {
        setPlaying(true);
        fadeIn(0.55, 2000);
      }).catch(() => {
        // Browser blocked — still mark UI as trying
        label.textContent = 'Click again ▶';
      });
    } else {
      fadeOut(1200);
      setPlaying(false);
    }
  });

  // Auto-play attempt on first user interaction anywhere on page
  let autoTried = false;
  function tryAutoPlay() {
    if (autoTried || playing) return;
    autoTried = true;
    audio.volume = 0;
    audio.play().then(() => {
      setPlaying(true);
      fadeIn(0.45, 3000); // gentler fade for autoplay
    }).catch(() => {
      // Autoplay blocked — button is still there for her to click
    });
    document.removeEventListener('click',      tryAutoPlay);
    document.removeEventListener('touchstart', tryAutoPlay);
    document.removeEventListener('keydown',    tryAutoPlay);
  }

  // Try on very first interaction
  document.addEventListener('click',      tryAutoPlay, { once: true });
  document.addEventListener('touchstart', tryAutoPlay, { once: true, passive: true });
  document.addEventListener('keydown',    tryAutoPlay, { once: true });

  // Pulse the button label to draw attention before play
  setTimeout(() => {
    if (!playing) {
      label.style.color = 'rgba(255,180,255,.9)';
      label.style.fontWeight = '600';
    }
  }, 3000);
})();
