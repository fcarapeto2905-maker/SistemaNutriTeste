-- ==============================================================================
-- SISTEMA DE GESTÃO ESCOLAR
-- Esquema de Banco de Dados SQL para Vercel Postgres (Neon)
-- Dialeto: PostgreSQL
-- Todos os campos identificadores (NIF, Matricula, Codigo, ID) são do tipo INTEIRO.
-- ==============================================================================

-- Remover tabelas e views existentes (caso queira recriar o esquema)
DROP VIEW IF EXISTS Turma_Aluno CASCADE;
DROP VIEW IF EXISTS Turma_Docente CASCADE;
DROP TABLE IF EXISTS Aluno_Turma CASCADE;
DROP TABLE IF EXISTS Professor_Turma CASCADE;
DROP TABLE IF EXISTS Turma CASCADE;
DROP TABLE IF EXISTS Aluno CASCADE;
DROP TABLE IF EXISTS Docente CASCADE;

-- ------------------------------------------------------------------------------
-- 1. TABELA: Docente
-- Armazena os dados dos professores
-- ------------------------------------------------------------------------------
CREATE TABLE Docente (
    NIF INT PRIMARY KEY,
    Nome VARCHAR(150) NOT NULL
);

COMMENT ON TABLE Docente IS 'Armazena os registros dos professores/docentes';
COMMENT ON COLUMN Docente.NIF IS 'Número de Identificação do Docente (Chave Primária, Inteiro)';
COMMENT ON COLUMN Docente.Nome IS 'Nome completo do docente';

-- ------------------------------------------------------------------------------
-- 2. TABELA: Aluno
-- Armazena os dados dos estudantes
-- ------------------------------------------------------------------------------
CREATE TABLE Aluno (
    Matricula INT PRIMARY KEY,
    Nome VARCHAR(150) NOT NULL
);

COMMENT ON TABLE Aluno IS 'Armazena os registros dos alunos';
COMMENT ON COLUMN Aluno.Matricula IS 'Matrícula do Aluno (Chave Primária, Inteiro)';
COMMENT ON COLUMN Aluno.Nome IS 'Nome completo do aluno';

-- ------------------------------------------------------------------------------
-- 3. TABELA: Turma
-- Armazena os dados dos cursos/turmas ofertados
-- ------------------------------------------------------------------------------
CREATE TABLE Turma (
    Codigo INT PRIMARY KEY,
    Nome_Curso VARCHAR(150) NOT NULL,
    Quantidade_Maxima INT NOT NULL CHECK (Quantidade_Maxima > 0),
    Empresa BOOLEAN NOT NULL DEFAULT FALSE,
    Nome_Empresa VARCHAR(150),
    Turno VARCHAR(50) NOT NULL,
    Data_Inicio DATE NOT NULL,
    Data_Fim DATE,
    CONSTRAINT chk_turma_datas CHECK (Data_Fim IS NULL OR Data_Fim >= Data_Inicio)
);

COMMENT ON TABLE Turma IS 'Armazena as turmas criadas na instituição';
COMMENT ON COLUMN Turma.Codigo IS 'Código identificador da turma (Chave Primária, Inteiro)';
COMMENT ON COLUMN Turma.Nome_Curso IS 'Nome do curso ou disciplina da turma';
COMMENT ON COLUMN Turma.Quantidade_Maxima IS 'Capacidade máxima de alunos na turma';
COMMENT ON COLUMN Turma.Empresa IS 'Indica se a turma é voltada/patrocinada por uma empresa (Booleano)';
COMMENT ON COLUMN Turma.Nome_Empresa IS 'Nome da empresa parceira, caso aplicável';
COMMENT ON COLUMN Turma.Turno IS 'Turno de realização das aulas (Ex: Manhã, Tarde, Noite, Integral)';
COMMENT ON COLUMN Turma.Data_Inicio IS 'Data de início das aulas da turma';
COMMENT ON COLUMN Turma.Data_Fim IS 'Data prevista de término das aulas da turma';

