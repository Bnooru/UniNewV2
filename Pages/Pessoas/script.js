/* ============================================================
   UniNew — Pessoas / script.js
   Lista + editar inline + remover. Adicionar → adicionar.html
   ============================================================ */
'use strict';

/* ── Auth guard ── */
const session = Auth.requireAuth(['admin']);
if (session) initHeader(session);

/* ── Elementos ── */
const pessoasList  = document.getElementById('pessoas-list');
const searchInput  = document.getElementById('search-input');
const banner       = document.getElementById('feedback-banner');
const bannerText   = document.getElementById('feedback-text');
const bannerClose  = document.getElementById('feedback-close');

/* ── Estado ── */
let allPessoas  = [];
let searchQuery = '';

/* ── Categoria → tag ── */
const CATEGORIA_TAG = {
  'Aluno':      'tag--blue',
  'Professor':  'tag--green',
  'Funcionário':'tag--amber',
};

/* ── Feedback banner (sem toast) ── */
let _bannerTimer = null;
function showBanner(msg, type = 'success') {
  clearTimeout(_bannerTimer);
  bannerText.textContent = msg;
  banner.className = `feedback-banner is-${type}`;
  banner.hidden = false;
  _bannerTimer = setTimeout(() => { banner.hidden = true; }, 4000);
}
bannerClose.addEventListener('click', () => {
  clearTimeout(_bannerTimer);
  banner.hidden = true;
});

/* ── Verifica se veio de adicionar.html com sucesso ── */
const urlParams = new URLSearchParams(location.search);
if (urlParams.get('saved') === '1') {
  history.replaceState({}, '', location.pathname);
  showBanner('✅ Pessoa salva com sucesso!');
}
if (urlParams.get('deleted') === '1') {
  history.replaceState({}, '', location.pathname);
  showBanner('✅ Pessoa removida com sucesso!');
}

/* ═══════════════════════════════════
   RENDER
═══════════════════════════════════ */
const CATEGORIA_TAG_MAP = CATEGORIA_TAG;

function renderList() {
  const q = searchQuery.toLowerCase();
  const filtered = allPessoas.filter(p =>
    p.nome.toLowerCase().includes(q) ||
    (p.email     || '').toLowerCase().includes(q) ||
    (p.categoria || '').toLowerCase().includes(q) ||
    (p.cursoDept || '').toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    pessoasList.innerHTML = `
      <div class="empty-list">
        <div class="empty-list__icon">👥</div>
        <p class="empty-list__title">Nenhuma pessoa encontrada</p>
        <p class="empty-list__text">Tente outra pesquisa ou adicione uma nova pessoa.</p>
      </div>`;
    return;
  }

  pessoasList.innerHTML = filtered.map(p => `
    <div class="list-item">
      <div class="list-item__avatar">${getInitials(p.nome)}</div>
      <div class="list-item__info">
        <div class="list-item__name">${p.nome}</div>
        <div class="list-item__meta">
          <span>✉️ ${p.email    || '—'}</span>
          <span>📞 ${p.telefone || '—'}</span>
        </div>
        <span class="tag ${CATEGORIA_TAG_MAP[p.categoria] || 'tag--info'} pessoa-category">
          ${p.categoria || '—'}
        </span>
      </div>
      <div class="list-item__actions">
        <a class="btn-action btn-action--edit" href="../Pessoas-Adicionar/index.html?id=${p.id}">✏️</a>
        <button class="btn-action btn-action--remove" data-id="${p.id}">🗑️</button>
      </div>
    </div>
  `).join('');

  pessoasList.querySelectorAll('.btn-action--remove').forEach(btn =>
    btn.addEventListener('click', () => handleRemove(Number(btn.dataset.id)))
  );
}

/* ═══════════════════════════════════
   CRUD
═══════════════════════════════════ */
async function loadPessoas() {
  try {
    allPessoas = await APIService.getPessoas();
    renderList();
  } catch (err) {
    pessoasList.innerHTML = `
      <div class="state-box">
        <span class="state-box__icon">⚠️</span>
        <p class="state-box__title">Erro ao carregar</p>
        <p class="state-box__text">${err.message}</p>
      </div>`;
  }
}

async function handleRemove(id) {
  const p = allPessoas.find(x => x.id === id);
  const ok = await confirmDialog(
    `Remover <strong>${p?.nome ?? 'esta pessoa'}</strong>?<br>Essa ação não pode ser desfeita.`
  );
  if (!ok) return;
  try {
    await APIService.deletePessoa(id);
    allPessoas = allPessoas.filter(x => x.id !== id);
    renderList();
    showBanner('✅ Pessoa removida com sucesso!');
  } catch (err) {
    showBanner('❌ ' + err.message, 'error');
  }
}

/* ── Search ── */
searchInput.addEventListener('input', debounce(() => {
  searchQuery = searchInput.value;
  renderList();
}, 250));

/* ── Init ── */
loadPessoas();
