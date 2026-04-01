// ══════════════════════════════════════════════════════
//  PALABRAS.JS v4 — Laboratorio de Palabras
//  Lista ampliada a 45 palabras + todos los juegos con voz
// ══════════════════════════════════════════════════════

import Voz from './voz.js';

const PALABRAS = [
  // Animales
  { emoji:'🐶', palabra:'PERRO',    pista:'EL MEJOR AMIGO DEL HUMANO' },
  { emoji:'🐱', palabra:'GATO',     pista:'ANIMAL QUE MAULLA' },
  { emoji:'🐸', palabra:'RANA',     pista:'SALTA Y VIVE CERCA DEL AGUA' },
  { emoji:'🐘', palabra:'ELEFANTE', pista:'TIENE TROMPA LARGA' },
  { emoji:'🦁', palabra:'LEON',     pista:'REY DE LA SELVA' },
  { emoji:'🐟', palabra:'PEZ',      pista:'VIVE EN EL AGUA' },
  { emoji:'🦋', palabra:'MARIPOSA', pista:'INSECTO CON ALAS COLORIDAS' },
  { emoji:'🐮', palabra:'VACA',     pista:'NOS DA LECHE' },
  { emoji:'🐷', palabra:'CHANCHO',  pista:'ANIMAL ROSADO QUE GRUÑE' },
  { emoji:'🦆', palabra:'PATO',     pista:'NADA Y VUELA' },
  { emoji:'🐰', palabra:'CONEJO',   pista:'TIENE OREJAS MUY LARGAS' },
  { emoji:'🦊', palabra:'ZORRO',    pista:'ES MUY ASTUTO Y NARANJA' },
  { emoji:'🐻', palabra:'OSO',      pista:'DUERME TODO EL INVIERNO' },
  { emoji:'🦓', palabra:'CEBRA',    pista:'TIENE RAYAS NEGRAS Y BLANCAS' },
  { emoji:'🐬', palabra:'DELFIN',   pista:'VIVE EN EL MAR Y ES MUY INTELIGENTE' },
  // Naturaleza
  { emoji:'🌸', palabra:'FLOR',     pista:'ES MUY LINDA Y PERFUMADA' },
  { emoji:'🌙', palabra:'LUNA',     pista:'BRILLA DE NOCHE' },
  { emoji:'☀️',  palabra:'SOL',      pista:'CALIENTA Y DA LUZ' },
  { emoji:'🌳', palabra:'ARBOL',    pista:'TIENE RAMAS Y HOJAS' },
  { emoji:'⭐', palabra:'ESTRELLA', pista:'BRILLA EN EL CIELO NOCTURNO' },
  { emoji:'🌈', palabra:'ARCOIRIS', pista:'APARECE DESPUES DE LA LLUVIA' },
  { emoji:'🌊', palabra:'OLA',      pista:'SE FORMA EN EL MAR' },
  { emoji:'🌋', palabra:'VOLCAN',   pista:'TIRA FUEGO Y LAVA' },
  { emoji:'🌵', palabra:'CACTUS',   pista:'PLANTA DEL DESIERTO CON ESPINAS' },
  // Comida
  { emoji:'🍎', palabra:'MANZANA',  pista:'FRUTA ROJA O VERDE' },
  { emoji:'🍕', palabra:'PIZZA',    pista:'COMIDA ITALIANA MUY RICA' },
  { emoji:'🍦', palabra:'HELADO',   pista:'POSTRE FRIO Y DULCE' },
  { emoji:'🍰', palabra:'TORTA',    pista:'SE COME EN LOS CUMPLEANOS' },
  { emoji:'🍇', palabra:'UVA',      pista:'FRUTA PEQUENA QUE CRECE EN RACIMOS' },
  { emoji:'🍓', palabra:'FRUTILLA', pista:'FRUTA ROJA CON PUNTITOS' },
  { emoji:'🥕', palabra:'ZANAHORIA',pista:'VERDURA NARANJA QUE LE GUSTA A LOS CONEJOS' },
  { emoji:'🍌', palabra:'BANANA',   pista:'FRUTA AMARILLA Y CURVA' },
  // Objetos y lugares
  { emoji:'🏠', palabra:'CASA',     pista:'DONDE VIVIMOS' },
  { emoji:'🎈', palabra:'GLOBO',    pista:'VUELA CON AIRE' },
  { emoji:'🚂', palabra:'TREN',     pista:'VIAJA SOBRE RIELES' },
  { emoji:'✈️',  palabra:'AVION',    pista:'VUELA EN EL CIELO' },
  { emoji:'🎸', palabra:'GUITARRA', pista:'INSTRUMENTO MUSICAL DE CUERDAS' },
  { emoji:'⚽', palabra:'PELOTA',   pista:'SE USA PARA JUGAR AL FUTBOL' },
  { emoji:'🎨', palabra:'PINTURA',  pista:'SE USA PARA HACER DIBUJOS DE COLORES' },
  { emoji:'📚', palabra:'LIBRO',    pista:'TIENE MUCHAS PAGINAS CON PALABRAS' },
  { emoji:'🚀', palabra:'COHETE',   pista:'VA AL ESPACIO' },
  { emoji:'🌂', palabra:'PARAGUAS', pista:'NOS PROTEGE DE LA LLUVIA' },
  { emoji:'🎠', palabra:'CALESITA', pista:'JUEGO QUE DA VUELTAS EN EL PARQUE' },
  { emoji:'🎭', palabra:'TEATRO',   pista:'LUGAR DONDE SE VEN OBRAS CON ACTORES' },
  { emoji:'🔭', palabra:'TELESCOPIO',pista:'SIRVE PARA VER LAS ESTRELLAS DE CERCA' },
];

