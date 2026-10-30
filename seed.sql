-- ==============================================================================
-- DADOS INICIAIS DE TESTE (SEEDS)
-- Opcional: Execute no Query Console do Vercel Postgres para testar o esquema
-- ==============================================================================

-- Inserir Docentes
INSERT INTO Docente (NIF, Nome) VALUES
(1001, 'Prof. Carlos Eduardo Silva'),
(1002, 'Profa. Mariana Albuquerque'),
(1003, 'Prof. Roberto Fernandes')
ON CONFLICT (NIF) DO NOTHING;

-- Inserir Alunos
INSERT INTO Aluno (Matricula, Nome) VALUES
(202401, 'Lucas Martins'),
(202402, 'Beatriz Souza'),
(202403, 'Gabriel Lima'),
(202404, 'Juliana Mendes')
ON CONFLICT (Matricula) DO NOTHING;

-- Inserir Turmas
INSERT INTO Turma (Codigo, Nome_Curso, Quantidade_Maxima, Empresa, Nome_Empresa, Turno, Data_Inicio, Data_Fim) VALUES
(501, 'Desenvolvimento Web Full Stack', 30, FALSE, NULL, 'Noite', '2026-02-01', '2026-06-30'),
(502, 'Análise de Dados com Python', 25, TRUE, 'TechCorp Soluções', 'Manhã', '2026-03-01', '2026-07-15'),
(503, 'Nutrição Clínica Avançada', 20, FALSE, NULL, 'Tarde', '2026-02-15', '2026-06-15')
ON CONFLICT (Codigo) DO NOTHING;

-- Relacionar Docentes com Turmas (Professor_Turma)
INSERT INTO Professor_Turma (Codigo_Turma, NIF_Docente, Status_Diario) VALUES
(501, 1001, 'Em Andamento'),
(502, 1002, 'Pendente'),
(503, 1003, 'Concluído')
ON CONFLICT (Codigo_Turma, NIF_Docente) DO NOTHING;

-- Relacionar Alunos com Turmas (Aluno_Turma)
INSERT INTO Aluno_Turma (Codigo_Turma_Aluno, Matricula_Aluno, Status_Final) VALUES
(501, 202401, 'Em Curso'),
(501, 202402, 'Em Curso'),
(502, 202403, 'Em Curso'),
(503, 202404, 'Aprovado')
ON CONFLICT (Codigo_Turma_Aluno, Matricula_Aluno) DO NOTHING;
