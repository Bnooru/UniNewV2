/* ============================================================
   UniNew — Cursos / script.js
   ============================================================ */
'use strict';

let cursos      = [];
let disciplinas = [];
let alunos      = [];
let discsCurso  = [];
let alunosCurso = [];
let editandoId  = null;

document.addEventListener('DOMContentLoaded', async () => {
  const session = Auth.requireAuth(['admin']);
  if (!session) return;
  initHeader(session);

  try {
    const pessoas = await APIService.getPessoas();
    alunos = pessoas.filter(p => p.categoria === 'aluno');

    [cursos, disciplinas] = await Promise.all([
      APIService.getCursos(),
      APIService.getDisciplinas(),
    ]);

    popularSelectDiscs();
    popularSelectAlunos();
    renderCursoList();
  } catch (err) {
    document.getElementById('curso-list').innerHTML =
      `<div class="state-box"><span class="state-box__icon">⚠️</span>
       <p class="state-box__title">Erro ao carregar: ${err.message}</p></div>`;
  }

  document.getElementById('btn-salvar').addEventListener('click', handleSalvar);
  document.getElementById('btn-cancelar').addEventListener('click', resetForm);
  document.getElementById('btn-add-disc').addEventListener('click', addDiscAoCurso);
  document.getElementById('btn-add-aluno').addEventListener('click', addAlunoAoCurso);
  document.getElementById('search-input').addEventListener('input',
    debounce(e => renderCursoList(e.target.value), 250));

  document.getElementById('curso-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit')   editarCurso(id);
    if (btn.dataset.action === 'remove') removerCurso(id);
  });
});

function popularSelectDiscs() {
  const sel = document.getElementById('f-disc-select');
  sel.innerHTML = '<option value="">— Selecione uma disciplina —</option>';
  disciplinas.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.codigo;
    opt.textContent = `${d.codigo} — ${d.nome}`;
    sel.appendChild(opt);
  });
}

function popularSelectAlunos() {
  const sel = document.getElementById('f-aluno-select');
  sel.innerHTML = '<option value="">— Selecione um aluno —</option>';
  alunos.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.nome;
    sel.appendChild(opt);
  });
}