const ABECEDARIO    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ABECEDARIO_ES = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

const CORRECTO  = [
  '¡EXACTO! ¡SOS BRILLANTE JUANITA!',
  '¡WOW! ¡SABÍA QUE LO IBAS A SABER!',
  '¡PERFECTO! ¡SOS UNA CRACK!',
  '¡INCREÍBLE! ¡LO CLAVASTE!',
  '¡ESO ES! ¡MI ALUMNA FAVORITA!',
  '¡GENIAL! ¡CADA VEZ MÁS INTELIGENTE!',
];
const INCORRECTO = [
  '¡CASI! ¡LA PRÓXIMA LA ROMPÉS!',
  '¡NO TE RINDAS! ¡VOLVAMOS A INTENTARLO!',
  '¡ESO ESTUVO CERCA! ¡SEGUÍ ASÍ!',
  '¡ERROR NOBLE! ¡ASÍ SE APRENDE!',
  '¡NO ERA ESA! ¡PERO SEGUÍS APRENDIENDO!',
];

const rand = arr => arr[Math.floor(Math.random()*arr.length)];
const shuffle = arr => [...arr].sort(()=>Math.random()-0.5);

export class PalabrasGame {
  constructor({ container, menu, backBtn, onStar, setRumiMsg }) {
    this.container  = container;
    this.menu       = menu;
    this.backBtn    = backBtn;
    this.onStar     = onStar;
    this.setRumiMsg = setRumiMsg || (()=>{});
    this._bindMenu();
  }

  _bindMenu(){
    this.menu.querySelectorAll('.palabras-btn').forEach(btn=>
      btn.addEventListener('click',()=>this._startSubjuego(btn.dataset.subjuego))
    );
    this.backBtn.addEventListener('click',()=>{
      this.container.style.display='none';
      this.menu.style.display='grid';
      this.backBtn.style.display='none';
      this.setRumiMsg('¡ELEGÍ OTRO JUEGO DE PALABRAS! ¡SON TODOS BUENÍSIMOS!','feliz');
    });
  }

