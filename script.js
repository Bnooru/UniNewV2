/* ============================================================
   UniNew — Login / script.js
   DOM: formulário de login, demo buttons
   Dados: APIService.login()
   ============================================================ */

'use strict';

/* ── Elementos ── */
const emailInput    = document.getElementById('login-email');
const senhaInput    = document.getElementById('login-senha');
const btnEntrar     = document.getElementById('btn-entrar');
const btnLabel      = document.getElementById('btn-entrar-label');
const btnSpinner    = document.getElementById('btn-entrar-spinner');
const errorBox      = document.getElementById('login-error');
const demoHints     = document.getElementById('demo-hints');

/* ── Redirecionamento por perfil ── */
const PROFILE_ROUTES = {
  admin:     '../../Pages/Admin/index.html',
  aluno:     '../../Pages/Aluno/index.html',
  professor: '../../Pages/Professor/index.html',
};

/* ── Oculta demo hints se não estiver em IS_DEMO ── */
if (typeof IS_DEMO !== 'undefined' && !IS_DEMO && demoHints) {
  demoHints.hidden = true;
}

/* ── Função principal de login ── */
async function handleLogin(email, senha) {
  setLoading(true);
  hideError();

  try {
    const session = await APIService.login(email.trim(), senha);
    Auth.setSession(session);

    const route = PROFILE_ROUTES[session.perfil];
    if (!route) throw new Error('Perfil desconhecido.');

    window.location.href = route;
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

/* ── Estado de loading ── */
function setLoading(on) {
  btnEntrar.disabled  = on;
  btnLabel.hidden     = on;
  btnSpinner.hidden   = !on;
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
}

/* ── Evento: botão entrar ── */
btnEntrar.addEventListener('click', () => {
  const email = emailInput.value;
  const senha = senhaInput.value;
  if (!email || !senha) { showError('Preencha e-mail e senha.'); return; }
  handleLogin(email, senha);
});

/* ── Evento: Enter nos inputs ── */
[emailInput, senhaInput].forEach(el =>
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') btnEntrar.click();
  })
);

/* ── Demo: preencher credenciais com 1 clique ── */
document.querySelectorAll('.demo-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    emailInput.value = btn.dataset.email;
    senhaInput.value = btn.dataset.senha;
    handleLogin(btn.dataset.email, btn.dataset.senha);
  });
});

/* ── Se já estiver logado, redireciona ── */
const existingSession = Auth.getSession();
if (existingSession?.perfil) {
  const route = PROFILE_ROUTES[existingSession.perfil];
  if (route) window.location.href = route;
}