/* ── Lista de cursos ── */
function renderCursoList(filtro = '') {
  const el = document.getElementById('curso-list');
  const f  = filtro.toLowerCase();
  const items = cursos.filter(c =>
    c.nome.toLowerCase().includes(f) || (c.codigo || '').toLowerCase().includes(f));

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
          <span>${c.codigo || c.id}</span>
          <span><span class="tag tag--blue">${c.tipo || '—'}</span>
          · ${(c.disciplinas || []).length} disc. · ${(c.alunos || []).length} alunos</span>
        </div>
      </div>
      <div class="list-item__actions">
        <button class="btn-action btn-action--edit"   data-action="edit"   data-id="${c.id}">✏️</button>
        <button class="btn-action btn-action--remove" data-action="remove" data-id="${c.id}">🗑️</button>
      </div>
    </div>`).join('');
}

/* ── Disciplinas do form ── */
function renderDiscsCurso() {
  const el = document.getElementById('curso-disc-list');
  if (!discsCurso.length) {
    el.innerHTML = '<p class="empty-hint">Nenhuma disciplina adicionada</p>';
    return;
  }
  el.innerHTML = discsCurso.map(codigo => {
    const d = disciplinas.find(x => x.codigo === codigo);
    return d ? `
      <div class="curso-disc-item">
        <span><b>${d.codigo}</b> – ${d.nome}
          <span style="color:var(--color-text-muted);font-size:11px">(${d.cargaHoraria}h)</span>
        </span>
        <button class="btn-icon" data-remove-disc="${codigo}">❌</button>
      </div>` : '';
  }).join('');

  el.querySelectorAll('[data-remove-disc]').forEach(btn =>
    btn.addEventListener('click', () => removeDiscDoCurso(btn.dataset.removeDisc))
  );
}

function addDiscAoCurso() {
  const codigo = document.getElementById('f-disc-select').value;
  if (!codigo)                       { Toast.error('Selecione uma disciplina.'); return; }
  if (discsCurso.includes(codigo))   { Toast.info('Disciplina já adicionada.'); return; }
  discsCurso.push(codigo);
  document.getElementById('f-disc-select').value = '';
  renderDiscsCurso();
}

function removeDiscDoCurso(codigo) {
  discsCurso = discsCurso.filter(x => x !== codigo);
  renderDiscsCurso();
}

/* ── Alunos do form ── */
function renderAlunosCurso() {
  const el = document.getElementById('curso-aluno-list');
  if (!alunosCurso.length) {
    el.innerHTML = '<p class="empty-hint">Nenhum aluno vinculado</p>';
    return;
  }
  el.innerHTML = alunosCurso.map(a => `
    <div class="curso-disc-item">
      <span>👤 ${a.nome}</span>
      <button class="btn-icon" data-remove-aluno="${a.id}">❌</button>
    </div>`).join('');

  el.querySelectorAll('[data-remove-aluno]').forEach(btn =>
    btn.addEventListener('click', () => removeAlunoDocurso(Number(btn.dataset.removeAluno)))
  );
}

async function addAlunoAoCurso() {
  if (!editandoId) { Toast.error('Salve o curso antes de adicionar alunos.'); return; }
  const alunoId = Number(document.getElementById('f-aluno-select').value);
  if (!alunoId) { Toast.error('Selecione um aluno.'); return; }
  if (alunosCurso.find(a => a.id === alunoId)) { Toast.info('Aluno já vinculado.'); return; }
  try {
    await APIService.addAlunoAoCurso(editandoId, alunoId);
    const aluno = alunos.find(a => a.id === alunoId);
    alunosCurso.push({ id: alunoId, nome: aluno?.nome || '?' });
    document.getElementById('f-aluno-select').value = '';
    renderAlunosCurso();
    Toast.success('Aluno vinculado!');
  } catch (err) {
    Toast.error(err.message);
  }
}

async function removeAlunoDocurso(alunoId) {
  if (!editandoId) return;
  try {
    await APIService.removeAlunoDocurso(editandoId, alunoId);
    alunosCurso = alunosCurso.filter(a => a.id !== alunoId);
    renderAlunosCurso();
  } catch (err) {
    Toast.error(err.message);
  }
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
      const novo = await APIService.createCurso({ nome, tipo, disciplinas: discsCurso });
      editandoId = novo.id;
      mostrarSecaoAlunos();
      Toast.success('Curso criado! Agora pode adicionar alunos.');
    }
    cursos = await APIService.getCursos();
    renderCursoList(document.getElementById('search-input').value);
  } catch (err) {
    Toast.error(err.message);
  } finally {
    btn.disabled = false; btn.textContent = 'SALVAR';
  }
}

/* ── Editar ── */
function editarCurso(id) {
  const c = cursos.find(x => Number(x.id) === Number(id));
  if (!c) { Toast.error('Curso não encontrado.'); return; }
  document.getElementById('f-nome').value = c.nome;
  document.getElementById('f-tipo').value = c.tipo || '';
  discsCurso  = [...(c.disciplinas || [])];
  alunosCurso = [...(c.alunos     || [])];
  editandoId  = Number(id);
  document.getElementById('form-title').textContent = 'Editar Curso';
  renderDiscsCurso();
  mostrarSecaoAlunos();
  renderAlunosCurso();
  document.getElementById('form-card').scrollIntoView({ behavior: 'smooth' });
}

/* ── Remover ── */
async function removerCurso(id) {
  const ok = await confirmDialog('Deseja remover este curso?');
  if (!ok) return;
  try {
    await APIService.deleteCurso(id);
    cursos = await APIService.getCursos();
    renderCursoList(document.getElementById('search-input').value);
    Toast.success('Curso removido.');
  } catch (err) {
    Toast.error(err.message);
  }
}

/* ── Helpers ── */
function mostrarSecaoAlunos() {
  document.getElementById('aluno-hint').style.display    = 'none';
  document.getElementById('aluno-add-row').style.display = 'flex';
}

function esconderSecaoAlunos() {
  document.getElementById('aluno-hint').style.display    = '';
  document.getElementById('aluno-add-row').style.display = 'none';
  document.getElementById('curso-aluno-list').innerHTML  = '';
}

/* ── Reset ── */
function resetForm() {
  document.getElementById('f-nome').value = '';
  document.getElementById('form-title').textContent = 'Alterar / Criar Curso';
  discsCurso  = [];
  alunosCurso = [];
  editandoId  = null;
  renderDiscsCurso();
  esconderSecaoAlunos();
}
