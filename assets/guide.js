/* guide.js — כותרת, עמודי קטגוריה (בלוקים מוסברים + חידון), התקדמות */
(function(){
  const root=document.body.dataset.root||'';
  const SCRATCH_URL='https://scratch.mit.edu/projects/editor/';
  const store={
    get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
    set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  };
  const done=()=>{ try{ return JSON.parse(store.get('sg-done')||'{}'); }catch(e){ return {}; } };
  const markDone=id=>{ const d=done(); d[id]=1; store.set('sg-done',JSON.stringify(d)); };

  /* ---- שפה: עברית בלבד / עברית + אנגלית ---- */
  function applyLang(m){ document.body.classList.remove('lang-he','lang-en'); if(m==='he') document.body.classList.add('lang-he'); }
  let lang=store.get('sg-lang')||'both';
  applyLang(lang);

  /* ---- סמל הדגל ---- */
  document.body.insertAdjacentHTML('afterbegin','<svg style="display:none" xmlns="http://www.w3.org/2000/svg"><symbol id="flag" viewBox="0 0 20 20"><path d="M4 2.4v15.2" stroke="#3B8C43" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M5.3 3.4c3.6-2.2 7.2 2.1 11.4 0v7.5c-4.2 2.1-7.8-2.2-11.4 0z" fill="#4CBB5B" stroke="#3B8C43" stroke-width="1"/></symbol></svg>');

  /* ---- כותרת עליונה ---- */
  const top=document.getElementById('top');
  if(top){
    top.className='top';
    top.innerHTML=`<div class="wrap">
      <a class="home" href="${root}index.html">מדריך סקראץ' להורים</a>
      <button class="btn ghost" id="langBtn" type="button" aria-label="החלפת שפת הבלוקים"></button>
      <a class="btn" href="${SCRATCH_URL}" target="_blank" rel="noopener">כניסה לסקראץ' ↗</a>
    </div>`;
    const lb=document.getElementById('langBtn');
    const paint=()=>{ lb.textContent=lang==='he'?'עברית בלבד':'עברית + English'; };
    paint();
    lb.addEventListener('click',()=>{ lang=lang==='he'?'both':'he'; store.set('sg-lang',lang); applyLang(lang); paint(); });
  }

  /* ---- עמוד קטגוריה ---- */
  const catId=document.body.dataset.cat;
  const G=window.GUIDE;
  if(catId && G){
    const c=G.cats[catId], app=document.getElementById('app');
    const idx=G.order.indexOf(catId), prev=G.order[idx-1], next=G.order[idx+1];
    document.body.classList.add('cat-page');
    document.title=`${c.he} | מדריך סקראץ' להורים`;
    app.style.setProperty('--c',c.color);
    app.innerHTML=`
      <div class="cat-hero"><div class="wrap">
        <div class="crumbs"><a href="${root}index.html">← כל הנושאים</a></div>
        <h1 style="margin:.1em 0;font-size:clamp(1.8rem,6vw,2.6rem);font-weight:800">${c.he} <span style="direction:ltr;display:inline-block;color:var(--ink-faint);font-size:.5em;font-weight:600">${c.en}</span></h1>
        <p style="margin:.3rem 0 0;color:var(--ink-soft);font-size:1.08rem;max-width:40rem">${c.lead}</p>
      </div></div>
      <div class="wrap">
        <h2>הבלוקים החשובים <small style="font-weight:600;color:var(--ink-faint);font-size:.7em">(לחצו על בלוק להסבר)</small></h2>
        <div class="blocks" id="blocks"></div>
        <div class="note"><b>טיפ להורה:</b> ${c.tip}</div>
        <h2>בדקו את עצמכם</h2>
        <div class="quiz" id="quiz"></div>
        <nav class="pager" aria-label="מעבר בין נושאים">
          ${prev?`<a class="btn ghost" href="${prev}.html">→ ${G.cats[prev].he}</a>`:'<span></span>'}
          ${next?`<a class="btn" href="${next}.html">${G.cats[next].he} ←</a>`:`<a class="btn" href="${root}characters.html">דמויות ורקעים ←</a>`}
        </nav>
      </div>`;
    const bl=document.getElementById('blocks');
    c.blocks.forEach((b,i)=>{
      const el=document.createElement('div');
      el.className='bcard cat-'+catId; el.style.setProperty('--c',c.color); el.style.setProperty('--cd',c.color);
      el.innerHTML=`<button type="button" aria-expanded="false" aria-controls="d${i}">
          <span class="bwrap blk-lg">${b.html}</span><span class="hint">מה זה עושה?</span></button>
        <div class="detail" id="d${i}" role="region"><dl>
          <div><dt>מה הוא עושה</dt><dd>${b.what}</dd></div>
          <div><dt>דוגמה מהחוג</dt><dd>${b.example}</dd></div>
          <div><dt>שאלה טובה לשאול את הילד</dt><dd class="ask">${b.ask}</dd></div>
          <div><dt>טעות נפוצה</dt><dd>${b.mistake}</dd></div></dl></div>`;
      const btn=el.querySelector('button');
      btn.addEventListener('click',()=>{ const o=el.classList.toggle('open'); btn.setAttribute('aria-expanded',o); });
      bl.appendChild(el);
    });

    /* חידון */
    const qz=document.getElementById('quiz'); let score=0, answered=0;
    const shuffleLabels=['א','ב','ג','ד'];
    c.quiz.forEach((q,qi)=>{
      const box=document.createElement('div'); box.className='q';
      box.innerHTML=`<p>${qi+1}. ${q.q}</p><div class="opts"></div><div class="fb" aria-live="polite"></div>`;
      const opts=box.querySelector('.opts'), fb=box.querySelector('.fb');
      /* ערבוב סדר התשובות בכל טעינה, כדי שהנכונה לא תמיד תהיה א' */
      const order=q.o.map((_,i)=>i);
      for(let i=order.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
      const correctPos=order.indexOf(q.a);
      order.forEach((src,pos)=>{
        const b=document.createElement('button'); b.type='button'; b.className='opt'; b.textContent=`${shuffleLabels[pos]}. ${q.o[src]}`;
        b.addEventListener('click',()=>{
          opts.querySelectorAll('button').forEach(x=>x.disabled=true);
          answered++;
          if(pos===correctPos){ b.classList.add('right'); score++; fb.textContent='נכון! '+q.w; }
          else { b.classList.add('wrong'); opts.children[correctPos].classList.add('right'); fb.textContent='לא בדיוק. '+q.w; }
          if(answered===c.quiz.length){
            const s=document.getElementById('score');
            s.textContent=`סיימתם: ${score} מתוך ${c.quiz.length}`+(score===c.quiz.length?' — מצוין!':' — אפשר לעבור שוב על הבלוקים ולנסות שוב.');
            markDone(catId);
          }
        });
        opts.appendChild(b);
      });
      qz.appendChild(box);
    });
    qz.insertAdjacentHTML('beforeend','<div class="score" id="score" aria-live="polite"></div>');
  }

  /* ---- דף הבית: סימון נושאים שהושלמו ---- */
  document.querySelectorAll('a.tile[data-id]').forEach(a=>{
    if(done()[a.dataset.id]) a.classList.add('is-done');
  });
})();
