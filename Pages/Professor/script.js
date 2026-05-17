/* ============================================================
   UniNew — Professor / script.js
   ============================================================ */
'use strict';

let session    = null;
let alunos     = [];
let discAtual  = null;

document.addEventListener('DOMContentLoaded', async () => {
  session = Auth.requireAuth(['professor']);
  if (!session) return;
  initHeader(session);

  document.getElementById('btn-salvar-notas').addEventListener('click', salvarNotas);
  document.getElementById('sel-disciplina').addEventListener('change', onDiscChange);

  document.getElementById('notas-tbody').addEventListener('input', e => {
    const input = e.target.closest('.nota-input');
    if (!input) return;
    const idx   = Number(input.dataset.idx);
    const campo = input.dataset.campo;
    const val   = input.value;
    alunos[idx][campo] = val === '' ? null : parseFloat(val);
    refreshMedia(idx);
  });

  await carregarDisciplinas();
});

async function carregarDisciplinas() {
  const sel = document.getElementById('sel-disciplina');
  try {
    const discs = await APIService.getProfessorDisciplinas();
    if (!discs.length) {
      sel.innerHTML = '<option value="">Nenhuma disciplina vinculada</option>';
      return;
    }
    sel.innerHTML = '<option value="">— Selecione —</option>' +
      discs.map(d => `<option value="${d.codigo}">${d.codigo} — ${d.nome}</option>`).join('');
    if (discs.length === 1) {
      sel.value = discs[0].codigo;
      await carregarTurma(discs[0].codigo);
    }
  } catch (err) {
    sel.innerHTML = '<option value="">Erro ao carregar</option>';
    Toast.error(err.message);
  }
}

async function onDiscChange() {
  const codigo = document.getElementById('sel-disciplina').value;
  if (!codigo) {
    document.getElementById('notas-card').style.display    = 'none';
    document.getElementById('btn-row-notas').style.display = 'none';
    return;
  }
  await carregarTurma(codigo);
}

async function carregarTurma(codigo) {
  discAtual = codigo;
  document.getElementById('notas-card').style.display    = '';
  document.getElementById('btn-row-notas').style.display = '';
  document.getElementById('notas-tbody').innerHTML =
    '<tr><td colspan="6" style="text-align:center;padding:20px"><div class="spinner" style="margin:0 auto"></div></td></tr>';

  try {
    alunos = await APIService.getAlunosTurma(codigo);
    renderTabela();
  } catch (err) {
    document.getElementById('notas-tbody').innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--color-danger)">${err.message}</td></tr>`;
  }
}

function renderTabela() {
  const tbody = document.getElementById('notas-tbody');
  if (!alunos.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--color-text-muted)">Nenhum aluno matriculado nesta disciplina</td></tr>';
    return;
  }
  tbody.innerHTML = alunos.map((a, i) => `
    <tr id="row-${i}">
      <td style="font-size:11px;color:var(--color-text-muted)">${(a.matricula || '—').slice(-6)}</td>
      <td style="font-weight:500">${a.nome.split(' ').slice(0,2).join(' ')}</td>
      <td><input class="nota-input" type="number" min="0" max="10" step="0.1"
            data-idx="${i}" data-campo="p1"
            value="${a.p1 ?? ''}" placeholder="—"></td>
      <td><input class="nota-input" type="number" min="0" max="10" step="0.1"
            data-idx="${i}" data-campo="p2"
            value="${a.p2 ?? ''}" placeholder="—"></td>
      <td><input class="nota-input" type="number" min="0" max="10" step="0.1"
            data-idx="${i}" data-campo="re"
            value="${a.re ?? ''}" placeholder="—"></td>
      <td id="media-cell-${i}" class="media-cell">—</td>
    </tr>`).join('');

  alunos.forEach((_, i) => refreshMedia(i));
}

function refreshMedia(idx) {
  const a    = alunos[idx];
  const cell = document.getElementById(`media-cell-${idx}`);
  if (!cell) return;

  let med = null;
  if (a.p1 !== null && a.p2 !== null) {
    const base = (a.p1 + a.p2) / 2;
    med = (a.re !== null && a.re > base) ? a.re : base;
  }

  if (med === null) { cell.textContent = '—'; cell.className = 'media-cell'; return; }

  cell.textContent = med.toFixed(1);
  cell.className   = `media-cell ${med >= 6 ? 'media-ok' : med >= 4 ? 'media-dep' : 'media-rep'}`;
}

async function salvarNotas() {
  if (!discAtual) return;
  const btn = document.getElementById('btn-salvar-notas');
  btn.disabled = true; btn.textContent = 'Salvando…';
  try {
    await APIService.salvarNotas(discAtual, alunos);
    Toast.success('Notas salvas!');
  } catch (err) {
    Toast.error(err.message);
  } finally {
    btn.disabled = false; btn.textContent = 'SALVAR NOTAS';
  }
}
