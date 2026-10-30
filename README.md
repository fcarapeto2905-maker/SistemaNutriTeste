# Sistema de Gestão Escolar - Banco de Dados Vercel Postgres

Esquema de banco de dados relacional em SQL projetado para execução no **Vercel Postgres (Neon)** com integridade referencial completa e identificadores inteiros.

---

## 🗄️ Estrutura das Tabelas

### 1. `Docente`
* **`NIF`**: `INT` (Chave Primária) - Identificador único do docente/professor.
* **`Nome`**: `VARCHAR(150)` - Nome completo do docente.

### 2. `Aluno`
* **`Matricula`**: `INT` (Chave Primária) - Identificador único do aluno.
* **`Nome`**: `VARCHAR(150)` - Nome completo do aluno.

### 3. `Turma`
* **`Codigo`**: `INT` (Chave Primária) - Identificador único da turma.
* **`Nome_Curso`**: `VARCHAR(150)` - Nome do curso ou disciplina.
* **`Quantidade_Maxima`**: `INT` - Lotação máxima de alunos na turma.
* **`Empresa`**: `BOOLEAN` - Indicador se a turma é voltada/patrocinada por empresa.
* **`Nome_Empresa`**: `VARCHAR(150)` - Nome da empresa parceira (opcional).
* **`Turno`**: `VARCHAR(50)` - Turno da turma (Ex: Manhã, Tarde, Noite, Integral).
* **`Data_Inicio`**: `DATE` - Data de início das aulas.
* **`Data_Fim`**: `DATE` - Data de término das aulas (com validação `Data_Fim >= Data_Inicio`).

### 4. `Professor_Turma` (View: `Turma_Docente`)
Relacionamento **Muitos-para-Muitos (N:M)** entre `Docente` e `Turma`:
* **`ID`**: `SERIAL` (`INT` auto-incremento, Chave Primária).
* **`Codigo_Turma`**: `INT` (Chave Estrangeira -> `Turma.Codigo` com `ON DELETE CASCADE`).
* **`NIF_Docente`**: `INT` (Chave Estrangeira -> `Docente.NIF` com `ON DELETE RESTRICT`).
* **`Status_Diario`**: `VARCHAR(50)` - Situação do diário de classe.
* *Restrição de unicidade*: `UNIQUE (Codigo_Turma, NIF_Docente)` para evitar duplicidade.

### 5. `Aluno_Turma` (View: `Turma_Aluno`)
Relacionamento **Muitos-para-Muitos (N:M)** entre `Aluno` e `Turma`:
* **`ID`**: `SERIAL` (`INT` auto-incremento, Chave Primária).
* **`Codigo_Turma_Aluno`**: `INT` (Chave Estrangeira -> `Turma.Codigo` com `ON DELETE CASCADE`).
* **`Matricula_Aluno`**: `INT` (Chave Estrangeira -> `Aluno.Matricula` com `ON DELETE RESTRICT`).
* **`Status_Final`**: `VARCHAR(50)` - Situação final do aluno (Ex: Em Curso, Aprovado, Reprovado).
* *Restrição de unicidade*: `UNIQUE (Codigo_Turma_Aluno, Matricula_Aluno)` para evitar duplicidade.

---

## 🚀 Como Executar no Ambiente Vercel

A Vercel disponibiliza a ferramenta nativa **Vercel Postgres (Neon)** para execução direta de comandos SQL:

1. Acesse o painel da **[Vercel](https://vercel.com)** e abra o projeto **`nutriteste`**.
2. Clique na aba **Storage** no menu superior.
3. Se o banco ainda não foi criado:
   * Clique em **Create Database** e selecione **Postgres** (Neon).
   * Confirme a região e conclua a criação.
4. Após o banco estar ativo:
   * Abra o banco de dados e clique na aba **Query Console** (Editor SQL interativo da Vercel).
   * Copie o conteúdo do arquivo [`schema.sql`](./schema.sql), cole no console e clique em **Run Query**.
   * *(Opcional)*: Execute também o script [`seed.sql`](./seed.sql) para inserir dados de teste.
