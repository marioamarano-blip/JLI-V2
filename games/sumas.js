// ══════════════════════════════════════════════════════
//  SUMAS.JS v4
//  - Selector de niveles
//  - Nivel 1: suma ≤15, con estrellas visuales
//  - Nivel 2: suma ≤25
//  - Nivel 3: suma ≤40
//  - Rumi lee cada pregunta
// ══════════════════════════════════════════════════════

import Voz from './voz.js';

const NIVELES = [
  { num:1, label:'NIVEL 1 ⭐',  maxNum:7,  maxSuma:15, estrellas:true,  color:'#2ECC71' },
  { num:2, label:'NIVEL 2 ⭐⭐', maxNum:12, maxSuma:25, estrellas:false, color:'#F1C40F' },
  { num:3, label:'NIVEL 3 ⭐⭐⭐',maxNum:20, maxSuma:40, estrellas:false, color:'#FF6B9D' },
];

export class SumasGame {
  constructor({ container, onStar, setRumiMsg }) {
    this.container   = container;
    this.onStar      = onStar;
    this.setRumiMsg  = setRumiMsg || (()=>{});
    this.nivelActual = 0;   // índice en NIVELES
    this.maxPreguntas = 5;
    this.preguntaActual = 0;
    this.respondidas    = [];
    this.mostrarMenu    = true;

    this.renderMenu();
  }

  // ── MENÚ DE NIVELES ──────────────────────────────────
  renderMenu() {
    this.mostrarMenu = true;
    this.container.innerHTML = `
      <div class="suma-card" style="gap:20px;max-width:480px;margin:0 auto">
        <div style="font-family:var(--font-title);font-size:1.5rem;color:var(--magic-yellow)">
          ¿QUÉ NIVEL ELEGÍS?
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;width:100%">
          ${NIVELES.map((n,i)=>`
            <button class="nivel-btn" data-nivel="${i}"
              style="background:rgba(255,255,255,0.06);border:2px solid ${n.color};
                     border-radius:16px;padding:16px 20px;cursor:pointer;
                     display:flex;align-items:center;gap:14px;transition:all 0.2s;
                     font-family:var(--font-title);font-size:1.1rem;color:white">
              <span style="font-size:2rem">${['🌱','🚀','🔥'][i]}</span>
              <div style="text-align:left;flex:1">
                <div style="color:${n.color}">${n.label}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);font-family:var(--font-body);font-weight:600">
                  ${i===0?'SUMAS HASTA 15 — CON ESTRELLITAS PARA CONTAR':i===1?'SUMAS HASTA 25 — NÚMEROS MÁS GRANDES':'SUMAS HASTA 40 — ¡EL DESAFÍO MÁXIMO!'}
                </div>
              </div>
            </button>`).join('')}
        </div>
      </div>`;

    this.setRumiMsg('¡ELEGÍ EL NIVEL! EMPEZÁ POR EL NIVEL UNO SI QUERÉS CONTAR CON ESTRELLITAS. ¡CADA NIVEL ES UN NUEVO DESAFÍO!','feliz');

