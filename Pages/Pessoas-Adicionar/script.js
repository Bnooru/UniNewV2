/* ============================================================
   UniNew — Pessoas / adicionar.js
   Cria ou edita uma pessoa. Redireciona para index.html ao salvar.
   Modo edição: ?id=<numero>
   ============================================================ */
'use strict';

/* ── Auth guard ── */
const session = Auth.requireAuth(['admin']);
if (session) initHeader(session);

/* ── Elementos ── */
const pageTitle  = document.getElementById('page-title');
const btnSalvar  = document.getElementById('btn-salvar');
const banner     = document.getElementById('feedback-banner');
const bannerText = document.getElementById('feedback-text');
const bannerClose= document.getElementById('feedback-close');

/* Campos */
const fNome       = document.getElementById('p-nome');
const fCpf        = document.getElementById('p-cpf');
const fGenero     = document.getElementById('p-genero');
const fCategoria  = document.getElementById('p-categoria');
const fCursoDept  = document.getElementById('p-cursodept');
const fTelefone   = document.getElementById('p-telefone');
const fEmail      = document.getElementById('p-email');
const fCep        = document.getElementById('p-cep');
const fUf         = document.getElementById('p-uf');
const fLogradouro = document.getElementById('p-logradouro');
const fBairro     = document.getElementById('p-bairro');
const fCidade     = document.getElementById('p-cidade');

/* ── Modo edição? ── */
const editId = Number(new URLSearchParams(location.search).get('id')) || null;

/* ── Feedback banner ── */
let _bannerTimer = null;
function showBanner(msg, type = 'error') {
  clearTimeout(_bannerTimer);
  bannerText.textContent = msg;
  banner.className = `feedback-banner is-${type}`;
  banner.hidden = false;
  if (type === 'success') {
    _bannerTimer = setTimeout(() => { banner.hidden = true; }, 3000);
  }
}
bannerClose.addEventListener('click', () => {
  clearTimeout(_bannerTimer);
  banner.hidden = true;
});

/* ── Carrega dados para edição ── */
function selectOption(selectEl, value) {
  const opt = selectEl.querySelector(`option[value="${value}"]`);
  if (opt) opt.selected = true;
}

async function loadForEdit() {
  if (!editId) return;
  pageTitle.textContent = 'Editar Pessoa';
  btnSalvar.textContent = 'SALVAR ALTERAÇÃO';
  btnSalvar.disabled = true;
  try {
    const pessoas = await APIService.getPessoas();
    const p = pessoas.find(x => x.id === editId);
    if (!p) { showBanner('Pessoa não encontrada.'); return; }
    fNome.value       = p.nome       || '';
    fCpf.value        = p.cpf        || '';
    fTelefone.value   = p.telefone   || '';
    fEmail.value      = p.email      || '';
    fCursoDept.value  = p.cursoDept  || '';
    fCep.value        = p.cep        || '';
    fUf.value         = p.uf         || '';
    fLogradouro.value = p.logradouro || '';
    fBairro.value     = p.bairro     || '';
    fCidade.value     = p.cidade     || '';
    selectOption(fGenero,    p.genero    || '');
    selectOption(fCategoria, p.categoria || '');
  } catch (err) {
    showBanner('Erro ao carregar dados: ' + err.message);
  } finally {
    btnSalvar.disabled = false;
  }
}

/* ── Salvar ── */
btnSalvar.addEventListener('click', async () => {
  const dados = {
    nome:       fNome.value.trim(),
    cpf:        fCpf.value.trim(),
    genero:     fGenero.value,
    categoria:  fCategoria.value,
    cursoDept:  fCursoDept.value.trim(),
    telefone:   fTelefone.value.trim(),
    email:      fEmail.value.trim(),
    cep:        fCep.value.trim(),
    uf:         fUf.value.trim().toUpperCase(),
    logradouro: fLogradouro.value.trim(),
    bairro:     fBairro.value.trim(),
    cidade:     fCidade.value.trim(),
  };

  if (!dados.nome)      { showBanner('⚠️ Nome é obrigatório.'); fNome.focus(); return; }
  if (!dados.categoria) { showBanner('⚠️ Selecione uma categoria.'); fCategoria.focus(); return; }
  if (dados.cpf.replace(/\D/g, '').length !== 11) {
    showBanner('⚠️ CPF obrigatório. Use o formato 000.000.000-00.'); fCpf.focus(); return;
  }

  btnSalvar.disabled = true;
  btnSalvar.textContent = 'Salvando…';
  try {
    if (editId) {
      await APIService.updatePessoa(editId, dados);
    } else {
      await APIService.createPessoa(dados);
    }
    window.location.href = '../Pessoas/index.html?saved=1';
  } catch (err) {
    showBanner('❌ ' + err.message);
    btnSalvar.disabled = false;
    btnSalvar.textContent = editId ? 'SALVAR ALTERAÇÃO' : 'SALVAR';
  }
});

/* ── Máscaras ── */
fCpf.addEventListener('input', () => {
  let v = fCpf.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/,           '$1.$2')
       .replace(/(\d{3})\.(\d{3})(\d)/,  '$1.$2.$3')
       .replace(/\.(\d{3})\.(\d{3})(\d)/,'.$1.$2-$3');
  fCpf.value = v;
});

fCep.addEventListener('input', () => {
  let v = fCep.value.replace(/\D/g, '').slice(0, 8);
  fCep.value = v.replace(/(\d{5})(\d)/, '$1-$2');
});

/* ── Init ── */
loadForEdit();
