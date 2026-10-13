/* erpnext.lk — interactions (dropdowns, modals, accordion, scroll-reveal, mobile menu, live task board) */
(function () {
  'use strict';

  /* ---------- 1. Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    mobileNav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => mobileNav.classList.remove('open')));
  }

  /* ---------- 2. Product dropdown (hover + click) ---------- */
  document.querySelectorAll('.dropdown').forEach(dd => {
    const btn = dd.querySelector('.dropdown-toggle');
    if (!btn) return;
    // HOVER — opens immediately, stays open while pointer is inside
    dd.addEventListener('mouseenter', () => {
      document.querySelectorAll('.dropdown').forEach(o => { if (o !== dd) o.classList.remove('open'); });
      dd.classList.add('open');
    });
    dd.addEventListener('mouseleave', () => dd.classList.remove('open'));
    // CLICK — toggles on click for touch/mobility
    btn.addEventListener('click', e => {
      e.stopPropagation();
      dd.classList.toggle('open');
    });
  });
  document.addEventListener('click', () =>
    document.querySelectorAll('.dropdown.open').forEach(o => o.classList.remove('open')));

  /* ---------- 3. Modal (all data-modal buttons) ---------- */
  const backdrop = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  function openModal(title, desc) {
    if (!backdrop) return;
    modalTitle.textContent = title || 'ERPNext.LK';
    modalDesc.textContent = desc || '';
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-modal]').forEach(btn =>
    btn.addEventListener('click', e => {
      e.preventDefault();
      openModal(btn.dataset.modal, btn.dataset.modalDesc);
    }));
  if (backdrop) {
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
    backdrop.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------- 4. FAQ accordion (height-animated like the reference Radix accordion-down) ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close others
      document.querySelectorAll('.faq-item.open').forEach(o => {
        if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-a').style.height = '0'; }
      });
      if (isOpen) {
        a.style.height = '0';
        item.classList.remove('open');
      } else {
        a.style.height = a.scrollHeight + 'px';
        item.classList.add('open');
      }
    });
  });

  /* ---------- 5. Scroll-reveal (fade-in-up when entering viewport, the reference hero-pop-in style) ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- 6. Agent pill switcher ---------- */
  const pills = document.querySelectorAll('.pill[data-agent]');
  const panels = document.querySelectorAll('.agent-panel-slot');
  pills.forEach(p => p.addEventListener('click', () => {
    pills.forEach(o => o.classList.remove('active'));
    p.classList.add('active');
    const id = p.dataset.agent;
    panels.forEach(sl => sl.style.display = sl.dataset.agent === id ? '' : 'none');
    // re-trigger entrance animation
    const visible = document.querySelector('.agent-panel-slot[data-agent="' + id + '"] .agent-panel');
    if (visible) { visible.style.animation = 'none'; void visible.offsetHeight; visible.style.animation = ''; }
  }));

  /* ---------- 7. Slack channel switcher ---------- */
  const chanPills = document.querySelectorAll('[data-channel]');
  chanPills.forEach(p => p.addEventListener('click', () => {
    chanPills.forEach(o => o.classList.remove('active'));
    p.classList.add('active');
    const ch = p.dataset.channel;
    document.querySelectorAll('.slack-scene').forEach(s => s.style.display = s.dataset.channel === ch ? '' : 'none');
    const visible = document.querySelector('.slack-scene[data-channel="' + ch + '"]');
    if (visible) { visible.style.animation = 'none'; void visible.offsetHeight; visible.style.animation = ''; }
  }));

  /* ---------- 8. Live task board — tasks cycle through columns (the reference board-rise behavior) ---------- */
  const liveTask = document.getElementById('liveTask');
  if (liveTask) {
    const states = [
      { col: 'col-flight', meta: '<span class="tag tag-normal">Normal</span><span class="text-blue-300">Step 1 of 5</span>', sub: '<span class="spin">◌</span> Payroll Runner · started now', title: 'Run October payroll for 42 employees across 3 branches' },
      { col: 'col-flight', meta: '<span class="tag tag-normal">Normal</span><span class="text-blue-300">Step 3 of 5</span>', sub: '<span class="spin">◌</span> Payroll Runner · verifying bank mappings', title: 'Run October payroll for 42 employees across 3 branches' },
      { col: 'col-you', meta: '<span class="tag tag-high">High</span><span class="text-amber-300">Waiting on approval</span>', sub: 'Payroll Runner · total: LKR 14.2M', title: 'Run October payroll for 42 employees across 3 branches', approve: true },
      { col: 'col-done', meta: '<span class="text-emerald-300 font-medium">Completed</span><span>just now</span>', sub: '', title: 'Run October payroll for 42 employees across 3 branches', done: true }
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % states.length;
      const s = states[i];
      const target = document.getElementById(s.col);
      if (!target) return;
      liveTask.style.animation = 'none';
      void liveTask.offsetHeight;
      liveTask.style.animation = '';
      liveTask.querySelector('.task-meta').innerHTML = s.meta;
      liveTask.querySelector('.task-title').textContent = s.title;
      let agentRow = liveTask.querySelector('.task-agent');
      if (s.approve) {
        agentRow.innerHTML = '<b>Payroll Runner</b><button class="approve-btn" data-modal="Payroll Approved ✓" data-modal-desc="The payroll run for 42 employees (LKR 14.2M) was approved and pushed to ERPNext payroll registry. Payslips generated.">Approve Run</button>';
      } else if (s.sub) {
        agentRow.innerHTML = '<b>Payroll Runner</b><span>' + s.sub + '</span>';
      } else {
        agentRow.style.display = 'none';
      }
      if (!s.done) agentRow.style.display = '';
      target.appendChild(liveTask);
      liveTask.classList.toggle('done-task', !!s.done);
    }, 4000);
  }

  /* ---------- 9. Hero typing effect (blink-cursor keyframe) ---------- */
  const typer = document.getElementById('typer');
  if (typer) {
    const phrases = [
      '“Chase overdue invoices over $5k and hold for review.”',
      '“Run month-end close and reconcile the general ledger.”',
      '“Re-qualify cold leads and book meetings for the sales team.”',
      '“Draft the weekly client digest and stage it for approval.”'
    ];
    let pi = 0, ci = 0, del = false;
    function tick() {
      const p = phrases[pi];
      typer.textContent = p.slice(0, ci) + '▍';
      if (!del) {
        ci++;
        if (ci > p.length) { del = true; setTimeout(tick, 2600); return; }
      } else {
        ci--;
        if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
      }
      setTimeout(tick, del ? 18 : 42);
    }
    tick();
  }

  /* ---------- 10. Smooth-scroll nav links with offset for fixed navbar ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
})();
