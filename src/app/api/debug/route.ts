import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    claude: !!process.env.CLAUDE_API_KEY,
    supabase: !!process.env.SUPABASE_URL,
    upstash: !!process.env.UPSTASH_REDIS_URL,
    resend: !!process.env.RESEND_API_KEY,
  });
}