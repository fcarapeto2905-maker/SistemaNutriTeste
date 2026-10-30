-- ==============================================================================
-- SISTEMA DE GESTÃO ESCOLAR - DIÁRIO ELETRÔNICO
-- Esquema de Banco de Dados SQL para Vercel Postgres (Neon)
-- Dialeto: PostgreSQL
-- Todos os identificadores (NIF, Matricula, Codigo, ID) são inteiros.
-- ==============================================================================

-- Limpeza preventiva de views e tabelas
DROP VIEW IF EXISTS Turma_Aluno CASCADE;
DROP VIEW IF EXISTS Turma_Docente CASCADE;
DROP TABLE IF EXISTS Diario_Presenca CASCADE;
DROP TABLE IF EXISTS Diario_Aula CASCADE;
DROP TABLE IF EXISTS Aluno_Turma CASCADE;
DROP TABLE IF EXISTS Professor_Turma CASCADE;
DROP TABLE IF EXISTS Turma CASCADE;
DROP TABLE IF EXISTS Aluno CASCADE;
DROP TABLE IF EXISTS Docente CASCADE;

-- ------------------------------------------------------------------------------
-- 1. TABELA: Docente
-- Armazena os dados dos professores (com NIF inteiro e Senha para autenticação)
-- ------------------------------------------------------------------------------
CREATE TABLE Docente (
    NIF INT PRIMARY KEY,
    Nome VARCHAR(150) NOT NULL,
    Senha VARCHAR(255) NOT NULL DEFAULT 'senha123',
    Email VARCHAR(150)
);

COMMENT ON TABLE Docente IS 'Armazena os registros e credenciais dos docentes';
COMMENT ON COLUMN Docente.NIF IS 'Número de Identificação do Docente (Chave Primária, Inteiro)';
COMMENT ON COLUMN Docente.Nome IS 'Nome completo do docente';
COMMENT ON COLUMN Docente.Senha IS 'Senha de acesso ao diário eletrônico';

-- ------------------------------------------------------------------------------
-- 2. TABELA: Aluno
-- Armazena os dados dos estudantes
-- ------------------------------------------------------------------------------
CREATE TABLE Aluno (
    Matricula INT PRIMARY KEY,
    Nome VARCHAR(150) NOT NULL,
    Email VARCHAR(150)
);

COMMENT ON TABLE Aluno IS 'Armazena os registros dos alunos';
COMMENT ON COLUMN Aluno.Matricula IS 'Matrícula do Aluno (Chave Primária, Inteiro)';
COMMENT ON COLUMN Aluno.Nome IS 'Nome completo do estudante';

-- ------------------------------------------------------------------------------
-- 3. TABELA: Turma
-- Armazena os cursos e turmas
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

COMMENT ON TABLE Turma IS 'Armazena as turmas cadastradas na instituição';
COMMENT ON COLUMN Turma.Codigo IS 'Código identificador da turma (Chave Primária, Inteiro)';
COMMENT ON COLUMN Turma.Nome_Curso IS 'Nome do curso ou disciplina da turma';
COMMENT ON COLUMN Turma.Quantidade_Maxima IS 'Capacidade máxima de alunos na turma';
COMMENT ON COLUMN Turma.Empresa IS 'Indica se a turma é parceira de uma empresa (Booleano)';
COMMENT ON COLUMN Turma.Nome_Empresa IS 'Nome da empresa parceira, caso aplicável';
COMMENT ON COLUMN Turma.Turno IS 'Turno das aulas (Manhã, Tarde, Noite, Integral)';
COMMENT ON COLUMN Turma.Data_Inicio IS 'Data de início das aulas';
COMMENT ON COLUMN Turma.Data_Fim IS 'Data de término das aulas';

