/* ============================================================
   UniNew — Professor / script.js
   DOM: tabela de notas com cálculo de média em tempo real
   Dados: APIService.getAlunosTurma() + .salvarNotas()
   ============================================================ */
'use strict';

const DISC_ID = 'dvmb2'; // em produção viria da sessão/rota
let session   = null;
let alunos    = [];

document.addEventListener('DOMContentLoaded', async () => {
  session = Auth.requireAuth(['professor']);
  if (!session) return;
  initHeader(session);

  document.getElementById('turma-sub').textContent =
    'Eng. Software – ADS – Semestre 2 – 2026';
  document.getElementById('turma-disc').textContent =
    session.disciplina ?? 'Desenvolvimento Mobile II';

  await carregarTurma();
  document.getElementById('btn-salvar-notas').addEventListener('click', salvarNotas);
});

async function carregarTurma() {
  try {
    alunos = await APIService.getAlunosTurma(DISC_ID);
    renderTabela();
  } catch (err) {
    document.getElementById('notas-tbody').innerHTML =
      `<tr><td colspan="6" class="state-box" style="padding:20px">
        <span class="state-box__icon">❌</span> ${err.message}
      </td></tr>`;
  }
}

function renderTabela() {
  const tbody = document.getElementById('notas-tbody');
  tbody.innerHTML = alunos.map((a, i) => `
    <tr id="row-${i}">
      <td style="font-size:11px;color:var(--color-text-muted)">${a.matricula.slice(-6)}</td>
      <td style="font-weight:500">${a.nome.split(' ').slice(0,2).join(' ')}</td>
      <td><input class="nota-input" type="number" min="0" max="10" step="0.1"
            value="${a.p1 ?? ''}" placeholder="—"
            oninput="atualizarNota(${i},'p1',this.value)"></td>
      <td><input class="nota-input" type="number" min="0" max="10" step="0.1"
            value="${a.p2 ?? ''}" placeholder="—"
            oninput="atualizarNota(${i},'p2',this.value)"></td>
      <td><input class="nota-input" type="number" min="0" max="10" step="0.1"
            value="${a.re ?? ''}" placeholder="—"
            oninput="atualizarNota(${i},'re',this.value)"></td>
      <td id="media-cell-${i}" class="media-cell">—</td>
    </tr>`).join('');

  // Calcula médias dos dados já existentes
  alunos.forEach((_, i) => refreshMedia(i));
}

function atualizarNota(idx, campo, val) {
  alunos[idx][campo] = val === '' ? null : parseFloat(val);
  refreshMedia(idx);
}

function refreshMedia(idx) {
  const a    = alunos[idx];
  const med  = calcularMedia(a.p1, a.p2, a.re);
  const cell = document.getElementById(`media-cell-${idx}`);
  if (med === null) { cell.textContent = '—'; cell.className = 'media-cell'; return; }

  let cls = 'media-ok';
  if (med < 4)      cls = 'media-rep';
  else if (med < 6) cls = 'media-dep';

  cell.textContent = med.toFixed(1);
  cell.className   = `media-cell ${cls}`;
}

async function salvarNotas() {
  const btn = document.getElementById('btn-salvar-notas');
  btn.disabled    = true;
  btn.textContent = 'Salvando…';

  const payload = alunos.map(a => ({
    matricula: a.matricula,
    p1: a.p1,
    p2: a.p2,
    re: a.re,
    media: calcularMedia(a.p1, a.p2, a.re),
  }));

  try {
    await APIService.salvarNotas(DISC_ID, payload);
    Toast.success('Notas salvas com sucesso!');
  } catch (err) {
    Toast.error(err.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'SALVAR NOTAS';
  }
}
