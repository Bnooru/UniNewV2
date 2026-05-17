const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const COLS = `id, razao_social AS "razaoSocial", nome_fantasia AS "nomeFantasia",
  cnpj, tipo, representante, telefone, email,
  cep, logradouro, bairro, cidade, uf, status`;

// GET /fornecedores
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT ${COLS} FROM fornecedor ORDER BY razao_social`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// POST /fornecedores
router.post('/', requireAuth, async (req, res) => {
  const { razaoSocial, nomeFantasia, cnpj, tipo, representante,
          telefone, email, cep, logradouro, bairro, cidade, uf } = req.body;
  if (!razaoSocial) return res.status(400).json({ message: 'Razão social obrigatória.' });
  try {
    const { rows } = await db.query(
      `INSERT INTO fornecedor
         (razao_social, nome_fantasia, cnpj, tipo, representante, telefone, email, cep, logradouro, bairro, cidade, uf)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING ${COLS}`,
      [razaoSocial, nomeFantasia || null, cnpj || null, tipo || null, representante || null,
       telefone || null, email || null, cep || null, logradouro || null,
       bairro || null, cidade || null, uf || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'CNPJ já cadastrado.' });
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// PUT /fornecedores/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { razaoSocial, nomeFantasia, cnpj, tipo, representante,
          telefone, email, cep, logradouro, bairro, cidade, uf } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE fornecedor SET
         razao_social  = COALESCE($1,  razao_social),
         nome_fantasia = COALESCE($2,  nome_fantasia),
         cnpj          = COALESCE($3,  cnpj),
         tipo          = COALESCE($4,  tipo),
         representante = COALESCE($5,  representante),
         telefone      = COALESCE($6,  telefone),
         email         = COALESCE($7,  email),
         cep           = COALESCE($8,  cep),
         logradouro    = COALESCE($9,  logradouro),
         bairro        = COALESCE($10, bairro),
         cidade        = COALESCE($11, cidade),
         uf            = COALESCE($12, uf)
       WHERE id = $13
       RETURNING ${COLS}`,
      [razaoSocial || null, nomeFantasia || null, cnpj || null, tipo || null,
       representante || null, telefone || null, email || null,
       cep || null, logradouro || null, bairro || null, cidade || null, uf || null,
       req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Fornecedor não encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// DELETE /fornecedores/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM fornecedor WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Fornecedor não encontrado.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

module.exports = router;
