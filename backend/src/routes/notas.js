const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// GET /notas/professor — disciplines taught by logged-in professor
router.get('/professor', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, codigo, nome FROM disciplina WHERE professor_id = $1 ORDER BY nome`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// GET /notas/turma/:disciplinaId — alunos in courses with this discipline + their notas
router.get('/turma/:disciplinaId', requireAuth, async (req, res) => {
  try {
    const dRes = await db.query(
      'SELECT id FROM disciplina WHERE codigo = $1', [req.params.disciplinaId]
    );
    if (!dRes.rows.length) return res.status(404).json({ message: 'Disciplina não encontrada.' });
    const discId = dRes.rows[0].id;

    const { rows } = await db.query(`
      SELECT DISTINCT
        u.id, u.nome, u.matricula,
        n.p1, n.p2, n.re
      FROM curso_disciplina cd
      JOIN aluno_curso ac ON ac.curso_id = cd.curso_id
      JOIN usuario u ON u.id = ac.aluno_id
      LEFT JOIN nota n ON n.aluno_id = u.id AND n.disciplina_id = $1
      WHERE cd.disciplina_id = $1
      ORDER BY u.nome
    `, [discId]);

    res.json(rows.map(r => ({
      id:        r.id,
      nome:      r.nome,
      matricula: r.matricula,
      p1:        r.p1 !== null ? +r.p1 : null,
      p2:        r.p2 !== null ? +r.p2 : null,
      re:        r.re !== null ? +r.re : null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// POST /notas/turma/:disciplinaId — upsert notas
router.post('/turma/:disciplinaId', requireAuth, async (req, res) => {
  const notas = req.body;
  if (!Array.isArray(notas)) return res.status(400).json({ message: 'Body deve ser array.' });

  const dRes = await db.query(
    'SELECT id FROM disciplina WHERE codigo = $1', [req.params.disciplinaId]
  );
  if (!dRes.rows.length) return res.status(404).json({ message: 'Disciplina não encontrada.' });
  const discId = dRes.rows[0].id;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    for (const { id: alunoId, p1, p2, re } of notas) {
      if (!alunoId) continue;
      await client.query(`
        INSERT INTO nota (aluno_id, disciplina_id, p1, p2, re, lancada_por)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (aluno_id, disciplina_id)
        DO UPDATE SET p1 = EXCLUDED.p1, p2 = EXCLUDED.p2, re = EXCLUDED.re,
                      lancada_por = EXCLUDED.lancada_por
      `, [alunoId, discId, p1 ?? null, p2 ?? null, re ?? null, req.user.id]);
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  } finally {
    client.release();
  }
});

// GET /notas/aluno/:alunoId
router.get('/aluno/:alunoId', requireAuth, async (req, res) => {
  try {
    const alunoId = req.params.alunoId === 'me' ? req.user.id : req.params.alunoId;

    const { rows } = await db.query(`
      SELECT DISTINCT
        d.codigo AS "disciplinaId", d.nome,
        n.p1, n.p2, n.re
      FROM aluno_curso ac
      JOIN curso_disciplina cd ON cd.curso_id = ac.curso_id
      JOIN disciplina d ON d.id = cd.disciplina_id
      LEFT JOIN nota n ON n.aluno_id = ac.aluno_id AND n.disciplina_id = d.id
      WHERE ac.aluno_id = $1
      ORDER BY d.nome
    `, [alunoId]);

    res.json(rows.map(r => {
      const p1 = r.p1 !== null ? +r.p1 : null;
      const p2 = r.p2 !== null ? +r.p2 : null;
      const re = r.re !== null ? +r.re : null;
      let media = null, status = 'sem_notas';
      if (p1 !== null && p2 !== null) {
        const base = (p1 + p2) / 2;
        media = (re !== null && re > base) ? re : base;
        media = parseFloat(media.toFixed(2));
        status = media >= 6 ? 'aprovado' : 'reprovado';
      }
      return { disciplinaId: r.disciplinaId, nome: r.nome, p1, p2, re, media, status };
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

module.exports = router;
