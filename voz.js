// ══════════════════════════════════════════════════════
//  VOZ.JS v3 — Motor de voz de Rumi
//  - Botón ▶️ en cada burbuja para reproducir
//  - Lee automáticamente en momentos clave
//  - Español Argentina, voz amigable para niños
// ══════════════════════════════════════════════════════

const Voz = {
  habilitada: true,
  inicializada: false,
  hablando: false,
  cola: [],
  vozSeleccionada: null,
  // Texto actual mostrado (para que el botón ▶️ lo repita)
  textoActual: '',

  init() {
    if (this.inicializada) return;
    this.inicializada = true;
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API no disponible');
      this.habilitada = false;
      return;
    }
    if (speechSynthesis.getVoices().length > 0) {
      this._seleccionarVoz();
    } else {
      speechSynthesis.addEventListener('voiceschanged', () => this._seleccionarVoz());
    }
  },

  _seleccionarVoz() {
    const voces = speechSynthesis.getVoices();
    const prioridad = ['es-AR', 'es-419', 'es-US', 'es-MX', 'es-ES', 'es'];
    for (const codigo of prioridad) {
      const v = voces.find(v => v.lang.toLowerCase().startsWith(codigo.toLowerCase()));
      if (v) { this.vozSeleccionada = v; break; }
    }
    if (!this.vozSeleccionada) {
      this.vozSeleccionada = voces.find(v => v.lang.toLowerCase().includes('es')) || voces[0];
    }
    console.log('🎙️ Rumi:', this.vozSeleccionada?.name, this.vozSeleccionada?.lang);
  },

  // Hablar un texto — prioridad=true interrumpe lo que haya
  decir(texto, prioridad = false) {
    if (!this.habilitada || !('speechSynthesis' in window)) return;
    const limpio = this._limpiar(texto);
    if (!limpio) return;
    this.textoActual = limpio;
    if (prioridad) { speechSynthesis.cancel(); this.cola = []; this.hablando = false; }
    this.cola.push(limpio);
    if (!this.hablando) this._next();
  },

  // Repetir el texto actual (llamado desde botón ▶️)
  repetir() {
    if (!this.textoActual) return;
    speechSynthesis.cancel();
    this.cola = [this.textoActual];
    this.hablando = false;
    this._next();
  },

  callar() {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    this.cola = [];
    this.hablando = false;
    this._setButtonState(false);
  },

  _next() {
    if (this.cola.length === 0) { this.hablando = false; return; }
    this.hablando = true;
    const texto = this.cola.shift();
    const utt = new SpeechSynthesisUtterance(texto);
    if (!this.vozSeleccionada) this._seleccionarVoz();
    if (this.vozSeleccionada) utt.voice = this.vozSeleccionada;
    utt.lang    = 'es-AR';
    utt.rate    = 0.88;   // un poco lento para niños de 6 años
    utt.pitch   = 1.18;   // voz expresiva
    utt.volume  = 1;
    // Animar botón ▶️ mientras habla
    this._setButtonState(true);
    utt.onend   = () => { this.hablando = false; this._setButtonState(false); this._next(); };
    utt.onerror = () => { this.hablando = false; this._setButtonState(false); this._next(); };
    speechSynthesis.speak(utt);
  },

  // Animar todos los botones ▶️ visibles
  _setButtonState(hablando) {
    document.querySelectorAll('.rumi-play-btn').forEach(btn => {
      btn.textContent  = hablando ? '⏸️' : '▶️';
      btn.classList.toggle('hablando', hablando);
    });
  },

  _limpiar(texto) {
    return texto
      .replace(/<[^>]+>/g, ' ')
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
      .replace(/[^\x00-\x7F\u00C0-\u024F\u0400-\u04FF¡¿]/g, '')
      .replace(/[!¡]+/g, '! ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  toggle() {
    this.habilitada = !this.habilitada;
    if (!this.habilitada) this.callar();
    return this.habilitada;
  },
};

export default Voz;
