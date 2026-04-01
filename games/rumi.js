// ══════════════════════════════════════════════════════
//  RUMI.JS v3 — La Ingeniera con botón ▶️ en burbuja
// ══════════════════════════════════════════════════════

import Voz from './voz.js';

export const RUMI_MOOD = {
  FELIZ: 'feliz',
  PENSATIVA: 'pensativa',
  CELEBRANDO: 'celebrando',
};

export function rumiSVG(mood = RUMI_MOOD.FELIZ, size = 120) {
  const mouth = {
    feliz:      `<path d="M50,74 Q60,82 70,74" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    pensativa:  `<path d="M52,76 Q60,74 68,76" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    celebrando: `<path d="M48,72 Q60,86 72,72" stroke="#fff" stroke-width="3" fill="rgba(255,150,150,0.4)" stroke-linecap="round"/>`,
  };
  const eyebrows = {
    feliz:
      `<path d="M43,46 Q49,42 55,46" stroke="#6B21A8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
       <path d="M65,46 Q71,42 77,46" stroke="#6B21A8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    pensativa:
      `<path d="M43,46 Q49,44 55,48" stroke="#6B21A8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
       <path d="M65,48 Q71,44 77,46" stroke="#6B21A8" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    celebrando:
      `<path d="M41,44 Q49,38 55,44" stroke="#6B21A8" stroke-width="3" fill="none" stroke-linecap="round"/>
       <path d="M65,44 Q71,38 79,44" stroke="#6B21A8" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  };
  const eyes = {
    feliz:
      `<ellipse cx="49" cy="56" rx="7" ry="8" fill="#1a0033"/>
       <ellipse cx="71" cy="56" rx="7" ry="8" fill="#1a0033"/>
       <circle cx="52" cy="53" r="2.5" fill="white"/>
       <circle cx="74" cy="53" r="2.5" fill="white"/>`,
    pensativa:
      `<ellipse cx="49" cy="56" rx="7" ry="6" fill="#1a0033"/>
       <ellipse cx="71" cy="56" rx="7" ry="6" fill="#1a0033"/>
       <circle cx="52" cy="54" r="2" fill="white"/>
       <circle cx="74" cy="54" r="2" fill="white"/>
       <path d="M77,52 Q82,48 84,50" stroke="#6B21A8" stroke-width="1.5" fill="none"/>`,
    celebrando:
      `<path d="M42,56 Q49,48 56,56" stroke="#1a0033" stroke-width="3" fill="none" stroke-linecap="round"/>
       <path d="M64,56 Q71,48 78,56" stroke="#1a0033" stroke-width="3" fill="none" stroke-linecap="round"/>
       <circle cx="48" cy="52" r="2" fill="#FFE066" opacity="0.9"/>
       <circle cx="72" cy="52" r="2" fill="#FFE066" opacity="0.9"/>`,
  };
  const extras = {
    feliz: '',
    pensativa:
      `<circle cx="88" cy="30" r="3" fill="rgba(155,89,182,0.5)"/>
       <circle cx="93" cy="22" r="5" fill="rgba(155,89,182,0.4)"/>
       <circle cx="100" cy="12" r="8" fill="rgba(155,89,182,0.35)"/>
       <text x="97" y="16" font-size="8" text-anchor="middle" fill="white">?</text>`,
    celebrando:
      `<text x="5" y="25" font-size="12">⭐</text>
       <text x="95" y="30" font-size="10">✨</text>
       <text x="5" y="90" font-size="10">🎉</text>
       <text x="95" y="85" font-size="12">⭐</text>`,
  };
  const anim = mood === RUMI_MOOD.CELEBRANDO
    ? 'style="animation:celebrar 0.6s ease infinite"'
    : 'style="animation:float-rumi 3s ease-in-out infinite"';

  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" ${anim}>
  <ellipse cx="60" cy="118" rx="28" ry="5" fill="rgba(0,0,0,0.2)"/>
  <rect x="28" y="84" width="64" height="36" rx="12" fill="#F8F8F0"/>
  <rect x="28" y="84" width="64" height="12" rx="6" fill="#F1C40F"/>
  <circle cx="60" cy="100" r="2.5" fill="#999"/><circle cx="60" cy="109" r="2.5" fill="#999"/>
  <rect x="32" y="94" width="14" height="10" rx="3" fill="rgba(0,0,0,0.08)"/>
  <rect x="56" y="84" width="8" height="36" fill="rgba(0,0,0,0.06)" rx="2"/>
  <rect x="50" y="78" width="20" height="12" rx="4" fill="#FDBCB4"/>
  <rect x="36" y="50" width="21" height="15" rx="7" fill="none" stroke="#F1C40F" stroke-width="3"/>
  <rect x="63" y="50" width="21" height="15" rx="7" fill="none" stroke="#F1C40F" stroke-width="3"/>
  <line x1="57" y1="57" x2="63" y2="57" stroke="#F1C40F" stroke-width="2.5"/>
  <line x1="36" y1="57" x2="30" y2="55" stroke="#F1C40F" stroke-width="2" stroke-linecap="round"/>
  <line x1="84" y1="57" x2="90" y2="55" stroke="#F1C40F" stroke-width="2" stroke-linecap="round"/>
  <rect x="37" y="51" width="19" height="13" rx="6" fill="rgba(100,200,255,0.25)"/>
  <rect x="64" y="51" width="19" height="13" rx="6" fill="rgba(100,200,255,0.25)"/>
  <ellipse cx="60" cy="60" rx="28" ry="26" fill="#FDBCB4"/>
  <ellipse cx="42" cy="67" rx="7" ry="4" fill="rgba(255,150,150,0.35)"/>
  <ellipse cx="78" cy="67" rx="7" ry="4" fill="rgba(255,150,150,0.35)"/>
  ${eyebrows[mood]}
  ${eyes[mood]}
  <ellipse cx="60" cy="67" rx="3" ry="2.5" fill="rgba(220,130,100,0.4)"/>
  ${mouth[mood]}
  <ellipse cx="60" cy="42" rx="30" ry="24" fill="#7B2FBE"/>
  <path d="M30,42 Q35,28 60,26 Q85,28 90,42 Q80,36 60,35 Q40,36 30,42Z" fill="#9B59B6"/>
  <path d="M30,44 Q32,52 36,50 Q33,42 30,44Z" fill="#9B59B6"/>
  <path d="M90,44 Q88,52 84,50 Q87,42 90,44Z" fill="#9B59B6"/>
  <text x="74" y="32" font-size="12">⭐</text>
  ${extras[mood]}
</svg>`;
}

export function renderRumi(elementId, mood = RUMI_MOOD.FELIZ, size = 120) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = rumiSVG(mood, size);
}

