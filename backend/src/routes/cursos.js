const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /cursos — inclui disciplinas e alunos
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows: cursos } = await db.query(
      `SELECT id, codigo, nome, tipo, carga_horaria AS "cargaHoraria", status
       FROM curso ORDER BY nome`
    );

    const { rows: discLinks } = await db.query(
      `SELECT cd.curso_id, d.codigo AS "disciplinaId"
       FROM curso_disciplina cd
       JOIN disciplina d ON d.id = cd.disciplina_id`
    );

    const { rows: alunoLinks } = await db.query(
      `SELECT ac.curso_id, u.id AS "alunoId", u.nome AS "alunoNome"
       FROM aluno_curso ac
       JOIN usuario u ON u.id = ac.aluno_id`
    );

    const disc = {};
    discLinks.forEach(l => {
      if (!disc[l.curso_id]) disc[l.curso_id] = [];
      disc[l.curso_id].push(l.disciplinaId);
    });

    const alunos = {};
    alunoLinks.forEach(l => {
      if (!alunos[l.curso_id]) alunos[l.curso_id] = [];
      alunos[l.curso_id].push({ id: l.alunoId, nome: l.alunoNome });
    });

    res.json(cursos.map(c => ({
      ...c,
      disciplinas: disc[c.id]   || [],
      alunos:      alunos[c.id] || [],
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// POST /cursos
router.post('/', requireAuth, async (req, res) => {
  const { nome, tipo, cargaHoraria, codigo, disciplinas = [] } = req.body;
  if (!nome) return res.status(400).json({ message: 'Nome obrigatório.' });
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const cod = codigo || `CURSO${Date.now()}`;
    const { rows } = await client.query(
      `INSERT INTO curso (codigo, nome, tipo, carga_horaria)
       VALUES ($1, $2, $3, $4)
       RETURNING id, codigo, nome, tipo, carga_horaria AS "cargaHoraria", status`,
      [cod, nome, tipo || null, cargaHoraria || 0]
    );
    const curso = rows[0];

    for (const discCodigo of disciplinas) {
      const d = await client.query('SELECT id FROM disciplina WHERE codigo = $1', [discCodigo]);
      if (d.rows.length) {
        await client.query(
          'INSERT INTO curso_disciplina (curso_id, disciplina_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [curso.id, d.rows[0].id]
        );
      }
    }
    await client.query('COMMIT');
    res.status(201).json({ ...curso, disciplinas, alunos: [] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ message: 'Código já existe.' });
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    client.release();
  }
});

// PUT /cursos/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { nome, tipo, cargaHoraria, disciplinas = [] } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE curso SET
         nome          = COALESCE($1, nome),
         tipo          = COALESCE($2, tipo),
         carga_horaria = COALESCE($3, carga_horaria)
       WHERE id = $4
       RETURNING id, codigo, nome, tipo, carga_horaria AS "cargaHoraria", status`,
      [nome || null, tipo || null, cargaHoraria ?? null, req.params.id]
    );
    if (!rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Curso não encontrado.' }); }

    await client.query('DELETE FROM curso_disciplina WHERE curso_id = $1', [req.params.id]);
    for (const discCodigo of disciplinas) {
      const d = await client.query('SELECT id FROM disciplina WHERE codigo = $1', [discCodigo]);
      if (d.rows.length) {
        await client.query(
          'INSERT INTO curso_disciplina (curso_id, disciplina_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [req.params.id, d.rows[0].id]
        );
      }
    }
    await client.query('COMMIT');
    res.json({ ...rows[0], disciplinas });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    client.release();
  }
});

// DELETE /cursos/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM curso WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Curso não encontrado.' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// POST /cursos/:id/alunos
router.post('/:id/alunos', requireAuth, async (req, res) => {
  const { alunoId } = req.body;
  if (!alunoId) return res.status(400).json({ message: 'alunoId obrigatório.' });
  try {
    await db.query(
      `INSERT INTO aluno_curso (aluno_id, curso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [alunoId, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// DELETE /cursos/:id/alunos/:alunoId
router.delete('/:id/alunos/:alunoId', requireAuth, async (req, res) => {
  try {
    await db.query(
      `DELETE FROM aluno_curso WHERE aluno_id = $1 AND curso_id = $2`,
      [req.params.alunoId, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

module.exports = router;
