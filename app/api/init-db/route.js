import { NextResponse } from 'next/server';
import { initializeDatabase, isPostgresConfigured } from '@/lib/db';

export async function POST() {
  try {
    const configured = isPostgresConfigured();
    if (!configured) {
      return NextResponse.json({
        success: false,
        message: 'Variável POSTGRES_URL não detectada nas variáveis de ambiente da Vercel. Operando em modo de memória local.',
        postgresConfigured: false
      });
    }

    const initialized = await initializeDatabase();
    return NextResponse.json({
      success: initialized,
      message: initialized 
        ? 'Tabelas e registros iniciais criados com sucesso no Vercel Postgres!' 
        : 'Tentativa de inicialização falhou. Verifique as credenciais do banco.',
      postgresConfigured: true
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
