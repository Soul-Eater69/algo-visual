import { NextRequest, NextResponse } from 'next/server';
import { analyzeAlgorithm } from '@/lib/langchain';

export async function POST(req: NextRequest) {
  try {
    const { code, apiKey: clientKey } = await req.json() as { code: string; apiKey: string };
    const apiKey = clientKey || process.env.OPENAI_API_KEY || '';

    if (!code || !apiKey) {
      return NextResponse.json(
        { error: 'Code and API key are required. Please set your OpenAI API key.' },
        { status: 400 }
      );
    }

    if (code.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide valid algorithm code' },
        { status: 400 }
      );
    }

    const result = await analyzeAlgorithm(code.trim(), apiKey);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
