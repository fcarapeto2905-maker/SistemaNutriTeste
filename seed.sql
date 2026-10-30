-- ==============================================================================
-- DADOS INICIAIS DE TESTE (SEEDS) - DIÁRIO ESCOLAR ELETRÔNICO
-- Dialeto: PostgreSQL (Vercel Postgres / Neon)
-- ==============================================================================

-- 1. DOCENTES (Senha padrão de teste: senha123)
INSERT INTO Docente (NIF, Nome, Senha, Email) VALUES
(1001, 'Prof. Carlos Eduardo Silva', 'senha123', 'carlos.silva@escola.edu.br'),
(1002, 'Profa. Mariana Albuquerque', 'senha123', 'mariana.albuquerque@escola.edu.br'),
(1003, 'Prof. Roberto Fernandes', 'senha123', 'roberto.fernandes@escola.edu.br')
ON CONFLICT (NIF) DO UPDATE 
SET Nome = EXCLUDED.Nome, Senha = EXCLUDED.Senha, Email = EXCLUDED.Email;

-- 2. ALUNOS
INSERT INTO Aluno (Matricula, Nome, Email) VALUES
(202401, 'Lucas Martins Ferreira', 'lucas.martins@aluno.escola.edu.br'),
(202402, 'Beatriz Souza Rocha', 'beatriz.souza@aluno.escola.edu.br'),
(202403, 'Gabriel Lima Santos', 'gabriel.lima@aluno.escola.edu.br'),
(202404, 'Juliana Mendes Duarte', 'juliana.mendes@aluno.escola.edu.br'),
(202405, 'Rafael Alves Moreira', 'rafael.alves@aluno.escola.edu.br'),
(202406, 'Camila Ribeiro Pinto', 'camila.ribeiro@aluno.escola.edu.br'),
(202407, 'Felipe Carvalho Costa', 'felipe.carvalho@aluno.escola.edu.br'),
(202408, 'Larissa Dias Barbosa', 'larissa.dias@aluno.escola.edu.br')
ON CONFLICT (Matricula) DO UPDATE 
SET Nome = EXCLUDED.Nome, Email = EXCLUDED.Email;

-- 3. TURMAS
INSERT INTO Turma (Codigo, Nome_Curso, Quantidade_Maxima, Empresa, Nome_Empresa, Turno, Data_Inicio, Data_Fim) VALUES
(501, 'Desenvolvimento Web Full Stack', 30, FALSE, NULL, 'Noite', '2026-02-01', '2026-06-30'),
(502, 'Análise de Dados com Python', 25, TRUE, 'TechCorp Soluções', 'Manhã', '2026-03-01', '2026-07-15'),
(503, 'Nutrição Clínica Aplicada', 20, FALSE, NULL, 'Tarde', '2026-02-15', '2026-06-15'),
(504, 'Gestão e Práticas Ágeis', 35, TRUE, 'Global Innovations S/A', 'Integral', '2026-04-01', '2026-08-30')
ON CONFLICT (Codigo) DO UPDATE 
SET Nome_Curso = EXCLUDED.Nome_Curso, Quantidade_Maxima = EXCLUDED.Quantidade_Maxima;

-- 4. ATRIBUIÇÃO DE DOCENTES ÀS TURMAS (Professor_Turma)
INSERT INTO Professor_Turma (Codigo_Turma, NIF_Docente, Status_Diario) VALUES
(501, 1001, 'Em Andamento'),
(502, 1001, 'Em Aberto'),
(503, 1002, 'Concluído'),
(504, 1003, 'Em Andamento')
ON CONFLICT (Codigo_Turma, NIF_Docente) DO UPDATE 
SET Status_Diario = EXCLUDED.Status_Diario;

-- 5. MATRÍCULA E NOTAS DOS ALUNOS NAS TURMAS (Aluno_Turma)
-- Turma 501: Prof. Carlos Eduardo
INSERT INTO Aluno_Turma (Codigo_Turma_Aluno, Matricula_Aluno, Nota, Total_Aulas, Presencas, Faltas, Status_Final) VALUES
(501, 202401, 8.50, 20, 18, 2, 'Aprovado'),
(501, 202402, 7.00, 20, 16, 4, 'Em Curso'),
(501, 202403, 9.20, 20, 20, 0, 'Aprovado'),
(501, 202404, 5.50, 20, 14, 6, 'Em Curso'),
(501, 202405, NULL, 20, 17, 3, 'Em Curso')
ON CONFLICT (Codigo_Turma_Aluno, Matricula_Aluno) DO UPDATE 
SET Nota = EXCLUDED.Nota, Presencas = EXCLUDED.Presencas, Faltas = EXCLUDED.Faltas;

-- Turma 502: Prof. Carlos Eduardo
INSERT INTO Aluno_Turma (Codigo_Turma_Aluno, Matricula_Aluno, Nota, Total_Aulas, Presencas, Faltas, Status_Final) VALUES
(502, 202403, 8.80, 20, 19, 1, 'Em Curso'),
(502, 202406, 7.50, 20, 18, 2, 'Em Curso'),
(502, 202407, 6.00, 20, 15, 5, 'Em Curso'),
(502, 202408, NULL, 20, 16, 4, 'Em Curso')
ON CONFLICT (Codigo_Turma_Aluno, Matricula_Aluno) DO UPDATE 
SET Nota = EXCLUDED.Nota, Presencas = EXCLUDED.Presencas, Faltas = EXCLUDED.Faltas;

-- Turma 503: Profa. Mariana
INSERT INTO Aluno_Turma (Codigo_Turma_Aluno, Matricula_Aluno, Nota, Total_Aulas, Presencas, Faltas, Status_Final) VALUES
(503, 202401, 9.50, 20, 19, 1, 'Aprovado'),
(503, 202404, 8.00, 20, 18, 2, 'Aprovado')
ON CONFLICT (Codigo_Turma_Aluno, Matricula_Aluno) DO NOTHING;
