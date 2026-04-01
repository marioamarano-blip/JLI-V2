// ══════════════════════════════════════════════════════
//  ENGRANAJES.JS v3 — REESCRITO DESDE CERO
//  Drag funcional, propagación real, ventilador + rana
// ══════════════════════════════════════════════════════

export class EngranajesGame {
  constructor({ container, onStar, setRumiMsg }) {
    this.container  = container;
    this.onStar     = onStar;
    this.setRumiMsg = setRumiMsg || (()=>{});
    this.animFrame  = null;
    this.t          = 0;
    this.yaGanoEstrella = false;
    this.ranaPos    = 0;   // 0=abajo 1=arriba
    this.drag       = null; // { gIdx, x, y }

    // ── BANCO DE ENGRANAJES ──────────────────────────
    // Posiciones del banco calculadas después del render
    this.banco = [
      { id:'g1', r:42, dientes:13, color:'#FF6B9D', label:'GRANDE'  },
      { id:'g2', r:28, dientes: 9, color:'#00D4FF', label:'MEDIANO' },
      { id:'g3', r:18, dientes: 6, color:'#F1C40F', label:'CHICO'   },
      { id:'g4', r:34, dientes:11, color:'#2ECC71', label:'MEDIO+'  },
    ];

    // ── SLOTS FIJOS EN EL CANVAS ─────────────────────
    // Se calculan en base al canvas real, en initSlots()
    this.slots = [
      // slot 0 = motor siempre activo
      { tipo:'motor',      r:28, angulo:0, vel:1,  engranaje:null, gIdx:-1 },
      // slot 1..4 = posiciones para engranajes del banco
      { tipo:'normal',     r:0,  angulo:0, vel:0,  engranaje:null, gIdx:-1 },
      { tipo:'normal',     r:0,  angulo:0, vel:0,  engranaje:null, gIdx:-1 },
      { tipo:'ventilador', r:0,  angulo:0, vel:0,  engranaje:null, gIdx:-1 },
      { tipo:'polea',      r:0,  angulo:0, vel:0,  engranaje:null, gIdx:-1 },
    ];

    this.render();
  }

  // ── POSICIONES FIJAS (calculadas post-render) ──────
  initSlots() {
    const W = this.canvas.width, H = this.canvas.height;
    const mx = W * 0.34; // zona máquina comienza aquí
    this.slotPos = [
      { x: mx + 70,  y: H * 0.50 },  // 0 motor
      { x: mx + 155, y: H * 0.50 },  // 1 engranaje 1
      { x: mx + 155, y: H * 0.22 },  // 2 engranaje 2 (arriba)
      { x: mx + 260, y: H * 0.22 },  // 3 ventilador
      { x: mx + 260, y: H * 0.75 },  // 4 polea / rana
    ];
    // Posiciones del banco izquierdo
    const bx = W * 0.07;
    this.bancoPos = this.banco.map((g,i) => ({
      x: bx + (i%2) * W*0.12,
      y: H * 0.18 + Math.floor(i/2) * H * 0.40,
    }));
  }

