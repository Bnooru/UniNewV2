/* ============================================================
   UniNew — Cadastro / script.js
   Modo: ?mode=edit → edição de perfil existente
         sem param  → novo cadastro
   ============================================================ */
'use strict';

const params  = new URLSearchParams(window.location.search);
const isEdit  = params.get('mode') === 'edit';
let session   = null;

document.addEventListener('DOMContentLoaded', () => {
  if (isEdit) {
    session = Auth.requireAuth(['aluno', 'admin', 'professor']);
    if (!session) return;
    initHeader(session);
    document.getElementById('page-title').textContent = 'Editar Cadastro';
    document.getElementById('card-senha').hidden = true; // senha não editada aqui
    preencherFormEdit(session);
  } else {
    // Novo cadastro: sem requisito de auth
    document.getElementById('header-greeting').textContent = 'Olá.';
    document.getElementById('btn-sair').addEventListener('click', () =>
      window.location.href = '../Login/index.html');
  }

  document.getElementById('btn-salvar').addEventListener('click', handleSalvar);
  document.getElementById('btn-cancelar').addEventListener('click', handleCancelar);

  // Máscara CPF
  document.getElementById('f-cpf').addEventListener('input', e => {
    e.target.value = e.target.value
      .replace(/\D/g,'')
      .replace(/(\d{3})(\d)/,'$1.$2')
      .replace(/(\d{3})(\d)/,'$1.$2')
      .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  });

  // Máscara telefone
  document.getElementById('f-tel').addEventListener('input', e => {
    e.target.value = e.target.value
      .replace(/\D/g,'')
      .replace(/(\d{2})(\d)/,'($1) $2')
      .replace(/(\d{5})(\d)/,'$1-$2');
  });
});

function preencherFormEdit(s) {
  document.getElementById('f-nome').value     = s.nome      ?? '';
  document.getElementById('f-email').value    = s.email     ?? '';
  document.getElementById('f-tel').value      = s.telefone  ?? '';
  document.getElementById('f-cpf').value      = s.cpf       ?? '';
  document.getElementById('f-genero').value   = s.genero    ?? '';
  document.getElementById('f-cep').value      = s.cep       ?? '';
  document.getElementById('f-logradouro').value = s.logradouro ?? '';
  document.getElementById('f-bairro').value   = s.bairro    ?? '';
  document.getElementById('f-cidade').value   = s.cidade    ?? '';
  document.getElementById('f-uf').value       = s.uf        ?? '';
}

function coletarForm() {
  return {
    nome:       document.getElementById('f-nome').value.trim(),
    cpf:        document.getElementById('f-cpf').value.trim(),
    genero:     document.getElementById('f-genero').value,
    telefone:   document.getElementById('f-tel').value.trim(),
    email:      document.getElementById('f-email').value.trim(),
    cep:        document.getElementById('f-cep').value.trim(),
    logradouro: document.getElementById('f-logradouro').value.trim(),
    bairro:     document.getElementById('f-bairro').value.trim(),
    cidade:     document.getElementById('f-cidade').value.trim(),
    uf:         document.getElementById('f-uf').value.trim().toUpperCase(),
    ...(!isEdit && {
      senha:  document.getElementById('f-senha').value,
      senha2: document.getElementById('f-senha2').value,
    }),
  };
}

async function handleSalvar() {
  const dados = coletarForm();
  if (!dados.nome || !dados.email) { Toast.error('Nome e e-mail são obrigatórios.'); return; }
  if (!isEdit && dados.senha !== dados.senha2) { Toast.error('As senhas não coincidem.'); return; }

  const btn = document.getElementById('btn-salvar');
  btn.disabled = true;
  btn.textContent = 'Salvando…';

  try {
    if (isEdit) {
      await APIService.updatePessoa(session.id, dados);
      Toast.success('Cadastro atualizado!');
      setTimeout(() => window.location.href = '../Aluno/index.html', 1200);
    } else {
      await APIService.registrar(dados);
      Toast.success('Cadastro criado! Faça login.');
      setTimeout(() => window.location.href = '../Login/index.html', 1500);
    }
  } catch (err) {
    Toast.error(err.message);
    btn.disabled = false;
    btn.textContent = 'SALVAR';
  }
}

function handleCancelar() {
  window.history.back();
}
