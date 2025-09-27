// Basic login (no backend) - checks non-empty credentials and redirects
document.addEventListener('DOMContentLoaded', ()=>{
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const u = document.getElementById('user').value.trim();
      const p = document.getElementById('pass').value.trim();
      if(!u || !p){ alert('Por favor ingresa usuario y contraseña'); return; }
      // simple demo check (optional preset)
      // allow any credentials but store a flag
      sessionStorage.setItem('kanban-auth','true');
      // redirect to dashboard
      window.location.href = 'dashboard.html';
    });
  }

  // protect dashboard
  if(location.pathname.endsWith('dashboard.html')){
    const auth = sessionStorage.getItem('kanban-auth');
    if(!auth){ window.location.href = 'index.html'; }
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
      sessionStorage.removeItem('kanban-auth');
      window.location.href = 'index.html';
    });
  }

  // NAV highlighting using IntersectionObserver
  const sections = document.querySelectorAll('main .card, header');
  const navLinks = document.querySelectorAll('.nav-link');
  if(sections.length && navLinks.length){
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const id = entry.target.id;
        const link = document.querySelector('.nav-link[href="#'+id+'"]');
        if(entry.isIntersecting){
          navLinks.forEach(l=>l.classList.remove('active'));
          if(link) link.classList.add('active');
        }
      });
    }, {threshold:0.4});
    sections.forEach(s=>obs.observe(s));
  }

  // Smooth scroll for nav links
  document.querySelectorAll('.nav-link').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const dest = document.querySelector(a.getAttribute('href'));
      if(dest) dest.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  // Kanban board logic
  const boardDataKey = 'kanban-data-v1';
  const defaultData = { todo:[{id: generateId(), title:'Ejemplo: Preparar presentación',desc:'Agregar puntos y referencias'}], doing:[], done:[] };

  function loadData(){
    const raw = localStorage.getItem(boardDataKey);
    return raw ? JSON.parse(raw) : defaultData;
  }
  function saveData(data){ localStorage.setItem(boardDataKey, JSON.stringify(data)); }

  function generateId(){ return 'c'+Math.random().toString(36).slice(2,9); }

  function renderBoard(){
    const data = loadData();
    ['todo','doing','done'].forEach(col=>{
      const zone = document.getElementById(col);
      zone.innerHTML = '';
      data[col].forEach(card=>{
        const el = document.createElement('div');
        el.className = 'card-item';
        el.draggable = true;
        el.dataset.id = card.id;
        el.innerHTML = `<strong>${escapeHtml(card.title)}</strong><div class="muted small">${escapeHtml(card.desc||'')}</div>`;
        zone.appendChild(el);
      });
    });
    attachDragHandlers();
  }

  function escapeHtml(str){ return String(str||'').replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function attachDragHandlers(){
    const items = document.querySelectorAll('.card-item');
    const zones = document.querySelectorAll('.dropzone');

    items.forEach(item=>{
      item.addEventListener('dragstart', e=>{ item.classList.add('dragging'); e.dataTransfer.setData('text/plain', item.dataset.id); });
      item.addEventListener('dragend', ()=> item.classList.remove('dragging'));
    });

    zones.forEach(zone=>{
      zone.addEventListener('dragover', e=>{ e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', ()=> zone.classList.remove('dragover'));
      zone.addEventListener('drop', e=>{
        e.preventDefault(); zone.classList.remove('dragover');
        const id = e.dataTransfer.getData('text/plain');
        moveCardToZone(id, zone.id);
      });
    });
  }

  function moveCardToZone(cardId, targetZone){
    const data = loadData();
    let found=null;
    ['todo','doing','done'].forEach(col=>{
      const idx = data[col].findIndex(c=>c.id===cardId);
      if(idx>-1){ found = {card: data[col][idx], from:col, idx}; data[col].splice(idx,1); }
    });
    if(found){ data[targetZone].unshift(found.card); saveData(data); renderBoard(); }
  }

  // Add card modal logic
  const modal = document.getElementById('modal');
  const cardTitle = document.getElementById('cardTitle');
  const cardDesc = document.getElementById('cardDesc');
  let currentTarget = null;

  document.querySelectorAll('.add-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      currentTarget = b.dataset.target;
      modal.classList.remove('hidden');
      cardTitle.value = ''; cardDesc.value='';
      cardTitle.focus();
    });
  });

  document.getElementById('cancelAdd').addEventListener('click', ()=> modal.classList.add('hidden'));
  document.getElementById('confirmAdd').addEventListener('click', ()=>{
    const title = cardTitle.value.trim();
    if(!title){ alert('Añade un título a la tarjeta'); return; }
    const data = loadData();
    data[currentTarget].unshift({id: generateId(), title, desc: cardDesc.value.trim()});
    saveData(data); renderBoard(); modal.classList.add('hidden');
  });

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', e=>{
      e.preventDefault();
      const name = document.getElementById('cname').value.trim();
      const email = document.getElementById('cemail').value.trim();
      const msg = document.getElementById('cmsg').value.trim();
      if(!name || !email || !msg){ alert('Completa todos los campos'); return; }
      // Simple feedback (no backend)
      alert('Gracias '+name+' — tu mensaje fue recibido. (Demo)');
      contactForm.reset();
    });
  }

  // initial render if on dashboard
  if(document.getElementById('board')) renderBoard();

}); // end DOMContentLoaded