-- ------------------------------------------------------------------------------
-- 4. TABELA: Professor_Turma (Turma_Docente)
-- Tabela associativa que relaciona Docente e Turma (Muitos para Muitos)
-- ------------------------------------------------------------------------------
CREATE TABLE Professor_Turma (
    ID SERIAL PRIMARY KEY,
    Codigo_Turma INT NOT NULL,
    NIF_Docente INT NOT NULL,
    Status_Diario VARCHAR(50) DEFAULT 'Pendente',
    CONSTRAINT fk_professor_turma_turma FOREIGN KEY (Codigo_Turma)
        REFERENCES Turma (Codigo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_professor_turma_docente FOREIGN KEY (NIF_Docente)
        REFERENCES Docente (NIF)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_professor_turma UNIQUE (Codigo_Turma, NIF_Docente)
);

COMMENT ON TABLE Professor_Turma IS 'Relaciona os docentes com as turmas atribuídas';
COMMENT ON COLUMN Professor_Turma.ID IS 'Identificador do registro de atribuição (Chave Primária, Inteiro Serial)';
COMMENT ON COLUMN Professor_Turma.Codigo_Turma IS 'Código da Turma vinculada (Chave Estrangeira)';
COMMENT ON COLUMN Professor_Turma.NIF_Docente IS 'NIF do Docente vinculado (Chave Estrangeira)';
COMMENT ON COLUMN Professor_Turma.Status_Diario IS 'Status do diário de classe (Ex: Pendente, Em Andamento, Concluído)';

-- ------------------------------------------------------------------------------
-- 5. TABELA: Aluno_Turma (Turma_Aluno)
-- Tabela associativa que relaciona Aluno e Turma (Muitos para Muitos)
-- ------------------------------------------------------------------------------
CREATE TABLE Aluno_Turma (
    ID SERIAL PRIMARY KEY,
    Codigo_Turma_Aluno INT NOT NULL,
    Matricula_Aluno INT NOT NULL,
    Status_Final VARCHAR(50) DEFAULT 'Em Curso',
    CONSTRAINT fk_aluno_turma_turma FOREIGN KEY (Codigo_Turma_Aluno)
        REFERENCES Turma (Codigo)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_aluno_turma_aluno FOREIGN KEY (Matricula_Aluno)
        REFERENCES Aluno (Matricula)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_aluno_turma UNIQUE (Codigo_Turma_Aluno, Matricula_Aluno)
);

COMMENT ON TABLE Aluno_Turma IS 'Relaciona os alunos matriculados nas respectivas turmas';
COMMENT ON COLUMN Aluno_Turma.ID IS 'Identificador da matrícula na turma (Chave Primária, Inteiro Serial)';
COMMENT ON COLUMN Aluno_Turma.Codigo_Turma_Aluno IS 'Código da Turma do aluno (Chave Estrangeira)';
COMMENT ON COLUMN Aluno_Turma.Matricula_Aluno IS 'Matrícula do Aluno vinculado (Chave Estrangeira)';
COMMENT ON COLUMN Aluno_Turma.Status_Final IS 'Situação final do aluno na turma (Ex: Em Curso, Aprovado, Reprovado, Cancelado)';

-- ------------------------------------------------------------------------------
-- 6. VIEWS DE COMPATIBILIDADE (Turma_Docente e Turma_Aluno)
-- Permitem consultas usando ambos os formatos de nomes citados no projeto
-- ------------------------------------------------------------------------------
CREATE VIEW Turma_Docente AS 
SELECT 
    ID, 
    Codigo_Turma, 
    NIF_Docente, 
    Status_Diario 
FROM Professor_Turma;

CREATE VIEW Turma_Aluno AS 
SELECT 
    ID, 
    Codigo_Turma_Aluno, 
    Matricula_Aluno, 
    Status_Final 
FROM Aluno_Turma;

-- ------------------------------------------------------------------------------
-- 7. ÍNDICES DE PERFORMANCE
-- Otimização de junções (JOINs) e pesquisas pelas chaves estrangeiras
-- ------------------------------------------------------------------------------
CREATE INDEX idx_prof_turma_codigo ON Professor_Turma (Codigo_Turma);
CREATE INDEX idx_prof_turma_docente ON Professor_Turma (NIF_Docente);
CREATE INDEX idx_aluno_turma_codigo ON Aluno_Turma (Codigo_Turma_Aluno);
CREATE INDEX idx_aluno_turma_aluno ON Aluno_Turma (Matricula_Aluno);
