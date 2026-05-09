/* ============================================================
   UniNew — Aluno / script.js
   DOM: banner, tabs, visão geral, notas
   Dados: APIService.getNotasAluno()
   ============================================================ */
'use strict';

/* ── Refs ── */
const tabBtns    = document.querySelectorAll('.tab-btn');
const tabVisao   = document.getElementById('tab-visao');
const tabNotas   = document.getElementById('tab-notas');
const notasLoad  = document.getElementById('notas-loading');
const notasList  = document.getElementById('notas-list');

let session = null;
let notasCarregadas = false;

/* ── Init ── */
document.addEventListener('DOMContentLoaded', async () => {
  session = Auth.requireAuth(['aluno']);
  if (!session) return;

  initHeader(session);
  preencherBanner(session);
  preencherVisao(session);
});

/* ── Banner ── */
function preencherBanner(s) {
  document.getElementById('banner-matricula').textContent = s.matricula ?? '—';
  document.getElementById('banner-curso').textContent =
    `${s.curso ?? '—'} · ${s.semestre ?? '?'}º Sem`;
}

/* ── Visão Geral ── */
function preencherVisao(s) {
  document.getElementById('info-curso').textContent     = s.curso ?? '—';
  document.getElementById('info-semestre').textContent  = `${s.semestre ?? '?'}º Semestre · 2026`;
  document.getElementById('info-matricula').textContent = s.matricula ?? '—';
  document.getElementById('info-email').textContent     = s.email ?? '—';
  document.getElementById('info-tel').textContent       = s.telefone ?? '(não informado)';
  document.getElementById('info-nasc').textContent      = s.nascimento ?? 'Não informado';
}

/* ── Tabs ── */
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const tab = btn.dataset.tab;
    tabVisao.hidden = tab !== 'visao';
    tabNotas.hidden = tab !== 'notas';

    if (tab === 'notas' && !notasCarregadas) carregarNotas();
  });
});

/* ── Notas ── */
async function carregarNotas() {
  notasLoad.hidden  = false;
  notasList.hidden  = true;

  try {
    const notas = await APIService.getNotasAluno(session.id);
    renderNotas(notas);
    notasCarregadas = true;
  } catch (err) {
    notasLoad.innerHTML = `
      <div class="state-box">
        <span class="state-box__icon">❌</span>
        <p class="state-box__text">${err.message}</p>
      </div>`;
  } finally {
    notasLoad.hidden = true;
    notasList.hidden = false;
  }
}

function renderNotas(notas) {
  if (!notas.length) {
    notasList.innerHTML = `
      <div class="state-box">
        <span class="state-box__icon">📭</span>
        <p class="state-box__title">Sem notas lançadas</p>
      </div>`;
    return;
  }

  notasList.innerHTML = notas.map(n => {
    const cls   = { aprovado: 'ok', dependencia: 'dep', reprovado: 'rep' }[n.status] ?? 'dep';
    const label = { aprovado: '✓', dependencia: 'DEP', reprovado: '✗' }[n.status] ?? '—';
    const media = n.media != null ? n.media.toFixed(2) : '—';
    return `
      <div class="nota-card">
        <div>
          <div class="nota-card__disc">${n.nome}</div>
          <div class="nota-card__cod">${n.disciplinaId}</div>
        </div>
        <div class="nota-badge nota-badge--${cls}">${media}<br><small style="font-size:10px">${label}</small></div>
      </div>`;
  }).join('');
}