  _startSubjuego(nombre){
    this.menu.style.display='none';
    this.container.style.display='block';
    this.backBtn.style.display='block';
    const instrucciones={
      'letra-inicial':'¡JUEGO DE LA LETRA INICIAL! TE VOY A MOSTRAR UNA IMAGEN Y VOS TENÉS QUE DECIR CON QUÉ LETRA EMPIEZA ESA PALABRA. ¡MIRÁ BIEN LA IMAGEN Y ELEGÍ LA LETRA CORRECTA!',
      'completar':    '¡JUEGO DE COMPLETAR LA PALABRA! TE MUESTRO UNA PALABRA A LA QUE LE FALTAN LETRAS. ¡TOCÁ LAS LETRAS QUE FALTAN PARA COMPLETARLA! USÁ LA IMAGEN COMO PISTA.',
      'unir':         '¡JUEGO DE UNIR! HAY IMÁGENES DE UN LADO Y PALABRAS DEL OTRO. TOCÁ UNA IMAGEN Y DESPUÉS TOCÁ LA PALABRA QUE LE CORRESPONDE. ¡UNILAS A TODAS!',
      'ahorcado':     '¡AHORCADO MÁGICO! HAY UNA PALABRA SECRETA. TENÉS QUE ADIVINARLA LETRA POR LETRA. HAY UNA PISTA EN LA IMAGEN. ¡TENÉS SEIS INTENTOS, DALE QUE VOS PODÉS!',
    };
    this.setRumiMsg(instrucciones[nombre]||'','feliz');
    setTimeout(()=>{
      switch(nombre){
        case 'letra-inicial': this._letraInicial(); break;
        case 'completar':     this._completar();    break;
        case 'unir':          this._unir();          break;
        case 'ahorcado':      this._ahorcado();      break;
      }
    }, 600);
  }

  // ════ JUEGO 1: ¿Con qué letra empieza? ══════════════
  _letraInicial(){
    const item=rand(PALABRAS);
    const correcta=item.palabra[0];
    const incorrectas=shuffle(ABECEDARIO.filter(l=>l!==correcta)).slice(0,7);
    const opciones=shuffle([correcta,...incorrectas]);

    Voz.decir(`MIRÁ LA IMAGEN. ¿CON QUÉ LETRA EMPIEZA ESTA PALABRA? ¡ELEGÍ!`, true);

    this.container.innerHTML=`
      <div class="letra-inicial-card">
        <div class="emoji-grande">${item.emoji}</div>
        <div class="pregunta-label">¿CON QUÉ LETRA EMPIEZA?</div>
        <div class="letras-grid">
          ${opciones.map(l=>`<button class="letra-btn" data-letra="${l}">${l}</button>`).join('')}
        </div>
        <button class="next-btn" id="sig-letra" style="display:none">SIGUIENTE ➡️</button>
      </div>`;

    this.container.querySelectorAll('.letra-btn').forEach(btn=>
      btn.addEventListener('click',()=>{
        this.container.querySelectorAll('.letra-btn').forEach(b=>b.disabled=true);
        if(btn.dataset.letra===correcta){
          btn.classList.add('correct');
          const msg=rand(CORRECTO)+` ¡LA PALABRA ${item.palabra} EMPIEZA CON LA LETRA ${correcta}!`;
          this.setRumiMsg(msg,'celebrando');
          if(this.onStar) this.onStar();
        } else {
          btn.classList.add('wrong');
          this.container.querySelectorAll('.letra-btn').forEach(b=>{ if(b.dataset.letra===correcta) b.classList.add('correct'); });
          const msg=rand(INCORRECTO)+` LA PALABRA ${item.palabra} EMPIEZA CON LA LETRA ${correcta}.`;
          this.setRumiMsg(msg,'pensativa');
        }
        document.getElementById('sig-letra').style.display='inline-block';
      })
    );
    document.getElementById('sig-letra').addEventListener('click',()=>this._letraInicial());
  }

