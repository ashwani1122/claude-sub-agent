import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (!code) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code_in_url`);
    }

    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`,
      );
    }

    if (data?.user) {
      // 🔥 temporarily disable this
      // await ensureUserExists();

      return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_user`);
  } catch (err: any) {
    console.error("CALLBACK ERROR:", err);

    return NextResponse.redirect(
      `/auth/auth-code-error?error=${encodeURIComponent(err.message || "unknown")}`,
    );
  }
}
