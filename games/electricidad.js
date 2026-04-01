// ══════════════════════════════════════════════════════
//  ELECTRICIDAD.JS v3
//  - Lámpara se enciende con brillo real al cerrar circuito
//  - Motor gira al cerrar circuito
//  - Celebración con confetti y mensaje de Rumi
// ══════════════════════════════════════════════════════

export class ElectricidadGame {
  constructor({ container, onStar, setRumiMsg }) {
    this.container   = container;
    this.onStar      = onStar;
    this.setRumiMsg  = setRumiMsg || (() => {});
    this.cables      = [];
    this.dragging    = null;
    this.interruptorCerrado = false;
    this.circuitoActivo     = false;
    this.lamparaOn   = false;
    this.motorOn     = false;
    this.animFrame   = null;
    this.t           = 0;
    this.yaGanoEstrella     = false;
    this.celebrando  = false;   // flag de animación de celebración
    this.celebT      = 0;

    this.render();

    setTimeout(() => this.setRumiMsg(
      'FIJATE EN LA BATERÍA: EL POLO POSITIVO ES ROJO Y EL NEGATIVO ES AZUL. ARRASTRÁ UN CABLE DESDE EL POSITIVO HASTA EL INTERRUPTOR, LUEGO A LA LÁMPARA O AL MOTOR, Y VOLVÉ AL NEGATIVO. ¡DESPUÉS CERRÁ EL INTERRUPTOR!',
      'feliz'
    ), 700);
  }

  // ── LAYOUT ────────────────────────────────────────────
  getLayout(W, H) {
    return {
      bateria: {
        id:'bateria', label:'BATERÍA', cx:W*0.13, cy:H*0.50, w:72, h:110,
        terminals:{
          pos:{ key:'pos', x:W*0.13, y:H*0.50-62, color:'#FF4040', label:'+' },
          neg:{ key:'neg', x:W*0.13, y:H*0.50+62, color:'#5588FF', label:'−' },
        }
      },
      interruptor:{
        id:'interruptor', label:'INTERRUPTOR', cx:W*0.50, cy:H*0.13, w:110, h:48,
        terminals:{
          a:{ key:'a', x:W*0.50-60, y:H*0.13, color:'#DDD', label:'' },
          b:{ key:'b', x:W*0.50+60, y:H*0.13, color:'#DDD', label:'' },
        }
      },
      lampara:{
        id:'lampara', label:'LÁMPARA', cx:W*0.82, cy:H*0.30, r:36,
        terminals:{
          a:{ key:'a', x:W*0.82, y:H*0.30-50, color:'#DDD', label:'' },
          b:{ key:'b', x:W*0.82, y:H*0.30+50, color:'#DDD', label:'' },
        }
      },
      motor:{
        id:'motor', label:'MOTOR', cx:W*0.82, cy:H*0.78, r:36,
        terminals:{
          a:{ key:'a', x:W*0.82, y:H*0.78-50, color:'#DDD', label:'' },
          b:{ key:'b', x:W*0.82, y:H*0.78+50, color:'#DDD', label:'' },
        }
      },
    };
  }

  allTerminals() {
    const L = this.getLayout(this.canvas.width, this.canvas.height);
    return Object.values(L).flatMap(c => Object.values(c.terminals).map(t=>({compId:c.id,...t})));
  }

  nearTerminal(x,y,r=24){ return this.allTerminals().find(t=>Math.hypot(t.x-x,t.y-y)<r); }

