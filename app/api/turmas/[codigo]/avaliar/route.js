import { NextResponse } from 'next/server';
import { salvarAvaliacoesTurma } from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const { codigo } = params;
    const body = await request.json();
    const { nif, statusDiario, avaliacoes } = body;

    if (!codigo || !nif || !Array.isArray(avaliacoes)) {
      return NextResponse.json(
        { error: 'Parâmetros incompletos (código, NIF e lista de avaliações são necessários)' },
        { status: 400 }
      );
    }

    const resultado = await salvarAvaliacoesTurma(codigo, nif, statusDiario, avaliacoes);

    return NextResponse.json({
      success: true,
      mensagem: 'Avaliações e presenças salvas com sucesso no banco de dados!',
      resultado,
    });
  } catch (error) {
    console.error('Erro ao salvar avaliações da turma:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao persistir avaliações no banco de dados' },
      { status: 500 }
    );
  }
}
