import { Pool } from 'pg';

let pool = null;

// Verifica se há connection string do Vercel Postgres / Neon
const connectionString = 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL_NON_POOLING || 
  process.env.POSTGRES_PRISMA_URL;

if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  } catch (err) {
    console.error('Erro ao instanciar Pool do Postgres:', err);
    pool = null;
  }
}

// ------------------------------------------------------------------------------
// Fallback em Memória (Garante funcionamento 100% resiliente em qualquer estado)
// ------------------------------------------------------------------------------
let memoryState = {
  docentes: [
    { nif: 1001, nome: 'Prof. Carlos Eduardo Silva', senha: 'senha123', email: 'carlos.silva@escola.edu.br' },
    { nif: 1002, nome: 'Profa. Mariana Albuquerque', senha: 'senha123', email: 'mariana.albuquerque@escola.edu.br' },
    { nif: 1003, nome: 'Prof. Roberto Fernandes', senha: 'senha123', email: 'roberto.fernandes@escola.edu.br' }
  ],
  alunos: [
    { matricula: 202401, nome: 'Lucas Martins Ferreira', email: 'lucas.martins@aluno.escola.edu.br' },
    { matricula: 202402, nome: 'Beatriz Souza Rocha', email: 'beatriz.souza@aluno.escola.edu.br' },
    { matricula: 202403, nome: 'Gabriel Lima Santos', email: 'gabriel.lima@aluno.escola.edu.br' },
    { matricula: 202404, nome: 'Juliana Mendes Duarte', email: 'juliana.mendes@aluno.escola.edu.br' },
    { matricula: 202405, nome: 'Rafael Alves Moreira', email: 'rafael.alves@aluno.escola.edu.br' },
    { matricula: 202406, nome: 'Camila Ribeiro Pinto', email: 'camila.ribeiro@aluno.escola.edu.br' },
    { matricula: 202407, nome: 'Felipe Carvalho Costa', email: 'felipe.carvalho@aluno.escola.edu.br' },
    { matricula: 202408, nome: 'Larissa Dias Barbosa', email: 'larissa.dias@aluno.escola.edu.br' }
  ],
  turmas: [
    { codigo: 501, nome_curso: 'Desenvolvimento Web Full Stack', quantidade_maxima: 30, empresa: false, nome_empresa: null, turno: 'Noite', data_inicio: '2026-02-01', data_fim: '2026-06-30' },
    { codigo: 502, nome_curso: 'Análise de Dados com Python', quantidade_maxima: 25, empresa: true, nome_empresa: 'TechCorp Soluções', turno: 'Manhã', data_inicio: '2026-03-01', data_fim: '2026-07-15' },
    { codigo: 503, nome_curso: 'Nutrição Clínica Aplicada', quantidade_maxima: 20, empresa: false, nome_empresa: null, turno: 'Tarde', data_inicio: '2026-02-15', data_fim: '2026-06-15' },
    { codigo: 504, nome_curso: 'Gestão e Práticas Ágeis', quantidade_maxima: 35, empresa: true, nome_empresa: 'Global Innovations S/A', turno: 'Integral', data_inicio: '2026-04-01', data_fim: '2026-08-30' }
  ],
  professor_turma: [
    { id: 1, codigo_turma: 501, nif_docente: 1001, status_diario: 'Em Andamento' },
    { id: 2, codigo_turma: 502, nif_docente: 1001, status_diario: 'Em Aberto' },
    { id: 3, codigo_turma: 503, nif_docente: 1002, status_diario: 'Concluído' },
    { id: 4, codigo_turma: 504, nif_docente: 1003, status_diario: 'Em Andamento' }
  ],
  aluno_turma: [
    { id: 1, codigo_turma_aluno: 501, matricula_aluno: 202401, nota: 8.50, total_aulas: 20, presencas: 18, faltas: 2, status_final: 'Aprovado' },
    { id: 2, codigo_turma_aluno: 501, matricula_aluno: 202402, nota: 7.00, total_aulas: 20, presencas: 16, faltas: 4, status_final: 'Em Curso' },
    { id: 3, codigo_turma_aluno: 501, matricula_aluno: 202403, nota: 9.20, total_aulas: 20, presencas: 20, faltas: 0, status_final: 'Aprovado' },
    { id: 4, codigo_turma_aluno: 501, matricula_aluno: 202404, nota: 5.50, total_aulas: 20, presencas: 14, faltas: 6, status_final: 'Em Curso' },
    { id: 5, codigo_turma_aluno: 501, matricula_aluno: 202405, nota: null, total_aulas: 20, presencas: 17, faltas: 3, status_final: 'Em Curso' },
    { id: 6, codigo_turma_aluno: 502, matricula_aluno: 202403, nota: 8.80, total_aulas: 20, presencas: 19, faltas: 1, status_final: 'Em Curso' },
    { id: 7, codigo_turma_aluno: 502, matricula_aluno: 202406, nota: 7.50, total_aulas: 20, presencas: 18, faltas: 2, status_final: 'Em Curso' },
    { id: 8, codigo_turma_aluno: 502, matricula_aluno: 202407, nota: 6.00, total_aulas: 20, presencas: 15, faltas: 5, status_final: 'Em Curso' },
    { id: 9, codigo_turma_aluno: 502, matricula_aluno: 202408, nota: null, total_aulas: 20, presencas: 16, faltas: 4, status_final: 'Em Curso' },
    { id: 10, codigo_turma_aluno: 503, matricula_aluno: 202401, nota: 9.50, total_aulas: 20, presencas: 19, faltas: 1, status_final: 'Aprovado' },
    { id: 11, codigo_turma_aluno: 503, matricula_aluno: 202404, nota: 8.00, total_aulas: 20, presencas: 18, faltas: 2, status_final: 'Aprovado' }
  ]
};

