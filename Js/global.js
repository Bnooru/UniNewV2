

'use strict';

/*  CONFIGURAÇÃO DE AMBIENTE
   IS_DEMO = true  → usa mock data (offline)
   IS_DEMO = false → usa fetch() contra API real */
const IS_DEMO = true;

/* Base URL da API real (só usada quando IS_DEMO = false) */
const API_BASE_URL = 'https://api.uninew.com.br/v1';

/* Delay simulado em modo demo (ms) */
const DEMO_DELAY = 350;

/*
   MOCK DATA 
*/
const MOCK_DB = {
  usuarios: [
    { id: 1, email: 'admin@uninew.com',     senha: 'admin123',  perfil: 'admin',     nome: 'Administrador' },
    { id: 2, email: 'aluno@uninew.com',     senha: 'aluno123',  perfil: 'aluno',     nome: 'José Aluno da Silva',    matricula: '20250001', curso: 'ADS', semestre: '2' },
    { id: 3, email: 'professor@uninew.com', senha: 'prof123',   perfil: 'professor', nome: 'Profª. Ana Paula Rocha', disciplina: 'Desenvolvimento Mobile II' },
  ],

  disciplinas: [
    { id: 'dvmb1', nome: 'Desenvolvimento Mobile I',   cargaHoraria: 60 },
    { id: 'dvmb2', nome: 'Desenvolvimento Mobile II',  cargaHoraria: 60 },
    { id: 'bd1',   nome: 'Banco de Dados I',            cargaHoraria: 60 },
    { id: 'pweb1', nome: 'Programação Web',              cargaHoraria: 80 },
    { id: 'es1',   nome: 'Engenharia de Software I',    cargaHoraria: 60 },
    { id: 'lp1',   nome: 'Lógica de Programação',       cargaHoraria: 60 },
  ],

  cursos: [
    { id: 'ADS2025',  nome: 'Análise e Desenvolvimento de Sistemas', tipo: 'Tecnólogo',   disciplinas: ['dvmb1','dvmb2','bd1','pweb1'] },
    { id: 'TECNO2025',nome: 'Tecnologia em Redes',                   tipo: 'Tecnólogo',   disciplinas: ['es1','lp1'] },
    { id: 'ENG2025',  nome: 'Engenharia de Software',                tipo: 'Bacharelado', disciplinas: ['es1','dvmb2','bd1'] },
  ],

  pessoas: [
    { id: 1, nome: 'José Ap. Souza',   email: 'jose@email.com',   telefone: '(11) 99999-0001', categoria: 'Aluno',      cursoDept: 'ADS',    cpf: '111.111.111-11', genero: 'Masculino', cep: '18110-000', logradouro: 'Rua A, 1', bairro: 'Centro', cidade: 'Votorantim', uf: 'SP' },
    { id: 2, nome: 'Maria Lima',       email: 'maria@email.com',  telefone: '(11) 99999-0002', categoria: 'Professor',  cursoDept: 'TI',     cpf: '222.222.222-22', genero: 'Feminino',  cep: '18111-000', logradouro: 'Rua B, 2', bairro: 'Bela Vista', cidade: 'Sorocaba', uf: 'SP' },
    { id: 3, nome: 'Carlos Gomes',     email: 'carlos@email.com', telefone: '(11) 99999-0003', categoria: 'Aluno',      cursoDept: 'ADS',    cpf: '333.333.333-33', genero: 'Masculino', cep: '18112-000', logradouro: 'Rua C, 3', bairro: 'Jardim', cidade: 'Votorantim', uf: 'SP' },
    { id: 4, nome: 'Ana Paula Santos', email: 'ana@email.com',    telefone: '(11) 99999-0004', categoria: 'Funcionário',cursoDept: 'Adm',    cpf: '444.444.444-44', genero: 'Feminino',  cep: '18113-000', logradouro: 'Rua D, 4', bairro: 'Alto', cidade: 'Votorantim', uf: 'SP' },
  ],

  fornecedores: [
    { id: 1, razaoSocial: 'Tech Equipamentos LTDA', nomeFantasia: 'TechEq',  cnpj: '12.345.678/0001-00', tipo: 'Equipamento', representante: 'Marcos Silva',  telefone: '(11) 3333-0001', email: 'contato@techeq.com',  cep: '01310-100', logradouro: 'Av. Paulista, 100', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP' },
    { id: 2, razaoSocial: 'Suprimentos SP EIRELI',  nomeFantasia: 'SupriSP', cnpj: '98.765.432/0001-00', tipo: 'Material',    representante: 'Carla Fonseca', telefone: '(11) 3333-0002', email: 'contato@suprisp.com', cep: '04551-060', logradouro: 'Rua Funchal, 200', bairro: 'Vila Olímpia', cidade: 'São Paulo', uf: 'SP' },
    { id: 3, razaoSocial: 'SoftSystems S/A',        nomeFantasia: 'SoftSys', cnpj: '11.222.333/0001-00', tipo: 'Tecnologia',  representante: 'João Neto',     telefone: '(11) 3333-0003', email: 'contato@softsys.com', cep: '20040-020', logradouro: 'Rua da Quitanda, 5', bairro: 'Centro', cidade: 'Rio de Janeiro', uf: 'RJ' },
  ],

  alunosNotas: [
    { matricula: '2025000001', nome: 'José Ap. Souza',    p1: null, p2: null, re: null },
    { matricula: '2025000002', nome: 'Maria Lima',         p1: null, p2: null, re: null },
    { matricula: '2025000003', nome: 'Carlos Gomes',       p1: null, p2: null, re: null },
    { matricula: '2025000004', nome: 'Ana Paula Santos',   p1: null, p2: null, re: null },
    { matricula: '2025000005', nome: 'Pedro Souza',        p1: null, p2: null, re: null },
    { matricula: '2025000006', nome: 'Julia Ferreira',     p1: null, p2: null, re: null },
  ],

  notasAluno: [
    { disciplinaId: 'dvmb1', nome: 'Desenvolvimento Mobile I',  p1: 9.0, p2: 9.5, re: null, media: 9.25, status: 'aprovado' },
    { disciplinaId: 'bd1',   nome: 'Banco de Dados I',           p1: 3.0, p2: 4.0, re: 5.0,  media: 4.0,  status: 'dependencia' },
    { disciplinaId: 'pweb1', nome: 'Programação Web',             p1: 7.0, p2: 9.0, re: null, media: 8.0,  status: 'aprovado' },
    { disciplinaId: 'es1',   nome: 'Engenharia de Software I',    p1: 5.5, p2: 4.5, re: null, media: 5.0,  status: 'reprovado' },
  ],
};

/* 
   HELPER — simula delay de rede em demo
 */
function _demoDelay(data) {
  return new Promise(resolve => setTimeout(() => resolve(structuredClone(data)), DEMO_DELAY));
}

/* 
   HELPER — fetch wrapper para API real
 */
async function _apiFetch(endpoint, options = {}) {
  const token = Auth.getToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/*
   AUTH SERVICE
*/
const Auth = {
  _key: 'uninew_session',

  /** Retorna sessão salva ou null */
  getSession() {
    try { return JSON.parse(sessionStorage.getItem(this._key)); }
    catch { return null; }
  },

  /** Persiste sessão */
  setSession(user) {
    sessionStorage.setItem(this._key, JSON.stringify(user));
  },

  /** Remove sessão */
  clearSession() {
    sessionStorage.removeItem(this._key);
  },

  /** Token JWT (modo real) */
  getToken() {
    return this.getSession()?.token ?? null;
  },

  /** Redireciona se não houver sessão */
  requireAuth(allowedProfiles = []) {
    const session = this.getSession();
    if (!session) {
      window.location.href = '/index.html';
      return null;
    }
    if (allowedProfiles.length && !allowedProfiles.includes(session.perfil)) {
      window.location.href = '/index.html';
      return null;
    }
    return session;
  },

  /** Logout e redirect */
  logout() {
    this.clearSession();
    window.location.href = '/index.html';
  },
};

/*
   API SERVICE
   Cada método:
     DEMO → resolve com mock data
     REAL → fetch() contra endpoint real
*/
const APIService = {

  /* ── AUTH ── */
  async login(email, senha) {
    if (IS_DEMO) {
      const user = MOCK_DB.usuarios.find(
        u => u.email === email.toLowerCase() && u.senha === senha
      );
      if (!user) throw new Error('E-mail ou senha inválidos.');
      const { senha: _, ...safe } = user;
      return _demoDelay({ ...safe, token: 'demo-jwt-token' });
    }
    return _apiFetch('/auth/login', { method: 'POST', body: { email, senha } });
  },

  async registrar(dados) {
    if (IS_DEMO) {
      const newUser = { id: Date.now(), perfil: 'aluno', ...dados };
      MOCK_DB.usuarios.push(newUser);
      return _demoDelay({ success: true, user: newUser });
    }
    return _apiFetch('/auth/registrar', { method: 'POST', body: dados });
  },

  /* ── DISCIPLINAS ── */
  async getDisciplinas() {
    if (IS_DEMO) return _demoDelay(MOCK_DB.disciplinas);
    return _apiFetch('/disciplinas');
  },

  async createDisciplina(dados) {
    if (IS_DEMO) {
      const nova = { id: `disc${Date.now()}`, ...dados };
      MOCK_DB.disciplinas.push(nova);
      return _demoDelay(nova);
    }
    return _apiFetch('/disciplinas', { method: 'POST', body: dados });
  },

  async updateDisciplina(id, dados) {
    if (IS_DEMO) {
      const idx = MOCK_DB.disciplinas.findIndex(d => d.id === id);
      if (idx === -1) throw new Error('Disciplina não encontrada.');
      MOCK_DB.disciplinas[idx] = { ...MOCK_DB.disciplinas[idx], ...dados };
      return _demoDelay(MOCK_DB.disciplinas[idx]);
    }
    return _apiFetch(`/disciplinas/${id}`, { method: 'PUT', body: dados });
  },

  async deleteDisciplina(id) {
    if (IS_DEMO) {
      MOCK_DB.disciplinas = MOCK_DB.disciplinas.filter(d => d.id !== id);
      return _demoDelay({ success: true });
    }
    return _apiFetch(`/disciplinas/${id}`, { method: 'DELETE' });
  },

  /* ── CURSOS ── */
  async getCursos() {
    if (IS_DEMO) return _demoDelay(MOCK_DB.cursos);
    return _apiFetch('/cursos');
  },

  async createCurso(dados) {
    if (IS_DEMO) {
      const novo = { id: `CURSO${Date.now()}`, ...dados };
      MOCK_DB.cursos.push(novo);
      return _demoDelay(novo);
    }
    return _apiFetch('/cursos', { method: 'POST', body: dados });
  },

  async updateCurso(id, dados) {
    if (IS_DEMO) {
      const idx = MOCK_DB.cursos.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Curso não encontrado.');
      MOCK_DB.cursos[idx] = { ...MOCK_DB.cursos[idx], ...dados };
      return _demoDelay(MOCK_DB.cursos[idx]);
    }
    return _apiFetch(`/cursos/${id}`, { method: 'PUT', body: dados });
  },

  async deleteCurso(id) {
    if (IS_DEMO) {
      MOCK_DB.cursos = MOCK_DB.cursos.filter(c => c.id !== id);
      return _demoDelay({ success: true });
    }
    return _apiFetch(`/cursos/${id}`, { method: 'DELETE' });
  },

  /* ── PESSOAS ── */
  async getPessoas() {
    if (IS_DEMO) return _demoDelay(MOCK_DB.pessoas);
    return _apiFetch('/pessoas');
  },

  async createPessoa(dados) {
    if (IS_DEMO) {
      const nova = { id: Date.now(), ...dados };
      MOCK_DB.pessoas.push(nova);
      return _demoDelay(nova);
    }
    return _apiFetch('/pessoas', { method: 'POST', body: dados });
  },

  async updatePessoa(id, dados) {
    if (IS_DEMO) {
      const idx = MOCK_DB.pessoas.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Pessoa não encontrada.');
      MOCK_DB.pessoas[idx] = { ...MOCK_DB.pessoas[idx], ...dados };
      return _demoDelay(MOCK_DB.pessoas[idx]);
    }
    return _apiFetch(`/pessoas/${id}`, { method: 'PUT', body: dados });
  },

  async deletePessoa(id) {
    if (IS_DEMO) {
      MOCK_DB.pessoas = MOCK_DB.pessoas.filter(p => p.id !== id);
      return _demoDelay({ success: true });
    }
    return _apiFetch(`/pessoas/${id}`, { method: 'DELETE' });
  },

  /* ── FORNECEDORES ── */
  async getFornecedores() {
    if (IS_DEMO) return _demoDelay(MOCK_DB.fornecedores);
    return _apiFetch('/fornecedores');
  },

  async createFornecedor(dados) {
    if (IS_DEMO) {
      const novo = { id: Date.now(), ...dados };
      MOCK_DB.fornecedores.push(novo);
      return _demoDelay(novo);
    }
    return _apiFetch('/fornecedores', { method: 'POST', body: dados });
  },

  async updateFornecedor(id, dados) {
    if (IS_DEMO) {
      const idx = MOCK_DB.fornecedores.findIndex(f => f.id === id);
      if (idx === -1) throw new Error('Fornecedor não encontrado.');
      MOCK_DB.fornecedores[idx] = { ...MOCK_DB.fornecedores[idx], ...dados };
      return _demoDelay(MOCK_DB.fornecedores[idx]);
    }
    return _apiFetch(`/fornecedores/${id}`, { method: 'PUT', body: dados });
  },

  async deleteFornecedor(id) {
    if (IS_DEMO) {
      MOCK_DB.fornecedores = MOCK_DB.fornecedores.filter(f => f.id !== id);
      return _demoDelay({ success: true });
    }
    return _apiFetch(`/fornecedores/${id}`, { method: 'DELETE' });
  },

  /* ── NOTAS (professor) ── */
  async getAlunosTurma(disciplinaId) {
    if (IS_DEMO) return _demoDelay(MOCK_DB.alunosNotas);
    return _apiFetch(`/notas/turma/${disciplinaId}`);
  },

  async salvarNotas(disciplinaId, notas) {
    if (IS_DEMO) {
      MOCK_DB.alunosNotas = MOCK_DB.alunosNotas.map(a => {
        const n = notas.find(x => x.matricula === a.matricula);
        return n ? { ...a, ...n } : a;
      });
      return _demoDelay({ success: true });
    }
    return _apiFetch(`/notas/turma/${disciplinaId}`, { method: 'POST', body: notas });
  },

  /* ── NOTAS (aluno) ── */
  async getNotasAluno(alunoId) {
    if (IS_DEMO) return _demoDelay(MOCK_DB.notasAluno);
    return _apiFetch(`/notas/aluno/${alunoId}`);
  },
};

/* 
   HELPERS GLOBAIS
*/

/** Inicializa header em páginas internas */
function initHeader(session) {
  const logo     = document.getElementById('header-logo');
  const greeting = document.getElementById('header-greeting');
  const sub      = document.getElementById('header-sub');
  const btnSair  = document.getElementById('btn-sair');

  if (logo)     logo.textContent = 'UniNew';
  if (greeting) greeting.textContent = `Olá, ${session?.nome ?? 'Usuário'}.`;
  if (sub && session?.curso) {
    sub.textContent = `${session.curso} · ${session.semestre}º Semestre`;
  }
  if (btnSair)  btnSair.addEventListener('click', () => Auth.logout());
}

/** Calcula média a partir de p1, p2, re */
function calcularMedia(p1, p2, re) {
  const n1 = parseFloat(p1), n2 = parseFloat(p2), nr = parseFloat(re);
  if (isNaN(n1) && isNaN(n2)) return null;
  let media = ((isNaN(n1) ? 0 : n1) + (isNaN(n2) ? 0 : n2)) / 2;
  if (!isNaN(nr) && media < 6) {
    media = ((isNaN(n1)?0:n1) + (isNaN(n2)?0:n2) + nr) / 3;
  }
  return parseFloat(media.toFixed(2));
}

/** Iniciais a partir do nome completo */
function getInitials(nome = '') {
  return nome.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

/** Debounce */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

/* 
   TOAST SYSTEM
*/
const Toast = {
  _container: null,

  _getContainer() {
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.id = 'toast-container';
      document.body.appendChild(this._container);
    }
    return this._container;
  },

  show(message, type = 'info', duration = 3000) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${icons[type] ?? 'ℹ️'}</span> ${message}`;
    this._getContainer().appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg)   { this.show(msg, 'error'); },
  info(msg)    { this.show(msg, 'info'); },
};

/* ─────────────────────────────────────────
   MODAL CONFIRM (substitui window.confirm)
───────────────────────────────────────── */
function confirmDialog(message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9000;
      display:flex;align-items:center;justify-content:center;padding:20px;`;

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:28px 22px;width:100%;max-width:320px;
                  box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:'DM Sans',sans-serif;">
        <p style="font-size:15px;color:#1E293B;margin-bottom:22px;line-height:1.5;">${message}</p>
        <div style="display:flex;gap:10px;">
          <button id="confirm-no"  style="flex:1;padding:12px;border:none;border-radius:10px;
            background:#E2E8F0;color:#64748B;font-weight:700;font-size:14px;cursor:pointer;">
            Cancelar
          </button>
          <button id="confirm-yes" style="flex:1;padding:12px;border:none;border-radius:10px;
            background:#EF4444;color:#fff;font-weight:700;font-size:14px;cursor:pointer;">
            Confirmar
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    overlay.querySelector('#confirm-yes').onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector('#confirm-no').onclick  = () => { overlay.remove(); resolve(false); };
  });
}

/* Exibe banner de ambiente no topo */
if (IS_DEMO) {
  document.addEventListener('DOMContentLoaded', () => {
    const bar = document.createElement('div');
    bar.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:9999;
      background:#F59E0B;color:#fff;text-align:center;font-size:11px;
      font-weight:700;padding:3px;letter-spacing:.5px;font-family:'Outfit',sans-serif;`;
    bar.textContent = '⚡ MODO DEMO — dados fictícios';
    document.body.prepend(bar);
    document.body.style.paddingTop = '20px';
  });
}
