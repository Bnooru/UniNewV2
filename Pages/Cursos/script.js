/* ============================================================
   UniNew — Cursos / script.js
   ============================================================ */
'use strict';

let cursos      = [];
let disciplinas = [];
let discsCurso  = []; // IDs das disciplinas do curso em edição
let editandoId  = null;

document.addEventListener('DOMContentLoaded', async () => {
  const session = Auth.requireAuth(['admin']);
  if (!session) return;
  initHeader(session);

  [cursos, disciplinas] = await Promise.all([
    APIService.getCursos(),
    APIService.getDisciplinas(),
  ]);

  renderCursoList();

  document.getElementById('btn-salvar').addEventListener('click', handleSalvar);
  document.getElementById('btn-cancelar').addEventListener('click', resetForm);
  document.getElementById('btn-add-disc').addEventListener('click', addDiscAoCurso);
  document.getElementById('search-input').addEventListener('input',
    debounce(e => renderCursoList(e.target.value), 250));
});

/* ── Lista de cursos ── */
function renderCursoList(filtro = '') {
  const el = document.getElementById('curso-list');
  const f  = filtro.toLowerCase();
  const items = cursos.filter(c =>
    c.nome.toLowerCase().includes(f) || c.id.toLowerCase().includes(f));

  if (!items.length) {
    el.innerHTML = `<div class="state-box"><span class="state-box__icon">📭</span>
      <p class="state-box__title">Nenhum curso encontrado</p></div>`;
    return;
  }

  el.innerHTML = items.map(c => `
    <div class="list-item">
      <div class="list-item__info">
        <div class="list-item__name">${c.nome}</div>
        <div class="list-item__meta">
          <span>${c.id}</span>
          <span><span class="tag tag--blue">${c.tipo}</span>
          · ${c.disciplinas.length} disc.</span>
        </div>
      </div>
      <div class="list-item__actions">
        <button class="btn-action btn-action--edit"   onclick="editarCurso('${c.id}')">✏️</button>
        <button class="btn-action btn-action--remove" onclick="removerCurso('${c.id}')">🗑️</button>
      </div>
    </div>`).join('');
}

/* ── Render disciplinas vinculadas no form ── */
function renderDiscsCurso() {
  const el = document.getElementById('curso-disc-list');
  if (!discsCurso.length) {
    el.innerHTML = '<p class="empty-hint">Nenhuma disciplina adicionada</p>';
    return;
  }
  el.innerHTML = discsCurso.map(id => {
    const d = disciplinas.find(x => x.id === id);
    return d ? `
      <div class="curso-disc-item">
        <span><b>${d.id}</b> – ${d.nome}
          <span style="color:var(--color-text-muted);font-size:11px">(${d.cargaHoraria}h)</span>
        </span>
        <button class="btn-icon" onclick="removeDiscDoCurso('${id}')">❌</button>
      </div>` : '';
  }).join('');
}

/* ── ADD disciplina ao curso ── */
function addDiscAoCurso() {
  const q = document.getElementById('f-disc-search').value.trim().toLowerCase();
  const d = disciplinas.find(x =>
    x.id.toLowerCase() === q || x.nome.toLowerCase().includes(q));
  if (!d)                     { Toast.error('Disciplina não encontrada.'); return; }
  if (discsCurso.includes(d.id)) { Toast.info('Disciplina já adicionada.'); return; }
  discsCurso.push(d.id);
  document.getElementById('f-disc-search').value = '';
  renderDiscsCurso();
}

function removeDiscDoCurso(id) {
  discsCurso = discsCurso.filter(x => x !== id);
  renderDiscsCurso();
}

/* ── Salvar curso ── */
async function handleSalvar() {
  const nome = document.getElementById('f-nome').value.trim();
  const tipo = document.getElementById('f-tipo').value;
  if (!nome) { Toast.error('Informe o nome do curso.'); return; }

  const btn = document.getElementById('btn-salvar');
  btn.disabled = true; btn.textContent = 'Salvando…';

  try {
    if (editandoId) {
      await APIService.updateCurso(editandoId, { nome, tipo, disciplinas: discsCurso });
      Toast.success('Curso atualizado!');
    } else {
      await APIService.createCurso({ nome, tipo, disciplinas: discsCurso });
      Toast.success('Curso criado!');
    }
    cursos = await APIService.getCursos();
    renderCursoList(document.getElementById('search-input').value);
    resetForm();
  } catch (err) {
    Toast.error(err.message);
  } finally {
    btn.disabled = false; btn.textContent = 'SALVAR';
  }
}

/* ── Editar ── */
function editarCurso(id) {
  const c = cursos.find(x => x.id === id);
  if (!c) return;
  document.getElementById('f-nome').value = c.nome;
  document.getElementById('f-tipo').value = c.tipo;
  discsCurso = [...c.disciplinas];
  editandoId = id;
  document.getElementById('form-title').textContent = 'Editar Curso';
  renderDiscsCurso();
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
}

/* ── Remover ── */
async function removerCurso(id) {
  const ok = await confirmDialog('Deseja remover este curso?');
  if (!ok) return;
  try {
    await APIService.deleteCurso(id);
    cursos = cursos.filter(c => c.id !== id);
    renderCursoList();
    Toast.success('Curso removido.');
  } catch (err) {
    Toast.error(err.message);
  }
}

/* ── Reset ── */
function resetForm() {
  document.getElementById('f-nome').value = '';
  document.getElementById('form-title').textContent = 'Alterar / Criar Curso';
  discsCurso = [];
  editandoId = null;
  renderDiscsCurso();
}