-- ------------------------------------------------------------------------------
-- 4. TABELA: Professor_Turma (Turma_Docente)
-- Relaciona Docente e Turma (N:M)
-- ------------------------------------------------------------------------------
CREATE TABLE Professor_Turma (
    ID SERIAL PRIMARY KEY,
    Codigo_Turma INT NOT NULL,
    NIF_Docente INT NOT NULL,
    Status_Diario VARCHAR(50) DEFAULT 'Em Aberto',
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
COMMENT ON COLUMN Professor_Turma.ID IS 'Identificador do registro (Chave Primária, Inteiro Serial)';
COMMENT ON COLUMN Professor_Turma.Codigo_Turma IS 'Código da Turma vinculada (Chave Estrangeira)';
COMMENT ON COLUMN Professor_Turma.NIF_Docente IS 'NIF do Docente vinculado (Chave Estrangeira)';
COMMENT ON COLUMN Professor_Turma.Status_Diario IS 'Status do diário (Em Aberto, Em Andamento, Concluído)';

-- ------------------------------------------------------------------------------
-- 5. TABELA: Aluno_Turma (Turma_Aluno)
-- Relaciona Aluno e Turma com controle de Notas, Presenças e Faltas
-- ------------------------------------------------------------------------------
CREATE TABLE Aluno_Turma (
    ID SERIAL PRIMARY KEY,
    Codigo_Turma_Aluno INT NOT NULL,
    Matricula_Aluno INT NOT NULL,
    Nota NUMERIC(4,2) DEFAULT NULL CHECK (Nota IS NULL OR (Nota >= 0.0 AND Nota <= 10.0)),
    Total_Aulas INT NOT NULL DEFAULT 20 CHECK (Total_Aulas >= 0),
    Presencas INT NOT NULL DEFAULT 0 CHECK (Presencas >= 0),
    Faltas INT NOT NULL DEFAULT 0 CHECK (Faltas >= 0),
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

COMMENT ON TABLE Aluno_Turma IS 'Relaciona os alunos às turmas com notas e presença';
COMMENT ON COLUMN Aluno_Turma.ID IS 'Identificador da matrícula na turma (Chave Primária, Inteiro Serial)';
COMMENT ON COLUMN Aluno_Turma.Codigo_Turma_Aluno IS 'Código da Turma do aluno (Chave Estrangeira)';
COMMENT ON COLUMN Aluno_Turma.Matricula_Aluno IS 'Matrícula do Aluno vinculado (Chave Estrangeira)';
COMMENT ON COLUMN Aluno_Turma.Nota IS 'Nota final/média do aluno (0.00 a 10.00)';
COMMENT ON COLUMN Aluno_Turma.Presencas IS 'Quantidade de presenças registradas';
COMMENT ON COLUMN Aluno_Turma.Faltas IS 'Quantidade de faltas registradas';
COMMENT ON COLUMN Aluno_Turma.Status_Final IS 'Status de conclusão (Em Curso, Aprovado, Reprovado por Nota, Reprovado por Falta)';

-- ------------------------------------------------------------------------------
-- 6. TABELAS ADICIONAIS: Diário de Aula e Frequência Detalhada
-- ------------------------------------------------------------------------------
CREATE TABLE Diario_Aula (
    ID SERIAL PRIMARY KEY,
    Codigo_Turma INT NOT NULL,
    NIF_Docente INT NOT NULL,
    Data_Aula DATE NOT NULL DEFAULT CURRENT_DATE,
    Conteudo TEXT,
    CONSTRAINT fk_diario_aula_turma FOREIGN KEY (Codigo_Turma)
        REFERENCES Turma (Codigo) ON DELETE CASCADE,
    CONSTRAINT fk_diario_aula_docente FOREIGN KEY (NIF_Docente)
        REFERENCES Docente (NIF) ON DELETE RESTRICT
);

CREATE TABLE Diario_Presenca (
    ID SERIAL PRIMARY KEY,
    ID_Diario INT NOT NULL,
    Matricula_Aluno INT NOT NULL,
    Presente BOOLEAN NOT NULL DEFAULT TRUE,
    Justificativa VARCHAR(255),
    CONSTRAINT fk_diario_presenca_diario FOREIGN KEY (ID_Diario)
        REFERENCES Diario_Aula (ID) ON DELETE CASCADE,
    CONSTRAINT fk_diario_presenca_aluno FOREIGN KEY (Matricula_Aluno)
        REFERENCES Aluno (Matricula) ON DELETE CASCADE,
    CONSTRAINT uq_diario_aluno UNIQUE (ID_Diario, Matricula_Aluno)
);

-- ------------------------------------------------------------------------------
-- 7. VIEWS DE COMPATIBILIDADE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW Turma_Docente AS 
SELECT 
    ID, 
    Codigo_Turma, 
    NIF_Docente, 
    Status_Diario 
FROM Professor_Turma;

CREATE OR REPLACE VIEW Turma_Aluno AS 
SELECT 
    ID, 
    Codigo_Turma_Aluno, 
    Matricula_Aluno,
    Nota,
    Presencas,
    Faltas,
    Status_Final 
FROM Aluno_Turma;

-- ------------------------------------------------------------------------------
-- 8. ÍNDICES DE PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX idx_prof_turma_codigo ON Professor_Turma (Codigo_Turma);
CREATE INDEX idx_prof_turma_docente ON Professor_Turma (NIF_Docente);
CREATE INDEX idx_aluno_turma_codigo ON Aluno_Turma (Codigo_Turma_Aluno);
CREATE INDEX idx_aluno_turma_aluno ON Aluno_Turma (Matricula_Aluno);
CREATE INDEX idx_diario_aula_turma ON Diario_Aula (Codigo_Turma);