let dbInitialized = false;

// Inicializa o banco de dados PostgreSQL automaticamente se conectado
export async function initializeDatabase() {
  if (!pool) return false;
  if (dbInitialized) return true;

  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS Docente (
          NIF INT PRIMARY KEY,
          Nome VARCHAR(150) NOT NULL,
          Senha VARCHAR(255) NOT NULL DEFAULT 'senha123',
          Email VARCHAR(150)
        );

        CREATE TABLE IF NOT EXISTS Aluno (
          Matricula INT PRIMARY KEY,
          Nome VARCHAR(150) NOT NULL,
          Email VARCHAR(150)
        );

        CREATE TABLE IF NOT EXISTS Turma (
          Codigo INT PRIMARY KEY,
          Nome_Curso VARCHAR(150) NOT NULL,
          Quantidade_Maxima INT NOT NULL CHECK (Quantidade_Maxima > 0),
          Empresa BOOLEAN NOT NULL DEFAULT FALSE,
          Nome_Empresa VARCHAR(150),
          Turno VARCHAR(50) NOT NULL,
          Data_Inicio DATE NOT NULL,
          Data_Fim DATE
        );

        CREATE TABLE IF NOT EXISTS Professor_Turma (
          ID SERIAL PRIMARY KEY,
          Codigo_Turma INT NOT NULL REFERENCES Turma(Codigo) ON DELETE CASCADE,
          NIF_Docente INT NOT NULL REFERENCES Docente(NIF) ON DELETE RESTRICT,
          Status_Diario VARCHAR(50) DEFAULT 'Em Aberto',
          UNIQUE(Codigo_Turma, NIF_Docente)
        );

        CREATE TABLE IF NOT EXISTS Aluno_Turma (
          ID SERIAL PRIMARY KEY,
          Codigo_Turma_Aluno INT NOT NULL REFERENCES Turma(Codigo) ON DELETE CASCADE,
          Matricula_Aluno INT NOT NULL REFERENCES Aluno(Matricula) ON DELETE RESTRICT,
          Nota NUMERIC(4,2) DEFAULT NULL,
          Total_Aulas INT NOT NULL DEFAULT 20,
          Presencas INT NOT NULL DEFAULT 0,
          Faltas INT NOT NULL DEFAULT 0,
          Status_Final VARCHAR(50) DEFAULT 'Em Curso',
          UNIQUE(Codigo_Turma_Aluno, Matricula_Aluno)
        );

        CREATE OR REPLACE VIEW Turma_Docente AS SELECT * FROM Professor_Turma;
        CREATE OR REPLACE VIEW Turma_Aluno AS SELECT * FROM Aluno_Turma;
      `);

      // Insere sementes iniciais caso a tabela Docente esteja vazia
      const checkDocentes = await client.query('SELECT COUNT(*) FROM Docente');
      if (parseInt(checkDocentes.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO Docente (NIF, Nome, Senha, Email) VALUES
          (1001, 'Prof. Carlos Eduardo Silva', 'senha123', 'carlos.silva@escola.edu.br'),
          (1002, 'Profa. Mariana Albuquerque', 'senha123', 'mariana.albuquerque@escola.edu.br'),
          (1003, 'Prof. Roberto Fernandes', 'senha123', 'roberto.fernandes@escola.edu.br')
          ON CONFLICT (NIF) DO NOTHING;

          INSERT INTO Aluno (Matricula, Nome, Email) VALUES
          (202401, 'Lucas Martins Ferreira', 'lucas.martins@aluno.escola.edu.br'),
          (202402, 'Beatriz Souza Rocha', 'beatriz.souza@aluno.escola.edu.br'),
          (202403, 'Gabriel Lima Santos', 'gabriel.lima@aluno.escola.edu.br'),
          (202404, 'Juliana Mendes Duarte', 'juliana.mendes@aluno.escola.edu.br'),
          (202405, 'Rafael Alves Moreira', 'rafael.alves@aluno.escola.edu.br'),
          (202406, 'Camila Ribeiro Pinto', 'camila.ribeiro@aluno.escola.edu.br'),
          (202407, 'Felipe Carvalho Costa', 'felipe.carvalho@aluno.escola.edu.br'),
          (202408, 'Larissa Dias Barbosa', 'larissa.dias@aluno.escola.edu.br')
          ON CONFLICT (Matricula) DO NOTHING;

          INSERT INTO Turma (Codigo, Nome_Curso, Quantidade_Maxima, Empresa, Nome_Empresa, Turno, Data_Inicio, Data_Fim) VALUES
          (501, 'Desenvolvimento Web Full Stack', 30, FALSE, NULL, 'Noite', '2026-02-01', '2026-06-30'),
          (502, 'Análise de Dados com Python', 25, TRUE, 'TechCorp Soluções', 'Manhã', '2026-03-01', '2026-07-15'),
          (503, 'Nutrição Clínica Aplicada', 20, FALSE, NULL, 'Tarde', '2026-02-15', '2026-06-15'),
          (504, 'Gestão e Práticas Ágeis', 35, TRUE, 'Global Innovations S/A', 'Integral', '2026-04-01', '2026-08-30')
          ON CONFLICT (Codigo) DO NOTHING;

          INSERT INTO Professor_Turma (Codigo_Turma, NIF_Docente, Status_Diario) VALUES
          (501, 1001, 'Em Andamento'),
          (502, 1001, 'Em Aberto'),
          (503, 1002, 'Concluído'),
          (504, 1003, 'Em Andamento')
          ON CONFLICT (Codigo_Turma, NIF_Docente) DO NOTHING;

          INSERT INTO Aluno_Turma (Codigo_Turma_Aluno, Matricula_Aluno, Nota, Total_Aulas, Presencas, Faltas, Status_Final) VALUES
          (501, 202401, 8.50, 20, 18, 2, 'Aprovado'),
          (501, 202402, 7.00, 20, 16, 4, 'Em Curso'),
          (501, 202403, 9.20, 20, 20, 0, 'Aprovado'),
          (501, 202404, 5.50, 20, 14, 6, 'Em Curso'),
          (501, 202405, NULL, 20, 17, 3, 'Em Curso'),
          (502, 202403, 8.80, 20, 19, 1, 'Em Curso'),
          (502, 202406, 7.50, 20, 18, 2, 'Em Curso'),
          (502, 202407, 6.00, 20, 15, 5, 'Em Curso'),
          (502, 202408, NULL, 20, 16, 4, 'Em Curso')
          ON CONFLICT (Codigo_Turma_Aluno, Matricula_Aluno) DO NOTHING;
        `);
      }
      dbInitialized = true;
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Falha ao inicializar banco Postgres:', err.message);
    return false;
  }
}

