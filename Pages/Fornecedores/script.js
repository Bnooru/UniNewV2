/* ============================================================
   UniNew — Fornecedores / script.js
   Lista + remover. Adicionar/Editar → adicionar.html
   ============================================================ */
'use strict';

/* ── Auth guard ── */
const session = Auth.requireAuth(['admin']);
if (session) initHeader(session);

/* ── Elementos ── */
const fornList    = document.getElementById('fornecedores-list');
const searchInput = document.getElementById('search-input');
const banner      = document.getElementById('feedback-banner');
const bannerText  = document.getElementById('feedback-text');
const bannerClose = document.getElementById('feedback-close');

/* ── Estado ── */
let allFornecedores = [];
let searchQuery     = '';

/* ── Tipo → tag ── */
const TIPO_TAG = {
  'Equipamento': 'tag--blue',
  'Material':    'tag--amber',
  'Tecnologia':  'tag--info',
  'Serviço':     'tag--green',
};

/* ── Feedback banner ── */
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

/* ── Verifica redirect com sucesso ── */
const urlParams = new URLSearchParams(location.search);
if (urlParams.get('saved') === '1') {
  history.replaceState({}, '', location.pathname);
  showBanner('✅ Fornecedor salvo com sucesso!');
}

/* ═══════════════════════════════════
   RENDER
═══════════════════════════════════ */
function renderList() {
  const q = searchQuery.toLowerCase();
  const filtered = allFornecedores.filter(f =>
    f.razaoSocial.toLowerCase().includes(q) ||
    (f.nomeFantasia  || '').toLowerCase().includes(q) ||
    (f.cnpj          || '').toLowerCase().includes(q) ||
    (f.tipo          || '').toLowerCase().includes(q) ||
    (f.representante || '').toLowerCase().includes(q)
  );

  if (filtered.length === 0) {
    fornList.innerHTML = `
      <div class="empty-list">
        <div class="empty-list__icon">🏢</div>
        <p class="empty-list__title">Nenhum fornecedor encontrado</p>
        <p class="empty-list__text">Tente outra pesquisa ou adicione um novo fornecedor.</p>
      </div>`;
    return;
  }

  fornList.innerHTML = filtered.map(f => `
    <div class="list-item">
      <div class="list-item__avatar">${getInitials(f.nomeFantasia || f.razaoSocial)}</div>
      <div class="list-item__info">
        <div class="list-item__name">${f.nomeFantasia || f.razaoSocial}</div>
        <div class="list-item__meta">
          <span class="forn-cnpj">📄 ${f.cnpj     || '—'}</span>
          <span>📞 ${f.telefone  || '—'}</span>
          <span>✉️ ${f.email     || '—'}</span>
        </div>
        <span class="tag ${TIPO_TAG[f.tipo] || 'tag--info'}" style="margin-top:4px;display:inline-block;">
          ${f.tipo || '—'}
        </span>
      </div>
      <div class="list-item__actions">
        <a class="btn-action btn-action--edit" href="../Fornecedores-Adicionar/index.html?id=${f.id}">✏️</a>
        <button class="btn-action btn-action--remove" data-id="${f.id}">🗑️</button>
      </div>
    </div>
  `).join('');

  fornList.querySelectorAll('.btn-action--remove').forEach(btn =>
    btn.addEventListener('click', () => handleRemove(Number(btn.dataset.id)))
  );
}

/* ═══════════════════════════════════
   CRUD
═══════════════════════════════════ */
async function loadFornecedores() {
  try {
    allFornecedores = await APIService.getFornecedores();
    renderList();
  } catch (err) {
    fornList.innerHTML = `
      <div class="state-box">
        <span class="state-box__icon">⚠️</span>
        <p class="state-box__title">Erro ao carregar</p>
        <p class="state-box__text">${err.message}</p>
      </div>`;
  }
}

async function handleRemove(id) {
  const f = allFornecedores.find(x => x.id === id);
  const ok = await confirmDialog(
    `Remover <strong>${f?.razaoSocial ?? 'este fornecedor'}</strong>?<br>Essa ação não pode ser desfeita.`
  );
  if (!ok) return;
  try {
    await APIService.deleteFornecedor(id);
    allFornecedores = allFornecedores.filter(x => x.id !== id);
    renderList();
    showBanner('✅ Fornecedor removido com sucesso!');
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
loadFornecedores();
