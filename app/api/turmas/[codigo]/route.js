import { NextResponse } from 'next/server';
import { getTurmaDetails, isPostgresConfigured } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { codigo } = params;
    const { searchParams } = new URL(request.url);
    const nif = searchParams.get('nif');

    if (!codigo || !nif) {
      return NextResponse.json(
        { error: 'Código da turma e NIF do docente são obrigatórios' },
        { status: 400 }
      );
    }

    const data = await getTurmaDetails(codigo, nif);

    if (!data) {
      return NextResponse.json(
        { error: 'Turma não encontrada ou acesso não autorizado para este docente' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      turma: data.turma,
      alunos: data.alunos,
      postgresConfigured: isPostgresConfigured(),
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes da turma:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar detalhes da turma' },
      { status: 500 }
    );
  }
}
