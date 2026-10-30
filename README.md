# Diário Escolar Eletrônico - Vercel Postgres

Sistema moderno de gestão escolar e diário eletrônico conectado diretamente ao banco de dados relacional **Vercel Postgres (Neon)**.

---

## 🚀 Funcionalidades Principais

1. **Autenticação Segura do Docente**:
   - Login por **NIF (inteiro)** e **Senha**.
   - Identificação personalizada e isolamento das turmas vinculadas ao docente.
   - Contas pré-cadastradas para testes rápidos (ex: Prof. Carlos Eduardo - NIF: 1001 / senha: `senha123`).

2. **Dashboard de Turmas**:
   - Lista dinâmica de turmas vinculadas através da tabela `Professor_Turma` (`Turma_Docente`).
   - Indicadores em tempo real: total de turmas, alunos atendidos, média geral de notas e status dos diários.
   - Filtros por curso e turno (Manhã, Tarde, Noite, Integral).
   - Indicador de parceria empresarial (`Empresa` e `Nome_Empresa`).

3. **Diário de Classe Interativo**:
   - Consulta detalhada dos estudantes matriculados via `Aluno_Turma` (`Turma_Aluno`).
   - Lançamento e edição de **Notas (0.00 a 10.00)** com indicador visual por cor.
   - Controle dinâmico de **Presenças** e **Faltas** com cálculo automático de percentual de frequência.
   - **Ações em Massa**:
     - *Presença para Todos Hoje* (+1 presença para toda a turma com 1 clique).
     - *Calcular Situação Automática* (Aprovado com nota ≥ 7 e freq ≥ 75%, Reprovado por Nota ou Falta).
   - Alteração do **Status do Diário** da turma (`Em Aberto`, `Em Andamento`, `Concluído`).
   - Botão para **Impressão** amigável do diário de classe.
   - Sincronização e persistência direta no banco de dados.

---

## 🗄️ Esquema do Banco de Dados Relacional (Postgres)

* **`Docente`**: `NIF` (INT, PK), `Nome`, `Senha`, `Email`
* **`Aluno`**: `Matricula` (INT, PK), `Nome`, `Email`
* **`Turma`**: `Codigo` (INT, PK), `Nome_Curso`, `Quantidade_Maxima`, `Empresa`, `Nome_Empresa`, `Turno`, `Data_Inicio`, `Data_Fim`
* **`Professor_Turma`** (View: `Turma_Docente`): `ID` (SERIAL PK), `Codigo_Turma` (FK), `NIF_Docente` (FK), `Status_Diario`
* **`Aluno_Turma`** (View: `Turma_Aluno`): `ID` (SERIAL PK), `Codigo_Turma_Aluno` (FK), `Matricula_Aluno` (FK), `Nota`, `Total_Aulas`, `Presencas`, `Faltas`, `Status_Final`
* **`Diario_Aula`** & **`Diario_Presenca`**: Histórico detalhado de encontros e diários.

---

## ☁️ Conexão e Implantação na Vercel

### 1. Provisionando o Vercel Postgres
1. No painel do projeto na **Vercel**, clique na aba **Storage**.
2. Clique em **Create Database** e selecione **Postgres** (Neon).
3. Conecte o banco de dados ao projeto `nutriteste`.
4. As variáveis `POSTGRES_URL`, `POSTGRES_PRISMA_URL` etc. serão injetadas automaticamente no ambiente pela Vercel.

### 2. Criando as Tabelas no Vercel Postgres
Você pode inicializar as tabelas de duas formas:
- **Pelo Query Console da Vercel**: Copie o conteúdo de [`schema.sql`](./schema.sql) e [`seed.sql`](./seed.sql), cole no console e execute.
- **Pela API da Aplicação**: A aplicação possui auto-inicialização e o endpoint `/api/init-db` que cria as tabelas e dados iniciais automaticamente assim que a conexão estiver ativa.

---

## 💻 Execução Local

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Compilar para produção
npm run build
npm run start
```
Acesse: [http://localhost:3000](http://localhost:3000)
