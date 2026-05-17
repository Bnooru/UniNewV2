-- ============================================
-- UniNew — Seed
-- ============================================

-- DISCIPLINAS
INSERT INTO disciplina (codigo, nome, carga_horaria) VALUES
  ('dvmb1', 'Desenvolvimento Mobile I',  60),
  ('dvmb2', 'Desenvolvimento Mobile II', 60),
  ('bd1',   'Banco de Dados I',           60),
  ('pweb1', 'Programação Web',            80),
  ('es1',   'Engenharia de Software I',   60),
  ('lp1',   'Lógica de Programação',      60)
ON CONFLICT DO NOTHING;

-- CURSOS
INSERT INTO curso (codigo, nome, tipo, carga_horaria) VALUES
  ('ADS2025',   'Análise e Desenvolvimento de Sistemas', 'Tecnólogo',   2400),
  ('TECNO2025', 'Tecnologia em Redes',                   'Tecnólogo',   2000),
  ('ENG2025',   'Engenharia de Software',                'Bacharelado', 3200)
ON CONFLICT DO NOTHING;

-- CURSO <-> DISCIPLINA
INSERT INTO curso_disciplina (curso_id, disciplina_id) VALUES
  ((SELECT id FROM curso WHERE codigo='ADS2025'),   (SELECT id FROM disciplina WHERE codigo='dvmb1')),
  ((SELECT id FROM curso WHERE codigo='ADS2025'),   (SELECT id FROM disciplina WHERE codigo='dvmb2')),
  ((SELECT id FROM curso WHERE codigo='ADS2025'),   (SELECT id FROM disciplina WHERE codigo='bd1')),
  ((SELECT id FROM curso WHERE codigo='ADS2025'),   (SELECT id FROM disciplina WHERE codigo='pweb1')),
  ((SELECT id FROM curso WHERE codigo='TECNO2025'), (SELECT id FROM disciplina WHERE codigo='es1')),
  ((SELECT id FROM curso WHERE codigo='TECNO2025'), (SELECT id FROM disciplina WHERE codigo='lp1')),
  ((SELECT id FROM curso WHERE codigo='ENG2025'),   (SELECT id FROM disciplina WHERE codigo='es1')),
  ((SELECT id FROM curso WHERE codigo='ENG2025'),   (SELECT id FROM disciplina WHERE codigo='dvmb2')),
  ((SELECT id FROM curso WHERE codigo='ENG2025'),   (SELECT id FROM disciplina WHERE codigo='bd1'))
ON CONFLICT DO NOTHING;

-- usuarios, aluno_curso, professor_disciplina e fornecedores: inseridos pelo backend no startup
