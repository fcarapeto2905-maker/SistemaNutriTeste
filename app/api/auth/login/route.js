import { NextResponse } from 'next/server';
import { authenticateDocente, isPostgresConfigured } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nif, senha } = body;

    if (!nif || !senha) {
      return NextResponse.json(
        { error: 'NIF e Senha são obrigatórios' },
        { status: 400 }
      );
    }

    const docente = await authenticateDocente(nif, senha);

    if (!docente) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique seu NIF e Senha.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      docente,
      postgresConfigured: isPostgresConfigured(),
    });
  } catch (error) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json(
      { error: 'Erro interno ao realizar autenticação' },
      { status: 500 }
    );
  }
}