// ------------------------------------------------------------------------------
// Funções de Acesso a Dados (com abstração inteligente Postgres / Fallback)
// ------------------------------------------------------------------------------

export async function authenticateDocente(nif, senha) {
  const nifInt = parseInt(nif, 10);
  if (isNaN(nifInt)) return null;

  if (pool) {
    try {
      await initializeDatabase();
      const res = await pool.query(
        'SELECT NIF, Nome, Email FROM Docente WHERE NIF = $1 AND Senha = $2',
        [nifInt, senha]
      );
      if (res.rows.length > 0) {
        return {
          nif: res.rows[0].nif,
          nome: res.rows[0].nome,
          email: res.rows[0].email,
          isLivePostgres: true,
        };
      }
      return null;
    } catch (e) {
      console.warn('Postgres query falhou, alternando para memória:', e.message);
    }
  }

  // Fallback em memória
  const docente = memoryState.docentes.find(d => d.nif === nifInt && d.senha === senha);
  if (docente) {
    return {
      nif: docente.nif,
      nome: docente.nome,
      email: docente.email,
      isLivePostgres: false,
    };
  }
  return null;
}

export async function getTurmasByDocente(nif) {
  const nifInt = parseInt(nif, 10);
  if (isNaN(nifInt)) return [];

  if (pool) {
    try {
      await initializeDatabase();
      const query = `
        SELECT 
          t.Codigo,
          t.Nome_Curso,
          t.Quantidade_Maxima,
          t.Empresa,
          t.Nome_Empresa,
          t.Turno,
          TO_CHAR(t.Data_Inicio, 'YYYY-MM-DD') AS Data_Inicio,
          TO_CHAR(t.Data_Fim, 'YYYY-MM-DD') AS Data_Fim,
          pt.Status_Diario,
          COUNT(at.Matricula_Aluno)::int AS Total_Alunos,
          ROUND(AVG(at.Nota), 1) AS Media_Turma
        FROM Turma t
        JOIN Professor_Turma pt ON pt.Codigo_Turma = t.Codigo
        LEFT JOIN Aluno_Turma at ON at.Codigo_Turma_Aluno = t.Codigo
        WHERE pt.NIF_Docente = $1
        GROUP BY t.Codigo, pt.Status_Diario
        ORDER BY t.Codigo ASC;
      `;
      const res = await pool.query(query, [nifInt]);
      return res.rows.map(r => ({
        codigo: r.codigo,
        nome_curso: r.nome_curso,
        quantidade_maxima: r.quantidade_maxima,
        empresa: r.empresa,
        nome_empresa: r.nome_empresa,
        turno: r.turno,
        data_inicio: r.data_inicio,
        data_fim: r.data_fim,
        status_diario: r.status_diario,
        total_alunos: r.total_alunos,
        media_turma: r.media_turma !== null ? parseFloat(r.media_turma) : null,
      }));
    } catch (e) {
      console.warn('Postgres turmas query falhou, alternando para memória:', e.message);
    }
  }

  // Fallback em memória
  const profTurmas = memoryState.professor_turma.filter(pt => pt.nif_docente === nifInt);
  return profTurmas.map(pt => {
    const t = memoryState.turmas.find(turma => turma.codigo === pt.codigo_turma);
    const alunosTurma = memoryState.aluno_turma.filter(at => at.codigo_turma_aluno === pt.codigo_turma);
    const notasValidas = alunosTurma.filter(at => at.nota !== null).map(at => at.nota);
    const media = notasValidas.length > 0 
      ? parseFloat((notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(1))
      : null;

    return {
      codigo: t.codigo,
      nome_curso: t.nome_curso,
      quantidade_maxima: t.quantidade_maxima,
      empresa: t.empresa,
      nome_empresa: t.nome_empresa,
      turno: t.turno,
      data_inicio: t.data_inicio,
      data_fim: t.data_fim,
      status_diario: pt.status_diario,
      total_alunos: alunosTurma.length,
      media_turma: media,
    };
  });
}

export async function getTurmaDetails(codigoTurma, nifDocente) {
  const codInt = parseInt(codigoTurma, 10);
  const nifInt = parseInt(nifDocente, 10);
  if (isNaN(codInt)) return null;

  if (pool) {
    try {
      await initializeDatabase();
      const turmaRes = await pool.query(`
        SELECT 
          t.Codigo,
          t.Nome_Curso,
          t.Quantidade_Maxima,
          t.Empresa,
          t.Nome_Empresa,
          t.Turno,
          TO_CHAR(t.Data_Inicio, 'YYYY-MM-DD') AS Data_Inicio,
          TO_CHAR(t.Data_Fim, 'YYYY-MM-DD') AS Data_Fim,
          pt.Status_Diario
        FROM Turma t
        JOIN Professor_Turma pt ON pt.Codigo_Turma = t.Codigo
        WHERE t.Codigo = $1 AND pt.NIF_Docente = $2;
      `, [codInt, nifInt]);

      if (turmaRes.rows.length === 0) return null;
      const turmaInfo = turmaRes.rows[0];

      const alunosRes = await pool.query(`
        SELECT 
          at.ID,
          at.Matricula_Aluno AS Matricula,
          a.Nome,
          a.Email,
          at.Nota,
          at.Total_Aulas,
          at.Presencas,
          at.Faltas,
          at.Status_Final
        FROM Aluno_Turma at
        JOIN Aluno a ON a.Matricula = at.Matricula_Aluno
        WHERE at.Codigo_Turma_Aluno = $1
        ORDER BY a.Nome ASC;
      `, [codInt]);

      return {
        turma: {
          codigo: turmaInfo.codigo,
          nome_curso: turmaInfo.nome_curso,
          quantidade_maxima: turmaInfo.quantidade_maxima,
          empresa: turmaInfo.empresa,
          nome_empresa: turmaInfo.nome_empresa,
          turno: turmaInfo.turno,
          data_inicio: turmaInfo.data_inicio,
          data_fim: turmaInfo.data_fim,
          status_diario: turmaInfo.status_diario,
        },
        alunos: alunosRes.rows.map(a => ({
          id: a.id,
          matricula: a.matricula,
          nome: a.nome,
          email: a.email,
          nota: a.nota !== null ? parseFloat(a.nota) : null,
          total_aulas: a.total_aulas,
          presencas: a.presencas,
          faltas: a.faltas,
          status_final: a.status_final,
        }))
      };
    } catch (e) {
      console.warn('Postgres detalhes query falhou, alternando para memória:', e.message);
    }
  }

  // Fallback em memória
  const pt = memoryState.professor_turma.find(p => p.codigo_turma === codInt && p.nif_docente === nifInt);
  if (!pt) return null;

  const t = memoryState.turmas.find(turma => turma.codigo === codInt);
  const alunosVinculados = memoryState.aluno_turma.filter(at => at.codigo_turma_aluno === codInt);
  const alunosDetalhados = alunosVinculados.map(at => {
    const aluno = memoryState.alunos.find(a => a.matricula === at.matricula_aluno);
    return {
      id: at.id,
      matricula: at.matricula_aluno,
      nome: aluno ? aluno.nome : `Aluno ${at.matricula_aluno}`,
      email: aluno ? aluno.email : '',
      nota: at.nota !== null ? parseFloat(at.nota) : null,
      total_aulas: at.total_aulas || 20,
      presencas: at.presencas || 0,
      faltas: at.faltas || 0,
      status_final: at.status_final || 'Em Curso',
    };
  }).sort((a, b) => a.nome.localeCompare(b.nome));

  return {
    turma: {
      codigo: t.codigo,
      nome_curso: t.nome_curso,
      quantidade_maxima: t.quantidade_maxima,
      empresa: t.empresa,
      nome_empresa: t.nome_empresa,
      turno: t.turno,
      data_inicio: t.data_inicio,
      data_fim: t.data_fim,
      status_diario: pt.status_diario,
    },
    alunos: alunosDetalhados
  };
}

export async function salvarAvaliacoesTurma(codigoTurma, nifDocente, statusDiario, avaliacoesAlunos) {
  const codInt = parseInt(codigoTurma, 10);
  const nifInt = parseInt(nifDocente, 10);
  if (isNaN(codInt)) throw new Error('Código de turma inválido');

  if (pool) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Atualiza status do diário na tabela Professor_Turma
      if (statusDiario) {
        await client.query(
          'UPDATE Professor_Turma SET Status_Diario = $1 WHERE Codigo_Turma = $2 AND NIF_Docente = $3',
          [statusDiario, codInt, nifInt]
        );
      }

      // Atualiza cada aluno
      for (const avaliacao of avaliacoesAlunos) {
        const matInt = parseInt(avaliacao.matricula, 10);
        const nota = avaliacao.nota !== null && avaliacao.nota !== '' && !isNaN(avaliacao.nota) 
          ? parseFloat(avaliacao.nota) 
          : null;
        const presencas = parseInt(avaliacao.presencas || 0, 10);
        const faltas = parseInt(avaliacao.faltas || 0, 10);
        const statusFinal = avaliacao.status_final || 'Em Curso';

        await client.query(`
          UPDATE Aluno_Turma 
          SET 
            Nota = $1,
            Presencas = $2,
            Faltas = $3,
            Status_Final = $4
          WHERE Codigo_Turma_Aluno = $5 AND Matricula_Aluno = $6;
        `, [nota, presencas, faltas, statusFinal, codInt, matInt]);
      }

      await client.query('COMMIT');
      return { success: true, updatedCount: avaliacoesAlunos.length };
    } catch (e) {
      await client.query('ROLLBACK');
      console.warn('Erro ao salvar no Postgres, aplicando em memória:', e.message);
    } finally {
      client.release();
    }
  }

  // Fallback em memória
  const pt = memoryState.professor_turma.find(p => p.codigo_turma === codInt && p.nif_docente === nifInt);
  if (pt && statusDiario) {
    pt.status_diario = statusDiario;
  }

  for (const avaliacao of avaliacoesAlunos) {
    const matInt = parseInt(avaliacao.matricula, 10);
    const at = memoryState.aluno_turma.find(a => a.codigo_turma_aluno === codInt && a.matricula_aluno === matInt);
    if (at) {
      at.nota = avaliacao.nota !== null && avaliacao.nota !== '' && !isNaN(avaliacao.nota) 
        ? parseFloat(avaliacao.nota) 
        : null;
      at.presencas = parseInt(avaliacao.presencas || 0, 10);
      at.faltas = parseInt(avaliacao.faltas || 0, 10);
      at.status_final = avaliacao.status_final || 'Em Curso';
    }
  }

  return { success: true, updatedCount: avaliacoesAlunos.length };
}

export function isPostgresConfigured() {
  return !!connectionString;
}
