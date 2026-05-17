/* ============================================================
   UniNew — Disciplinas / script.js
   ============================================================ */
'use strict';

let disciplinas  = [];
let professores  = [];
let editandoId   = null;

document.addEventListener('DOMContentLoaded', async () => {
  const session = Auth.requireAuth(['admin']);
  if (!session) return;
  initHeader(session);

  try {
    const pessoas = await APIService.getPessoas();
    professores = pessoas.filter(p => p.categoria === 'professor');
    popularSelectProfessores();

    disciplinas = await APIService.getDisciplinas();
    renderLista();
  } catch (err) {
    document.getElementById('disc-list').innerHTML =
      `<div class="state-box"><span class="state-box__icon">⚠️</span>
       <p class="state-box__title">Erro ao carregar: ${err.message}</p></div>`;
  }

  document.getElementById('btn-salvar').addEventListener('click', handleSalvar);
  document.getElementById('btn-cancelar').addEventListener('click', resetForm);
  document.getElementById('search-input').addEventListener('input',
    debounce(e => renderLista(e.target.value), 250));

  document.getElementById('disc-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit')   editarDisc(id);
    if (btn.dataset.action === 'remove') removerDisc(id);
  });
});

function popularSelectProfessores() {
  const sel = document.getElementById('f-professor');
  sel.innerHTML = '<option value="">— Nenhum —</option>';
  professores.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.nome;
    sel.appendChild(opt);
  });
}

/* ── Render lista ── */
function renderLista(filtro = '') {
  const el = document.getElementById('disc-list');
  const f  = filtro.toLowerCase();
  const items = disciplinas.filter(d =>
    (d.codigo || '').toLowerCase().includes(f) || d.nome.toLowerCase().includes(f));

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
      <span class="disc-row__cod">${d.codigo || d.id}</span>
      <div class="disc-row__info">
        <div class="disc-row__nome">${d.nome}</div>
        <div class="disc-row__prof">${d.professorNome ? '👤 ' + d.professorNome : '—'}</div>
      </div>
      <div class="disc-row__right">
        <span class="disc-row__ch">${d.cargaHoraria}h</span>
        <span class="disc-row__actions">
          <button class="btn-action btn-action--edit"   data-action="edit"   data-id="${d.id}">✏️</button>
          <button class="btn-action btn-action--remove" data-action="remove" data-id="${d.id}">🗑️</button>
        </span>
      </div>
    </div>`).join('');
}

/* ── Salvar ── */
async function handleSalvar() {
  const nome = document.getElementById('f-nome').value.trim();
  const ch   = parseInt(document.getElementById('f-ch').value);
  const professorId = Number(document.getElementById('f-professor').value) || null;

  if (!nome)      { Toast.error('Informe o nome da disciplina.'); return; }
  if (!ch || ch < 1) { Toast.error('Informe uma carga horária válida.'); return; }

  const btn = document.getElementById('btn-salvar');
  btn.disabled = true; btn.textContent = 'Salvando…';

  try {
    if (editandoId) {
      await APIService.updateDisciplina(editandoId, { nome, cargaHoraria: ch, professorId });
      Toast.success('Disciplina atualizada!');
    } else {
      await APIService.createDisciplina({ nome, cargaHoraria: ch, professorId });
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
  const d = disciplinas.find(x => Number(x.id) === Number(id));
  if (!d) { Toast.error('Disciplina não encontrada.'); return; }
  document.getElementById('f-nome').value = d.nome;
  document.getElementById('f-ch').value   = d.cargaHoraria;

  const sel = document.getElementById('f-professor');
  sel.value = d.professorId || '';

  document.getElementById('form-title').textContent = 'Editar Disciplina';
  editandoId = Number(id);
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
}

/* ── Remover ── */
async function removerDisc(id) {
  const ok = await confirmDialog('Deseja remover esta disciplina? Esta ação não pode ser desfeita.');
  if (!ok) return;
  try {
    await APIService.deleteDisciplina(id);
    disciplinas = await APIService.getDisciplinas();
    renderLista(document.getElementById('search-input').value);
    Toast.success('Disciplina removida.');
  } catch (err) {
    Toast.error(err.message);
  }
}

/* ── Reset form ── */
function resetForm() {
  document.getElementById('f-nome').value     = '';
  document.getElementById('f-ch').value       = '';
  document.getElementById('f-professor').value = '';
  document.getElementById('form-title').textContent = 'Adicionar Disciplina';
  editandoId = null;
}
