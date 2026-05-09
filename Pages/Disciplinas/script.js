/* ============================================================
   UniNew — Disciplinas / script.js
   DOM: CRUD disciplinas (add, edit, delete, search)
   Dados: APIService.*Disciplina()
   ============================================================ */
'use strict';

let disciplinas = [];
let editandoId  = null;

document.addEventListener('DOMContentLoaded', async () => {
  const session = Auth.requireAuth(['admin']);
  if (!session) return;
  initHeader(session);

  await carregarDisciplinas();

  document.getElementById('btn-salvar').addEventListener('click', handleSalvar);
  document.getElementById('btn-cancelar').addEventListener('click', resetForm);
  document.getElementById('search-input').addEventListener('input',
    debounce(e => renderLista(e.target.value), 250));
});

/* ── Carregar ── */
async function carregarDisciplinas() {
  try {
    disciplinas = await APIService.getDisciplinas();
    renderLista();
  } catch (err) {
    Toast.error(err.message);
  }
}

/* ── Render lista ── */
function renderLista(filtro = '') {
  const el = document.getElementById('disc-list');
  const f  = filtro.toLowerCase();
  const items = disciplinas.filter(d =>
    d.id.toLowerCase().includes(f) || d.nome.toLowerCase().includes(f));

  if (!items.length) {
    el.innerHTML = `
      <div class="state-box">
        <span class="state-box__icon">📭</span>
        <p class="state-box__title">Nenhuma disciplina encontrada</p>
      </div>`;
    return;
  }

  el.innerHTML = items.map(d => `
    <div class="disc-row">
      <span class="disc-row__cod">${d.id}</span>
      <span class="disc-row__nome">${d.nome}</span>
      <span class="disc-row__ch">${d.cargaHoraria}h</span>
      <span class="disc-row__actions">
        <button class="btn-action btn-action--edit"   onclick="editarDisc('${d.id}')">✏️</button>
        <button class="btn-action btn-action--remove" onclick="removerDisc('${d.id}')">🗑️</button>
      </span>
    </div>`).join('');
}

/* ── Salvar (create | update) ── */
async function handleSalvar() {
  const nome = document.getElementById('f-nome').value.trim();
  const ch   = parseInt(document.getElementById('f-ch').value);

  if (!nome)      { Toast.error('Informe o nome da disciplina.'); return; }
  if (!ch || ch < 1) { Toast.error('Informe uma carga horária válida.'); return; }

  const btn = document.getElementById('btn-salvar');
  btn.disabled = true; btn.textContent = 'Salvando…';

  try {
    if (editandoId) {
      await APIService.updateDisciplina(editandoId, { nome, cargaHoraria: ch });
      Toast.success('Disciplina atualizada!');
    } else {
      await APIService.createDisciplina({ nome, cargaHoraria: ch });
      Toast.success('Disciplina criada!');
    }
    disciplinas = await APIService.getDisciplinas();
    renderLista(document.getElementById('search-input').value);
    resetForm();
  } catch (err) {
    Toast.error(err.message);
  } finally {
    btn.disabled = false; btn.textContent = 'SALVAR';
  }
}

/* ── Editar ── */
function editarDisc(id) {
  const d = disciplinas.find(x => x.id === id);
  if (!d) return;
  document.getElementById('f-nome').value = d.nome;
  document.getElementById('f-ch').value   = d.cargaHoraria;
  document.getElementById('form-title').textContent = 'Editar Disciplina';
  editandoId = id;
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
}

/* ── Remover ── */
async function removerDisc(id) {
  const ok = await confirmDialog('Deseja remover esta disciplina? Esta ação não pode ser desfeita.');
  if (!ok) return;
  try {
    await APIService.deleteDisciplina(id);
    disciplinas = disciplinas.filter(d => d.id !== id);
    renderLista(document.getElementById('search-input').value);
    Toast.success('Disciplina removida.');
  } catch (err) {
    Toast.error(err.message);
  }
}

/* ── Reset form ── */
function resetForm() {
  document.getElementById('f-nome').value = '';
  document.getElementById('f-ch').value   = '';
  document.getElementById('form-title').textContent = 'Adicionar Disciplina';
  editandoId = null;
}