  // ── RENDER HTML ───────────────────────────────────
  render() {
    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%">
        <canvas id="gear-canvas" width="800" height="480"
          style="width:100%;max-width:800px;border-radius:16px;background:#09071e;touch-action:none;cursor:grab"></canvas>
        <div id="gear-status" style="font-family:'Fredoka One',cursive;font-size:1.05rem;color:#F1C40F;text-align:center;min-height:30px">
          ARRASTRÁ LOS ENGRANAJES A LOS ESPACIOS DE LA MÁQUINA ⚙️
        </div>
        <button class="circuit-btn" id="btn-reset-gear">🔄 EMPEZAR DE NUEVO</button>
      </div>`;

    this.canvas = document.getElementById('gear-canvas');
    this.ctx    = this.canvas.getContext('2d');
    this.initSlots();

    const ev = (name, fn, opt) => this.canvas.addEventListener(name, fn, opt);
    ev('mousedown',  e => this.down(this.pos(e)));
    ev('mousemove',  e => this.moveD(this.pos(e)));
    ev('mouseup',    e => this.upD(this.pos(e)));
    ev('mouseleave', e => this.upD(this.pos(e)));
    ev('touchstart', e => { e.preventDefault(); this.down(this.pos(e.touches[0])); }, {passive:false});
    ev('touchmove',  e => { e.preventDefault(); this.moveD(this.pos(e.touches[0])); }, {passive:false});
    ev('touchend',   e => { e.preventDefault(); this.upD(this.pos(e.changedTouches[0])); }, {passive:false});

    document.getElementById('btn-reset-gear').addEventListener('click', () => this.reset());

    setTimeout(() => this.setRumiMsg(
      'ARRASTRÁ LOS ENGRANAJES DESDE LA IZQUIERDA A LOS CÍRCULOS PUNTEADOS DE LA MÁQUINA. ¡SI DOS ENGRANAJES SE TOCAN, UNO HACE GIRAR AL OTRO! CONECTÁ EL VENTILADOR Y LA POLEA PARA VER ALGO INCREÍBLE.',
      'feliz'
    ), 700);

    this.loop();
  }

  reset() {
    this.slots.forEach((s,i)=>{ if(i>0){s.engranaje=null;s.gIdx=-1;s.r=0;s.vel=0;s.angulo=0;} });
    this.ranaPos=0; this.yaGanoEstrella=false;
    this.setStatus('ARRASTRÁ LOS ENGRANAJES A LOS ESPACIOS DE LA MÁQUINA ⚙️');
    this.setRumiMsg('¡VOLVEMOS A EMPEZAR! ARRASTRÁ LOS ENGRANAJES A LOS ESPACIOS DE LA MÁQUINA.','feliz');
  }

  pos(e) {
    const r=this.canvas.getBoundingClientRect();
    return { x:(e.clientX-r.left)*(this.canvas.width/r.width), y:(e.clientY-r.top)*(this.canvas.height/r.height) };
  }

  // ── DRAG ─────────────────────────────────────────
  down({x,y}) {
    // ¿Click en engranaje del banco?
    for(let i=0;i<this.banco.length;i++){
      const g=this.banco[i], bp=this.bancoPos[i];
      // Solo si NO está en uso
      const enUso=this.slots.some(s=>s.gIdx===i);
      if(!enUso && Math.hypot(x-bp.x,y-bp.y)<g.r+10){
        this.drag={tipo:'banco',gIdx:i,x,y};
        this.canvas.style.cursor='grabbing';
        return;
      }
    }
    // ¿Click en engranaje ya colocado en slot?
    for(let si=1;si<this.slots.length;si++){
      const s=this.slots[si], sp=this.slotPos[si];
      if(s.gIdx>=0 && Math.hypot(x-sp.x,y-sp.y)<s.r+10){
        this.drag={tipo:'slot',gIdx:s.gIdx,slotIdx:si,x,y};
        s.engranaje=null; s.gIdx=-1; s.r=0; s.vel=0;
        this.propagar();
        this.canvas.style.cursor='grabbing';
        return;
      }
    }
  }

  moveD({x,y}){ if(this.drag){ this.drag.x=x; this.drag.y=y; } }

  upD({x,y}) {
    if(!this.drag){ return; }
    const gIdx=this.drag.gIdx;
    const g=this.banco[gIdx];
    // ¿Soltó sobre un slot vacío?
    let colocado=false;
    for(let si=1;si<this.slots.length;si++){
      const s=this.slots[si], sp=this.slotPos[si];
      if(s.gIdx<0 && Math.hypot(x-sp.x,y-sp.y)<55){
        s.engranaje=g; s.gIdx=gIdx; s.r=g.r;
        this.propagar();
        this.checkLogro();
        colocado=true;
        break;
      }
    }
    this.drag=null;
    this.canvas.style.cursor='grab';
  }

  // ── PROPAGACIÓN DE VELOCIDADES ─────────────────────
  // BFS desde slot 0 (motor). Si dos slots se "tocan" (distancia ≈ r1+r2),
  // el segundo gira en sentido inverso con velocidad proporcional.
  propagar() {
    // Reset velocidades (no el motor)
    for(let i=1;i<this.slots.length;i++) this.slots[i].vel=0;

    const queue=[0];
    const visto=new Set([0]);
    while(queue.length){
      const from=queue.shift();
      const pF=this.slotPos[from], rF=this.slots[from].r||28, velF=this.slots[from].vel;
      for(let to=0;to<this.slots.length;to++){
        if(visto.has(to)) continue;
        if(to>0 && this.slots[to].gIdx<0) continue; // slot vacío
        const pT=this.slotPos[to], rT=this.slots[to].r||28;
        const dist=Math.hypot(pF.x-pT.x,pF.y-pT.y);
        const contacto=rF+rT;
        // Tolerancia ±20px para que sea fácil de activar
        if(dist<contacto+20 && dist>Math.abs(rF-rT)-4){
          this.slots[to].vel = -velF*(rF/rT);
          visto.add(to);
          queue.push(to);
        }
      }
    }
  }

  checkLogro(){
    const vVent=Math.abs(this.slots[3].vel);
    const vPolea=Math.abs(this.slots[4].vel);
    if(!this.yaGanoEstrella && vVent>0.05){
      this.yaGanoEstrella=true;
      this.setStatus('⭐ ¡EL VENTILADOR ESTÁ GIRANDO! ¡GENIAL!');
      this.setRumiMsg('¡GENIAL! ¡EL VENTILADOR ESTÁ GIRANDO! ¿VES CÓMO EL MOVIMIENTO VIAJA DE UN ENGRANAJE AL OTRO? ¡ESO SE LLAMA TRANSMISIÓN DE MOVIMIENTO! ¡SOS UNA INGENIERA!','celebrando');
      if(this.onStar) this.onStar();
    }
    if(vVent>0.05 && vPolea>0.05){
      this.setStatus('🚀 ¡INCREÍBLE! ¡EL VENTILADOR SOPLA Y LA RANA SUBE! ¡MÁQUINA PERFECTA!');
      this.setRumiMsg('¡INCREÍBLE JUANITA! ¡MOVÉS EL VENTILADOR Y LA POLEA AL MISMO TIEMPO! ¡ASÍ FUNCIONAN LAS MÁQUINAS DE VERDAD!','celebrando');
    } else if(vVent>0.05){
      this.setStatus('💨 ¡EL VENTILADOR GIRA! ¡AHORA CONECTÁ LA POLEA PARA QUE SUBA LA RANA!');
    } else if(vPolea>0.05){
      this.setStatus('🐸 ¡LA RANA SUBE! ¡AHORA CONECTÁ EL VENTILADOR!');
      this.setRumiMsg('¡LA RANA ESTÁ SUBIENDO! ¿PODÉS TAMBIÉN HACER GIRAR EL VENTILADOR?','feliz');
    }
  }

  setStatus(msg){ const el=document.getElementById('gear-status'); if(el) el.innerHTML=msg; }

  // ── LOOP ─────────────────────────────────────────
  loop(){
    this.animFrame=requestAnimationFrame(()=>this.loop());
    this.t+=0.025;
    // Actualizar ángulos
    this.slots.forEach(s=>{ s.angulo+=s.vel*0.045; });
    // Mover rana si polea activa
    const vPolea=this.slots[4].vel;
    if(Math.abs(vPolea)>0.05) this.ranaPos=Math.min(1,Math.max(0,this.ranaPos+vPolea*0.004));
    this.draw();
  }

  // ── DIBUJO ───────────────────────────────────────
  draw(){
    const ctx=this.ctx, W=this.canvas.width, H=this.canvas.height;
    ctx.clearRect(0,0,W,H);

    // Fondo
    const bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#09071e'); bg.addColorStop(1,'#0d0b2b');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

    // Grid
    ctx.fillStyle='rgba(255,255,255,0.03)';
    for(let x=20;x<W;x+=28) for(let y=20;y<H;y+=28){ ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill(); }

    // Separador banco/máquina
    const mx=W*0.34;
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1.5; ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(mx-10,20); ctx.lineTo(mx-10,H-20); ctx.stroke();
    ctx.setLineDash([]);

    // Panel banco
    this.drawBancoPanel(W,H);

    // Fondo zona máquina
    ctx.fillStyle='rgba(255,255,255,0.015)';
    ctx.beginPath(); ctx.roundRect(mx,20,W-mx-10,H-40,12); ctx.fill();

    // Slots vacíos: círculos punteados
    const labels=['','ENGRANAJE 1','ENGRANAJE 2','VENTILADOR','POLEA'];
    for(let i=1;i<this.slots.length;i++){
      const sp=this.slotPos[i], s=this.slots[i];
      if(s.gIdx<0){
        ctx.save();
        ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=2; ctx.setLineDash([5,5]);
        ctx.beginPath(); ctx.arc(sp.x,sp.y,40,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.arc(sp.x,sp.y,40,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='bold 10px Nunito,sans-serif'; ctx.textAlign='center';
        ctx.fillText(labels[i],sp.x,sp.y+54); ctx.restore();
      }
    }

    // Líneas de conexión entre slots con engranaje
    for(let i=0;i<this.slots.length;i++){
      for(let j=i+1;j<this.slots.length;j++){
        if((i>0&&this.slots[i].gIdx<0)||(j>0&&this.slots[j].gIdx<0)) continue;
        const pi=this.slotPos[i],pj=this.slotPos[j];
        const ri=this.slots[i].r||28, rj=this.slots[j].r||28;
        const dist=Math.hypot(pi.x-pj.x,pi.y-pj.y);
        if(dist<ri+rj+20 && dist>Math.abs(ri-rj)-4){
          ctx.save();
          ctx.strokeStyle='rgba(255,220,80,0.15)'; ctx.lineWidth=2;
          ctx.beginPath(); ctx.moveTo(pi.x,pi.y); ctx.lineTo(pj.x,pj.y); ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Motor slot 0
    this.drawMotorSlot(this.slotPos[0],this.slots[0]);

    // Engranajes en slots
    for(let i=1;i<this.slots.length;i++){
      const s=this.slots[i];
      if(s.gIdx>=0){
        const g=this.banco[s.gIdx], sp=this.slotPos[i];
        if(s.tipo==='ventilador') this.drawVentilador(sp,s,g);
        else if(s.tipo==='polea') this.drawPolea(sp,s,g,H);
        else this.drawEngranaje(sp.x,sp.y,g.r,g.color,s.angulo,g.dientes,g.label,Math.abs(s.vel));
      }
    }

    // Polea + rana aunque no haya engranaje en slot 4
    if(this.slots[4].gIdx<0) this.drawRanaEsperando(this.slotPos[4],H);

    // Engranaje siendo arrastrado
    if(this.drag){
      const g=this.banco[this.drag.gIdx];
      ctx.save(); ctx.globalAlpha=0.75;
      this.drawEngranaje(this.drag.x,this.drag.y,g.r,g.color,this.t*3,g.dientes,g.label,1);
      ctx.restore();
    }
  }

  drawBancoPanel(W,H){
    const ctx=this.ctx;
    const bw=W*0.28, bx=W*0.02;
    ctx.save();
    ctx.fillStyle='rgba(255,255,255,0.02)'; ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(bx,10,bw,H-20,10); ctx.fill(); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='bold 11px Nunito,sans-serif'; ctx.textAlign='center';
    ctx.fillText('⚙️ TUS ENGRANAJES',bx+bw/2,30);

    this.banco.forEach((g,i)=>{
      const bp=this.bancoPos[i];
      const enUso=this.slots.some(s=>s.gIdx===i);
      if(!enUso){
        const bob=Math.sin(this.t*1.6+i*1.2)*5;
        this.drawEngranaje(bp.x,bp.y+bob,g.r,g.color,this.t*(0.4+i*0.1),g.dientes,g.label,0.7);
        ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='9px Nunito,sans-serif'; ctx.textAlign='center';
        ctx.fillText('ARRASTRÁ →',bp.x,bp.y+g.r+20+bob);
      } else {
        ctx.save();
        ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=2; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.arc(bp.x,bp.y,g.r,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.font='10px Nunito,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('EN USO',bp.x,bp.y); ctx.textBaseline='alphabetic';
        ctx.restore();
      }
    });
    ctx.restore();
  }

  drawMotorSlot(sp,slot){
    const ctx=this.ctx;
    ctx.save();
    ctx.shadowColor='#F1C40F'; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.arc(sp.x,sp.y,slot.r,0,Math.PI*2);
    ctx.fillStyle='#1C2C3E'; ctx.fill();
    ctx.strokeStyle='#F1C40F'; ctx.lineWidth=3; ctx.stroke(); ctx.shadowBlur=0;
    // Flechas giratorias
    for(let i=0;i<3;i++){
      const ang=slot.angulo*2+i*Math.PI*2/3;
      ctx.save(); ctx.translate(sp.x,sp.y); ctx.rotate(ang);
      ctx.fillStyle='#F1C40F';
      ctx.beginPath(); ctx.moveTo(0,-(slot.r-4)); ctx.lineTo(4,-(slot.r+8)); ctx.lineTo(-4,-(slot.r+8)); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.font='16px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⚡',sp.x,sp.y);
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='#F1C40F'; ctx.font='bold 10px Nunito,sans-serif'; ctx.textAlign='center';
    ctx.fillText('MOTOR',sp.x,sp.y+slot.r+15);
    ctx.restore();
  }

  drawEngranaje(x,y,r,color,angulo,dientes,label,velAbs=1,alpha=1){
    const ctx=this.ctx; ctx.save(); ctx.globalAlpha*=alpha;
    ctx.translate(x,y); ctx.rotate(angulo);
    const rInt=r*0.70, rExt=r;
    ctx.beginPath();
    for(let i=0;i<dientes;i++){
      const a0=(i/dientes)*Math.PI*2, a1=((i+0.35)/dientes)*Math.PI*2;
      const a2=((i+0.65)/dientes)*Math.PI*2, a3=((i+1)/dientes)*Math.PI*2;
      if(i===0) ctx.moveTo(Math.cos(a0)*rInt,Math.sin(a0)*rInt);
      ctx.lineTo(Math.cos(a1)*rInt,Math.sin(a1)*rInt);
      ctx.lineTo(Math.cos(a1)*rExt,Math.sin(a1)*rExt);
      ctx.lineTo(Math.cos(a2)*rExt,Math.sin(a2)*rExt);
      ctx.lineTo(Math.cos(a2)*rInt,Math.sin(a2)*rInt);
      ctx.lineTo(Math.cos(a3)*rInt,Math.sin(a3)*rInt);
    }
    ctx.closePath();
    const g=ctx.createRadialGradient(0,0,r*0.1,0,0,r);
    g.addColorStop(0,color); g.addColorStop(1,this.darken(color,0.4));
    ctx.fillStyle=g; ctx.shadowColor=color; ctx.shadowBlur=velAbs>0.1?10:4; ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.shadowBlur=0;
    // Centro
    ctx.beginPath(); ctx.arc(0,0,r*0.28,0,Math.PI*2); ctx.fillStyle='rgba(0,0,0,0.4)'; ctx.fill();
    ctx.beginPath(); ctx.arc(0,0,r*0.12,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill();
    // Agujeros decorativos
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2; ctx.beginPath(); ctx.arc(Math.cos(a)*r*0.48,Math.sin(a)*r*0.48,r*0.08,0,Math.PI*2);
      ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.font='bold 10px Nunito,sans-serif'; ctx.textAlign='center';
    ctx.fillText(label,x,y+r+14); ctx.restore();
  }

  drawVentilador(sp,slot,g){
    // Dibuja el engranaje + aspas del ventilador encima
    this.drawEngranaje(sp.x,sp.y,g.r,g.color,slot.angulo,g.dientes,g.label,Math.abs(slot.vel));
    const ctx=this.ctx, vel=slot.vel, girando=Math.abs(vel)>0.05;
    ctx.save(); ctx.translate(sp.x,sp.y);
    // Marco ventilador
    ctx.beginPath(); ctx.arc(0,0,g.r+16,0,Math.PI*2);
    ctx.strokeStyle=girando?'#00D4FF':'rgba(0,212,255,0.3)';
    ctx.lineWidth=2.5; ctx.shadowColor=girando?'#00D4FF':'transparent'; ctx.shadowBlur=girando?16:0; ctx.stroke(); ctx.shadowBlur=0;
    // Aspas
    for(let i=0;i<5;i++){
      const ang=slot.angulo*vel*50+i*Math.PI*2/5;
      ctx.save(); ctx.rotate(ang);
      ctx.fillStyle=`hsla(${185+i*14},90%,${girando?65:35}%,0.9)`;
      ctx.beginPath(); ctx.ellipse(g.r*0.65,0,g.r*0.6,g.r*0.18,0.4,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0,0,7,0,Math.PI*2); ctx.fillStyle='#00D4FF'; ctx.fill();
    // Viento
    if(girando){
      for(let i=0;i<3;i++){
        const off=(this.t*2.5+i*0.7)%1;
        ctx.strokeStyle=`rgba(0,212,255,${0.6-off*0.55})`; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(0,0,g.r+20+off*28,-0.45,0.45); ctx.stroke();
      }
    }
    ctx.restore();
    ctx.fillStyle=girando?'#00D4FF':'#888'; ctx.font='bold 10px Nunito,sans-serif'; ctx.textAlign='center';
    ctx.fillText(girando?'💨 SOPLANDO!':'💨 VENTILADOR',sp.x,sp.y+g.r+32);
  }

  drawPolea(sp,slot,g,H){
    this.drawEngranaje(sp.x,sp.y,g.r,g.color,slot.angulo,g.dientes,'',Math.abs(slot.vel));
    const ctx=this.ctx, girando=Math.abs(slot.vel)>0.05;
    // Cuerda + rana
    const cX=sp.x+g.r+10;
    const topY=sp.y+g.r+6, botY=H-36;
    const ranaY=botY-this.ranaPos*(botY-topY-50);
    ctx.save();
    // Cuerda
    ctx.strokeStyle='#C8903C'; ctx.lineWidth=3; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(cX,topY); ctx.lineTo(cX,ranaY+22); ctx.stroke();
    // Contrapeso lado izquierdo
    const cX2=sp.x-g.r-10;
    ctx.beginPath(); ctx.moveTo(cX2,topY); ctx.lineTo(cX2,botY-18); ctx.stroke();
    ctx.fillStyle='#666'; ctx.beginPath(); ctx.roundRect(cX2-10,botY-28,20,22,4); ctx.fill();
    // Rana
    ctx.font='28px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🐸',cX,ranaY);
    ctx.font='bold 9px Nunito,sans-serif'; ctx.fillStyle=girando?'#2ECC71':'#888'; ctx.textBaseline='alphabetic';
    ctx.fillText(girando?(this.ranaPos>0.85?'¡LLEGUÉ!':'¡SUBIENDO!'):'¡ESPERANDO!',cX,ranaY+26);
    // Rueda polea
    ctx.translate(sp.x,sp.y); ctx.rotate(slot.angulo*slot.vel*35);
    ctx.beginPath(); ctx.arc(0,0,g.r*0.75,0,Math.PI*2);
    ctx.strokeStyle='#C8903C'; ctx.lineWidth=4; ctx.stroke();
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2; ctx.beginPath(); ctx.moveTo(0,0);
      ctx.lineTo(Math.cos(a)*g.r*0.7,Math.sin(a)*g.r*0.7); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle=girando?'#2ECC71':'#888'; ctx.font='bold 10px Nunito,sans-serif'; ctx.textAlign='center';
    ctx.fillText('🐸 POLEA',sp.x,sp.y+g.r+32);
  }

  drawRanaEsperando(sp,H){
    const ctx=this.ctx;
    const botY=H-36;
    ctx.save();
    ctx.font='28px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.globalAlpha=0.4; ctx.fillText('🐸',sp.x+50,botY);
    ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='bold 9px Nunito,sans-serif';
    ctx.fillText('¡PONÉ UN ENGRANAJE\nEN LA POLEA!',sp.x+50,botY+28);
    ctx.restore();
  }

  darken(hex,a){ const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgb(${Math.floor(r*a)},${Math.floor(g*a)},${Math.floor(b*a)})`; }

  destroy(){ if(this.animFrame) cancelAnimationFrame(this.animFrame); }
}