  // ── HTML ──────────────────────────────────────────────
  render() {
    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:100%">
        <canvas id="circuit-canvas" width="800" height="480"
          style="width:100%;max-width:800px;border-radius:16px;border:2px solid rgba(241,196,15,0.3);
                 cursor:crosshair;touch-action:none;background:#09071e"></canvas>
        <div id="circuit-status"
          style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#F1C40F;min-height:34px;text-align:center;padding:2px 8px">
          CONECTÁ LOS CABLES PARA CERRAR EL CIRCUITO ⚡
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">
          <button class="circuit-btn" id="btn-sw">🔘 ABRIR / CERRAR INTERRUPTOR</button>
          <button class="circuit-btn" id="btn-clear">🗑️ BORRAR CABLES</button>
          <button class="circuit-btn" id="btn-hint">💡 PISTA</button>
        </div>
        <div id="circuit-hint" style="display:none;color:var(--text-muted);font-size:0.82rem;
          text-align:center;max-width:520px;padding:6px 12px;background:rgba(255,255,255,0.05);border-radius:10px">
          + BATERÍA → INTERRUPTOR A → INTERRUPTOR B → LÁMPARA A → LÁMPARA B → − BATERÍA<br>
          O: + BATERÍA → INTERRUPTOR A → INTERRUPTOR B → MOTOR A → MOTOR B → − BATERÍA
        </div>
      </div>`;

    this.canvas = document.getElementById('circuit-canvas');
    this.ctx    = this.canvas.getContext('2d');

    const on = (ev,fn) => this.canvas.addEventListener(ev, fn);
    on('mousedown',  e => this.down(this.pos(e)));
    on('mousemove',  e => this.move(this.pos(e)));
    on('mouseup',    e => this.up(this.pos(e)));
    on('mouseleave', e => this.up(this.pos(e)));
    on('touchstart', e => { e.preventDefault(); this.down(this.pos(e.touches[0])); }, {passive:false});
    on('touchmove',  e => { e.preventDefault(); this.move(this.pos(e.touches[0])); }, {passive:false});
    on('touchend',   e => { e.preventDefault(); this.up(this.pos(e.changedTouches[0])); }, {passive:false});

    document.getElementById('btn-sw').addEventListener('click', ()=>{
      this.interruptorCerrado = !this.interruptorCerrado;
      this.verificar();
    });
    document.getElementById('btn-clear').addEventListener('click', ()=>{
      this.cables=[]; this.circuitoActivo=false; this.lamparaOn=false; this.motorOn=false;
      this.yaGanoEstrella=false; this.celebrando=false;
      this.setStatus('CABLES BORRADOS. ¡A CONECTAR DE NUEVO! 🔌');
    });
    document.getElementById('btn-hint').addEventListener('click', ()=>{
      const h=document.getElementById('circuit-hint');
      h.style.display = h.style.display==='none'?'block':'none';
    });

    this.loop();
  }

  pos(e){
    const r=this.canvas.getBoundingClientRect();
    return { x:(e.clientX-r.left)*(this.canvas.width/r.width), y:(e.clientY-r.top)*(this.canvas.height/r.height) };
  }

  down({x,y}){ const t=this.nearTerminal(x,y); if(t) this.dragging={from:t,curX:x,curY:y}; }
  move({x,y}){ if(this.dragging){this.dragging.curX=x;this.dragging.curY=y;} }
  up({x,y}){
    if(!this.dragging) return;
    const dest=this.nearTerminal(x,y);
    if(dest && dest.compId!==this.dragging.from.compId){
      const a=this.dragging.from, b=dest;
      const existe=this.cables.some(c=>
        (c.a.compId===a.compId&&c.a.key===a.key&&c.b.compId===b.compId&&c.b.key===b.key)||
        (c.b.compId===a.compId&&c.b.key===a.key&&c.a.compId===b.compId&&c.a.key===b.key)
      );
      if(!existe){
        const desdePos=(a.compId==='bateria'&&a.key==='pos')||(b.compId==='bateria'&&b.key==='pos');
        const desdeNeg=(a.compId==='bateria'&&a.key==='neg')||(b.compId==='bateria'&&b.key==='neg');
        const color = desdePos?'#FF4040':desdeNeg?'#5588FF':'#AAAAAA';
        this.cables.push({a,b,color});
        this.verificar();
      }
    }
    this.dragging=null;
  }

  // ── LÓGICA ───────────────────────────────────────────
  verificar(){
    const grafo={};
    const add=(u,v)=>{ (grafo[u]=grafo[u]||[]).push(v); (grafo[v]=grafo[v]||[]).push(u); };
    this.cables.forEach(c=>add(`${c.a.compId}:${c.a.key}`,`${c.b.compId}:${c.b.key}`));
    if(this.interruptorCerrado) add('interruptor:a','interruptor:b');

    const visited=new Set();
    const dfs=n=>{ if(n==='bateria:neg') return true; visited.add(n); return (grafo[n]||[]).some(v=>!visited.has(v)&&dfs(v)); };
    const hayCircuito=dfs('bateria:pos');

    this.circuitoActivo = hayCircuito;
    this.lamparaOn = hayCircuito && this.interruptorCerrado && (visited.has('lampara:a')||visited.has('lampara:b'));
    this.motorOn   = hayCircuito && this.interruptorCerrado && (visited.has('motor:a')  ||visited.has('motor:b'));

    if(hayCircuito && this.interruptorCerrado){
      const queLuz = this.lamparaOn && this.motorOn ? '¡LA LÁMPARA BRILLA Y EL MOTOR GIRA!' : this.lamparaOn ? '¡LA LÁMPARA SE ENCENDIÓ!' : '¡EL MOTOR ESTÁ GIRANDO!';
      this.setStatus(`⚡ ¡CIRCUITO CERRADO! ${queLuz} 🎉`);
      if(!this.yaGanoEstrella){
        this.yaGanoEstrella = true;
        this.celebrando = true; this.celebT = 0;
        this.setRumiMsg(`¡INCREÍBLE JUANITA! ¡CERRASTE EL CIRCUITO! ${queLuz} ¡LA ELECTRICIDAD FLUYE Y VOS LO HICISTE POSIBLE! ¡SOS UNA INGENIERA DE VERDAD!`, 'celebrando');
        if(this.onStar) this.onStar();
      }
    } else if(hayCircuito && !this.interruptorCerrado){
      this.setStatus('🔘 ¡EL CIRCUITO ESTÁ LISTO! CERRÁ EL INTERRUPTOR PARA ACTIVARLO');
      this.setRumiMsg('¡MUY BIEN! ¡LOS CABLES ESTÁN CONECTADOS! AHORA APRETÁ EL BOTÓN PARA CERRAR EL INTERRUPTOR. ¡YA CASI!','feliz');
    } else {
      this.setStatus('🔌 SEGUÍ CONECTANDO... EL CIRCUITO NO ESTÁ COMPLETO AÚN');
    }
  }

  setStatus(msg){ const el=document.getElementById('circuit-status'); if(el) el.innerHTML=msg; }

  // ── LOOP ─────────────────────────────────────────────
  loop(){ this.animFrame=requestAnimationFrame(()=>this.loop()); this.t+=0.04; if(this.celebrando){this.celebT+=0.04;if(this.celebT>5)this.celebrando=false;} this.draw(); }

  draw(){
    const ctx=this.ctx, W=this.canvas.width, H=this.canvas.height;
    ctx.clearRect(0,0,W,H);

    // Fondo
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#09071e'); bg.addColorStop(1,'#0d0b2b');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Si la lámpara está encendida, el fondo se ilumina suavemente
    if(this.lamparaOn && this.interruptorCerrado){
      const glow=ctx.createRadialGradient(W*0.82,H*0.30,10,W*0.82,H*0.30,W*0.6);
      const p=0.12+0.06*Math.sin(this.t*4);
      glow.addColorStop(0,`rgba(255,240,60,${p})`);
      glow.addColorStop(1,'rgba(255,200,0,0)');
      ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
    }

    // Grid
    ctx.fillStyle='rgba(255,255,255,0.03)';
    for(let x=20;x<W;x+=28) for(let y=20;y<H;y+=28){ ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill(); }

    const L=this.getLayout(W,H);
    const activo=this.circuitoActivo&&this.interruptorCerrado;

    this.cables.forEach(c=>this.drawWire(c.a.x,c.a.y,c.b.x,c.b.y,c.color,activo));
    if(this.dragging) this.drawWire(this.dragging.from.x,this.dragging.from.y,this.dragging.curX,this.dragging.curY,'rgba(255,255,255,0.4)',false,true);

    this.drawBateria(L.bateria);
    this.drawInterruptor(L.interruptor);
    this.drawLampara(L.lampara);
    this.drawMotor(L.motor);
    this.allTerminals().forEach(t=>this.drawTerminal(t));

    // Celebración: partículas de chispas
    if(this.celebrando){
      for(let i=0;i<8;i++){
        const ang=this.celebT*3+i*Math.PI/4;
        const dist=40+30*Math.sin(this.celebT*5+i);
        const cx2=W*0.82+Math.cos(ang)*dist, cy2=H*(this.lamparaOn?0.30:0.78)+Math.sin(ang)*dist;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx2,cy2,3+2*Math.sin(this.celebT*8+i),0,Math.PI*2);
        ctx.fillStyle=`hsl(${(this.celebT*200+i*45)%360},100%,70%)`;
        ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=8; ctx.fill();
        ctx.restore();
      }
    }
  }

  drawWire(x1,y1,x2,y2,color,energizado,enCurso=false){
    const ctx=this.ctx; ctx.save();
    if(energizado){ ctx.shadowColor=color; ctx.shadowBlur=14; ctx.setLineDash([14,8]); ctx.lineDashOffset=-this.t*14; }
    ctx.strokeStyle=enCurso?'rgba(255,255,255,0.35)':color;
    ctx.lineWidth=energizado?5:3; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(x1,y1);
    const mx=(x1+x2)/2; ctx.bezierCurveTo(mx,y1,mx,y2,x2,y2);
    ctx.stroke(); ctx.restore();
  }

  drawTerminal(t){
    const ctx=this.ctx;
    const activo=this.dragging?.from?.compId===t.compId&&this.dragging?.from?.key===t.key;
    ctx.save();
    ctx.beginPath(); ctx.arc(t.x,t.y,activo?11:8,0,Math.PI*2);
    ctx.fillStyle=t.color||'#CCC';
    if(activo){ctx.shadowColor=t.color;ctx.shadowBlur=18;}
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1.5; ctx.stroke();
    if(t.label){ ctx.fillStyle='white'; ctx.font='bold 10px Nunito,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(t.label,t.x,t.y); }
    ctx.restore();
  }

  drawBateria(b){
    const ctx=this.ctx; const{cx,cy,w,h}=b; const x=cx-w/2,y=cy-h/2;
    ctx.save();
    ctx.shadowColor='#F1C40F'; ctx.shadowBlur=this.circuitoActivo?20:6;
    ctx.fillStyle='#1C2C3E'; ctx.beginPath(); ctx.roundRect(x,y,w,h,10); ctx.fill();
    ctx.strokeStyle='#F1C40F'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.roundRect(x,y,w,h,10); ctx.stroke();
    ctx.fillStyle='#FF4040'; ctx.beginPath(); ctx.roundRect(x+3,y+3,w-6,h/2-6,[8,8,0,0]); ctx.fill();
    ctx.fillStyle='#2244AA'; ctx.beginPath(); ctx.roundRect(x+3,y+h/2+3,w-6,h/2-6,[0,0,8,8]); ctx.fill();
    ctx.fillStyle='white'; ctx.font='bold 26px Fredoka One,cursive'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('+',cx,cy-h/4); ctx.fillText('−',cx,cy+h/4);
    ctx.fillStyle='#F1C40F'; ctx.font='bold 11px Nunito,sans-serif'; ctx.fillText('🔋 '+b.label,cx,y-14);
    ctx.restore();
  }

  drawInterruptor(sw){
    const ctx=this.ctx; const{cx,cy,w,h}=sw; const x=cx-w/2,y=cy-h/2;
    const ta=sw.terminals.a,tb=sw.terminals.b;
    ctx.save();
    ctx.fillStyle='#1C2C3E'; ctx.beginPath(); ctx.roundRect(x,y,w,h,8); ctx.fill();
    const col=this.interruptorCerrado?'#2ECC71':'#FF6B6B';
    ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.beginPath(); ctx.roundRect(x,y,w,h,8); ctx.stroke();
    ctx.strokeStyle=col; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.shadowColor=col; ctx.shadowBlur=this.interruptorCerrado?12:4;
    ctx.beginPath(); ctx.moveTo(ta.x,ta.y);
    if(this.interruptorCerrado) ctx.lineTo(tb.x,tb.y);
    else ctx.lineTo(ta.x+(tb.x-ta.x)*0.55,ta.y-28);
    ctx.stroke(); ctx.shadowBlur=0;
    ctx.fillStyle=col; ctx.font='bold 11px Nunito,sans-serif'; ctx.textAlign='center';
    ctx.fillText(this.interruptorCerrado?'🟢 CERRADO':'🔴 ABIERTO',cx,y-14);
    ctx.restore();
  }

  drawLampara(l){
    const ctx=this.ctx; const{cx,cy,r}=l;
    const on=this.lamparaOn&&this.interruptorCerrado;
    const pulso=on?0.7+0.3*Math.sin(this.t*5):0;
    ctx.save();
    // Halo grande de luz cuando está encendida
    if(on){
      const grd=ctx.createRadialGradient(cx,cy,4,cx,cy,r*4.5);
      grd.addColorStop(0,`rgba(255,248,100,${0.7*pulso})`);
      grd.addColorStop(0.4,`rgba(255,220,40,${0.3*pulso})`);
      grd.addColorStop(1,'rgba(255,180,0,0)');
      ctx.fillStyle=grd; ctx.fillRect(cx-r*5,cy-r*5,r*10,r*10);
    }
    // Globo
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    const bright=on?Math.round(180+75*pulso):30;
    ctx.fillStyle=on?`rgb(255,${bright},30)`:'#1C2C3E';
    ctx.shadowColor=on?'#FFE840':'transparent'; ctx.shadowBlur=on?30:0;
    ctx.fill();
    ctx.strokeStyle=on?'#FFE840':'#F1C40F'; ctx.lineWidth=3; ctx.stroke(); ctx.shadowBlur=0;
    // Filamento
    ctx.strokeStyle=on?'#FF6000':'#334'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(cx-12,cy+10); ctx.quadraticCurveTo(cx,cy-12,cx+12,cy+10); ctx.stroke();
    // Destellos cuando está encendida
    if(on){
      const rayos=6;
      for(let i=0;i<rayos;i++){
        const ang=this.t*2+i*Math.PI*2/rayos;
        const r1=r+6, r2=r+14+6*Math.sin(this.t*6+i);
        ctx.strokeStyle=`rgba(255,240,80,${0.5+0.4*Math.sin(this.t*4+i)})`;
        ctx.lineWidth=2; ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(ang)*r1,cy+Math.sin(ang)*r1);
        ctx.lineTo(cx+Math.cos(ang)*r2,cy+Math.sin(ang)*r2);
        ctx.stroke();
      }
      ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('💡',cx,cy);
    }
    ctx.fillStyle=on?'#FFE840':'#888'; ctx.font='bold 11px Nunito,sans-serif'; ctx.textAlign='center';
    ctx.fillText('💡 '+l.label,cx,cy-r-16);
    ctx.restore();
  }

  drawMotor(m){
    const ctx=this.ctx; const{cx,cy,r}=m;
    const on=this.motorOn&&this.interruptorCerrado;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle='#1C2C3E';
    ctx.shadowColor=on?'#FF8C42':'transparent'; ctx.shadowBlur=on?20:0;
    ctx.fill(); ctx.strokeStyle='#FF8C42'; ctx.lineWidth=3; ctx.stroke(); ctx.shadowBlur=0;
    if(on){
      // Hélice con 4 aspas girando rápido
      for(let i=0;i<4;i++){
        const ang=this.t*6+i*Math.PI/2;
        ctx.save(); ctx.translate(cx,cy); ctx.rotate(ang);
        const g=ctx.createLinearGradient(-r*0.8,0,r*0.8,0);
        g.addColorStop(0,`hsl(${20+i*70},100%,55%)`); g.addColorStop(1,`hsl(${50+i*70},100%,70%)`);
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.ellipse(0,0,r*0.82,r*0.20,0,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2); ctx.fillStyle='#FF8C42'; ctx.fill();
      // Ondas de vibración
      for(let i=1;i<=3;i++){
        const alpha=Math.max(0,(0.4-i*0.1)*Math.abs(Math.sin(this.t*8)));
        ctx.beginPath(); ctx.arc(cx,cy,r+i*10,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,140,66,${alpha})`; ctx.lineWidth=2; ctx.stroke();
      }
    } else {
      ctx.font='28px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🌀',cx,cy);
    }
    ctx.fillStyle=on?'#FF8C42':'#888'; ctx.font='bold 11px Nunito,sans-serif'; ctx.textAlign='center';
    ctx.fillText('🌀 '+m.label,cx,cy-r-16);
    ctx.restore();
  }

  destroy(){ if(this.animFrame) cancelAnimationFrame(this.animFrame); }
}
