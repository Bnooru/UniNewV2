const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'uninew_secret';

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ message: 'E-mail e senha obrigatórios.' });
  }
  try {
    const { rows } = await db.query(
      'SELECT * FROM usuario WHERE email = $1 AND status = $2',
      [email.toLowerCase().trim(), 'ATIVO']
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });

    const payload = {
      id:        user.id,
      nome:      user.nome,
      email:     user.email,
      perfil:    user.perfil,
      matricula: user.matricula,
      curso:     user.curso_dept,
      semestre:  user.semestre || '2',
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: '8h' });
    res.json({ ...payload, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// POST /auth/registrar
router.post('/registrar', async (req, res) => {
  const { nome, email, senha, perfil = 'aluno', ...resto } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ message: 'Nome, e-mail e senha obrigatórios.' });
  }
  try {
    const existe = await db.query('SELECT id FROM usuario WHERE email = $1', [email.toLowerCase()]);
    if (existe.rows.length) return res.status(409).json({ message: 'E-mail já cadastrado.' });

    const hash = await bcrypt.hash(senha, 10);
    const { rows } = await db.query(
      `INSERT INTO usuario (nome, email, senha_hash, perfil, matricula, curso_dept)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, email, perfil`,
      [nome, email.toLowerCase(), hash, perfil, resto.matricula || null, resto.cursoDept || null]
    );
    res.status(201).json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

module.exports = router;