// ── setRumiMessage: actualiza burbuja + botón ▶️ + habla
export function setRumiMessage(bubbleId, message, mood = RUMI_MOOD.FELIZ, rumiElementId = null, autoPlay = true) {
  const bubble = document.getElementById(bubbleId);
  if (bubble) {
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateX(-8px)';
    setTimeout(() => {
      // Texto + botón ▶️ siempre presentes en la burbuja
      bubble.innerHTML = `
        <span class="rumi-text">${message}</span>
        <button class="rumi-play-btn" title="ESCUCHAR" onclick="window._rumiRepetir()">▶️</button>
      `;
      bubble.style.transition = 'all 0.3s ease';
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateX(0)';
    }, 150);
  }
  if (rumiElementId) renderRumi(rumiElementId, mood, 80);

  // Guardar texto y hablar si autoPlay
  if (autoPlay) Voz.decir(message, true);
  else Voz.textoActual = Voz._limpiar ? Voz._limpiar(message) : message;
}

// Función global para el onclick del botón ▶️
window._rumiRepetir = () => Voz.repetir();

export function initRumi() {
  Voz.init();
  renderRumi('rumi-svg-welcome', RUMI_MOOD.FELIZ, 130);
  // Poner botón ▶️ en la burbuja de bienvenida
  const wb = document.getElementById('welcome-msg')?.parentElement;
  if (wb) {
    const btn = document.createElement('button');
    btn.className = 'rumi-play-btn';
    btn.title = 'ESCUCHAR';
    btn.textContent = '▶️';
    btn.onclick = () => Voz.repetir();
    wb.appendChild(btn);
  }
  ['sumas','electricidad','engranajes','poleas','palabras'].forEach(id => {
    renderRumi(`rumi-${id}`, RUMI_MOOD.FELIZ, 80);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRumi);
} else {
  initRumi();
}
