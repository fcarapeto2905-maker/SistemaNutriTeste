'use client';

import { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Building2, 
  ArrowLeft, 
  Save, 
  LogOut, 
  Sparkles, 
  Calendar, 
  Award, 
  Check, 
  X, 
  Search, 
  AlertCircle,
  Database,
  Printer
} from 'lucide-react';

export default function DiárioEscolarApp() {
  // Estado de Autenticação
  const [docente, setDocente] = useState(null);
  const [nifInput, setNifInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Estado das Turmas
  const [turmas, setTurmas] = useState([]);
  const [turmasLoading, setTurmasLoading] = useState(false);
  const [selectedTurmaCodigo, setSelectedTurmaCodigo] = useState(null);
  const [turmaDetails, setTurmaDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Filtros e Busca
  const [buscaTurma, setBuscaTurma] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('Todos');

  // Estado da Edição do Diário
  const [alunosEditados, setAlunosEditados] = useState([]);
  const [statusDiarioEditado, setStatusDiarioEditado] = useState('Em Aberto');
  const [salvando, setSalvando] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isPostgresLive, setIsPostgresLive] = useState(false);

  // Carregar sessão salva do LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('diario_docente_sessao');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setDocente(parsed);
      } catch (e) {
        localStorage.removeItem('diario_docente_sessao');
      }
    }
  }, []);

  // Buscar turmas quando docente estiver logado
  useEffect(() => {
    if (docente?.nif) {
      carregarTurmas(docente.nif);
    }
  }, [docente]);

  // Carregar turmas
  async function carregarTurmas(nif) {
    setTurmasLoading(true);
    try {
      const res = await fetch(`/api/turmas?nif=${nif}`);
      const data = await res.json();
      if (data.success) {
        setTurmas(data.turmas);
        setIsPostgresLive(data.postgresConfigured);
      }
    } catch (err) {
      console.error('Erro ao carregar turmas:', err);
    } finally {
      setTurmasLoading(false);
    }
  }

  // Carregar detalhes de uma turma selecionada
  async function abrirTurma(codigo) {
    setSelectedTurmaCodigo(codigo);
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/turmas/${codigo}?nif=${docente.nif}`);
      const data = await res.json();
      if (data.success) {
        setTurmaDetails(data.turma);
        setStatusDiarioEditado(data.turma.status_diario || 'Em Aberto');
        setAlunosEditados(data.alunos || []);
      }
    } catch (err) {
      console.error('Erro ao abrir turma:', err);
    } finally {
      setDetailsLoading(false);
    }
  }

  // Realizar Login
  async function handleLogin(e) {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nif: nifInput, senha: senhaInput })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setDocente(data.docente);
        setIsPostgresLive(data.postgresConfigured);
        localStorage.setItem('diario_docente_sessao', JSON.stringify(data.docente));
      } else {
        setLoginError(data.error || 'Credenciais inválidas');
      }
    } catch (err) {
      setLoginError('Falha de conexão com a API escolar.');
    } finally {
      setLoginLoading(false);
    }
  }

  // Preenchimento rápido para demonstração
  function preencherTeste(nif, senha) {
    setNifInput(nif);
    setSenhaInput(senha);
    setLoginError('');
  }

  // Logout
  function handleLogout() {
    setDocente(null);
    setTurmas([]);
    setSelectedTurmaCodigo(null);
    setTurmaDetails(null);
    localStorage.removeItem('diario_docente_sessao');
  }

  // Atualizar nota de um aluno no estado
  function handleNotaChange(matricula, valor) {
    setAlunosEditados(prev => prev.map(aluno => {
      if (aluno.matricula === matricula) {
        return { ...aluno, nota: valor === '' ? null : parseFloat(valor) };
      }
      return aluno;
    }));
  }

  // Incrementar/Decrementar presenças ou faltas
  function alterarFrequencia(matricula, tipo, delta) {
    setAlunosEditados(prev => prev.map(aluno => {
      if (aluno.matricula === matricula) {
        const pres = tipo === 'presenca' ? Math.max(0, (aluno.presencas || 0) + delta) : aluno.presencas;
        const falt = tipo === 'falta' ? Math.max(0, (aluno.faltas || 0) + delta) : aluno.faltas;
        return { ...aluno, presencas: pres, faltas: falt };
      }
      return aluno;
    }));
  }

  // Alterar status final individual
  function handleStatusFinalChange(matricula, novoStatus) {
    setAlunosEditados(prev => prev.map(aluno => {
      if (aluno.matricula === matricula) {
        return { ...aluno, status_final: novoStatus };
      }
      return aluno;
    }));
  }

  // Ação Rápida: Dar Presença para Todos Hoje (+1 Presença)
  function darPresencaParaTodos() {
    setAlunosEditados(prev => prev.map(aluno => ({
      ...aluno,
      presencas: (aluno.presencas || 0) + 1
    })));
    mostrarToast('Presença de hoje adicionada para todos os alunos!');
  }

  // Ação Rápida: Calcular Situação Automática
  function calcularStatusAutomatico() {
    setAlunosEditados(prev => prev.map(aluno => {
      const total = (aluno.presencas || 0) + (aluno.faltas || 0);
      const freq = total > 0 ? (aluno.presencas / total) * 100 : 100;
      let status = 'Em Curso';

      if (aluno.nota !== null) {
        if (freq < 75) {
          status = 'Reprovado por Falta';
        } else if (aluno.nota >= 7.0) {
          status = 'Aprovado';
        } else {
          status = 'Reprovado por Nota';
        }
      }
      return { ...aluno, status_final: status };
    }));
    mostrarToast('Situação dos alunos recalculada com sucesso!');
  }

  // Salvar Diário no Banco de Dados
  async function salvarDiario() {
    setSalvando(true);
    try {
      const payload = {
        nif: docente.nif,
        statusDiario: statusDiarioEditado,
        avaliacoes: alunosEditados.map(a => ({
          matricula: a.matricula,
          nota: a.nota,
          presencas: a.presencas,
          faltas: a.faltas,
          status_final: a.status_final
        }))
      };

      const res = await fetch(`/api/turmas/${selectedTurmaCodigo}/avaliar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        mostrarToast('✅ Notas e presenças salvas com sucesso no banco!');
        // Atualiza a lista de turmas para refletir a nova média
        carregarTurmas(docente.nif);
      } else {
        mostrarToast('❌ Erro ao salvar: ' + (data.error || 'Falha na requisição'));
      }
    } catch (err) {
      mostrarToast('❌ Erro de rede ao conectar com o banco');
    } finally {
      setSalvando(false);
    }
  }

  function mostrarToast(mensagem) {
    setToastMessage(mensagem);
    setTimeout(() => setToastMessage(null), 4000);
  }

  // Filtragem de Turmas
  const turmasFiltradas = turmas.filter(t => {
    const matchBusca = t.nome_curso.toLowerCase().includes(buscaTurma.toLowerCase()) || 
                       t.codigo.toString().includes(buscaTurma);
    const matchTurno = filtroTurno === 'Todos' || t.turno === filtroTurno;
    return matchBusca && matchTurno;
  });

  // Métricas da Turma Atual
  const totalAlunosTurma = alunosEditados.length;
  const notasPreenchidas = alunosEditados.filter(a => a.nota !== null && !isNaN(a.nota)).map(a => a.nota);
  const mediaNotasTurma = notasPreenchidas.length > 0
    ? (notasPreenchidas.reduce((a, b) => a + b, 0) / notasPreenchidas.length).toFixed(1)
    : '--';
  const totalAprovados = alunosEditados.filter(a => a.status_final === 'Aprovado').length;

  // ==============================================================================
  // TELA 1: LOGIN DO DOCENTE
  // ==============================================================================
  if (!docente) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="brand-icon" style={{ margin: '0 auto 1.25rem', width: '56px', height: '56px' }}>
              <GraduationCap size={32} />
            </div>
            <h1>Diário Escolar Eletrônico</h1>
            <p>Portal do Docente • Conectado ao Vercel Postgres</p>
          </div>

          {loginError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="nifInput">NIF (Identificador do Docente)</label>
              <input
                id="nifInput"
                type="number"
                className="form-control"
                placeholder="Ex: 1001"
                value={nifInput}
                onChange={e => setNifInput(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="senhaInput">Senha de Acesso</label>
              <input
                id="senhaInput"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={senhaInput}
                onChange={e => setSenhaInput(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loginLoading}
              id="btnLogin"
            >
              {loginLoading ? (
                <>Conectando à base de dados...</>
              ) : (
                <>
                  <BookOpen size={18} />
                  <span>Acessar Diário Escolar</span>
                </>
              )}
            </button>
          </form>

          {/* Atalhos Rápidos para Testar */}
          <div className="quick-logins">
            <div className="quick-title">Contas de Teste Pré-cadastradas no Banco:</div>
            <div className="quick-btn-grid">
              <button 
                type="button" 
                className="quick-btn"
                onClick={() => preencherTeste('1001', 'senha123')}
              >
                <span><strong>Prof. Carlos Eduardo</strong> (NIF: 1001)</span>
                <span style={{ color: 'var(--primary)' }}>Usar ➔</span>
              </button>
              <button 
                type="button" 
                className="quick-btn"
                onClick={() => preencherTeste('1002', 'senha123')}
              >
                <span><strong>Profa. Mariana</strong> (NIF: 1002)</span>
                <span style={{ color: 'var(--primary)' }}>Usar ➔</span>
              </button>
              <button 
                type="button" 
                className="quick-btn"
                onClick={() => preencherTeste('1003', 'senha123')}
              >
                <span><strong>Prof. Roberto</strong> (NIF: 1003)</span>
                <span style={{ color: 'var(--primary)' }}>Usar ➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // TELA 2: VISUALIZAÇÃO DETALHADA DO DIÁRIO DA TURMA SELECIONADA
  // ==============================================================================
  if (selectedTurmaCodigo && turmaDetails) {
    return (
      <div>
        {/* Topo / Navbar */}
        <header className="app-header">
          <div className="brand-wrapper">
            <button className="btn-back" onClick={() => setSelectedTurmaCodigo(null)} id="btnVoltarTurmas">
              <ArrowLeft size={18} />
              <span>Voltar às Minhas Turmas</span>
            </button>
          </div>

          <div className="user-profile">
            <div className={`db-status-badge ${isPostgresLive ? 'db-status-live' : 'db-status-demo'}`}>
              <span className="status-dot"></span>
              <Database size={14} />
              <span>{isPostgresLive ? 'Vercel Postgres Ativo' : 'Base Local Integrada'}</span>
            </div>

            <div className="profile-info">
              <div className="profile-name">{docente.nome}</div>
              <div className="profile-nif">NIF: {docente.nif}</div>
            </div>

            <button className="btn-logout" onClick={handleLogout} title="Sair do Diário">
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <main className="container">
          <div className="diary-view">
            {/* Cabeçalho da Turma */}
            <div className="diary-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="codigo-badge">Turma #{turmaDetails.codigo}</span>
                  {turmaDetails.empresa && (
                    <span className="company-tag">
                      <Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Parceria: {turmaDetails.nome_empresa}
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    color: 'var(--text-muted)'
                  }}>
                    Turno: {turmaDetails.turno}
                  </span>
                </div>
                <h2>{turmaDetails.nome_curso}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Início: {turmaDetails.data_inicio}</span>
                  {turmaDetails.data_fim && (
                    <span>Término: {turmaDetails.data_fim}</span>
                  )}
                  <span>Capacidade: {turmaDetails.quantidade_maxima} alunos</span>
                </div>
              </div>

              {/* Status do Diário e Botões de Ação */}
              <div className="diary-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="statusDiarioSelect" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Status do Diário:
                  </label>
                  <select 
                    id="statusDiarioSelect"
                    className="select-status"
                    value={statusDiarioEditado}
                    onChange={e => setStatusDiarioEditado(e.target.value)}
                  >
                    <option value="Em Aberto">🟡 Em Aberto</option>
                    <option value="Em Andamento">🔵 Em Andamento</option>
                    <option value="Concluído">🟢 Concluído</option>
                  </select>
                </div>

                <button 
                  className="btn-action" 
                  onClick={darPresencaParaTodos}
                  title="Adiciona +1 presença a todos os matriculados"
                  id="btnPresencaTodos"
                >
                  <Check size={16} />
                  <span>Presença p/ Todos Hoje</span>
                </button>

                <button 
                  className="btn-action" 
                  onClick={calcularStatusAutomatico}
                  title="Calcula se está Aprovado ou Reprovado com base em Notas e Frequência"
                  id="btnAutoCalculo"
                >
                  <Sparkles size={16} />
                  <span>Calcular Situação</span>
                </button>

                <button 
                  className="btn-action" 
                  onClick={() => window.print()} 
                  title="Imprimir Diário de Classe"
                >
                  <Printer size={16} />
                  <span>Imprimir</span>
                </button>

                <button 
                  className="btn-save" 
                  onClick={salvarDiario} 
                  disabled={salvando}
                  id="btnSalvarDiario"
                >
                  <Save size={18} />
                  <span>{salvando ? 'Gravando no Banco...' : 'Salvar Diário'}</span>
                </button>
              </div>
            </div>

            {/* Painel de Indicadores da Turma */}
            <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div className="kpi-value">{totalAlunosTurma}</div>
                  <div className="kpi-label">Alunos Matriculados</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <Award size={24} />
                </div>
                <div>
                  <div className="kpi-value">{mediaNotasTurma}</div>
                  <div className="kpi-label">Média Geral da Turma</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="kpi-value">{totalAprovados} / {totalAlunosTurma}</div>
                  <div className="kpi-label">Alunos Aprovados</div>
                </div>
              </div>
            </div>

            {/* Tabela de Alunos, Notas e Frequência */}
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Matrícula</th>
                    <th>Nome do Estudante</th>
                    <th style={{ textAlign: 'center' }}>Nota (0 - 10)</th>
                    <th style={{ textAlign: 'center' }}>Frequência (Aulas: 20)</th>
                    <th style={{ textAlign: 'center' }}>Situação Final</th>
                  </tr>
                </thead>
                <tbody>
                  {alunosEditados.map(aluno => {
                    const totalFreq = (aluno.presencas || 0) + (aluno.faltas || 0);
                    const pctFreq = totalFreq > 0 ? Math.round((aluno.presencas / totalFreq) * 100) : 100;
                    
                    let barColorClass = 'bar-high';
                    if (pctFreq < 75) barColorClass = 'bar-low';
                    else if (pctFreq < 85) barColorClass = 'bar-mid';

                    return (
                      <tr key={aluno.matricula}>
                        <td>
                          <span style={{ 
                            fontFamily: 'monospace', 
                            fontWeight: 700, 
                            color: 'var(--text-muted)' 
                          }}>
                            {aluno.matricula}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{aluno.nome}</div>
                          {aluno.email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{aluno.email}</div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="input-nota"
                            placeholder="--"
                            value={aluno.nota !== null && aluno.nota !== undefined ? aluno.nota : ''}
                            onChange={e => handleNotaChange(aluno.matricula, e.target.value)}
                            style={{
                              borderColor: aluno.nota !== null 
                                ? (aluno.nota >= 7.0 ? 'rgba(16, 185, 129, 0.5)' : aluno.nota >= 5.0 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)')
                                : 'var(--border-subtle)'
                            }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div className="attendance-control">
                              <span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 600 }}>
                                P: {aluno.presencas || 0}
                              </span>
                              <button 
                                type="button" 
                                className="btn-counter" 
                                onClick={() => alterarFrequencia(aluno.matricula, 'presenca', 1)}
                                title="Adicionar presença"
                              >
                                +
                              </button>
                              <button 
                                type="button" 
                                className="btn-counter" 
                                onClick={() => alterarFrequencia(aluno.matricula, 'presenca', -1)}
                                title="Remover presença"
                              >
                                -
                              </button>
                              
                              <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#fca5a5', fontWeight: 600 }}>
                                F: {aluno.faltas || 0}
                              </span>
                              <button 
                                type="button" 
                                className="btn-counter" 
                                onClick={() => alterarFrequencia(aluno.matricula, 'falta', 1)}
                                title="Adicionar falta"
                              >
                                +
                              </button>
                              <button 
                                type="button" 
                                className="btn-counter" 
                                onClick={() => alterarFrequencia(aluno.matricula, 'falta', -1)}
                                title="Remover falta"
                              >
                                -
                              </button>
                            </div>

                            <div className="attendance-progress" title={`Frequência: ${pctFreq}%`}>
                              <div 
                                className={`attendance-bar ${barColorClass}`} 
                                style={{ width: `${pctFreq}%` }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                              {pctFreq}% presença
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <select 
                            className="select-status"
                            value={aluno.status_final || 'Em Curso'}
                            onChange={e => handleStatusFinalChange(aluno.matricula, e.target.value)}
                            style={{
                              borderColor: aluno.status_final === 'Aprovado' ? 'rgba(16, 185, 129, 0.5)' : 
                                           aluno.status_final?.startsWith('Reprovado') ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)'
                            }}
                          >
                            <option value="Em Curso">Em Curso</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Reprovado por Nota">Reprovado por Nota</option>
                            <option value="Reprovado por Falta">Reprovado por Falta</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Toast Notificador */}
        {toastMessage && (
          <div className="toast-container">
            <div className="toast">
              <Sparkles size={20} color="var(--primary)" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==============================================================================
  // TELA 3: DASHBOARD DO DOCENTE (LISTAGEM DAS TURMAS)
  // ==============================================================================
  const totalTurmas = turmas.length;
  const totalAlunosGeral = turmas.reduce((acc, t) => acc + (t.total_alunos || 0), 0);
  const turmasConcluidas = turmas.filter(t => t.status_diario === 'Concluído').length;

  return (
    <div>
      {/* Topo / Navbar */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="brand-title">Diário Escolar Eletrônico</div>
            <div className="brand-subtitle">Portal do Professor • Gestão de Turmas</div>
          </div>
        </div>

        <div className="user-profile">
          <div className={`db-status-badge ${isPostgresLive ? 'db-status-live' : 'db-status-demo'}`}>
            <span className="status-dot"></span>
            <Database size={14} />
            <span>{isPostgresLive ? 'Vercel Postgres Ativo' : 'Base de Dados Conectada'}</span>
          </div>

          <div className="profile-info">
            <div className="profile-name">{docente.nome}</div>
            <div className="profile-nif">Docente NIF: {docente.nif}</div>
          </div>

          <button className="btn-logout" onClick={handleLogout} title="Sair do Diário" id="btnLogout">
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <main className="container">
        {/* Painel de Indicadores Gerais */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <BookOpen size={26} />
            </div>
            <div>
              <div className="kpi-value">{totalTurmas}</div>
              <div className="kpi-label">Minhas Turmas Atribuídas</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9' }}>
              <Users size={26} />
            </div>
            <div>
              <div className="kpi-value">{totalAlunosGeral}</div>
              <div className="kpi-label">Estudantes sob Minha Tutoria</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
              <CheckCircle2 size={26} />
            </div>
            <div>
              <div className="kpi-value">{turmasConcluidas} / {totalTurmas}</div>
              <div className="kpi-label">Diários Finalizados</div>
            </div>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="section-header">
          <div>
            <h2>Turmas Vinculadas ao Docente</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Selecione uma turma para consultar alunos, lançar notas e controlar a frequência escolar.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Buscar por curso ou código..."
                className="form-control"
                style={{ paddingLeft: '2.25rem', width: '240px', fontSize: '0.85rem' }}
                value={buscaTurma}
                onChange={e => setBuscaTurma(e.target.value)}
              />
            </div>

            <select 
              className="select-status"
              value={filtroTurno}
              onChange={e => setFiltroTurno(e.target.value)}
            >
              <option value="Todos">Todos os Turnos</option>
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Noite">Noite</option>
              <option value="Integral">Integral</option>
            </select>
          </div>
        </div>

        {/* Grid de Cards das Turmas */}
        {turmasLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div className="status-dot" style={{ margin: '0 auto 1rem', width: '16px', height: '16px', background: 'var(--primary)' }}></div>
            <p>Carregando turmas vinculadas do banco de dados...</p>
          </div>
        ) : turmasFiltradas.length === 0 ? (
          <div style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '12px', 
            padding: '3rem', 
            textAlign: 'center' 
          }}>
            <BookOpen size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h3>Nenhuma turma encontrada</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Nenhuma turma corresponde aos filtros aplicados para o NIF {docente.nif}.
            </p>
          </div>
        ) : (
          <div className="turmas-grid">
            {turmasFiltradas.map(turma => {
              let statusClass = 'status-aberto';
              if (turma.status_diario === 'Em Andamento') statusClass = 'status-andamento';
              else if (turma.status_diario === 'Concluído') statusClass = 'status-concluido';

              return (
                <div 
                  key={turma.codigo} 
                  className="turma-card"
                  onClick={() => abrirTurma(turma.codigo)}
                  id={`turma-card-${turma.codigo}`}
                >
                  <div className="turma-badge-row">
                    <span className="codigo-badge">CÓDIGO: {turma.codigo}</span>
                    <span className={`status-badge ${statusClass}`}>
                      {turma.status_diario || 'Em Aberto'}
                    </span>
                  </div>

                  <h3>{turma.nome_curso}</h3>

                  <div className="turma-details">
                    <div className="detail-row">
                      <Clock size={15} style={{ color: 'var(--primary)' }} />
                      <span>Turno: <strong>{turma.turno}</strong></span>
                    </div>

                    <div className="detail-row">
                      <Users size={15} style={{ color: 'var(--info)' }} />
                      <span>
                        Alunos: <strong>{turma.total_alunos || 0}</strong> matriculados (Máx: {turma.quantidade_maxima})
                      </span>
                    </div>

                    <div className="detail-row">
                      <Calendar size={15} style={{ color: 'var(--warning)' }} />
                      <span>Início: {turma.data_inicio} {turma.data_fim ? `| Término: ${turma.data_fim}` : ''}</span>
                    </div>

                    {turma.empresa && (
                      <div className="detail-row" style={{ marginTop: '0.25rem' }}>
                        <span className="company-tag">
                          <Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {turma.nome_empresa || 'Empresa Parceira'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="turma-card-footer">
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Média da Turma: </span>
                      <strong style={{ 
                        color: turma.media_turma !== null ? (turma.media_turma >= 7 ? 'var(--success)' : 'var(--warning)') : 'var(--text-dim)' 
                      }}>
                        {turma.media_turma !== null ? turma.media_turma : 'Sem notas'}
                      </strong>
                    </div>

                    <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                      Abrir Diário ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