  // ════ JUEGO 2: Completar ════════════════════════════
  _completar(){
    const item=rand(PALABRAS.filter(p=>p.palabra.length>=3&&p.palabra.length<=8));
    const palabra=item.palabra;
    const cantOcultas=palabra.length<=4?1:2;
    const indices=shuffle([...Array(palabra.length).keys()]).slice(0,cantOcultas);
    const letrasOcultas=indices.map(i=>palabra[i]);
    const llenadas=new Array(palabra.length).fill(null);
    const distractores=shuffle(ABECEDARIO.filter(l=>!letrasOcultas.includes(l))).slice(0,4);
    const opcionesLetras=shuffle([...letrasOcultas,...distractores]);

    Voz.decir(`COMPLETÁ LA PALABRA. LA PISTA ES: ${item.pista}. ¡TOCÁ LAS LETRAS QUE FALTAN!`, true);

    const render=()=>{
      this.container.innerHTML=`
        <div class="completar-card">
          <div class="hint-emoji">${item.emoji}</div>
          <div class="pregunta-label" style="font-size:0.85rem;color:var(--text-muted)">PISTA: ${item.pista}</div>
          <div class="palabra-display">
            ${palabra.split('').map((l,i)=>
              indices.includes(i)
                ?`<div class="letra-slot ${llenadas[i]?'completa':'vacia'}" data-idx="${i}">${llenadas[i]||'_'}</div>`
                :`<div class="letra-slot">${l}</div>`
            ).join('')}
          </div>
          <div class="opciones-letras">
            ${opcionesLetras.map((l,idx)=>`
              <button class="opcion-letra-btn" data-letra="${l}" data-bidx="${idx}"
                ${llenadas.some((ll,li)=>ll===l&&indices.includes(li))?'disabled':''}>
                ${l}
              </button>`).join('')}
          </div>
          <button class="next-btn" id="sig-completar" style="display:none">SIGUIENTE ➡️</button>
        </div>`;

      this.container.querySelectorAll('.opcion-letra-btn:not([disabled])').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const letra=btn.dataset.letra;
          const huecosVacios=indices.filter(i=>!llenadas[i]);
          if(!huecosVacios.length) return;
          llenadas[huecosVacios[0]]=letra;
          btn.disabled=true;
          const todosLlenos=indices.every(i=>llenadas[i]);
          if(todosLlenos){
            const correcto=indices.every(i=>llenadas[i]===palabra[i]);
            if(correcto){
              this.setRumiMsg(rand(CORRECTO)+` ¡LA PALABRA ES ${palabra}!`,'celebrando');
              if(this.onStar) this.onStar();
            } else {
              this.setRumiMsg(rand(INCORRECTO)+` LA PALABRA CORRECTA ES ${palabra.split('').join(' ')}.`,'pensativa');
            }
            document.getElementById('sig-completar').style.display='inline-block';
          } else {
            const restantes=huecosVacios.length-1;
            if(restantes>0) Voz.decir(`BIEN. FALTA ${restantes===1?'UNA LETRA MÁS':restantes+' LETRAS MÁS'}.`);
          }
          this.container.querySelectorAll('.letra-slot[data-idx]').forEach(slot=>{
            const i=parseInt(slot.dataset.idx);
            if(llenadas[i]){ slot.textContent=llenadas[i]; slot.style.color=llenadas[i]===palabra[i]?'var(--magic-green)':'#FF5050'; }
          });
        });
      });
      document.getElementById('sig-completar')?.addEventListener('click',()=>this._completar());
    };
    render();
  }

  // ════ JUEGO 3: Unir imagen con palabra ══════════════
  _unir(){
    const items=shuffle(PALABRAS).slice(0,4);
    const palabrasShuffled=shuffle(items.map(i=>i.palabra));
    let selectedImg=null;
    let matched=new Set();

    Voz.decir('TOCÁ UNA IMAGEN Y DESPUÉS TOCÁ LA PALABRA QUE LE CORRESPONDE. ¡UNILAS A TODAS!',true);

    const render=()=>{
      this.container.innerHTML=`
        <div class="unir-card">
          <div class="pregunta-label" style="margin-bottom:4px">
            UNÍ CADA IMAGEN CON SU PALABRA
            ${matched.size>0?`<span style="color:var(--magic-green)"> (${matched.size}/4)</span>`:''}
          </div>
          <div class="unir-grid">
            <div class="unir-col">
              <div class="unir-col-title">IMÁGENES</div>
              ${items.map((item,i)=>`
                <div class="unir-item ${matched.has(item.palabra)?'matched':''}"
                     data-type="img" data-idx="${i}" data-palabra="${item.palabra}">
                  <span class="unir-emoji">${item.emoji}</span>
                  ${matched.has(item.palabra)?`<small style="font-size:0.75rem;color:var(--magic-green)">✓ ${item.palabra}</small>`:''}
                </div>`).join('')}
            </div>
            <div class="unir-col">
              <div class="unir-col-title">PALABRAS</div>
              ${palabrasShuffled.map((p,i)=>`
                <div class="unir-item ${matched.has(p)?'matched':''}"
                     data-type="word" data-idx="${i}" data-palabra="${p}">
                  ${p}
                </div>`).join('')}
            </div>
          </div>
          ${matched.size===4?`<button class="next-btn" id="sig-unir">¡OTRO JUEGO! ➡️</button>`:''}
        </div>`;

      document.getElementById('sig-unir')?.addEventListener('click',()=>this._unir());

      this.container.querySelectorAll('.unir-item:not(.matched)').forEach(el=>{
        el.addEventListener('click',()=>{
          const tipo=el.dataset.type, palabra=el.dataset.palabra;
          if(tipo==='img'){
            this.container.querySelectorAll('.unir-item').forEach(e=>e.classList.remove('selected-img','selected-word'));
            el.classList.add('selected-img'); selectedImg=palabra;
            const it=items.find(i=>i.palabra===palabra);
            if(it) Voz.decir(`SELECCIONASTE: ${it.pista}. ¡AHORA BUSCÁ SU PALABRA!`,true);
          } else {
            if(!selectedImg){
              this.container.querySelectorAll('.unir-item').forEach(e=>e.classList.remove('selected-img','selected-word'));
              el.classList.add('selected-word');
              Voz.decir(`SELECCIONASTE LA PALABRA ${palabra}. ¡AHORA TOCÁ SU IMAGEN!`,true);
            } else {
              if(selectedImg===palabra){
                matched.add(palabra);
                this.setRumiMsg(rand(CORRECTO),'celebrando');
                if(this.onStar) this.onStar();
                if(matched.size===4) setTimeout(()=>this.setRumiMsg('¡PERFECTÍSIMO! ¡UNISTE TODAS! ¡SOS UNA GENIA!','celebrando'),500);
              } else {
                el.classList.add('wrong-flash'); setTimeout(()=>el.classList.remove('wrong-flash'),700);
                const imgIt=items.find(i=>i.palabra===selectedImg);
                this.setRumiMsg(`ESA NO ERA. LA IMAGEN DE ${imgIt?.pista||selectedImg} VA CON OTRA PALABRA. ¡INTENTÁ DE NUEVO!`,'pensativa');
              }
              selectedImg=null; setTimeout(()=>render(),600);
            }
          }
        });
      });
    };
    render();
  }

  // ════ JUEGO 4: Ahorcado Mágico ══════════════════════
  _ahorcado(){
    const item=rand(PALABRAS);
    const palabra=item.palabra;
    const maxErrores=6;
    let errores=0, usadas=new Set();

    Voz.decir(`NUEVA PALABRA SECRETA. LA PISTA ES: ${item.pista}. TIENE ${palabra.length} LETRAS. ¡ADIVINÁ!`,true);

    const gali=[
      `<svg width="140" height="160" viewBox="0 0 140 160"><line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/><line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/></svg>`,
      `<svg width="140" height="160" viewBox="0 0 140 160"><line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/><line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/><circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/></svg>`,
      `<svg width="140" height="160" viewBox="0 0 140 160"><line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/><line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/><circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/><line x1="90" y1="54" x2="90" y2="100" stroke="#FF8C42" stroke-width="3"/></svg>`,
      `<svg width="140" height="160" viewBox="0 0 140 160"><line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/><line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/><circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/><line x1="90" y1="54" x2="90" y2="100" stroke="#FF8C42" stroke-width="3"/><line x1="90" y1="65" x2="65" y2="82" stroke="#FF8C42" stroke-width="3"/></svg>`,
      `<svg width="140" height="160" viewBox="0 0 140 160"><line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/><line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/><circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/><line x1="90" y1="54" x2="90" y2="100" stroke="#FF8C42" stroke-width="3"/><line x1="90" y1="65" x2="65" y2="82" stroke="#FF8C42" stroke-width="3"/><line x1="90" y1="65" x2="115" y2="82" stroke="#FF8C42" stroke-width="3"/></svg>`,
      `<svg width="140" height="160" viewBox="0 0 140 160"><line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/><line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/><circle cx="90" cy="42" r="12" stroke="#FF8C42" stroke-width="3" fill="none"/><line x1="90" y1="54" x2="90" y2="100" stroke="#FF8C42" stroke-width="3"/><line x1="90" y1="65" x2="65" y2="82" stroke="#FF8C42" stroke-width="3"/><line x1="90" y1="65" x2="115" y2="82" stroke="#FF8C42" stroke-width="3"/><line x1="90" y1="100" x2="65" y2="130" stroke="#FF8C42" stroke-width="3"/></svg>`,
      `<svg width="140" height="160" viewBox="0 0 140 160"><line x1="20" y1="150" x2="120" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="40" y2="150" stroke="#666" stroke-width="3"/><line x1="40" y1="10" x2="90" y2="10" stroke="#666" stroke-width="3"/><line x1="90" y1="10" x2="90" y2="30" stroke="#666" stroke-width="3"/><circle cx="90" cy="42" r="12" stroke="#FF5050" stroke-width="3" fill="none"/><line x1="90" y1="54" x2="90" y2="100" stroke="#FF5050" stroke-width="3"/><line x1="90" y1="65" x2="65" y2="82" stroke="#FF5050" stroke-width="3"/><line x1="90" y1="65" x2="115" y2="82" stroke="#FF5050" stroke-width="3"/><line x1="90" y1="100" x2="65" y2="130" stroke="#FF5050" stroke-width="3"/><line x1="90" y1="100" x2="115" y2="130" stroke="#FF5050" stroke-width="3"/></svg>`,
    ];

    const cora=()=>'❤️'.repeat(maxErrores-errores)+'🖤'.repeat(errores);

    const render=()=>{
      const adi=palabra.split('').every(l=>usadas.has(l));
      const per=errores>=maxErrores;
      this.container.innerHTML=`
        <div class="ahorcado-card">
          <div class="ahorcado-pista">${item.emoji} <small style="font-size:0.72rem;color:var(--text-muted)">${item.pista}</small></div>
          <div class="ahorcado-layout">
            <div class="ahorcado-dibujo">${gali[errores]}</div>
            <div class="ahorcado-derecha">
              <div class="ahorcado-vidas">${cora()}</div>
              <div class="ahorcado-slots">
                ${palabra.split('').map(l=>`<div class="ahorcado-slot">${usadas.has(l)?l:''}</div>`).join('')}
              </div>
              ${(!adi&&!per)?`<div class="teclado">${ABECEDARIO_ES.map(l=>`
                <button class="tecla ${usadas.has(l)?(palabra.includes(l)?'acierto':'fallo'):''}"
                        data-letra="${l}" ${usadas.has(l)?'disabled':''}>${l}</button>`).join('')}</div>`:''}
              ${adi?`<div style="text-align:center;font-family:var(--font-title);font-size:1.4rem;color:var(--magic-green)">¡ADIVINASTE! 🎉</div>`:''}
              ${per?`<div style="text-align:center;font-family:var(--font-title);color:#FF5050">ERA: <span style="color:var(--magic-yellow)">${palabra}</span></div>`:''}
            </div>
          </div>
          ${(adi||per)?`<button class="next-btn" id="sig-ahorcado">¡OTRA PALABRA! 🔄</button>`:''}
        </div>`;

      document.getElementById('sig-ahorcado')?.addEventListener('click',()=>this._ahorcado());

      this.container.querySelectorAll('.tecla:not([disabled])').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const letra=btn.dataset.letra; usadas.add(letra);
          if(!palabra.includes(letra)){
            errores++;
            const rest=maxErrores-errores;
            if(errores>=maxErrores) this.setRumiMsg(`¡AY! LA PALABRA ERA ${palabra}. ¡PERO APRENDISTE UNA PALABRA NUEVA!`,'pensativa');
            else this.setRumiMsg(`LA LETRA ${letra} NO ESTÁ. TE ${rest===1?'QUEDA UN INTENTO':'QUEDAN '+rest+' INTENTOS'}. ¡SEGUÍ PENSANDO!`,'pensativa');
          } else {
            const quedan=palabra.split('').filter(l=>!usadas.has(l));
            if(quedan.length===0){
              this.setRumiMsg(rand(CORRECTO)+` ¡LA PALABRA ERA ${palabra}!`,'celebrando');
              if(this.onStar) this.onStar();
            } else {
              this.setRumiMsg(`¡BIEN! LA LETRA ${letra} ESTÁ EN LA PALABRA. ¡SEGUÍ BUSCANDO! FALTAN ${quedan.length} LETRAS.`,'feliz');
            }
          }
          render();
        });
      });
    };
    render();
  }

  destroy(){}
}
