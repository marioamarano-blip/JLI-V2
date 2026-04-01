// ══════════════════════════════════════════════════════
//  APP.JS v3 — Orquestador con voz contextual completa
// ══════════════════════════════════════════════════════

import Voz from './voz.js';
import { initRumi, renderRumi, setRumiMessage, RUMI_MOOD } from './rumi.js';
import { SumasGame }        from './sumas.js';
import { ElectricidadGame } from './electricidad.js';
import { EngranajesGame }   from './engranajes.js';
import { PalabrasGame }     from './palabras.js';

const App = {
  totalStars: 0,
  currentGame: null,

  // Introducciones de Rumi — se leen al entrar al módulo
  rumiIntros: {
    sumas: [
      '¡VAMOS JUANITA! LOS NÚMEROS SON EL LENGUAJE DEL UNIVERSO. ¡A SUMAR COMO UNA INGENIERA PRO!',
      '¡LAS MATEMÁTICAS SON INCREÍBLES! CADA SUMA TE HACE MÁS FUERTE. ¡DALE QUE VOS PODÉS!',
    ],
    electricidad: [
      '¡BIENVENIDA AL MUNDO DE LA ELECTRICIDAD! FIJATE EN LA BATERÍA: EL POLO POSITIVO ES ROJO Y EL NEGATIVO ES AZUL. CONECTÁ LOS CABLES ARRASTRÁNDOLOS DE UN PUNTO AL OTRO PARA CERRAR EL CIRCUITO.',
      '¡LA ELECTRICIDAD ESTÁ EN TODOS LADOS! HOY VOS LA VAS A CONTROLAR. CONECTÁ EL POSITIVO DE LA BATERÍA AL INTERRUPTOR, LUEGO A LA LÁMPARA O AL MOTOR, Y VOLVÉ AL NEGATIVO.',
    ],
    engranajes: [
      '¡LOS ENGRANAJES SON INCREÍBLES! CUANDO UN DIENTE EMPUJA AL OTRO, TODA LA MÁQUINA SE MUEVE. ARRASTRÁ LOS ENGRANAJES DESDE EL PANEL DE LA IZQUIERDA A LOS ESPACIOS DE LA MÁQUINA.',
      '¡MIRÁ ESTO JUANITA! UN ENGRANAJE GRANDE Y UNO CHICO JUNTOS HACEN COSAS MÁGICAS. ¡EL CHICO GIRA MÁS RÁPIDO! ¡PROBÁ CONECTARLOS AL VENTILADOR Y A LA POLEA DE LA RANA!',
    ],
    poleas: [
      '¡CON UNA POLEA PODÉS LEVANTAR COSAS MUY PESADAS CON POCA FUERZA! ¡ESO ES INGENIERÍA!',
    ],
    palabras: [
      '¡BIENVENIDA A MI LABORATORIO DE PALABRAS JUANITA! ACÁ VAS A PRACTICAR LAS LETRAS Y LAS PALABRAS. ELEGÍ UN JUEGO PARA EMPEZAR.',
      '¡A MÍ ME ENCANTA LEER! ¡LOS INGENIEROS LEEMOS MUCHÍSIMO! ¡ELEGÍ UN JUEGO DE PALABRAS Y EMPECEMOS!',
    ],
  },

  init() {
    this.loadStars();
    this.bindEvents();
    this.updateStarsDisplay();
    setTimeout(() => {
      Voz.decir('HOLA JUANITA! SOY RUMI, TU MENTORA DE INGENIERÍA. ELEGÍ UN JUEGO Y EMPECEMOS!', true);
    }, 900);
  },

  loadStars() { this.totalStars = parseInt(localStorage.getItem('juanita-stars') || '0'); },
  saveStars()  { localStorage.setItem('juanita-stars', this.totalStars); },
  addStars(n)  { this.totalStars += n; this.saveStars(); this.updateStarsDisplay(); },
  updateStarsDisplay() {
    document.querySelectorAll('#total-stars, .stars-count').forEach(el => el.textContent = this.totalStars);
  },

  bindEvents() {
    document.querySelectorAll('.game-btn').forEach(btn =>
      btn.addEventListener('click', () => this.navigate(btn.dataset.game))
    );
    document.querySelectorAll('.back-btn').forEach(btn =>
      btn.addEventListener('click', () => { Voz.callar(); this.navigate(btn.dataset.target); })
    );
    document.getElementById('btn-voz')?.addEventListener('click', () => {
      const on = Voz.toggle();
      document.getElementById('btn-voz').textContent = on ? '🔊 VOZ: ON' : '🔇 VOZ: OFF';
    });
  },

  // Función helper para setear mensaje de Rumi en un módulo
  _setMsg(gameId, msg, mood) {
    setRumiMessage(`rumi-msg-${gameId}`, msg, mood, `rumi-${gameId}`);
  },

  navigate(target) {
    Voz.callar();
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active'); s.style.display = 'none';
    });
    const screen = document.getElementById(`${target}-screen`);
    if (!screen) return;
    screen.style.display = 'flex'; screen.classList.add('active');

    if (target !== 'welcome') {
      const intros = this.rumiIntros[target];
      if (intros) {
        const msg = intros[Math.floor(Math.random() * intros.length)];
        // autoPlay=false — el juego leerá su propia intro después
        setRumiMessage(`rumi-msg-${target}`, msg, RUMI_MOOD.FELIZ, `rumi-${target}`, false);
      }
      this.startGame(target);
    } else {
      Voz.decir('HOLA JUANITA! ELEGÍ UN JUEGO PARA JUGAR.', true);
    }
    this.updateStarsDisplay();
  },

  startGame(name) {
    if (this.currentGame?.destroy) this.currentGame.destroy();

    const setMsg = (msg, mood = 'feliz') =>
      this._setMsg(name, msg, mood === 'feliz' ? RUMI_MOOD.FELIZ : mood === 'celebrando' ? RUMI_MOOD.CELEBRANDO : RUMI_MOOD.PENSATIVA);

    switch (name) {
      case 'sumas':
        this.currentGame = new SumasGame({
          container:  document.getElementById('sumas-content'),
          onStar:     () => this.onStar('sumas'),
          setRumiMsg: setMsg,
        }); break;

      case 'electricidad':
        this.currentGame = new ElectricidadGame({
          container:  document.getElementById('electricidad-content'),
          onStar:     () => this.onStar('electricidad'),
          setRumiMsg: setMsg,
        }); break;

      case 'engranajes':
        this.currentGame = new EngranajesGame({
          container:  document.getElementById('engranajes-content'),
          onStar:     () => this.onStar('engranajes'),
          setRumiMsg: setMsg,
        }); break;

      case 'poleas':
        document.getElementById('poleas-content').innerHTML =
          `<div class="placeholder-card"><div class="placeholder-icon">🌀</div>¡MÓDULO DE POLEAS PRÓXIMAMENTE!<br><small>RUMI ESTÁ PREPARANDO ALGO ÉPICO</small></div>`;
        break;

      case 'palabras':
        this.currentGame = new PalabrasGame({
          container:  document.getElementById('palabras-content'),
          menu:       document.getElementById('palabras-menu'),
          backBtn:    document.getElementById('palabras-back-menu'),
          onStar:     () => this.onStar('palabras'),
          setRumiMsg: setMsg,
        }); break;
    }
  },

  onStar(gameId) {
    this.addStars(1);
    const msgs = [
      ['¡INCREÍBLE JUANITA! ¡ESO FUE PERFECTO! ¡UNA ESTRELLA PARA VOS!', 'celebrando'],
      ['¡BRILLANTE! ¡SABÍA QUE PODÍAS! ¡SOS UNA INGENIERA DE VERDAD!', 'celebrando'],
      ['¡WOW! ¡ESPECTACULAR! ¡CADA VEZ MÁS CERCA DE SER INGENIERA!', 'celebrando'],
      ['¡GENIAL JUANITA! ¡ASÍ SE HACE! ¡SEGUÍ ASÍ QUE VAS BÁRBARO!', 'celebrando'],
    ];
    const [msg, mood] = msgs[Math.floor(Math.random() * msgs.length)];
    this._setMsg(gameId, msg, mood);
    showConfetti();
    showSuperMsg('¡GENIAL JUANITA! ⭐');
  },
};

// ── CONFETTI ────────────────────────────────────────────
function showConfetti() {
  const overlay = document.getElementById('confetti-overlay');
  overlay.style.display = 'block'; overlay.innerHTML = '';
  const colors = ['#FF6B9D','#F1C40F','#00D4FF','#2ECC71','#9B59B6','#FF8C42'];
  for (let i = 0; i < 65; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random()*100}%;top:-10px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${6+Math.random()*9}px;height:${6+Math.random()*9}px;
      border-radius:${Math.random()>.5?'50%':'2px'};
      animation-delay:${Math.random()*0.9}s;
      animation-duration:${1.5+Math.random()*1.5}s;`;
    overlay.appendChild(p);
  }
  setTimeout(() => { overlay.style.display = 'none'; }, 3200);
}

function showSuperMsg(text) {
  const el = document.createElement('div');
  el.className = 'super-msg'; el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

export { showConfetti, showSuperMsg };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('welcome-screen').style.display = 'flex';
  App.init();
});
