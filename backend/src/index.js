const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth',         require('./routes/auth'));
app.use('/disciplinas',  require('./routes/disciplinas'));
app.use('/cursos',       require('./routes/cursos'));
app.use('/pessoas',      require('./routes/pessoas'));
app.use('/fornecedores', require('./routes/fornecedores'));
app.use('/notas',        require('./routes/notas'));

app.get('/health', (_, res) => res.json({ ok: true }));

async function seedDemoUsers() {
  const demos = [
    { nome: 'Administrador',          email: 'admin@uninew.com',     senha: 'admin123',    perfil: 'admin',       matricula: null,         cursoDept: null,  cpf: '000.000.001-00' },
    { nome: 'José Aluno da Silva',    email: 'aluno@uninew.com',     senha: 'aluno123',    perfil: 'aluno',       matricula: '20250001',   cursoDept: 'ADS', cpf: '111.111.111-11' },
    { nome: 'Profª. Ana Paula Rocha', email: 'professor@uninew.com', senha: 'prof123',     perfil: 'professor',   matricula: null,         cursoDept: 'TI',  cpf: '222.222.222-22' },
    { nome: 'José Ap. Souza',         email: 'jose@email.com',       senha: 'uninew@2025', perfil: 'aluno',       matricula: '2025000001', cursoDept: 'ADS', cpf: '333.333.333-33' },
    { nome: 'Maria Lima',             email: 'maria@email.com',      senha: 'uninew@2025', perfil: 'professor',   matricula: null,         cursoDept: 'TI',  cpf: '444.444.444-44' },
    { nome: 'Carlos Gomes',           email: 'carlos@email.com',     senha: 'uninew@2025', perfil: 'aluno',       matricula: '2025000003', cursoDept: 'ADS', cpf: '555.555.555-55' },
    { nome: 'Ana Paula Santos',       email: 'ana@email.com',        senha: 'uninew@2025', perfil: 'funcionario', matricula: null,         cursoDept: 'Adm', cpf: '666.666.666-66' },
  ];

  for (const u of demos) {
    const exists = await db.query('SELECT id FROM usuario WHERE email = $1', [u.email]);
    if (exists.rows.length) continue;
    const hash = await bcrypt.hash(u.senha, 10);
    await db.query(
      `INSERT INTO usuario (nome, email, senha_hash, perfil, matricula, curso_dept, cpf)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [u.nome, u.email, hash, u.perfil, u.matricula, u.cursoDept, u.cpf]
    );
  }
  console.log('Demo users OK');
}

async function seedRelationalData() {
  // Fornecedores
  await db.query(`
    INSERT INTO fornecedor (razao_social, nome_fantasia, cnpj, tipo, representante, telefone, email, cep, logradouro, bairro, cidade, uf)
    VALUES
      ('Tech Equipamentos LTDA','TechEq','12.345.678/0001-00','Equipamento','Marcos Silva','(11) 3333-0001','contato@techeq.com','01310-100','Av. Paulista, 100','Bela Vista','São Paulo','SP'),
      ('Suprimentos SP EIRELI','SupriSP','98.765.432/0001-00','Material','Carla Fonseca','(11) 3333-0002','contato@suprisp.com','04551-060','Rua Funchal, 200','Vila Olímpia','São Paulo','SP'),
      ('SoftSystems S/A','SoftSys','11.222.333/0001-00','Tecnologia','João Neto','(11) 3333-0003','contato@softsys.com','20040-020','Rua da Quitanda, 5','Centro','Rio de Janeiro','RJ')
    ON CONFLICT DO NOTHING`);

  const { rows: [aluno] } = await db.query(`SELECT id FROM usuario WHERE email = 'aluno@uninew.com'`);
  const { rows: [prof] }  = await db.query(`SELECT id FROM usuario WHERE email = 'professor@uninew.com'`);
  if (!aluno || !prof) return;

  // Professor → todas as disciplinas do seed
  await db.query(`UPDATE disciplina SET professor_id = $1 WHERE professor_id IS NULL`, [prof.id]);

  // Aluno demo → curso ADS2025
  const { rows: [ads] } = await db.query(`SELECT id FROM curso WHERE codigo = 'ADS2025'`);
  if (ads) {
    await db.query(
      `INSERT INTO aluno_curso (aluno_id, curso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [aluno.id, ads.id]
    );
  }

  // Outros alunos demo → ADS2025
  const outrosAlunos = ['jose@email.com', 'carlos@email.com'];
  for (const email of outrosAlunos) {
    const { rows: [u] } = await db.query(`SELECT id FROM usuario WHERE email = $1`, [email]);
    if (u && ads) {
      await db.query(
        `INSERT INTO aluno_curso (aluno_id, curso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [u.id, ads.id]
      );
    }
  }

  console.log('Relational seed OK');
}

const PORT = process.env.PORT || 3000;

async function start() {
  let retries = 10;
  while (retries > 0) {
    try {
      await db.query('SELECT 1');
      break;
    } catch {
      retries--;
      if (!retries) { console.error('DB indisponível. Encerrando.'); process.exit(1); }
      console.log(`Aguardando DB... (${retries} tentativas restantes)`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  await seedDemoUsers();
  await seedRelationalData();

  app.listen(PORT, () => {
    console.log(`UniNew API rodando na porta ${PORT}`);
  });
}

start().catch(err => { console.error(err); process.exit(1); });
