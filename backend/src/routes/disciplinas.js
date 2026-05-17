const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /disciplinas
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT d.id, d.codigo, d.nome, d.carga_horaria AS "cargaHoraria", d.status,
              d.professor_id AS "professorId", u.nome AS "professorNome"
       FROM disciplina d
       LEFT JOIN usuario u ON u.id = d.professor_id
       ORDER BY d.nome`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// POST /disciplinas
router.post('/', requireAuth, async (req, res) => {
  const { nome, cargaHoraria, codigo, professorId } = req.body;
  if (!nome) return res.status(400).json({ message: 'Nome obrigatório.' });
  try {
    const cod = codigo || `disc${Date.now()}`;
    const { rows } = await db.query(
      `INSERT INTO disciplina (codigo, nome, carga_horaria, professor_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, codigo, nome, carga_horaria AS "cargaHoraria", status, professor_id AS "professorId"`,
      [cod, nome, cargaHoraria || 0, professorId || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Código já existe.' });
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// PUT /disciplinas/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { nome, cargaHoraria, professorId } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE disciplina SET
         nome          = COALESCE($1, nome),
         carga_horaria = COALESCE($2, carga_horaria),
         professor_id  = $3
       WHERE id = $4
       RETURNING id, codigo, nome, carga_horaria AS "cargaHoraria", status, professor_id AS "professorId"`,
      [nome || null, cargaHoraria ?? null, professorId || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Disciplina não encontrada.' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// DELETE /disciplinas/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM disciplina WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Disciplina não encontrada.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

module.exports = router;
