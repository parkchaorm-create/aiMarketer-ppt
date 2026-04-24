/* ================================================================
   Common Runtime — output2_AI_marketer_course
   배경 MODE는 <body data-bg-mode="FLOW|NETWORK|WAVES|VORONOI|CONSTELLATION">로 지정.
   미지정 시 FLOW가 기본값.
   ================================================================ */
(function () {
  /* ─── SLIDE NAVIGATION ─── */
  const slides = document.querySelectorAll('.slide');
  const dotsEl = document.getElementById('dots');
  const progressEl = document.getElementById('progress');
  const curNumEl = document.getElementById('curNum');
  const thumbStrip = document.getElementById('thumbStrip');
  const helpOverlay = document.getElementById('helpOverlay');
  let current = 0;

  slides.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'ctrl-dot';
    d.onclick = () => go(i);
    dotsEl && dotsEl.appendChild(d);
  });
  document.querySelectorAll('.thumb').forEach(t => {
    t.onclick = () => go(parseInt(t.dataset.idx, 10));
  });

  function render() {
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    document.querySelectorAll('.ctrl-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    document.querySelectorAll('.thumb').forEach((t, i) => t.classList.toggle('active', i === current));
    if (progressEl) progressEl.style.width = ((current + 1) / slides.length * 100) + '%';
    if (curNumEl) curNumEl.textContent = String(current + 1).padStart(2, '0');
    runCountup();
  }
  function next() { if (current < slides.length - 1) { current++; render(); } }
  function prev() { if (current > 0) { current--; render(); } }
  function go(i) { current = i; render(); }
  function goFirst() { current = 0; render(); }
  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }
  function toggleThumbs() { thumbStrip && thumbStrip.classList.toggle('open'); }
  function toggleHelp() { helpOverlay && helpOverlay.classList.toggle('open'); }

  // 전역 노출 (인라인 onclick 호환)
  window.next = next;
  window.prev = prev;
  window.go = go;
  window.goFirst = goFirst;
  window.toggleFullscreen = toggleFullscreen;
  window.toggleThumbs = toggleThumbs;
  window.toggleHelp = toggleHelp;

  // CRITICAL FIX (2026-04-24 · Space 버그): 포커스된 button에서 Space/Enter가
  // browser-default로 onclick 트리거 · ctrl-btn(next/prev) 포커스 시 Space → 슬라이드 이동.
  // 해결: keydown 시 활성 요소 blur + keyup·keypress도 잡아서 stopPropagation.
  function blurActiveIfButton() {
    var ae = document.activeElement;
    if (ae && (ae.tagName === 'BUTTON' || ae.tagName === 'A') && typeof ae.blur === 'function') {
      ae.blur();
    }
  }

  // Space·Backspace의 keyup·keypress도 차단 (button 활성화 방지)
  document.addEventListener('keyup', function(e) {
    if (e.key === ' ' || e.key === 'Backspace' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
  document.addEventListener('keypress', function(e) {
    if (e.key === ' ' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  document.addEventListener('keydown', e => {
    if (helpOverlay && helpOverlay.classList.contains('open') && e.key !== 'Escape' && e.key !== '?') return;

    // 골든 Part 01 정책 · 키 역할 엄격 분리
    // ArrowRight/PageDown: 다음 슬라이드
    // ArrowLeft/PageUp: 이전 슬라이드
    // Space/ArrowDown: 문장 다음 (슬라이드 이동 절대 X)
    // Backspace/ArrowUp: 문장 이전
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault(); next();
    }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault(); prev();
    }
    else if (e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      blurActiveIfButton(); // 포커스된 button의 Space-click 차단
      var slide = document.querySelector('.slide.active');
      if (!slide || typeof window.setSentenceIdx !== 'function') return;
      var ss = slide.querySelectorAll('.teacher-note .sentence');
      if (ss.length === 0) return;
      var aid = -1;
      ss.forEach(function(s, i) { if (s.classList.contains('active')) aid = i; });
      if (aid < ss.length - 1) window.setSentenceIdx(aid + 1, slide);
      // 문장 끝이어도 슬라이드 이동 안 함
    }
    else if (e.key === 'Backspace' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      blurActiveIfButton();
      var slide2 = document.querySelector('.slide.active');
      if (!slide2 || typeof window.setSentenceIdx !== 'function') return;
      var ss2 = slide2.querySelectorAll('.teacher-note .sentence');
      if (ss2.length === 0) return;
      var aid2 = -1;
      ss2.forEach(function(s, i) { if (s.classList.contains('active')) aid2 = i; });
      if (aid2 > 0) window.setSentenceIdx(aid2 - 1, slide2);
      // 문장 처음이어도 슬라이드 이동 안 함
    }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
    else if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    else if (e.key === 't' || e.key === 'T') toggleThumbs();
    else if (e.key === '?' || e.key === '/') toggleHelp();
    else if (e.key === 'n' || e.key === 'N') {
      document.querySelectorAll('details.teacher-note').forEach(function(d) {
        if (d.open) d.removeAttribute('open'); else d.setAttribute('open', '');
      });
    }
    else if (e.key === 'Escape') {
      helpOverlay && helpOverlay.classList.remove('open');
      thumbStrip && thumbStrip.classList.remove('open');
    }
  });

  const deck = document.getElementById('deck');
  if (deck) {
    deck.addEventListener('click', e => {
      if (e.target.closest('a, button, .bullet-list, .outro-actions')) return;
      next();
    });
  }

  /* ─── TYPEWRITER ON COVER TITLE ─── */
  const tw = document.querySelector('.typewriter-target');
  if (tw) {
    const text = tw.dataset.text;
    let ti = 0;
    tw.innerHTML = '<span class="caret"></span>';
    (function typ() {
      if (ti < text.length) {
        tw.innerHTML = text.substring(0, ti + 1) + '<span class="caret"></span>';
        ti++;
        setTimeout(typ, 55 + Math.random() * 40);
      }
    })();
  }

  /* ─── COUNTUP ANIMATION ─── */
  function runCountup() {
    const active = document.querySelector('.slide.active');
    if (!active) return;
    active.querySelectorAll('.svg-countup').forEach(el => {
      const target = parseInt(el.dataset.target || '100', 10);
      let v = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const t = setInterval(() => {
        v += step;
        if (v >= target) { v = target; clearInterval(t); }
        el.textContent = v;
      }, 20);
    });
  }

  /* ─── CUSTOM CURSOR ─── */
  const cDot = document.getElementById('cursorDot');
  const cRing = document.getElementById('cursorRing');
  if (cDot && cRing) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cDot.style.left = mx + 'px';
      cDot.style.top = my + 'px';
    });
    (function animCursor() {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      cRing.style.left = rx + 'px';
      cRing.style.top = ry + 'px';
      requestAnimationFrame(animCursor);
    })();
    document.querySelectorAll('a, button, .ctrl-dot, .tilt-card, .thumb').forEach(el => {
      el.addEventListener('mouseenter', () => cRing.classList.add('hover'));
      el.addEventListener('mouseleave', () => cRing.classList.remove('hover'));
    });
  }

  /* ─── 3D TILT CARDS ─── */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateX(6px) translateY(-2px) perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    card.addEventListener('click', () => { card.classList.toggle('open'); });
  });

  /* ─── ALGORITHMIC BACKGROUND ─── */
  const canvas = document.getElementById('bgcanvas');
  if (!canvas) { render(); return; }
  const ctx = canvas.getContext('2d');
  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const MODE = (document.body.dataset.bgMode || 'FLOW').toUpperCase();
  const GOLD = '#e2c793';
  const GOLD2 = '#b8941f';

  let seed = 7932;
  function rand() {
    seed = (seed * 1664525 + 1013904223) | 0;
    return ((seed >>> 0) / 4294967296);
  }

  const noiseTable = new Array(512);
  for (let i = 0; i < 512; i++) noiseTable[i] = rand();
  function noise2(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const aa = noiseTable[(xi + yi * 57) & 511];
    const ba = noiseTable[((xi + 1) + yi * 57) & 511];
    const ab = noiseTable[(xi + (yi + 1) * 57) & 511];
    const bb = noiseTable[((xi + 1) + (yi + 1) * 57) & 511];
    const x1 = aa * (1 - u) + ba * u;
    const x2 = ab * (1 - u) + bb * u;
    return x1 * (1 - v) + x2 * v;
  }

  let particles = [], nodes = [], cells = [];
  let t = 0;
  let mouseX = w / 2, mouseY = h / 2;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX * devicePixelRatio;
    mouseY = e.clientY * devicePixelRatio;
  });

  function initFlow() {
    particles = [];
    for (let i = 0; i < 220; i++) particles.push({ x: rand() * w, y: rand() * h, vx: 0, vy: 0, life: rand() * 200 });
  }
  function drawFlow() {
    ctx.fillStyle = 'rgba(13,13,13,0.08)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 0.6 * devicePixelRatio;
    for (const p of particles) {
      const mDx = (p.x - mouseX) / 300;
      const mDy = (p.y - mouseY) / 300;
      const n = noise2(p.x * 0.0018, p.y * 0.0018 + t * 0.02) * Math.PI * 4;
      p.vx = Math.cos(n) * 1.2 * devicePixelRatio + mDx * 0.4;
      p.vy = Math.sin(n) * 1.2 * devicePixelRatio + mDy * 0.4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      p.x += p.vx; p.y += p.vy;
      ctx.lineTo(p.x, p.y);
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      p.life--;
      if (p.life < 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        p.x = rand() * w; p.y = rand() * h; p.life = 120 + rand() * 160;
      }
    }
    ctx.globalAlpha = 1;
  }

  function initNetwork() {
    nodes = [];
    for (let i = 0; i < 70; i++) {
      nodes.push({
        x: rand() * w, y: rand() * h,
        vx: (rand() - 0.5) * 0.4 * devicePixelRatio,
        vy: (rand() - 0.5) * 0.4 * devicePixelRatio
      });
    }
  }
  function drawNetwork() {
    ctx.fillStyle = 'rgba(13,13,13,0.2)';
    ctx.fillRect(0, 0, w, h);
    for (const n of nodes) {
      const dx = mouseX - n.x, dy = mouseY - n.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 250 * devicePixelRatio) { n.vx += dx / d * 0.02; n.vy += dy / d * 0.02; }
      n.vx *= 0.98; n.vy *= 0.98;
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 0.5 * devicePixelRatio;
    const limit = 180 * devicePixelRatio;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < limit) {
          ctx.globalAlpha = (1 - d / limit) * 0.4;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = GOLD;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.5 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initWaves() {
    cells = [];
    for (let i = 0; i < 6; i++) {
      cells.push({ x: rand() * w, y: rand() * h, r: 80 + rand() * 220, phase: rand() * Math.PI * 2, speed: 0.5 + rand() * 1.5 });
    }
  }
  function drawWaves() {
    ctx.fillStyle = 'rgba(13,13,13,0.12)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 0.6 * devicePixelRatio;
    const mx = mouseX, my = mouseY;
    for (const c of cells) {
      c.x += ((c._ox || c.x) - c.x) * 0.02;
      if (!c._ox) c._ox = c.x;
    }
    for (const c of cells) {
      for (let k = 0; k < 8; k++) {
        const radius = (c.r + k * 22 * devicePixelRatio + Math.sin(t * 0.02 * c.speed + c.phase) * 20 * devicePixelRatio);
        ctx.globalAlpha = 0.12 - k * 0.012;
        ctx.beginPath();
        ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 0.25;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.arc(mx, my, 30 * devicePixelRatio + k * 20 * devicePixelRatio + Math.sin(t * 0.06) * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function initVoronoi() {
    nodes = [];
    for (let i = 0; i < 40; i++) {
      nodes.push({ x: rand() * w, y: rand() * h, vx: (rand() - 0.5) * 0.3 * devicePixelRatio, vy: (rand() - 0.5) * 0.3 * devicePixelRatio });
    }
  }
  function drawVoronoi() {
    ctx.fillStyle = 'rgba(13,13,13,0.35)';
    ctx.fillRect(0, 0, w, h);
    for (const n of nodes) {
      const dx = mouseX - n.x, dy = mouseY - n.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 200 * devicePixelRatio && d > 1) { n.vx -= dx / d * 0.03; n.vy -= dy / d * 0.03; }
      n.vx *= 0.97; n.vy *= 0.97;
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 0.4 * devicePixelRatio;
    for (let i = 0; i < nodes.length; i++) {
      const dists = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        dists.push({ j, d: dx * dx + dy * dy });
      }
      dists.sort((a, b) => a.d - b.d);
      for (let k = 0; k < 3; k++) {
        const o = nodes[dists[k].j];
        ctx.globalAlpha = 0.2 - k * 0.05;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(o.x, o.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = GOLD;
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.2 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initConstellation() {
    particles = [];
    for (let i = 0; i < 120; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * Math.min(w, h) * 0.45;
      particles.push({
        x: w / 2 + Math.cos(angle) * dist,
        y: h / 2 + Math.sin(angle) * dist,
        angle: angle, dist: dist,
        speed: 0.0005 + rand() * 0.0012,
        size: 0.8 + rand() * 1.4
      });
    }
  }
  function drawConstellation() {
    ctx.fillStyle = 'rgba(13,13,13,0.18)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 0.35 * devicePixelRatio;
    const cx = w / 2 + (mouseX - w / 2) * 0.08;
    const cy = h / 2 + (mouseY - h / 2) * 0.08;
    for (const p of particles) {
      p.angle += p.speed;
      p.x = cx + Math.cos(p.angle) * p.dist;
      p.y = cy + Math.sin(p.angle) * p.dist;
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120 * devicePixelRatio) {
          ctx.globalAlpha = (1 - d / (120 * devicePixelRatio)) * 0.35;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = GOLD;
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (MODE === 'FLOW') initFlow();
  else if (MODE === 'NETWORK') initNetwork();
  else if (MODE === 'WAVES') initWaves();
  else if (MODE === 'VORONOI') initVoronoi();
  else initConstellation();

  (function loop() {
    t++;
    if (MODE === 'FLOW') drawFlow();
    else if (MODE === 'NETWORK') drawNetwork();
    else if (MODE === 'WAVES') drawWaves();
    else if (MODE === 'VORONOI') drawVoronoi();
    else drawConstellation();
    requestAnimationFrame(loop);
  })();

  render();
})();

/* ================================================================
   📝 강사 노트 시스템 (2026-04-24 공통 에셋 추가)
   · 뷰 분리 (?view=student = 프로젝터 · 기본 = 강사 뷰)
   · 노래방 모드 (문장 split + past/active/future 하이라이트)
   · 4중 채널 동기화 (BroadcastChannel·postMessage·localStorage·MutationObserver)
   · Presenter View 듀얼 창 (📺 버튼)
   ================================================================ */

(function initViewMode() {
  if (!document.body.classList.contains('teacher-view') &&
      !document.body.classList.contains('student-view')) {
    document.body.classList.add('teacher-view');
  }
  var params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'student') {
    document.body.classList.remove('teacher-view');
    document.body.classList.add('student-view');
  }
})();

(function initTeacherNotes() {
  function setup() {
    document.querySelectorAll('.teacher-note .note-script-text').forEach(function(scriptEl) {
      if (scriptEl.querySelector('.sentence')) return;
      var raw = scriptEl.innerHTML;
      var paras = raw.split(/<br\s*\/?>\s*<br\s*\/?>/i);
      var html = paras.map(function(p) {
        var stripped = p.replace(/<br\s*\/?>/gi, ' ').trim();
        if (!stripped) return '';
        var tokens = stripped.match(/[^.?!]+[.?!]?\s*/g) || [stripped];
        return tokens.map(function(s) {
          var t = s.trim();
          return t ? '<span class="sentence future">' + t + '</span>' : '';
        }).filter(Boolean).join(' ');
      }).filter(Boolean).join('<span class="note-para-break"></span>');
      scriptEl.innerHTML = html;
    });

    document.querySelectorAll('.teacher-note .sentence').forEach(function(s) {
      if (s.__clickBound) return;
      s.__clickBound = true;
      s.addEventListener('click', function() {
        var slide = s.closest('.slide');
        if (!slide) return;
        var sentences = Array.prototype.slice.call(slide.querySelectorAll('.teacher-note .sentence'));
        var idx = sentences.indexOf(s);
        if (typeof window.setSentenceIdx === 'function') window.setSentenceIdx(idx, slide);
      });
    });

    if (typeof window.setSentenceIdx !== 'function') {
      window.setSentenceIdx = function(idx, slideEl) {
        slideEl = slideEl || document.querySelector('.slide.active');
        if (!slideEl) return;
        var sentences = slideEl.querySelectorAll('.teacher-note .sentence');
        sentences.forEach(function(s, i) {
          s.classList.remove('past', 'active', 'future');
          if (i < idx) s.classList.add('past');
          else if (i === idx) s.classList.add('active');
          else s.classList.add('future');
        });
        setTimeout(function() {
          var active = slideEl.querySelector('.teacher-note .sentence.active');
          if (active && typeof active.scrollIntoView === 'function') {
            try { active.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}
          }
        }, 50);
      };
    }

    document.querySelectorAll('.slide').forEach(function(s) {
      if (s.__sentenceObs) return;
      s.__sentenceObs = true;
      new MutationObserver(function() {
        if (s.classList.contains('active') && typeof window.setSentenceIdx === 'function') {
          window.setSentenceIdx(0, s);
        }
      }).observe(s, { attributes: true, attributeFilter: ['class'] });
    });

    var initActive = document.querySelector('.slide.active');
    if (initActive && typeof window.setSentenceIdx === 'function') {
      window.setSentenceIdx(0, initActive);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

window.openProjectorWindow = function() {
  var base = window.location.href.split('?')[0];
  var projUrl = base + '?view=student';
  var proj = window.open(projUrl, 'projector-' + base,
    'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
  if (!proj) {
    alert('팝업이 차단되었습니다. 주소창 옆 팝업 아이콘에서 허용해 주세요.');
    return;
  }
  window.__projector = proj;
  proj.focus();
};

(function initSlideSync() {
  var SYNC_KEY = 'aimarketer-slide-sync';
  var channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(SYNC_KEY);
    }
  } catch(e) { channel = null; }

  function broadcast(msg) {
    if (window.__skipBroadcast) return;
    try { if (channel) channel.postMessage(msg); } catch(e) {}
    try { if (window.__projector && !window.__projector.closed) window.__projector.postMessage(msg, '*'); } catch(e) {}
    try { if (window.opener && !window.opener.closed) window.opener.postMessage(msg, '*'); } catch(e) {}
    try { localStorage.setItem(SYNC_KEY, JSON.stringify(Object.assign({}, msg, { ts: Date.now() }))); } catch(e) {}
  }

  function handle(msg) {
    if (!msg || !msg.type) return;
    if (msg.type === 'goto' && typeof window.go === 'function') {
      window.__skipBroadcast = true;
      window.go(msg.index);
      setTimeout(function() { window.__skipBroadcast = false; }, 120);
    } else if (msg.type === 'sentence' && typeof window.setSentenceIdx === 'function') {
      window.__skipBroadcast = true;
      window.setSentenceIdx(msg.index);
      setTimeout(function() { window.__skipBroadcast = false; }, 120);
    } else if (msg.type === 'tab') {
      // 책갈피 탭(bullet-list tilt-card) open/close 동기화
      var slides = document.querySelectorAll('.slide');
      if (!slides[msg.slide]) return;
      var cards = slides[msg.slide].querySelectorAll('.bullet-list li.tilt-card');
      if (!cards[msg.card]) return;
      window.__skipBroadcast = true;
      if (msg.open) cards[msg.card].classList.add('open');
      else cards[msg.card].classList.remove('open');
      setTimeout(function() { window.__skipBroadcast = false; }, 120);
    } else if (msg.type === 'navigate') {
      var curPath = window.location.pathname;
      if (curPath !== msg.path) {
        var viewParam = new URLSearchParams(window.location.search).get('view');
        window.location.href = msg.path + (viewParam ? '?view=' + viewParam : '');
      }
    } else if (msg.type === 'thumbs') {
      var strip = document.getElementById('thumbStrip');
      if (strip) {
        window.__skipBroadcast = true;
        if (msg.open) strip.classList.add('open'); else strip.classList.remove('open');
        setTimeout(function() { window.__skipBroadcast = false; }, 120);
      }
    } else if (msg.type === 'help') {
      var ov = document.getElementById('helpOverlay');
      if (ov) {
        window.__skipBroadcast = true;
        if (msg.open) ov.classList.add('open'); else ov.classList.remove('open');
        setTimeout(function() { window.__skipBroadcast = false; }, 120);
      }
    }
  }

  if (channel) channel.onmessage = function(e) { handle(e.data); };
  window.addEventListener('message', function(e) { if (e.data) handle(e.data); });
  window.addEventListener('storage', function(e) {
    if (e.key === SYNC_KEY && e.newValue) {
      try { handle(JSON.parse(e.newValue)); } catch(err) {}
    }
  });

  function observeAll() {
    document.querySelectorAll('.slide').forEach(function(s, idx) {
      if (s.__syncObs) return;
      s.__syncObs = true;
      new MutationObserver(function() {
        if (s.classList.contains('active')) {
          broadcast({ type: 'goto', index: idx });
        }
      }).observe(s, { attributes: true, attributeFilter: ['class'] });

      // 책갈피 탭(bullet-list tilt-card) open/close 동기화
      s.querySelectorAll('.bullet-list li.tilt-card').forEach(function(card, cardIdx) {
        if (card.__syncObs) return;
        card.__syncObs = true;
        new MutationObserver(function() {
          broadcast({
            type: 'tab',
            slide: idx,
            card: cardIdx,
            open: card.classList.contains('open')
          });
        }).observe(card, { attributes: true, attributeFilter: ['class'] });
      });
    });

    var thumbStrip = document.getElementById('thumbStrip');
    if (thumbStrip && !thumbStrip.__syncObs) {
      thumbStrip.__syncObs = true;
      new MutationObserver(function() {
        broadcast({ type: 'thumbs', open: thumbStrip.classList.contains('open') });
      }).observe(thumbStrip, { attributes: true, attributeFilter: ['class'] });
    }

    var helpOverlay = document.getElementById('helpOverlay');
    if (helpOverlay && !helpOverlay.__syncObs) {
      helpOverlay.__syncObs = true;
      new MutationObserver(function() {
        broadcast({ type: 'help', open: helpOverlay.classList.contains('open') });
      }).observe(helpOverlay, { attributes: true, attributeFilter: ['class'] });
    }
  }

  var origSetSentence = window.setSentenceIdx;
  if (typeof origSetSentence === 'function') {
    window.setSentenceIdx = function(idx, slideEl) {
      origSetSentence(idx, slideEl);
      broadcast({ type: 'sentence', index: idx });
    };
  }

  document.querySelectorAll('a.nav-arrow[href], a.btn[href]').forEach(function(a) {
    a.addEventListener('click', function() {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      try {
        var absolute = new URL(href, window.location.href);
        broadcast({ type: 'navigate', path: absolute.pathname });
      } catch (err) {}
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAll);
  } else {
    observeAll();
  }
})();
