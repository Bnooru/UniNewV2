-- ============================================
-- UniNew — Schema PostgreSQL
-- ============================================

-- ENUMs
DO $$ BEGIN CREATE TYPE status_cadastro AS ENUM ('ATIVO','INATIVO','BLOQUEADO');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE tipo_pessoa AS ENUM ('PF','PJ');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE status_matricula AS ENUM ('ATIVA','TRANCADA','CONCLUIDA','CANCELADA');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE papel_docente_turma AS ENUM ('RESPONSAVEL','ASSISTENTE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE perfil_usuario AS ENUM ('admin','aluno','professor','funcionario');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- USUARIO BASE
CREATE TABLE IF NOT EXISTS usuario (
  id            BIGSERIAL PRIMARY KEY,
  nome          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  telefone      VARCHAR(30),
  senha_hash    VARCHAR(255) NOT NULL,
  perfil        perfil_usuario NOT NULL,
  status        status_cadastro NOT NULL DEFAULT 'ATIVO',
  matricula     VARCHAR(30),
  curso_dept    VARCHAR(80),
  cpf           VARCHAR(20),
  genero        VARCHAR(30),
  cep           VARCHAR(10),
  logradouro    VARCHAR(255),
  bairro        VARCHAR(80),
  cidade        VARCHAR(80),
  uf            CHAR(2),
  criado_em     TIMESTAMP NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_email ON usuario(email);

-- CURSO
CREATE TABLE IF NOT EXISTS curso (
  id            BIGSERIAL PRIMARY KEY,
  codigo        VARCHAR(30) NOT NULL,
  nome          VARCHAR(140) NOT NULL,
  tipo          VARCHAR(60),
  carga_horaria INTEGER NOT NULL DEFAULT 0 CHECK (carga_horaria >= 0),
  status        status_cadastro NOT NULL DEFAULT 'ATIVO'
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_curso_codigo ON curso(codigo);

-- DISCIPLINA (professor_id opcional — um professor por disciplina)
CREATE TABLE IF NOT EXISTS disciplina (
  id            BIGSERIAL PRIMARY KEY,
  codigo        VARCHAR(30) NOT NULL,
  nome          VARCHAR(140) NOT NULL,
  carga_horaria INTEGER NOT NULL DEFAULT 0 CHECK (carga_horaria >= 0),
  status        status_cadastro NOT NULL DEFAULT 'ATIVO',
  professor_id  BIGINT REFERENCES usuario(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_disciplina_codigo ON disciplina(codigo);

-- CURSO <-> DISCIPLINA
CREATE TABLE IF NOT EXISTS curso_disciplina (
  curso_id      BIGINT NOT NULL REFERENCES curso(id) ON DELETE CASCADE,
  disciplina_id BIGINT NOT NULL REFERENCES disciplina(id) ON DELETE CASCADE,
  PRIMARY KEY (curso_id, disciplina_id)
);

-- ALUNO <-> CURSO
CREATE TABLE IF NOT EXISTS aluno_curso (
  aluno_id  BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  curso_id  BIGINT NOT NULL REFERENCES curso(id) ON DELETE CASCADE,
  PRIMARY KEY (aluno_id, curso_id)
);

-- FORNECEDOR
CREATE TABLE IF NOT EXISTS fornecedor (
  id               BIGSERIAL PRIMARY KEY,
  razao_social     VARCHAR(160) NOT NULL,
  nome_fantasia    VARCHAR(160),
  cnpj             VARCHAR(20),
  tipo             VARCHAR(60),
  representante    VARCHAR(120),
  telefone         VARCHAR(30),
  email            VARCHAR(160),
  cep              VARCHAR(10),
  logradouro       VARCHAR(255),
  bairro           VARCHAR(80),
  cidade           VARCHAR(80),
  uf               CHAR(2),
  status           status_cadastro NOT NULL DEFAULT 'ATIVO'
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_fornecedor_cnpj ON fornecedor(cnpj) WHERE cnpj IS NOT NULL;

-- NOTAS
CREATE TABLE IF NOT EXISTS nota (
  id             BIGSERIAL PRIMARY KEY,
  aluno_id       BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  disciplina_id  BIGINT NOT NULL REFERENCES disciplina(id) ON DELETE CASCADE,
  p1             NUMERIC(4,2),
  p2             NUMERIC(4,2),
  re             NUMERIC(4,2),
  lancada_por    BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
  criado_em      TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (aluno_id, disciplina_id)
);
