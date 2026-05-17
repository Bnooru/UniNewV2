/* ============================================================
   UniNew — Fornecedores / adicionar.js
   Cria ou edita um fornecedor. Redireciona para index.html ao salvar.
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
const fRazao         = document.getElementById('f-razao');
const fFantasia      = document.getElementById('f-fantasia');
const fTipo          = document.getElementById('f-tipo');
const fCnpj          = document.getElementById('f-cnpj');
const fRepresentante = document.getElementById('f-representante');
const fTelefone      = document.getElementById('f-telefone');
const fEmail         = document.getElementById('f-email');
const fCep           = document.getElementById('f-cep');
const fUf            = document.getElementById('f-uf');
const fLogradouro    = document.getElementById('f-logradouro');
const fBairro        = document.getElementById('f-bairro');
const fCidade        = document.getElementById('f-cidade');

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
async function loadForEdit() {
  if (!editId) return;
  pageTitle.textContent = 'Editar Fornecedor';
  btnSalvar.textContent = 'SALVAR ALTERAÇÃO';
  try {
    const lista = await APIService.getFornecedores();
    const f = lista.find(x => x.id === editId);
    if (!f) { showBanner('Fornecedor não encontrado.'); return; }
    fRazao.value          = f.razaoSocial   || '';
    fFantasia.value       = f.nomeFantasia  || '';
    fTipo.value           = f.tipo          || '';
    fCnpj.value           = f.cnpj          || '';
    fRepresentante.value  = f.representante || '';
    fTelefone.value       = f.telefone      || '';
    fEmail.value          = f.email         || '';
    fCep.value            = f.cep           || '';
    fUf.value             = f.uf            || '';
    fLogradouro.value     = f.logradouro    || '';
    fBairro.value         = f.bairro        || '';
    fCidade.value         = f.cidade        || '';
  } catch (err) {
    showBanner('Erro ao carregar dados: ' + err.message);
  }
}

/* ── Salvar ── */
btnSalvar.addEventListener('click', async () => {
  const dados = {
    razaoSocial:   fRazao.value.trim(),
    nomeFantasia:  fFantasia.value.trim(),
    tipo:          fTipo.value,
    cnpj:          fCnpj.value.trim(),
    representante: fRepresentante.value.trim(),
    telefone:      fTelefone.value.trim(),
    email:         fEmail.value.trim(),
    cep:           fCep.value.trim(),
    uf:            fUf.value.trim().toUpperCase(),
    logradouro:    fLogradouro.value.trim(),
    bairro:        fBairro.value.trim(),
    cidade:        fCidade.value.trim(),
  };

  if (!dados.razaoSocial) { showBanner('⚠️ Razão Social é obrigatória.'); fRazao.focus(); return; }
  if (!dados.cnpj)        { showBanner('⚠️ CNPJ é obrigatório.');         fCnpj.focus();  return; }

  btnSalvar.disabled = true;
  btnSalvar.textContent = 'Salvando…';
  try {
    if (editId) {
      await APIService.updateFornecedor(editId, dados);
    } else {
      await APIService.createFornecedor(dados);
    }
    window.location.href = '../Fornecedores/index.html?saved=1';
  } catch (err) {
    showBanner('❌ ' + err.message);
    btnSalvar.disabled = false;
    btnSalvar.textContent = editId ? 'SALVAR ALTERAÇÃO' : 'SALVAR';
  }
});

/* ── Máscara CNPJ ── */
fCnpj.addEventListener('input', () => {
  let v = fCnpj.value.replace(/\D/g, '').slice(0, 14);
  v = v.replace(/(\d{2})(\d)/,          '$1.$2')
       .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
       .replace(/\.(\d{3})(\d)/,        '.$1/$2')
       .replace(/(\d{4})(\d)/,          '$1-$2');
  fCnpj.value = v;
});

/* ── Máscara CEP ── */
fCep.addEventListener('input', () => {
  let v = fCep.value.replace(/\D/g, '').slice(0, 8);
  fCep.value = v.replace(/(\d{5})(\d)/, '$1-$2');
});

/* ── Init ── */
loadForEdit();
