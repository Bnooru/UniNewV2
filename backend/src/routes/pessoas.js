const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const COLS = `id, nome, email, telefone, perfil AS categoria,
  curso_dept AS "cursoDept", cpf, genero, cep, logradouro, bairro, cidade, uf, status`;

// GET /pessoas
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT ${COLS} FROM usuario ORDER BY nome`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// POST /pessoas
router.post('/', requireAuth, async (req, res) => {
  const { nome, email, telefone, categoria, cursoDept, cpf, genero,
          cep, logradouro, bairro, cidade, uf, senha } = req.body;
  if (!nome || !email) return res.status(400).json({ message: 'Nome e e-mail obrigatórios.' });
  try {
    const hash = await bcrypt.hash(senha || 'uninew@2025', 10);
    const perfil = categoria?.toLowerCase() || 'aluno';
    const { rows } = await db.query(
      `INSERT INTO usuario
         (nome, email, telefone, senha_hash, perfil, curso_dept, cpf, genero, cep, logradouro, bairro, cidade, uf)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING ${COLS}`,
      [nome, email.toLowerCase(), telefone || null, hash, perfil,
       cursoDept || null, cpf || null, genero || null,
       cep || null, logradouro || null, bairro || null, cidade || null, uf || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'E-mail já cadastrado.' });
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// PUT /pessoas/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { nome, email, telefone, categoria, cursoDept, cpf, genero,
          cep, logradouro, bairro, cidade, uf } = req.body;
  try {
    const perfil = categoria?.toLowerCase() || null;
    const { rows } = await db.query(
      `UPDATE usuario SET
         nome       = COALESCE($1,  nome),
         email      = COALESCE($2,  email),
         telefone   = COALESCE($3,  telefone),
         perfil     = COALESCE($4,  perfil),
         curso_dept = COALESCE($5,  curso_dept),
         cpf        = COALESCE($6,  cpf),
         genero     = COALESCE($7,  genero),
         cep        = COALESCE($8,  cep),
         logradouro = COALESCE($9,  logradouro),
         bairro     = COALESCE($10, bairro),
         cidade     = COALESCE($11, cidade),
         uf         = COALESCE($12, uf),
         atualizado_em = now()
       WHERE id = $13
       RETURNING ${COLS}`,
      [nome || null, email?.toLowerCase() || null, telefone || null, perfil,
       cursoDept || null, cpf || null, genero || null,
       cep || null, logradouro || null, bairro || null, cidade || null, uf || null,
       req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Pessoa não encontrada.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// DELETE /pessoas/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM usuario WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Pessoa não encontrada.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

module.exports = router;
