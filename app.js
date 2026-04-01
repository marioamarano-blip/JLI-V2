// ══════════════════════════════════════════════════════
//  APP.JS v4 — Orquestador final listo para GitHub
// ══════════════════════════════════════════════════════

import Voz from './voz.js';
import { setRumiMessage, RUMI_MOOD } from './rumi.js';
import { SumasGame }        from './sumas.js';
import { ElectricidadGame } from './electricidad.js';
import { EngranajesGame }   from './engranajes.js';
import { PalabrasGame }     from './palabras.js';

const App = {
  totalStars: 0,
  currentGame: null,

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
    Voz.init();
    this.loadStars();
    this.bindEvents();
    this.updateStarsDisplay();

    const btnVoz = document.getElementById('btn-voz');
    if (btnVoz) btnVoz.textContent = Voz.habilitada ? '🔊 VOZ: ON' : '🔇 VOZ: OFF';

    setTimeout(() => {
      Voz.decir('HOLA JUANITA! SOY RUMI, TU MENTORA DE INGENIERÍA. ELEGÍ UN JUEGO Y EMPECEMOS!', true);
    }, 900);
  },

  loadStars() {
    this.totalStars = parseInt(localStorage.getItem('juanita-stars') || '0', 10);
  },

  saveStars() {
    localStorage.setItem('juanita-stars', this.totalStars);
  },

  addStars(n) {
    this.totalStars += n;
    this.saveStars();
    this.updateStarsDisplay();
  },

  updateStarsDisplay() {
    document.querySelectorAll('#total-stars, .stars-count').forEach(el => {
      el.textContent = this.totalStars;
    });
  },

  bindEvents() {
    document.querySelectorAll('.game-btn').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.game));
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Voz.callar();
        this.navigate(btn.dataset.target);
      });
    });

    document.getElementById('btn-voz')?.addEventListener('click', () => {
      const on = Voz.toggle();
      document.getElementById('btn-voz').textContent = on ? '🔊 VOZ: ON' : '🔇 VOZ: OFF';
    });
  },

  _setMsg(gameId, msg, mood) {
    setRumiMessage(`rumi-msg-${gameId}`, msg, mood, `rumi-${gameId}`);
  },

  navigate(target) {
    Voz.callar();

    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.remove('active');
      screen.style.display = 'none';
    });

    const screen = document.getElementById(`${target}-screen`);
    if (!screen) {
      console.error('Pantalla no encontrada:', target);
      return;
    }

    screen.style.display = 'flex';
    screen.classList.add('active');

    if (target !== 'welcome') {
      const intros = this.rumiIntros[target];
      if (intros?.length) {
        const msg = intros[Math.floor(Math.random() * intros.length)];
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
    this.currentGame = null;

    const setMsg = (msg, mood = 'feliz') => {
      const moodMap = {
        feliz: RUMI_MOOD.FELIZ,
        celebrando: RUMI_MOOD.CELEBRANDO,
        pensativa: RUMI_MOOD.PENSATIVA,
      };
      this._setMsg(name, msg, moodMap[mood] || RUMI_MOOD.FELIZ);
    };

    const getRequiredElement = (id) => {
      const el = document.getElementById(id);
      if (!el) console.error(`No existe el elemento requerido: ${id}`);
      return el;
    };

    switch (name) {
      case 'sumas': {
        const container = getRequiredElement('sumas-content');
        if (!container) return;
        this.currentGame = new SumasGame({
          container,
          onStar: () => this.onStar('sumas'),
          setRumiMsg: setMsg,
        });
        break;
      }

      case 'electricidad': {
        const container = getRequiredElement('electricidad-content');
        if (!container) return;
        this.currentGame = new ElectricidadGame({
          container,
          onStar: () => this.onStar('electricidad'),
          setRumiMsg: setMsg,
        });
        break;
      }

      case 'engranajes': {
        const container = getRequiredElement('engranajes-content');
        if (!container) return;
        this.currentGame = new EngranajesGame({
          container,
          onStar: () => this.onStar('engranajes'),
          setRumiMsg: setMsg,
        });
        break;
      }

      case 'poleas': {
        const container = getRequiredElement('poleas-content');
        if (!container) return;
        container.innerHTML = `<div class="placeholder-card"><div class="placeholder-icon">🌀</div>¡MÓDULO DE POLEAS PRÓXIMAMENTE!<br><small>RUMI ESTÁ PREPARANDO ALGO ÉPICO</small></div>`;
        break;
      }

      case 'palabras': {
        const container = getRequiredElement('palabras-content');
        const menu = getRequiredElement('palabras-menu');
        const backBtn = getRequiredElement('palabras-back-menu');
        if (!container || !menu || !backBtn) return;
        this.currentGame = new PalabrasGame({
          container,
          menu,
          backBtn,
          onStar: () => this.onStar('palabras'),
          setRumiMsg: setMsg,
        });
        break;
      }

      default:
        console.warn('Juego no reconocido:', name);
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
    this._setMsg(gameId, msg, mood === 'celebrando' ? RUMI_MOOD.CELEBRANDO : RUMI_MOOD.FELIZ);
    showConfetti();
    showSuperMsg('¡GENIAL JUANITA! ⭐');
  },
};

function showConfetti() {
  const overlay = document.getElementById('confetti-overlay');
  if (!overlay) return;
  overlay.style.display = 'block';
  overlay.innerHTML = '';

  const colors = ['#FF6B9D', '#F1C40F', '#00D4FF', '#2ECC71', '#9B59B6', '#FF8C42'];
  for (let i = 0; i < 65; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random() * 100}%;top:-10px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${6 + Math.random() * 9}px;height:${6 + Math.random() * 9}px;
      border-radius:${Math.random() > .5 ? '50%' : '2px'};
      animation-delay:${Math.random() * 0.9}s;
      animation-duration:${1.5 + Math.random() * 1.5}s;`;
    overlay.appendChild(p);
  }

  setTimeout(() => {
    overlay.style.display = 'none';
  }, 3200);
}

function showSuperMsg(text) {
  const el = document.createElement('div');
  el.className = 'super-msg';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

export { showConfetti, showSuperMsg };

document.addEventListener('DOMContentLoaded', () => {
  const welcome = document.getElementById('welcome-screen');
  if (welcome) welcome.style.display = 'flex';
  App.init();
});
