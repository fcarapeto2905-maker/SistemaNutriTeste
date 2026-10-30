import { NextResponse } from 'next/server';
import { getTurmasByDocente, isPostgresConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const nif = searchParams.get('nif');

    if (!nif) {
      return NextResponse.json(
        { error: 'NIF do docente é obrigatório' },
        { status: 400 }
      );
    }

    const turmas = await getTurmasByDocente(nif);

    return NextResponse.json({
      success: true,
      turmas,
      postgresConfigured: isPostgresConfigured(),
    });
  } catch (error) {
    console.error('Erro ao listar turmas do docente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar turmas' },
      { status: 500 }
    );
  }
}