    this.container.querySelectorAll('.nivel-btn').forEach(btn =>
      btn.addEventListener('click', ()=>{
        this.nivelActual = parseInt(btn.dataset.nivel);
        this.preguntaActual = 0;
        this.respondidas = [];
        this.mostrarMenu = false;
        const n=NIVELES[this.nivelActual];
        this.setRumiMsg(`¡NIVEL ${n.num} ELEGIDO! ${n.num===1?'¡VAMOS A SUMAR CON ESTRELLITAS!':n.num===2?'¡NÚMEROS MÁS GRANDES, A PENSAR!':'¡EL NIVEL MÁS DIFÍCIL! ¡DALE JUANITA!'}`, 'feliz');
        setTimeout(()=>this.render(), 400);
      })
    );
  }

  // ── PREGUNTA ─────────────────────────────────────────
  generarPregunta() {
    const n=NIVELES[this.nivelActual];
    let a,b;
    do { a=Math.floor(Math.random()*n.maxNum)+1; b=Math.floor(Math.random()*n.maxNum)+1; }
    while(a+b>n.maxSuma);
    const respuesta=a+b;
    const ops=new Set([respuesta]);
    while(ops.size<4){
      const d=Math.floor(Math.random()*5)+1;
      const w=Math.random()>0.5?respuesta+d:Math.max(1,respuesta-d);
      if(w!==respuesta) ops.add(w);
    }
    return { a, b, respuesta, opciones:[...ops].sort(()=>Math.random()-0.5) };
  }

  render() {
    this.pregunta=this.generarPregunta();
    const { a, b } = this.pregunta;
    const n=NIVELES[this.nivelActual];

    // Estrellas visuales solo en nivel 1 y si los números son ≤10
    const mostrarEstrellas = n.estrellas && a<=10 && b<=10;

    this.container.innerHTML = `
      <div class="suma-card" style="max-width:520px;margin:0 auto">
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%">
          <button class="back-menu-btn" id="btn-back-nivel"
            style="font-size:0.8rem;padding:6px 12px">← NIVELES</button>
          <div style="font-family:var(--font-title);font-size:0.95rem;color:${n.color}">${n.label}</div>
          <div></div>
        </div>

        <div class="progress-dots">
          ${Array.from({length:this.maxPreguntas},(_,i)=>
            `<div class="dot ${i<this.preguntaActual?'done':''}"></div>`
          ).join('')}
        </div>

        <div class="suma-problem">${a} + ${b} = <span style="color:rgba(255,255,255,0.2)">?</span></div>

        ${mostrarEstrellas ? `
          <div style="display:flex;flex-direction:column;gap:10px;width:100%;align-items:center">
            <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:380px">
              ${Array.from({length:a},()=>`<span style="font-size:1.6rem;line-height:1;filter:drop-shadow(0 0 4px gold)">⭐</span>`).join('')}
            </div>
            <div style="font-family:var(--font-title);color:var(--text-muted);font-size:1rem">+</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:380px">
              ${Array.from({length:b},()=>`<span style="font-size:1.6rem;line-height:1;filter:drop-shadow(0 0 4px #00D4FF)">🌟</span>`).join('')}
            </div>
            <div style="color:var(--text-muted);font-size:0.82rem">¡CONTÁ LAS ESTRELLITAS!</div>
          </div>` : ''}

        <div style="color:var(--text-muted);font-size:0.85rem;text-align:center">ELEGÍ LA RESPUESTA CORRECTA</div>

        <div class="options-grid">
          ${this.pregunta.opciones.map(op=>
            `<button class="option-btn" data-valor="${op}">${op}</button>`
          ).join('')}
        </div>
      </div>`;

    // Rumi lee la pregunta
    if(mostrarEstrellas){
      Voz.decir(`CONTÁ LAS ESTRELLITAS. TENÉS ${a} ESTRELLAS DORADAS Y ${b} ESTRELLAS CELESTES. ¿CUÁNTAS SON EN TOTAL?`, true);
    } else {
      Voz.decir(`¿CUÁNTO ES ${a} MÁS ${b}?`, true);
    }

    document.getElementById('btn-back-nivel')?.addEventListener('click',()=>this.renderMenu());
    this.container.querySelectorAll('.option-btn').forEach(btn=>
      btn.addEventListener('click',()=>this.responder(parseInt(btn.dataset.valor),btn))
    );
  }

  responder(valor, btn) {
    this.container.querySelectorAll('.option-btn').forEach(b=>b.disabled=true);
    const {a,b:bVal,respuesta}=this.pregunta;

    if(valor===respuesta){
      btn.classList.add('correct');
      this.respondidas.push(true);
      this.preguntaActual++;
      const msgs=[
        [`¡EXACTO! ${a} MÁS ${bVal} SON ${respuesta}. ¡LO SABÍAS!`,'celebrando'],
        [`¡PERFECTO! LA RESPUESTA ES ${respuesta}. ¡SOS UNA CRACK!`,'celebrando'],
        [`¡BRILLANTE! ¡${respuesta} ES CORRECTO!`,'celebrando'],
      ];
      const [msg,mood]=msgs[Math.floor(Math.random()*msgs.length)];
      this.setRumiMsg(msg,mood);
      if(this.onStar) this.onStar();
      if(this.preguntaActual>=this.maxPreguntas) setTimeout(()=>this.mostrarResultados(),900);
      else setTimeout(()=>this.render(),1000);
    } else {
      btn.classList.add('wrong');
      this.container.querySelectorAll('.option-btn').forEach(b=>{ if(parseInt(b.dataset.valor)===respuesta) b.classList.add('correct'); });
      this.respondidas.push(false);
      this.preguntaActual++;
      const msgs=[
        [`¡CASI! ${a} MÁS ${bVal} ES IGUAL A ${respuesta}. ¡LA PRÓXIMA LA CLAVÁS!`,'pensativa'],
        [`NO ERA ESA. LA RESPUESTA CORRECTA ES ${respuesta}. ¡SEGUÍ INTENTANDO!`,'pensativa'],
      ];
      const [msg,mood]=msgs[Math.floor(Math.random()*msgs.length)];
      this.setRumiMsg(msg,mood);
      setTimeout(()=>{ if(this.preguntaActual<this.maxPreguntas) this.render(); else this.mostrarResultados(); },1800);
    }
  }

  mostrarResultados(){
    const correctas=this.respondidas.filter(Boolean).length;
    const n=NIVELES[this.nivelActual];
    const emoji=correctas>=4?'🎉':correctas>=2?'😊':'💪';
    const txt=correctas>=4?`¡JUANITA HICISTE ${correctas} DE ${this.maxPreguntas}! ¡SOS UNA CRACK DE LAS MATEMÁTICAS!`:correctas>=2?`¡HICISTE ${correctas} DE ${this.maxPreguntas}! ¡MUY BIEN! ¡SEGUÍ PRACTICANDO!`:`¡HICISTE ${correctas} DE ${this.maxPreguntas}! ¡NO TE RINDAS! ¡LA PRÓXIMA LOS ROMPÉS TODOS!`;
    this.setRumiMsg(txt,correctas>=4?'celebrando':'feliz');

    this.container.innerHTML=`
      <div class="suma-card" style="gap:16px;max-width:440px;margin:0 auto">
        <div style="font-size:3.5rem">${emoji}</div>
        <div style="font-family:var(--font-title);font-size:2.2rem;color:var(--magic-yellow)">
          ¡${correctas} DE ${this.maxPreguntas}!
        </div>
        <div style="color:var(--text-muted);font-size:0.95rem;text-align:center">
          ${correctas>=4?'¡JUANITA SOS UNA CRACK DE LAS MATEMÁTICAS! 🚀':correctas>=2?'¡MUY BIEN! ¡SEGUÍ PRACTICANDO! 💪':'¡NO TE RINDAS! ¡LA PRÓXIMA LA ROMPÉS! 🔥'}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <button class="reiniciar-btn" id="btn-reiniciar">¡OTRA VEZ! 🔄</button>
          <button class="back-menu-btn" id="btn-back-res" style="padding:14px 24px">CAMBIAR NIVEL</button>
        </div>
      </div>`;

    document.getElementById('btn-reiniciar').addEventListener('click',()=>{
      this.preguntaActual=0; this.respondidas=[];
      // Subir nivel automáticamente si sacó todo bien
      if(correctas>=this.maxPreguntas && this.nivelActual<NIVELES.length-1){
        this.nivelActual++;
        this.setRumiMsg(`¡SUBISTE AL ${NIVELES[this.nivelActual].label}! ¡VAMOS CON NÚMEROS MÁS GRANDES!`,'celebrando');
        setTimeout(()=>this.render(),600);
      } else { this.render(); }
    });
    document.getElementById('btn-back-res').addEventListener('click',()=>this.renderMenu());
  }

  destroy(){}
}
